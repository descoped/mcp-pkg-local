/**
 * Simplified Shell-RPC Pool for test optimization
 */
import { ShellRPC } from './index.js';
import type { ShellOptions } from './types.js';

export interface PooledShell {
  shell: ShellRPC;
  inUse: boolean;
  lastUsed: number;
}

export class ShellRPCPool {
  private static instance: ShellRPCPool;
  private readonly shells = new Map<string, PooledShell>();
  private readonly maxSize = 5;

  static getInstance(): ShellRPCPool {
    this.instance ??= new ShellRPCPool();
    return this.instance;
  }

  /**
   * Acquires a shell instance from the pool, reusing existing shells when possible
   * @param key - Unique identifier for the shell (usually package manager name)
   * @param options - Optional shell configuration options
   * @returns Promise resolving to a ShellRPC instance
   * @throws {ShellRPCError} If shell creation fails
   * @example
   * const shell = await pool.acquire('pip', { cwd: '/project' });
   */
  async acquire(key: string, options?: ShellOptions): Promise<ShellRPC> {
    // Try to reuse existing shell
    const existing = this.shells.get(key);
    if (existing && !existing.inUse) {
      existing.inUse = true;
      existing.lastUsed = Date.now();
      return existing.shell;
    }

    // Create new shell if under limit
    if (this.shells.size < this.maxSize) {
      const shell = new ShellRPC(options);
      await shell.initialize();

      this.shells.set(key, {
        shell,
        inUse: true,
        lastUsed: Date.now(),
      });

      return shell;
    }

    // Wait for available shell or create new one
    const shell = new ShellRPC(options);
    await shell.initialize();
    return shell;
  }

  release(key: string): void {
    const pooled = this.shells.get(key);
    if (pooled) {
      pooled.inUse = false;
      pooled.lastUsed = Date.now();
    }
  }

  /**
   * Clears all pooled shell instances and cleans up resources
   * @returns Promise that resolves when all shells are cleaned up
   */
  async clear(): Promise<void> {
    const cleanupPromises = Array.from(this.shells.values()).map((p) => p.shell.cleanup());
    await Promise.all(cleanupPromises);
    this.shells.clear();
  }
}
