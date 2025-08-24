/**
 * Centralized timeout configuration for all tests
 *
 * This module provides consistent timeout values across the test suite,
 * making it easy to adjust timeouts based on environment or requirements.
 *
 * All timeouts use activity-based behavior in Shell-RPC:
 * - Timeouts reset on stdout activity (progress indicators)
 * - Stderr output does NOT reset timeouts (prevents hanging on errors)
 */

/**
 * Base timeout multiplier for CI environments
 * CI environments may be slower, so we allow much longer timeouts for network operations
 */
const getCI_MULTIPLIER = (): number => (process.env.CI ? 4.0 : 1); // 4x longer timeouts in CI for network operations

/**
 * Test timeout presets in milliseconds
 * Made dynamic to support environment changes during testing
 */
export const TIMEOUTS = {
  /**
   * Short operations (5s)
   * - Simple command execution
   * - Version checks
   * - Quick validations
   */
  get short() {
    return 5000 * getCI_MULTIPLIER();
  },

  /**
   * Medium operations (15s)
   * - Virtual environment creation
   * - Small package installations
   * - Cache operations
   */
  get medium() {
    return 15000 * getCI_MULTIPLIER();
  },

  /**
   * Long operations (30s)
   * - Large package installations
   * - Multiple package operations
   * - Complex test scenarios
   */
  get long() {
    return 30000 * getCI_MULTIPLIER();
  },

  /**
   * Default timeout (30s)
   * Used when no specific timeout is provided
   */
  get default() {
    return 30000 * getCI_MULTIPLIER();
  },
};

/**
 * Command execution timeouts
 * These are passed to Shell-RPC execute() calls
 * Made dynamic to support environment changes during testing
 */
export const COMMAND_TIMEOUTS = {
  /**
   * Package manager detection
   */
  get detection() {
    return TIMEOUTS.short;
  },

  /**
   * Version checks
   */
  get version() {
    return TIMEOUTS.short;
  },

  /**
   * List installed packages
   */
  get list() {
    return TIMEOUTS.short;
  },

  /**
   * Create virtual environment
   */
  get venv() {
    return TIMEOUTS.medium;
  },

  /**
   * Install single package
   * In CI, package downloads can be very slow due to network constraints
   */
  get install() {
    return process.env.CI ? 120000 : TIMEOUTS.medium;
  }, // 2 minutes in CI, 15s locally

  /**
   * Uninstall packages
   */
  get uninstall() {
    return TIMEOUTS.medium;
  },

  /**
   * Sync dependencies from lock file
   * In CI, dependency syncing involves multiple downloads and can be very slow
   */
  get sync() {
    return process.env.CI ? 240000 : TIMEOUTS.long;
  }, // 4 minutes in CI, 30s locally

  /**
   * Cache operations
   */
  get cache() {
    return TIMEOUTS.short;
  },
};

/**
 * Test-specific timeout configurations
 * Maps test categories to appropriate timeouts
 */
export const TEST_TIMEOUTS = {
  /**
   * Unit tests should be fast
   */
  unit: TIMEOUTS.short,

  /**
   * Integration tests may take longer
   */
  integration: TIMEOUTS.medium,

  /**
   * End-to-end tests with full workflows
   */
  e2e: TIMEOUTS.long,

  /**
   * Performance tests may need more time
   */
  performance: TIMEOUTS.long,
} as const;
