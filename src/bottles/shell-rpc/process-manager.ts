/**
 * Process lifecycle management with node-pty and child_process fallback
 */
import { spawn, type ChildProcess } from 'node:child_process';
import type { IPty } from 'node-pty';
import type { ShellProcess, ShellOptions } from './types.js';
import { ShellRPCError } from './types.js';
import { getDefaultShell, detectPlatform } from './platform.js';
import { createShellEnvironment } from './environment.js';

/**
 * Type for node-pty module
 */
type NodePtyModule = {
  spawn: (file: string, args: string[] | string, options: Record<string, unknown>) => IPty;
};

/**
 * Try to load node-pty dynamically
 */
async function tryLoadNodePty(): Promise<NodePtyModule | null> {
  try {
    // Dynamic import to handle optional dependency
    return (await import('node-pty')) as NodePtyModule;
  } catch {
    console.error('[ShellRPC] node-pty not available, using child_process fallback');
    return null;
  }
}

/**
 * PTY-based shell process wrapper
 */
class PtyShellProcess implements ShellProcess {
  constructor(private pty: IPty) {}

  write(data: string): void {
    this.pty.write(data);
  }

  onData(handler: (data: string) => void): void {
    this.pty.onData(handler);
  }

  onExit(handler: (code: number | null) => void): void {
    this.pty.onExit(({ exitCode }) => handler(exitCode));
  }

  kill(signal?: NodeJS.Signals): void {
    this.pty.kill(signal);
  }

  resize(cols: number, rows: number): void {
    this.pty.resize(cols, rows);
  }

  isAlive(): boolean {
    // PTY doesn't have a direct isAlive check, so we track it internally
    // This is handled by the process manager
    return true;
  }
}

/**
 * child_process-based shell process wrapper
 */
class ChildShellProcess implements ShellProcess {
  private alive = true;

  constructor(private proc: ChildProcess) {
    proc.on('exit', () => {
      this.alive = false;
    });
  }

  write(data: string): void {
    this.proc.stdin?.write(data);
  }

  onData(handler: (data: string) => void): void {
    this.proc.stdout?.on('data', (chunk: Buffer) => {
      handler(chunk.toString());
    });
  }

  onError(handler: (data: string) => void): void {
    this.proc.stderr?.on('data', (chunk: Buffer) => {
      handler(chunk.toString());
    });
  }

  onExit(handler: (code: number | null) => void): void {
    this.proc.on('exit', handler);
  }

  kill(signal?: NodeJS.Signals): void {
    this.proc.kill(signal);
  }

  isAlive(): boolean {
    return this.alive && !this.proc.killed;
  }
}

/**
 * Process manager for creating and managing shell processes
 */
export class ProcessManager {
  private nodePty: NodePtyModule | null = null;
  private initialized = false;

  /**
   * Initialize the process manager
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    this.nodePty = await tryLoadNodePty();
    this.initialized = true;
  }

  /**
   * Create a new shell process
   */
  async createShell(options: ShellOptions): Promise<ShellProcess> {
    await this.initialize();

    const shell = options.shell ?? getDefaultShell();
    const env = createShellEnvironment({
      env: options.env,
      cleanEnv: options.cleanEnv,
      preservePaths: options.preservePaths,
    });
    const cwd = options.cwd ?? process.cwd();

    // Try PTY first if available and preferred
    if (this.nodePty && options.preferPty !== false) {
      try {
        return this.createPtyShell(shell, cwd, env);
      } catch (error) {
        console.error(
          '[ShellRPC] Failed to create PTY shell, falling back to child_process:',
          error,
        );
      }
    }

    // Fallback to child_process
    return this.createChildProcessShell(shell, cwd, env);
  }

  /**
   * Create a PTY-based shell
   */
  private createPtyShell(shell: string, cwd: string, env: Record<string, string>): ShellProcess {
    if (!this.nodePty) {
      throw new ShellRPCError('node-pty not available', 'PTY_NOT_AVAILABLE');
    }

    const pty = this.nodePty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: 80,
      rows: 30,
      cwd,
      env: env as Record<string, string | undefined>,
    });

    return new PtyShellProcess(pty);
  }

  /**
   * Create a child_process-based shell
   */
  private createChildProcessShell(
    shell: string,
    cwd: string,
    env: Record<string, string>,
  ): ShellProcess {
    // Determine if we're on Windows
    const isWindows = detectPlatform() === 'win32';

    // Spawn the shell process without interactive mode
    const proc = spawn(shell, [], {
      cwd,
      env,
      shell: false, // We're already spawning a shell
      stdio: ['pipe', 'pipe', 'pipe'],
      windowsHide: true, // Hide console window on Windows
    });

    if (!proc.stdin || !proc.stdout || !proc.stderr) {
      throw new ShellRPCError('Failed to create shell process streams', 'STREAM_CREATION_FAILED');
    }

    // Set encoding for streams
    proc.stdin.setDefaultEncoding('utf8');
    proc.stdout.setEncoding('utf8');
    proc.stderr.setEncoding('utf8');

    // Disable shell prompts
    if (isWindows) {
      // For PowerShell
      if (shell.includes('powershell') || shell.includes('pwsh')) {
        proc.stdin.write('$PSStyle.OutputRendering = "PlainText"\r\n');
        proc.stdin.write('$ProgressPreference = "SilentlyContinue"\r\n');
      }
    } else {
      // For Unix shells - set minimal prompt
      proc.stdin.write('export PS1="$ "\n');
      proc.stdin.write('export PS2="> "\n');
      proc.stdin.write('unset PROMPT_COMMAND\n');
    }

    return new ChildShellProcess(proc);
  }
}
