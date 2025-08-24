/**
 * Shell-RPC Engine for persistent shell process management
 *
 * This is the core component of the bottles system, providing:
 * - Persistent shell processes that stay alive between commands
 * - Cross-platform support (Windows, Linux, macOS)
 * - Command queueing and timeout handling
 * - Automatic fallback from node-pty to child_process
 */
import { randomUUID } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { setTimeout, clearTimeout } from 'node:timers';
import type {
  ShellOptions,
  ShellProcess,
  CommandResult,
  SupportedSignal,
  SignalResult,
} from './types.js';
import { ShellRPCError } from './types.js';
import type { TimeoutConfig, TimeoutStats } from './timeout/types.js';

// Node.js error type with optional code property
interface NodeError extends Error {
  code?: string;
  syscall?: string;
}
import { ProcessManager } from './process-manager.js';
import { CommandQueue } from './command-queue.js';
import { getCommandMarkers, detectPlatform, getDefaultShell } from './platform.js';
import { EnhancedTimeoutIntegration } from './enhanced-timeout.js';

const INIT_TIMEOUT = process.env.CI ? 3000 : 5000; // Shorter init timeout in CI

/**
 * Main ShellRPC class for managing persistent shell sessions
 * Now with enhanced timeout capabilities and event-driven observability
 */
export class ShellRPC extends EventEmitter {
  private readonly id: string;
  private readonly options: Required<ShellOptions>;
  private readonly commandQueue: CommandQueue;
  private readonly processManager: ProcessManager;

  private shell: ShellProcess | null = null;
  private readonly platform: ReturnType<typeof detectPlatform>;
  private outputBuffer = '';
  private errorBuffer = '';
  private isInitialized = false;
  private isAlive = true;
  // Map to track timeout instances for each command
  private readonly activeTimeouts = new Map<string, EnhancedTimeoutIntegration>();
  private commandCounter = 0;
  private currentCommandId: string | null = null;
  private isCommandRunning = false;
  private wasInterrupted = false;

  constructor(options: ShellOptions = {}) {
    super();
    this.id = options.id ?? randomUUID();
    this.platform = detectPlatform();

    // Set default options
    this.options = {
      cwd: options.cwd ?? process.cwd(),
      env: options.env ?? {},
      shell: options.shell ?? getDefaultShell(this.platform),
      defaultTimeout: options.defaultTimeout ?? 30000,
      preferPty: options.preferPty ?? true,
      id: this.id,
      cleanEnv: options.cleanEnv ?? false,
      preservePaths: options.preservePaths ?? [],
    };

    this.commandQueue = new CommandQueue();
    this.processManager = new ProcessManager();
  }

  /**
   * Initialize the shell process
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Create the shell process
      this.shell = await this.processManager.createShell(this.options);

      // Set up output handlers
      this.setupOutputHandlers();

      // Wait for shell to be ready
      await this.waitForReady();

      this.isInitialized = true;
      if (process.env.CI || process.env.DEBUG_SHELL_RPC) {
        console.error(
          `[ShellRPC] Shell ${this.id} initialized successfully (CI: ${!!process.env.CI})`,
        );
      }
    } catch (error) {
      throw new ShellRPCError(
        `Failed to initialize shell: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'INIT_FAILED',
        error,
      );
    }
  }

  /**
   * Execute a command in the shell
   */
  async execute(command: string, timeout?: number): Promise<CommandResult> {
    // Initialize if needed
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (!this.shell || !this.isAlive) {
      throw new ShellRPCError('Shell process is not alive', 'SHELL_NOT_ALIVE');
    }

    const effectiveTimeout = timeout ?? this.options.defaultTimeout;

    // Queue the command and get the promise for the result
    const resultPromise = this.commandQueue.enqueue(command, effectiveTimeout);

    // Start processing if not already processing
    if (!this.commandQueue.getCurrent()) {
      const queued = this.commandQueue.processNext();
      if (queued) {
        // Process command asynchronously without waiting
        this.processCommand(queued.command, queued.timeout).catch((error) => {
          console.error('[ShellRPC] Error processing command:', error);
        });
      }
    }

    return resultPromise;
  }

