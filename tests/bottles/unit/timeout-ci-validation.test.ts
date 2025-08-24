/**
 * Test timeout configuration validation
 *
 * Validates that CI timeout multipliers are applied correctly
 * across all timeout configurations.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('CI Timeout Configuration Validation', () => {
  let originalCiValue: string | undefined;

  beforeAll(() => {
    // Save original CI environment variable
    originalCiValue = process.env.CI;
  });

  afterAll(() => {
    // Restore original CI environment variable
    if (originalCiValue === undefined) {
      delete process.env.CI;
    } else {
      process.env.CI = originalCiValue;
    }
  });

  it('should apply 4x multiplier for CI environments in command timeouts', async () => {
    // Set CI environment
    process.env.CI = 'true';

    // Dynamic import to get updated values (ES module equivalent)
    const timeoutsModule = (await import('../../config/timeouts.js?t=' + Date.now())) as {
      COMMAND_TIMEOUTS: Record<string, number>;
    };
    const CI_COMMAND_TIMEOUTS = timeoutsModule.COMMAND_TIMEOUTS;

    // Test that install timeout is specifically configured for CI
    expect(CI_COMMAND_TIMEOUTS.install).toBe(120000); // 2 minutes
    expect(CI_COMMAND_TIMEOUTS.sync).toBe(240000); // 4 minutes

    // Test other timeouts have 4x multiplier
    expect(CI_COMMAND_TIMEOUTS.detection).toBeGreaterThan(15000); // 5s * 4 = 20s
    expect(CI_COMMAND_TIMEOUTS.venv).toBeGreaterThan(45000); // 15s * 4 = 60s
  });

  it('should apply 4x multiplier for CI environments in package manager timeouts', async () => {
    // Set CI environment
    process.env.CI = 'true';

    // Dynamic import to get updated values (ES module equivalent)
    const timeoutsModule = (await import('#bottles/package-managers/timeouts?t=' + Date.now())) as {
      PACKAGE_MANAGER_TIMEOUTS: Record<string, number>;
    };
    const CI_PM_TIMEOUTS = timeoutsModule.PACKAGE_MANAGER_TIMEOUTS;

    // Test 4x multiplier is applied
    expect(CI_PM_TIMEOUTS.immediate).toBe(4000); // 1s * 4
    expect(CI_PM_TIMEOUTS.quick).toBe(20000); // 5s * 4
    expect(CI_PM_TIMEOUTS.standard).toBe(120000); // 30s * 4
    expect(CI_PM_TIMEOUTS.extended).toBe(240000); // 60s * 4
  });

  it('should use normal timeouts in non-CI environments', async () => {
    // Unset CI environment and timeout multiplier
    delete process.env.CI;
    delete process.env.PKG_LOCAL_TIMEOUT_MULTIPLIER;

    // Dynamic imports to get updated values (ES module equivalent)
    const commandTimeoutsModule = (await import('../../config/timeouts.js?t=' + Date.now())) as {
      COMMAND_TIMEOUTS: Record<string, number>;
    };
    const packageTimeoutsModule = (await import(
      '#bottles/package-managers/timeouts?t=' + Date.now()
    )) as { PACKAGE_MANAGER_TIMEOUTS: Record<string, number> };

    const LOCAL_COMMAND_TIMEOUTS = commandTimeoutsModule.COMMAND_TIMEOUTS;
    const LOCAL_PM_TIMEOUTS = packageTimeoutsModule.PACKAGE_MANAGER_TIMEOUTS;

    // Test normal timeouts (15s base for medium operations)
    expect(LOCAL_COMMAND_TIMEOUTS.install).toBe(15000); // medium timeout
    expect(LOCAL_COMMAND_TIMEOUTS.detection).toBe(5000); // short timeout
    expect(LOCAL_COMMAND_TIMEOUTS.venv).toBe(15000); // medium timeout

    // Test package manager timeouts
    expect(LOCAL_PM_TIMEOUTS.immediate).toBe(1000);
    expect(LOCAL_PM_TIMEOUTS.quick).toBe(5000);
    expect(LOCAL_PM_TIMEOUTS.standard).toBe(30000);
    expect(LOCAL_PM_TIMEOUTS.extended).toBe(60000);
  });

  it('should have reasonable timeout values for package installations in CI', async () => {
    // Set CI environment
    process.env.CI = 'true';

    // Dynamic import to get updated values (ES module equivalent)
    const testUtilsModule = (await import(
      '../integration/common/test-utils.js?t=' + Date.now()
    )) as {
      TEST_TIMEOUTS: Record<string, number>;
    };
    const CI_TEST_TIMEOUTS = testUtilsModule.TEST_TIMEOUTS;

    // Test that install timeouts are sufficient for CI network operations
    expect(CI_TEST_TIMEOUTS.install).toBeGreaterThanOrEqual(120000); // At least 2 minutes
    expect(CI_TEST_TIMEOUTS.sync).toBeGreaterThanOrEqual(240000); // At least 4 minutes

    // Test that timeouts are not excessive (max 5 minutes for single operations)
    expect(CI_TEST_TIMEOUTS.install).toBeLessThanOrEqual(300000);
    expect(CI_TEST_TIMEOUTS.sync).toBeLessThanOrEqual(300000);
  });

  it('should allow manual timeout override via environment variable', async () => {
    // Unset CI environment and set manual override
    delete process.env.CI;
    process.env.PKG_LOCAL_TIMEOUT_MULTIPLIER = '2.5';

    // Dynamic import to get updated values (ES module equivalent)
    const overrideModule = (await import('#bottles/package-managers/timeouts?t=' + Date.now())) as {
      PACKAGE_MANAGER_TIMEOUTS: Record<string, number>;
    };
    const OVERRIDE_TIMEOUTS = overrideModule.PACKAGE_MANAGER_TIMEOUTS;

    // Test manual override takes precedence
    expect(OVERRIDE_TIMEOUTS.standard).toBe(75000); // 30s * 2.5
    expect(OVERRIDE_TIMEOUTS.quick).toBe(12500); // 5s * 2.5

    // Clean up
    delete process.env.PKG_LOCAL_TIMEOUT_MULTIPLIER;
  });
});
