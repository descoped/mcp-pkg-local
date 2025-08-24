/**
 * Tests for Shell-RPC Engine critical fixes
 */
import { describe, it, expect, afterEach } from 'vitest';
import { setTimeout } from 'node:timers';
import { ShellRPC } from '#bottles/shell-rpc';
import { createCleanEnvironment, createStandardEnvironment } from '#bottles/shell-rpc/environment';
import { TIMEOUTS } from '../../config/timeouts.js';

describe('Shell-RPC Critical Fixes', () => {
  let shell: ShellRPC | null = null;

  afterEach(async () => {
    // Clean up shell after each test
    if (shell) {
      await shell.cleanup();
      shell = null;
    }
  });

  describe('Timeout Handling', () => {
    it(
      'should handle command timeout correctly',
      async () => {
        shell = new ShellRPC({ defaultTimeout: 1000 });
        await shell.initialize();

        // Use a real command that would block indefinitely
        // cat without input will block waiting for stdin
        const result = await shell.execute('cat', 100);

        expect(result.timedOut).toBe(true);
        expect(result.exitCode).toBe(-1);
      },
      TIMEOUTS.medium,
    );

    it(
      'should recover after timeout',
      async () => {
        shell = new ShellRPC({ defaultTimeout: 1000 });
        await shell.initialize();

        // First command times out
        const timeoutResult = await shell.execute('cat', 100);
        expect(timeoutResult.timedOut).toBe(true);

        // Shell should still be usable
        const normalResult = await shell.execute('echo "recovered"');
        expect(normalResult.timedOut).toBe(false);
        expect(normalResult.stdout).toContain('recovered');
        expect(normalResult.exitCode).toBe(0);
      },
      TIMEOUTS.medium,
    );
  });

  describe('Clean Environment Mode', () => {
    it('should create clean environment with minimal variables', () => {
      const cleanEnv = createCleanEnvironment();

      // Should have essential variables
      expect(cleanEnv.PATH).toBeDefined();
      expect(cleanEnv.TERM).toBe('dumb');
      expect(cleanEnv.NO_COLOR).toBe('1');
      expect(cleanEnv.CI).toBe('true');

      // Should have platform-specific essentials
      if (process.platform === 'win32') {
        expect(cleanEnv.SYSTEMROOT).toBeDefined();
        expect(cleanEnv.WINDIR).toBeDefined();
      } else {
        expect(cleanEnv.HOME).toBeDefined();
        expect(cleanEnv.USER ?? cleanEnv.USERNAME).toBeDefined();
      }

      // Should not inherit all parent variables
      const parentEnvCount = Object.keys(process.env).length;
      const cleanEnvCount = Object.keys(cleanEnv).length;
      expect(cleanEnvCount).toBeLessThan(parentEnvCount);
    });

    it('should preserve custom paths in clean environment', () => {
      const customPaths = ['/custom/bin', '/another/path'];
      const cleanEnv = createCleanEnvironment({}, customPaths);

      const pathSeparator = process.platform === 'win32' ? ';' : ':';
      const paths = (cleanEnv.PATH ?? '').split(pathSeparator);

      // Custom paths should be included
      customPaths.forEach((path) => {
        expect(paths).toContain(path);
      });
    });

    it('should merge custom environment variables', () => {
      const customEnv = {
        MY_VAR: 'test_value',
        ANOTHER_VAR: 'another_value',
      };

      const cleanEnv = createCleanEnvironment(customEnv);

      expect(cleanEnv.MY_VAR).toBe('test_value');
      expect(cleanEnv.ANOTHER_VAR).toBe('another_value');
    });

    it('should execute commands in clean environment', async () => {
      shell = new ShellRPC({
        cleanEnv: true,
        env: { CUSTOM_VAR: 'clean_test' },
      });
      await shell.initialize();

      // Test that custom variable is available
      const result = await shell.execute(
        process.platform === 'win32' ? 'echo %CUSTOM_VAR%' : 'echo $CUSTOM_VAR',
      );

      expect(result.stdout).toContain('clean_test');
      expect(result.exitCode).toBe(0);
    });

    it('should compare standard vs clean environment', async () => {
      // Standard environment
      const standardShell = new ShellRPC({ cleanEnv: false });
      await standardShell.initialize();

      const standardResult = await standardShell.execute(
        process.platform === 'win32' ? 'set | find /c "="' : 'env | wc -l',
      );

      await standardShell.cleanup();

      // Clean environment
      const cleanShell = new ShellRPC({ cleanEnv: true });
      await cleanShell.initialize();

      const cleanResult = await cleanShell.execute(
        process.platform === 'win32' ? 'set | find /c "="' : 'env | wc -l',
      );

      shell = cleanShell; // For cleanup

      // Clean environment should have fewer variables
      const standardCount = parseInt(standardResult.stdout.trim(), 10);
      const cleanCount = parseInt(cleanResult.stdout.trim(), 10);

      // Clean environment should have significantly fewer variables
      expect(cleanCount).toBeLessThanOrEqual(standardCount);
      // Verify reduction is meaningful (at least 10% fewer variables)
      const reduction = ((standardCount - cleanCount) / standardCount) * 100;
      expect(reduction).toBeGreaterThan(10);
    });
  });

  describe('Signal Support', () => {
    it(
      'should interrupt running command with SIGINT',
      async () => {
        shell = new ShellRPC();
        await shell.initialize();

        // Start a long-running command that can be interrupted
        // Use a while loop that's interruptible
        const commandPromise = shell.execute('while true; do echo -n ""; done', 15000);

        // Wait a bit then interrupt
        await new Promise((resolve) => setTimeout(resolve, 500));
        const signalResult = shell.interrupt();

        expect(signalResult.success).toBe(true);
        expect(signalResult.signal).toBe('SIGINT');

        // Command should complete quickly after interrupt (within 2 seconds)
        const startWait = Date.now();
        try {
          await commandPromise;
        } catch {
          // Interrupt may cause an error, which is fine
        }
        const waitTime = Date.now() - startWait;
        expect(waitTime).toBeLessThan(2000); // Should not wait long after interrupt
      },
      TIMEOUTS.long,
    );

    it('should terminate shell with SIGTERM', async () => {
      shell = new ShellRPC();
      await shell.initialize();

      const status = shell.getStatus();
      expect(status.alive).toBe(true);

      const signalResult = shell.terminate();
      expect(signalResult.success).toBe(true);
      expect(signalResult.signal).toBe('SIGTERM');

      // Shell should be marked as not alive
      const newStatus = shell.getStatus();
      expect(newStatus.alive).toBe(false);
    });

    it('should force kill shell with SIGKILL', async () => {
      shell = new ShellRPC();
      await shell.initialize();

      const signalResult = shell.forceKill();
      expect(signalResult.success).toBe(true);
      expect(signalResult.signal).toBe('SIGKILL');

      // Shell should be dead
      const status = shell.getStatus();
      expect(status.alive).toBe(false);

      // Further commands should fail
      await expect(shell.execute('echo test')).rejects.toThrow('Shell process is not alive');
    });

    it('should handle signal errors gracefully', () => {
      shell = new ShellRPC();
      // Don't initialize - shell is not alive

      const signalResult = shell.interrupt();
      expect(signalResult.success).toBe(false);
      expect(signalResult.error).toBe('Shell process is not alive');
      expect(signalResult.signal).toBe('SIGINT');
    });
  });

  describe('Integration Tests', () => {
    it(
      'should handle timeout + clean environment + signals',
      async () => {
        // Create shell with clean environment and short timeout
        shell = new ShellRPC({
          cleanEnv: true,
          defaultTimeout: 1000,
          env: { TEST_MODE: 'integration' },
        });
        await shell.initialize();

        // Test clean environment
        const envResult = await shell.execute(
          process.platform === 'win32' ? 'echo %TEST_MODE%' : 'echo $TEST_MODE',
        );
        expect(envResult.stdout).toContain('integration');

        // Test timeout termination (use read which blocks)
        const timeoutResult = await shell.execute('sleep 10', 800);
        expect(timeoutResult.timedOut || timeoutResult.exitCode === -1).toBe(true);

        // Test that shell is still alive after timeout
        const status = shell.getStatus();
        expect(status.alive).toBe(true);

        // Test signal support
        const signalResult = shell.interrupt();
        expect(signalResult.success).toBe(true);

        // Clean termination
        const terminateResult = shell.terminate();
        expect(terminateResult.success).toBe(true);
      },
      TIMEOUTS.medium,
    );

    it(
      'should handle parallel command execution correctly',
      async () => {
        shell = new ShellRPC({ defaultTimeout: 2000 });
        await shell.initialize();

        const results = await Promise.all([
          shell.execute('echo "first"'),
          shell.execute('echo "second"'),
          shell.execute('cat', 100), // This will timeout
          shell.execute('echo "third"'),
        ]);

        // Check normal commands succeeded
        expect(results[0].stdout).toContain('first');
        expect(results[0].timedOut).toBe(false);

        expect(results[1].stdout).toContain('second');
        expect(results[1].timedOut).toBe(false);

        // Check timeout command
        expect(results[2].timedOut).toBe(true);

        // Check last command still executed
        expect(results[3].stdout).toContain('third');
        expect(results[3].timedOut).toBe(false);
      },
      TIMEOUTS.long,
    );
  });
});