  /**
   * Process a single command
   */
  private async processCommand(command: string, timeout: number): Promise<void> {
    const startTime = Date.now();
    const markers = getCommandMarkers(this.options.shell);

    // Create a unique command ID for tracking
    const commandId = `cmd_${++this.commandCounter}_${Date.now()}`;
    this.currentCommandId = commandId;

    // Clear buffers before each command to ensure clean state
    this.outputBuffer = '';
    this.errorBuffer = '';

    // Create a unique end marker for this command
    const uniqueEndMarker = `___CMD_END_${Date.now()}___`;

    // Create a new timeout instance for this specific command
    const timeoutIntegration = new EnhancedTimeoutIntegration();
    this.activeTimeouts.set(commandId, timeoutIntegration);
    this.setupTimeoutEventForwardingForCommand(timeoutIntegration, commandId);

    // Start the new timeout system
    timeoutIntegration.start(command, timeout);

    // Event handler for timeout expiration
    let timeoutHandler: ((reason: string) => void) | null = null;

    // Create timeout promise using ResilientTimeout events (event-driven, no polling)
    const timeoutPromise = new Promise<void>((_, reject) => {
      // Define the timeout handler
      timeoutHandler = (reason: string): void => {
        const state = timeoutIntegration.getState();
        // Only terminate if THIS command is the one currently running
        if (this.isCommandRunning && this.currentCommandId === commandId) {
          console.error(
            `[ShellRPC] Command ${commandId} timed out (${reason}, stage: ${state?.stage}), terminating...`,
          );
          this.terminateCurrentCommand();
        }
        reject(new ShellRPCError(`Command timed out: ${reason}`, 'TIMEOUT'));
      };

      // Register the event listener
      timeoutIntegration.on('timeout:expired', timeoutHandler);
    });

    // Track completion check timer so we can cancel it
    let completionCheckTimer: NodeJS.Timeout | null = null;
    let completionResolved = false;

    // Create completion promise
    const completionPromise = new Promise<void>((resolve, reject) => {
      const checkCompletion = (): void => {
        // Stop if already resolved
        if (completionResolved) {
          return;
        }

        // Check if command was interrupted
        if (this.wasInterrupted) {
          completionResolved = true;
          reject(new ShellRPCError('Command was interrupted', 'INTERRUPTED'));
          return;
        }

        // Look for the markers in the right order - start marker should come before end marker
        const startIdx = this.outputBuffer.indexOf(markers.start);
        if (startIdx >= 0) {
          // Only look for end marker after the start marker in the SHELL OUTPUT, not in the command
          const afterStart = this.outputBuffer.substring(startIdx + markers.start.length);

          // Find where the command ends and actual output begins
          // Look for the first newline after the command, which indicates shell output
          const firstNewline = afterStart.indexOf('\n');
          if (firstNewline >= 0) {
            // Only check the actual shell output, not the echoed command
            const shellOutput = afterStart.substring(firstNewline);

            // Debug: Log buffer state for UV commands
            if (process.env.DEBUG_SHELL_RPC && command.includes('uv')) {
              console.error(`[ShellRPC] Checking for end marker '${uniqueEndMarker}'`);
              console.error(`[ShellRPC] Shell output length: ${shellOutput.length}`);
              console.error(`[ShellRPC] Last 200 chars: ${shellOutput.slice(-200)}`);
            }

            if (shellOutput.includes(uniqueEndMarker)) {
              // Debug: Log when we find the marker
              if (process.env.DEBUG_SHELL_RPC) {
                console.error(
                  `[ShellRPC] Found end marker in shell output after ${Date.now() - startTime}ms`,
                );
              }
              completionResolved = true;
              resolve();
              return;
            }
          }
        }

        if (!this.isAlive) {
          completionResolved = true;
          reject(new ShellRPCError('Shell process died unexpectedly', 'SHELL_DIED'));
        } else {
          // Check again in a short interval (CI-aware)
          completionCheckTimer = setTimeout(checkCompletion, checkInterval);
        }
      };

      // Start checking for completion with CI-aware intervals
      const checkInterval = process.env.CI ? 100 : 50; // Less frequent in CI to avoid race conditions
      completionCheckTimer = setTimeout(checkCompletion, checkInterval);
    });

    try {
      // Mark command as running and reset interrupt flag
      this.isCommandRunning = true;
      this.wasInterrupted = false;

      // Send the command with markers
      const isWindows = this.platform === 'win32';
      const wrappedCommand = isWindows
        ? `echo ${markers.start} & ${command} & echo ${uniqueEndMarker}\r\n`
        : `echo "${markers.start}" && ${command} && echo "${uniqueEndMarker}"\n`;

      // Debug: Log the command being sent
      if (process.env.DEBUG_SHELL_RPC) {
        console.error(`[ShellRPC] Sending command: ${wrappedCommand.replace(/\n/g, '\\n')}`);
      }

      // Shell is guaranteed to exist here due to check at line 102, but TypeScript needs explicit check
      if (this.shell) {
        this.shell.write(wrappedCommand);
      }

      // Wait for completion or timeout
      await Promise.race([completionPromise, timeoutPromise]);

      // Clean up timeout event listener
      if (timeoutHandler) {
        timeoutIntegration.off('timeout:expired', timeoutHandler);
      }

      // Stop timeout system and mark command as completed
      timeoutIntegration.stop();
      this.activeTimeouts.delete(commandId);
      this.currentCommandId = null;
      if (completionCheckTimer) {
        clearTimeout(completionCheckTimer);
        completionCheckTimer = null;
      }
      this.isCommandRunning = false;

      // Extract output between markers
      const output = this.extractOutput(markers.start, uniqueEndMarker);

      // Complete the command normally
      const result: CommandResult = {
        command,
        stdout: output.stdout,
        stderr: output.stderr,
        exitCode: 0, // TODO: Extract actual exit code
        duration: Date.now() - startTime,
        timedOut: false,
      };

      this.commandQueue.complete(result);

      // Clear buffers after processing to prevent interference
      this.outputBuffer = '';
      this.errorBuffer = '';

      // Process next command in queue
      const next = this.commandQueue.processNext();
      if (next) {
        // Process next command asynchronously
        this.processCommand(next.command, next.timeout).catch((error) => {
          console.error('[ShellRPC] Error processing next command:', error);
        });
      }
    } catch (error) {
      // Clean up timeout event listener
      if (timeoutHandler) {
        timeoutIntegration.off('timeout:expired', timeoutHandler);
      }

      // Stop timeout system and mark command as completed
      timeoutIntegration.stop();
      this.activeTimeouts.delete(commandId);
      this.currentCommandId = null;
      if (completionCheckTimer) {
        clearTimeout(completionCheckTimer);
        completionCheckTimer = null;
      }
      this.isCommandRunning = false;

      // Helper function to handle error completion
      const completeWithError = (timedOut: boolean, debugMessage?: string): void => {
        if (debugMessage && process.env.DEBUG_SHELL_RPC) {
          console.error(`[ShellRPC] ${debugMessage}`);
        }

        const output = this.extractOutput(markers.start, uniqueEndMarker);
        const result: CommandResult = {
          command,
          stdout: output.stdout || this.outputBuffer,
          stderr: output.stderr || this.errorBuffer,
          exitCode: -1,
          duration: Date.now() - startTime,
          timedOut,
        };
        this.commandQueue.complete(result);

        // Clear buffers after error
        this.outputBuffer = '';
        this.errorBuffer = '';
      };

      if (
        (error instanceof Error && error.message.includes('timed out')) ||
        (error instanceof ShellRPCError && error.code === 'TIMEOUT')
      ) {
        // Handle timeout - extract any partial output
        completeWithError(
          true,
          `Detected timeout: ${error instanceof ShellRPCError ? error.code : error.message}`,
        );
      } else if (
        (error instanceof Error && error.message.includes('interrupted')) ||
        (error instanceof ShellRPCError && error.code === 'INTERRUPTED')
      ) {
        // Handle interrupt - command was cancelled by user
        completeWithError(false);
      } else if (error instanceof ShellRPCError && error.code === 'SHELL_DIED') {
        // Treat shell death during command execution as timeout/interrupt
        // This handles cases where SIGINT causes the shell to exit (common in CI)
        completeWithError(
          true,
          'Shell died during command execution - treating as timeout/interrupt',
        );
      } else {
        // Debug non-timeout errors in CI
        if (process.env.DEBUG_SHELL_RPC) {
          console.error(
            `[ShellRPC] Non-timeout error: ${error instanceof Error ? error.message : 'Unknown error'}, type: ${error?.constructor?.name}, code: ${error && typeof error === 'object' && 'code' in error ? (error as NodeError).code : 'unknown'}`,
          );
        }

        // Check if this is actually a timeout that we missed due to different error handling
        const duration = Date.now() - startTime;
        const wasLikelyTimeout = duration >= timeout * 0.8; // If it took at least 80% of timeout duration

        if (wasLikelyTimeout) {
          completeWithError(
            true,
            `Treating as timeout due to duration ${duration}ms >= 80% of ${timeout}ms`,
          );
        } else {
          // Handle other errors - only fail if there's a current command
          if (this.commandQueue.getCurrent()) {
            this.commandQueue.fail(error instanceof Error ? error : new Error('Unknown error'));
          } else {
            // No current command to fail, just log the error
            console.error('[ShellRPC] Error occurred with no current command:', error);
          }
        }
      }

      // Process next command even after error
      const next = this.commandQueue.processNext();
      if (next) {
        this.processCommand(next.command, next.timeout).catch((error) => {
          console.error('[ShellRPC] Error processing next command after failure:', error);
        });
      }
    }
  }

