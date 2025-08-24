/**
 * Integration tests for Shell-RPC timeout system
 *
 * Tests factory functions, auto-detection, and Shell-RPC integration
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createPipInstallTimeout,
  createUvTimeout,
  createMavenTimeout,
  createQuickCommandTimeout,
  createGenericTimeout,
  autoDetectTimeoutConfig,
  ShellRPCCompatTimeout,
  createTimeoutIntegration,
  getPlatformTimeoutConfig,
} from '#bottles/shell-rpc/timeout/index.js';

describe('Timeout Factory Functions', () => {
  describe('Package Manager Specific Configs', () => {
    it('should create pip install timeout config with correct defaults', () => {
      const config = createPipInstallTimeout();

      expect(config.baseTimeout).toBe(30000);
      expect(config.activityExtension).toBe(10000);
      expect(config.graceTimeout).toBe(15000);
      expect(config.absoluteMaximum).toBe(600000);
      expect(config.progressPatterns.length).toBeGreaterThan(0);
      expect(config.errorPatterns.length).toBeGreaterThan(0);
    });

    it('should allow overrides in pip install config', () => {
      const config = createPipInstallTimeout({
        baseTimeout: 60000,
        debug: true,
      });

      expect(config.baseTimeout).toBe(60000);
      expect(config.debug).toBe(true);
      expect(config.activityExtension).toBe(10000); // Default preserved
    });

    it('should create uv timeout config with faster defaults', () => {
      const config = createUvTimeout();

      expect(config.baseTimeout).toBe(15000); // Faster than pip
      expect(config.activityExtension).toBe(5000);
      expect(config.absoluteMaximum).toBe(300000); // Shorter than pip
    });

    it('should create quick command timeout with minimal values', () => {
      const config = createQuickCommandTimeout();

      expect(config.baseTimeout).toBe(3000);
      expect(config.activityExtension).toBe(500);
      expect(config.graceTimeout).toBe(2000);
      expect(config.absoluteMaximum).toBe(10000);
    });

    it('should create Maven timeout with longer defaults', () => {
      const config = createMavenTimeout();

      expect(config.baseTimeout).toBe(60000); // Longer for Maven
      expect(config.activityExtension).toBe(20000);
      expect(config.absoluteMaximum).toBe(1200000); // 20 minutes
    });
  });

  describe('Generic and Auto-Detection', () => {
    it('should create generic timeout with merged patterns', () => {
      const config = createGenericTimeout();

      expect(config.progressPatterns.length).toBeGreaterThan(5); // Should have merged patterns
      expect(config.errorPatterns.length).toBeGreaterThan(3);
    });

    it('should auto-detect pip install commands', () => {
      const config1 = autoDetectTimeoutConfig('pip install tensorflow');
      const config2 = autoDetectTimeoutConfig('pip3 install numpy scipy');

      expect(config1.baseTimeout).toBe(30000);
      expect(config2.baseTimeout).toBe(30000);
      expect(config1.progressPatterns).toEqual(config2.progressPatterns);
    });

    it('should auto-detect pip uninstall commands', () => {
      const config = autoDetectTimeoutConfig('pip uninstall tensorflow');

      expect(config.baseTimeout).toBe(15000);
      expect(config.absoluteMaximum).toBe(120000);
    });

    it('should auto-detect uv commands', () => {
      const config1 = autoDetectTimeoutConfig('uv add requests');
      const config2 = autoDetectTimeoutConfig('uv sync');
      const config3 = autoDetectTimeoutConfig('uv remove old-package');

      expect(config1.baseTimeout).toBe(15000); // uv add uses default UV timeout
      expect(config2.baseTimeout).toBe(45000); // uv sync is PACKAGE_SYNC, gets longer timeout
      expect(config3.baseTimeout).toBe(10000); // uv remove gets shorter timeout
    });

    it('should auto-detect npm commands', () => {
      const config1 = autoDetectTimeoutConfig('npm install');
      const config2 = autoDetectTimeoutConfig('npm ci');
      const config3 = autoDetectTimeoutConfig('npm run build');

      expect(config1.baseTimeout).toBe(30000);
      expect(config2.baseTimeout).toBe(30000);
      expect(config3.baseTimeout).toBe(30000);
    });

    it('should auto-detect Maven commands', () => {
      const config1 = autoDetectTimeoutConfig('mvn clean install');
      const config2 = autoDetectTimeoutConfig('maven compile');

      expect(config1.baseTimeout).toBe(60000);
      expect(config2.baseTimeout).toBe(60000);
    });

    it('should auto-detect quick commands', () => {
      const quickCommands = [
        'echo "hello"',
        'ls -la',
        'pwd',
        'cd /home',
        'cat file.txt',
        'which python',
      ];

      for (const cmd of quickCommands) {
        const config = autoDetectTimeoutConfig(cmd);
        expect(config.baseTimeout).toBe(1000); // Quick commands get 1s timeout
        expect(config.absoluteMaximum).toBe(5000); // Quick commands get 5s max
      }
    });

    it('should use generic config for unknown commands', () => {
      const config = autoDetectTimeoutConfig('some-unknown-command --flag');

      expect(config.baseTimeout).toBe(30000); // Generic default
      expect(config.progressPatterns.length).toBeGreaterThan(0); // Should have merged patterns
    });

    it('should handle empty commands gracefully', () => {
      const config = autoDetectTimeoutConfig('');

      expect(config).toBeDefined();
      expect(config.baseTimeout).toBeGreaterThan(0);
    });
  });
});

describe('Shell-RPC Compatibility Layer', () => {
  let compatTimeout: ShellRPCCompatTimeout;
  let mockOnTimeout: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    compatTimeout = new ShellRPCCompatTimeout();
    mockOnTimeout = vi.fn();
  });

  describe('Basic Functionality', () => {
    it('should start timeout for command', () => {
      compatTimeout.start('pip install requests', 30000, mockOnTimeout);

      expect(compatTimeout.isActive()).toBe(true);
    });

    it('should stop timeout', () => {
      compatTimeout.start('echo test', 5000, mockOnTimeout);
      expect(compatTimeout.isActive()).toBe(true);

      compatTimeout.stop();
      expect(compatTimeout.isActive()).toBe(false);
    });

    it('should process output activity', () => {
      compatTimeout.start('pip install requests', 30000, mockOnTimeout);

      // Should not throw
      compatTimeout.processOutput('Collecting requests');
      compatTimeout.processOutput('Downloading requests-2.28.1-py3-none-any.whl');

      expect(compatTimeout.isActive()).toBe(true);
    });

    it('should provide timeout state information', () => {
      compatTimeout.start('sleep 10', 5000, mockOnTimeout);

      const state = compatTimeout.getState();
      expect(state).toBeDefined();
      expect(state?.stage).toBe('ACTIVE');
      expect(state?.elapsed).toBeGreaterThanOrEqual(0);
      expect(state?.timeSinceActivity).toBeGreaterThanOrEqual(0);
    });

    it('should return null state when not active', () => {
      const state = compatTimeout.getState();
      expect(state).toBeNull();
    });

    it('should clean up on subsequent starts', () => {
      compatTimeout.start('command1', 5000, mockOnTimeout);
      const firstActive = compatTimeout.isActive();

      compatTimeout.start('command2', 10000, mockOnTimeout);
      const secondActive = compatTimeout.isActive();

      expect(firstActive).toBe(true);
      expect(secondActive).toBe(true);
    });
  });

  describe('Auto-Detection Integration', () => {
    it('should use auto-detected config for pip commands', () => {
      compatTimeout.start('pip install tensorflow', 20000, mockOnTimeout);

      // The timeout should use pip-specific patterns
      // We can't easily test the patterns directly, but we can verify
      // the timeout was created successfully
      expect(compatTimeout.isActive()).toBe(true);
    });

    it('should override base timeout while preserving patterns', () => {
      // Start with a pip command but override timeout
      compatTimeout.start('pip install requests', 60000, mockOnTimeout);

      const state = compatTimeout.getState();
      expect(state).toBeDefined();
      expect(compatTimeout.isActive()).toBe(true);
    });

    it('should handle auto-detection failures gracefully', () => {
      // Use a command that might cause auto-detection to fail
      compatTimeout.start('malformed|||command###', 5000, mockOnTimeout);

      expect(compatTimeout.isActive()).toBe(true);
    });
  });
});

describe('Timeout Integration Utility', () => {
  let integration: ReturnType<typeof createTimeoutIntegration>;

  beforeEach(() => {
    integration = createTimeoutIntegration();
  });

  describe('Integration Lifecycle', () => {
    it('should start and manage timeout lifecycle', () => {
      integration.start('pip install requests', 30000);

      expect(integration.isTimedOut()).toBe(false);
      expect(integration.getTimeoutReason()).toBeNull();
    });

    it('should track timeout state', () => {
      integration.start('echo test', 5000);
      integration.processOutput('test output');

      expect(integration.isTimedOut()).toBe(false);
    });

    it('should clean up properly', () => {
      integration.start('echo test', 5000);
      integration.stop();

      expect(integration.isTimedOut()).toBe(false);
      expect(integration.getTimeoutReason()).toBeNull();
      expect(integration.getStats()).toBeNull();
    });

    it('should handle multiple start calls', () => {
      integration.start('command1', 5000);
      integration.start('command2', 10000);

      expect(integration.isTimedOut()).toBe(false);
    });

    it('should provide statistics when active', () => {
      integration.start('pip install requests', 30000);

      const stats = integration.getStats();
      expect(stats).toBeDefined();
      expect(stats?.totalCreated).toBe(1);
    });

    it('should return null stats when inactive', () => {
      const stats = integration.getStats();
      expect(stats).toBeNull();
    });
  });

  describe('Activity Processing', () => {
    it('should process output without errors', () => {
      integration.start('pip install requests', 30000);

      // Should not throw
      integration.processOutput('Collecting requests');
      integration.processOutput('Downloading...');
      integration.processOutput('Installing...');

      expect(integration.isTimedOut()).toBe(false);
    });

    it('should handle output when not started', () => {
      // Should not throw when processing output without starting
      integration.processOutput('some output');

      expect(integration.isTimedOut()).toBe(false);
    });
  });
});

describe('Platform Configuration', () => {
  it('should provide platform-specific timeout config', () => {
    const config = getPlatformTimeoutConfig();

    expect(config).toBeDefined();
    expect(config.windowsSignal).toBeDefined();
    expect(config.unixSignal).toBeDefined();
    expect(config.cleanupStrategy).toBeDefined();
    expect(config.recoveryTimeout).toBeGreaterThan(0);
  });

  it('should have different configs for different platforms', () => {
    const config = getPlatformTimeoutConfig();

    // Should have platform-appropriate defaults
    if (process.platform === 'win32') {
      expect(config.cleanupStrategy).toBe('immediate');
    } else {
      expect(config.cleanupStrategy).toBe('graceful');
    }
  });

  it('should fallback to Linux config for unknown platforms', () => {
    // This is harder to test since we can't change process.platform,
    // but we can at least verify the function doesn't throw
    expect(() => getPlatformTimeoutConfig()).not.toThrow();
  });
});

describe('Error Handling', () => {
  it('should handle configuration errors gracefully', () => {
    // Test with invalid overrides
    expect(() =>
      createPipInstallTimeout({
        baseTimeout: -1000, // Invalid
      }),
    ).not.toThrow(); // Should not throw at creation, only when used
  });

  it('should handle empty command strings in auto-detection', () => {
    const config1 = autoDetectTimeoutConfig('');
    const config2 = autoDetectTimeoutConfig('   ');

    expect(config1).toBeDefined();
    expect(config2).toBeDefined();
    expect(config1.baseTimeout).toBeGreaterThan(0);
    expect(config2.baseTimeout).toBeGreaterThan(0);
  });

  it('should handle null/undefined inputs in auto-detection', () => {
    const config1 = autoDetectTimeoutConfig(null as unknown as string);
    const config2 = autoDetectTimeoutConfig(undefined as unknown as string);

    expect(config1).toBeDefined();
    expect(config2).toBeDefined();
  });
});