describe('Environment Module', () => {
  it('should create standard environment with inherited variables', () => {
    const standardEnv = createStandardEnvironment();

    // Should inherit most parent variables
    const parentEnvCount = Object.keys(process.env).length;
    const standardEnvCount = Object.keys(standardEnv).length;

    // Should be roughly similar (minus removed problematic ones)
    expect(Math.abs(parentEnvCount - standardEnvCount)).toBeLessThan(10);

    // Should have our overrides
    expect(standardEnv.TERM).toBe('dumb');
    expect(standardEnv.NO_COLOR).toBe('1');
    expect(standardEnv.CI).toBe('true');

    // Should not have problematic variables
    expect(standardEnv.PS1).toBeUndefined();
    expect(standardEnv.PROMPT).toBeUndefined();
  });

  it('should handle undefined values correctly', () => {
    const customEnv = {
      DEFINED: 'value',
      UNDEFINED: undefined as unknown as string,
    };

    const cleanEnv = createCleanEnvironment(customEnv);

    expect(cleanEnv.DEFINED).toBe('value');
    expect(cleanEnv.UNDEFINED).toBeUndefined();
  });

  it('should include appropriate system paths', () => {
    const cleanEnv = createCleanEnvironment();
    const pathSeparator = process.platform === 'win32' ? ';' : ':';
    const paths = (cleanEnv.PATH ?? '').split(pathSeparator);

    if (process.platform === 'win32') {
      // Should have Windows system paths
      expect(paths.some((p: string) => p.includes('System32'))).toBe(true);
    } else {
      // Should have Unix system paths
      expect(paths).toContain('/usr/bin');
      expect(paths).toContain('/bin');
    }
  });
});