  /**
   * Set up output handlers for the shell process
   */
  private setupOutputHandlers(): void {
    if (!this.shell) return;

    // Handle stdout
    this.shell.onData((data: string) => {
      this.outputBuffer += data;

      // Feed data to current command's timeout system for activity detection (only when command is running)
      if (this.isCommandRunning && this.currentCommandId) {
        const timeoutIntegration = this.activeTimeouts.get(this.currentCommandId);
        if (timeoutIntegration) {
          timeoutIntegration.processOutput(data);
        }
      }

      // Log for debugging (can be removed in production)
      if (process.env.DEBUG_SHELL_RPC) {
        console.error(`[ShellRPC ${this.id}] stdout:`, data);
      }
    });

    // Handle stderr (if separate from stdout)
    if (this.shell.onError) {
      this.shell.onError((data: string) => {
        this.errorBuffer += data;

        // Feed stderr data to current command's timeout system for activity detection (only when command is running)
        if (this.isCommandRunning && this.currentCommandId) {
          const timeoutIntegration = this.activeTimeouts.get(this.currentCommandId);
          if (timeoutIntegration) {
            timeoutIntegration.processOutput(data);
          }
        }

        if (process.env.DEBUG_SHELL_RPC) {
          console.error(`[ShellRPC ${this.id}] stderr:`, data);
        }
      });
    }

    // Handle exit
    this.shell.onExit((code: number | null) => {
      console.error(`[ShellRPC ${this.id}] Shell exited with code:`, code);
      this.isAlive = false;

      // Clear all pending commands
      const error = new ShellRPCError(`Shell process exited with code ${code}`, 'SHELL_EXITED', {
        exitCode: code,
      });
      this.commandQueue.clearAll(error);
    });
  }

