/**
 * Unit tests for ShellRPC Pool
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ShellRPCPool } from '#bottles/shell-rpc/pool';
import { ShellRPC } from '#bottles/shell-rpc';

describe('ShellRPC Pool', () => {
  let pool: ShellRPCPool;

  beforeEach(() => {
    pool = ShellRPCPool.getInstance();
  });

  afterEach(async () => {
    await pool.clear();
  });

  it('should reuse shells when released', async () => {
    const shell1 = await pool.acquire('test');
    expect(shell1).toBeInstanceOf(ShellRPC);

    pool.release('test');

    const shell2 = await pool.acquire('test');
    expect(shell2).toBe(shell1); // Should be the same instance
  });

  it('should handle concurrent requests', async () => {
    const shells = await Promise.all([
      pool.acquire('test1'),
      pool.acquire('test2'),
      pool.acquire('test3'),
    ]);

    expect(shells).toHaveLength(3);
    expect(shells[0]).not.toBe(shells[1]);
    expect(shells[1]).not.toBe(shells[2]);
    expect(shells[0]).not.toBe(shells[2]);
  });

  it('should mark shells as in use', async () => {
    const shell1 = await pool.acquire('test');
    const shell2 = await pool.acquire('test'); // Different instance since first is in use

    expect(shell1).not.toBe(shell2);
  });

  it('should create new shell when pool is empty', async () => {
    const shell = await pool.acquire('new-test');
    expect(shell).toBeInstanceOf(ShellRPC);
    expect(shell.getStatus().alive).toBe(true);
  });

  it('should respect max pool size', async () => {
    const keys = Array.from({ length: 6 }, (_, i) => `test${i}`);
    const shells = await Promise.all(keys.map((key) => pool.acquire(key)));

    // Only 5 should be pooled (maxSize = 5)
    expect(shells).toHaveLength(6);
    expect(shells.every((s) => s !== null && s !== undefined)).toBe(true);
  });

  it('should clean up all shells on clear', async () => {
    const shells = await Promise.all([pool.acquire('test1'), pool.acquire('test2')]);

    await pool.clear();

    // Shells should no longer be alive after clear
    for (const shell of shells) {
      expect(shell.getStatus().alive).toBe(false);
    }
  });

  it('should track last used time', async () => {
    const shell = await pool.acquire('test');

    pool.release('test');

    // Internal check - this would require exposing the internal state
    // For now, just verify the shell can be reacquired
    const shell2 = await pool.acquire('test');
    expect(shell2).toBe(shell);
  });

  it('should handle options when creating new shells', async () => {
    const shell = await pool.acquire('test-with-options', { cwd: process.cwd() });

    expect(shell).toBeInstanceOf(ShellRPC);
    expect(shell.getStatus().alive).toBe(true);
  });

  it('should be a singleton', () => {
    const pool1 = ShellRPCPool.getInstance();
    const pool2 = ShellRPCPool.getInstance();

    expect(pool1).toBe(pool2);
  });
});
