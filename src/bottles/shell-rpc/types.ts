/**
 * Type definitions for the Shell-RPC Engine
 */

export type ShellPlatform = 'win32' | 'darwin' | 'linux';

export interface ShellOptions {
  /**
   * Working directory for the shell
   */
  cwd?: string;

  /**
   * Environment variables
   */
  env?: Record<string, string>;

  /**
   * Shell executable to use (defaults to platform default)
   */
  shell?: string;

  /**
   * Timeout for individual commands in milliseconds
   */
  defaultTimeout?: number;

  /**
   * Whether to use node-pty or fallback to child_process
   */
  preferPty?: boolean;

  /**
   * Custom identifier for this shell instance
   */
  id?: string;

  /**
   * Use clean environment mode - only essential variables
   * When true, starts with minimal environment instead of inheriting from parent
   */
  cleanEnv?: boolean;

  /**
   * Additional paths to preserve in clean environment mode
   * Only used when cleanEnv is true
   */
  preservePaths?: string[];
}

export interface CommandResult {
  /**
   * The command that was executed
   */
  command: string;

  /**
   * Standard output
   */
  stdout: string;

  /**
   * Standard error output
   */
  stderr: string;

  /**
   * Exit code (0 for success)
   */
  exitCode: number;

  /**
   * Execution time in milliseconds
   */
  duration: number;

  /**
   * Whether the command timed out
   */
  timedOut: boolean;
}

export interface QueuedCommand {
  /**
   * Unique identifier for this command
   */
  id: string;

  /**
   * The command to execute
   */
  command: string;

  /**
   * Timeout in milliseconds
   */
  timeout: number;

  /**
   * Promise resolver for the result
   */
  resolve: (result: CommandResult) => void;

  /**
   * Promise rejector for errors
   */
  reject: (error: Error) => void;

  /**
   * Timestamp when command was queued
   */
  queuedAt: number;

  /**
   * Timestamp when command started executing
   */
  startedAt?: number;
}

export interface ShellProcess {
  /**
   * Write to stdin
   */
  write(data: string): void;

  /**
   * Attach stdout handler
   */
  onData(handler: (data: string) => void): void;

  /**
   * Attach stderr handler (if separate)
   */
  onError?(handler: (data: string) => void): void;

  /**
   * Attach exit handler
   */
  onExit(handler: (code: number | null) => void): void;

  /**
   * Kill the process
   */
  kill(signal?: NodeJS.Signals): void;

  /**
   * Resize the terminal (PTY only)
   */
  resize?(cols: number, rows: number): void;

  /**
   * Check if process is running
   */
  isAlive(): boolean;
}

export class ShellRPCError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ShellRPCError';
  }
}

/**
 * Supported signal types for process control
 */
export type SupportedSignal = 'SIGINT' | 'SIGTERM' | 'SIGKILL';

/**
 * Signal result interface
 */
export interface SignalResult {
  /**
   * Whether the signal was successfully sent
   */
  success: boolean;

  /**
   * Error message if signal failed
   */
  error?: string;

  /**
   * The signal that was sent
   */
  signal: SupportedSignal;
}