  /**
   * Wait for the shell to be ready
   */
  private async waitForReady(): Promise<void> {
    if (!this.shell) {
      throw new ShellRPCError('No shell process', 'NO_SHELL');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new ShellRPCError('Shell initialization timeout', 'INIT_TIMEOUT'));
      }, INIT_TIMEOUT);

      // Send a simple echo command to verify the shell is responsive
      const readyMarker = `READY_${Date.now()}`;
      const testCommand =
        this.platform === 'win32' ? `echo ${readyMarker}` : `echo "${readyMarker}"`;

      if (!this.shell) {
        throw new ShellRPCError('No shell process', 'NO_SHELL');
      }
      this.shell.write(`${testCommand}\n`);

      const checkReady = (): void => {
        if (this.outputBuffer.includes(readyMarker)) {
          clearTimeout(timeout);
          this.outputBuffer = ''; // Clear the initialization output
          this.errorBuffer = ''; // Clear any initialization errors
          resolve();
        } else if (!this.isAlive) {
          clearTimeout(timeout);
          reject(new ShellRPCError('Shell died during initialization', 'INIT_DIED'));
        } else {
          const readyCheckInterval = process.env.CI ? 200 : 100; // Less frequent in CI
          setTimeout(checkReady, readyCheckInterval);
        }
      };

      const readyCheckInterval = process.env.CI ? 200 : 100;
      setTimeout(checkReady, readyCheckInterval);
    });
  }

  /**
   * Extract output between command markers
   */
  private extractOutput(
    startMarker: string,
    endMarker: string,
  ): {
    stdout: string;
    stderr: string;
  } {
    // Split output into lines for easier processing
    const lines = this.outputBuffer.split(/\r?\n/);
    const output: string[] = [];
    let insideMarkers = false;
    let foundStart = false;
    let foundEnd = false;

    for (const line of lines) {
      // Check for start marker
      if (line.includes(startMarker)) {
        insideMarkers = true;
        foundStart = true;
        continue;
      }

      // Check for end marker
      if (line.includes(endMarker)) {
        foundEnd = true;
        break;
      }

      // Collect lines between markers
      if (insideMarkers) {
        output.push(line);
      }
    }

    // If we didn't find both markers, return the raw output
    if (!foundStart || !foundEnd) {
      console.error(`[ShellRPC] Markers not found. Start: ${foundStart}, End: ${foundEnd}`);
      console.error(`[ShellRPC] Output buffer: ${this.outputBuffer}`);
      return {
        stdout: this.outputBuffer.trim(),
        stderr: this.errorBuffer.trim(),
      };
    }

    // Join the collected lines
    const stdout = output.join('\n').trim();

    return {
      stdout,
      stderr: this.errorBuffer.trim(),
    };
  }

  /**
   * Terminate the currently running command
   */
  private async terminateCurrentCommand(): Promise<void> {
    if (!this.shell || !this.isAlive) return;

    try {
      if (this.platform === 'win32') {
        // On Windows, send Ctrl+C followed by newline to ensure it's processed
        this.shell.write('\x03\r\n');
      } else {
        // On Unix, send Ctrl+C directly to the shell's stdin
        // This interrupts the current foreground process
        this.shell.write('\x03');
      }
      // Mark that we've interrupted to help with cleanup
      this.isCommandRunning = false;

      // Wait a bit for the interrupt to process
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Don't clear buffers here - we need to detect if the end marker appears
    } catch (error) {
      console.error('[ShellRPC] Error terminating command:', error);
    }
  }

  /**
   * Send a signal to the shell process
   */
  sendSignal(signal: SupportedSignal): SignalResult {
    if (!this.shell || !this.isAlive) {
      return {
        success: false,
        error: 'Shell process is not alive',
        signal,
      };
    }

    try {
      // Map signal to appropriate action
      if (this.platform === 'win32') {
        // Windows doesn't support Unix signals directly
        switch (signal) {
          case 'SIGINT':
            // Send Ctrl+C followed by newline
            this.shell.write('\x03\r\n');
            // Reset command state
            this.isCommandRunning = false;
            break;
          case 'SIGTERM':
          case 'SIGKILL':
            // Force kill the shell
            this.shell.kill('SIGTERM');
            this.isAlive = false;
            break;
        }
      } else {
        // Unix systems support signals directly
        if (signal === 'SIGINT') {
          // For SIGINT, send Ctrl+C to stdin instead of using kill
          // This properly interrupts the foreground process
          this.shell.write('\x03');
          // Mark as interrupted so the command completes
          this.wasInterrupted = true;
          this.isCommandRunning = false;
          // Send a newline to ensure prompt returns
          setTimeout(() => {
            if (this.shell && this.isAlive) {
              this.shell.write('\n');
            }
          }, 100);
        } else {
          this.shell.kill(signal as NodeJS.Signals);
        }

        // Mark as not alive for SIGKILL and SIGTERM
        if (signal === 'SIGKILL' || signal === 'SIGTERM') {
          this.isAlive = false;
        }
      }

      return {
        success: true,
        signal,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        signal,
      };
    }
  }

  /**
   * Interrupt the current command (SIGINT)
   */
  interrupt(): SignalResult {
    return this.sendSignal('SIGINT');
  }

  /**
   * Terminate the shell gracefully (SIGTERM)
   */
  terminate(): SignalResult {
    return this.sendSignal('SIGTERM');
  }

  /**
   * Force kill the shell (SIGKILL)
   */
  forceKill(): SignalResult {
    return this.sendSignal('SIGKILL');
  }

  /**
   * Get shell status
   */
  getStatus(): {
    id: string;
    alive: boolean;
    initialized: boolean;
    platform: string;
    shell: string;
    queueStats: ReturnType<CommandQueue['getStats']>;
  } {
    return {
      id: this.id,
      alive: this.isAlive,
      initialized: this.isInitialized,
      platform: this.platform,
      shell: this.options.shell,
      queueStats: this.commandQueue.getStats(),
    };
  }

  /**
   * Set up event forwarding from timeout integration to Shell-RPC for a specific command
   * This provides observability into timeout behavior
   */
  private setupTimeoutEventForwardingForCommand(
    timeoutIntegration: EnhancedTimeoutIntegration,
    commandId: string,
  ): void {
    // Forward timeout events to Shell-RPC events for observability
    timeoutIntegration.on(
      'timeout:started',
      (command: string, category: string, config: TimeoutConfig) => {
        this.emit('timeout:started', { command, category, config, commandId });
      },
    );

    timeoutIntegration.on('timeout:activity', (data: string, action: string) => {
      this.emit('timeout:activity', { data: data.substring(0, 100), action, commandId });
    });

    timeoutIntegration.on('timeout:state_changed', (from: string, to: string) => {
      this.emit('timeout:state_changed', { from, to, commandId });

      if (process.env.DEBUG_SHELL_RPC) {
        console.error(`[ShellRPC] Timeout state changed for ${commandId}: ${from} → ${to}`);
      }
    });

    timeoutIntegration.on('timeout:grace_entered', () => {
      this.emit('timeout:grace_entered', { commandId });

      if (process.env.DEBUG_SHELL_RPC) {
        console.error(
          `[ShellRPC] Entered grace period for ${commandId} - command has chance to recover`,
        );
      }
    });

    timeoutIntegration.on('timeout:grace_recovered', () => {
      this.emit('timeout:grace_recovered', { commandId });

      if (process.env.DEBUG_SHELL_RPC) {
        console.error(`[ShellRPC] Recovered from grace period for ${commandId}!`);
      }
    });

    timeoutIntegration.on('timeout:expired', (reason: string) => {
      this.emit('timeout:expired', { reason, commandId });
    });

    timeoutIntegration.on('timeout:stopped', (stats: TimeoutStats) => {
      if (stats && process.env.DEBUG_SHELL_RPC) {
        const timeoutStats = stats as {
          completions: number;
          graceRecoveries: number;
          terminations: unknown;
        };
        console.error(`[ShellRPC] Timeout stopped for ${commandId}. Stats:`, {
          completions: timeoutStats.completions,
          graceRecoveries: timeoutStats.graceRecoveries,
          terminations: timeoutStats.terminations,
        });
      }
    });
  }

  /**
   * Cleanup and terminate the shell
   */
  async cleanup(): Promise<void> {
    if (!this.isAlive) return;

    console.error(`[ShellRPC ${this.id}] Cleaning up shell process`);

    try {
      // 1. Clear all timeouts first
      for (const timeoutIntegration of this.activeTimeouts.values()) {
        timeoutIntegration.stop();
      }
      this.activeTimeouts.clear();

      // 2. Clear command queue
      this.commandQueue.clearAll(new ShellRPCError('Shell cleanup', 'CLEANUP'));

      // 3. Graceful shell exit
      if (this.shell?.isAlive()) {
        this.shell.write('exit\n');
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // 4. Force kill if needed
      if (this.shell?.isAlive()) {
        this.shell.kill('SIGTERM');
      }

      // 5. Clean state
      this.outputBuffer = '';
      this.errorBuffer = '';
      this.isAlive = false;
      this.isInitialized = false;
      this.shell = null;
    } catch (error) {
      console.error(`[ShellRPC ${this.id}] Cleanup error:`, error);
    }
  }
}

// Export all types for convenience
export * from './types.js';
export { detectPlatform, getDefaultShell } from './platform.js';
export {
  createCleanEnvironment,
  createStandardEnvironment,
  createShellEnvironment,
} from './environment.js';
