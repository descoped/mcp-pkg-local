/**
 * Command queue management for sequential command execution
 */
import { randomUUID } from 'node:crypto';
import type { QueuedCommand, CommandResult } from './types.js';

export class CommandQueue {
  private queue: QueuedCommand[] = [];
  private current: QueuedCommand | null = null;
  private processing = false;
  private completed = 0;
  private failed = 0;

  /**
   * Add a command to the queue
   */
  enqueue(command: string, timeout: number): Promise<CommandResult> {
    return new Promise((resolve, reject) => {
      const queuedCommand: QueuedCommand = {
        id: randomUUID(),
        command,
        timeout,
        resolve,
        reject,
        queuedAt: Date.now(),
      };

      this.queue.push(queuedCommand);
      // Don't auto-process here - let the caller control when to process
    });
  }

  /**
   * Get the current executing command
   */
  getCurrent(): QueuedCommand | null {
    return this.current;
  }

  /**
   * Process the next command in the queue
   */
  processNext(): QueuedCommand | null {
    if (this.current || this.queue.length === 0) {
      return null;
    }

    this.processing = true;
    this.current = this.queue.shift() ?? null;

    if (this.current) {
      this.current.startedAt = Date.now();
    }

    return this.current;
  }

  /**
   * Mark current command as complete
   */
  complete(result: CommandResult): void {
    if (!this.current) {
      // Log warning but don't throw - this can happen in race conditions
      console.warn('[CommandQueue] complete() called with no current command');
      return;
    }

    this.current.resolve(result);
    this.current = null;
    this.completed++;
    this.processing = this.queue.length > 0;
  }

  /**
   * Mark current command as failed
   */
  fail(error: Error): void {
    if (!this.current) {
      // Log warning but don't throw - this can happen in race conditions
      console.warn('[CommandQueue] fail() called with no current command');
      return;
    }

    this.current.reject(error);
    this.current = null;
    this.failed++;
    this.processing = this.queue.length > 0;
  }

  /**
   * Clear all pending commands with an error
   */
  clearAll(error: Error): void {
    // Fail current command
    if (this.current) {
      this.current.reject(error);
      this.current = null;
      this.failed++;
    }

    // Fail all queued commands
    while (this.queue.length > 0) {
      const cmd = this.queue.shift();
      if (cmd) {
        cmd.reject(error);
        this.failed++;
      }
    }

    this.processing = false;
  }

  /**
   * Get queue statistics
   */
  getStats(): {
    pending: number;
    current: string | null;
    processing: boolean;
    completed: number;
    failed: number;
    queuedCommands: Array<{ command: string; queuedAt: number }>;
  } {
    return {
      pending: this.queue.length,
      current: this.current?.command ?? null,
      processing: this.processing,
      completed: this.completed,
      failed: this.failed,
      queuedCommands: this.queue.map((q) => ({
        command: q.command,
        queuedAt: q.queuedAt,
      })),
    };
  }
}
