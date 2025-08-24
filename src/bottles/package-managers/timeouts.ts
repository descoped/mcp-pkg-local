/**
 * Timeout configuration for package manager operations
 *
 * All timeouts use activity-based behavior in Shell-RPC:
 * - Timeouts reset on stdout activity (progress indicators)
 * - Stderr output does NOT reset timeouts (prevents hanging on errors)
 */

/**
 * Environment-based timeout multiplier
 * Allows adjusting timeouts via environment variable or automatically in CI
 * Made dynamic to support environment changes during testing
 */
const getTIMEOUT_MULTIPLIER = (): number =>
  process.env.PKG_LOCAL_TIMEOUT_MULTIPLIER
    ? parseFloat(process.env.PKG_LOCAL_TIMEOUT_MULTIPLIER)
    : process.env.CI
      ? 4.0 // 4x longer timeouts in CI for network operations
      : 1;

/**
 * Package manager operation timeouts in milliseconds
 * Made dynamic to support environment changes during testing
 */
export const PACKAGE_MANAGER_TIMEOUTS = {
  /**
   * Immediate operations (1s)
   * - which/where commands
   * - Environment variable checks
   * - File existence checks
   */
  get immediate() {
    return 1000 * getTIMEOUT_MULTIPLIER();
  },

  /**
   * Quick operations (5s)
   * - Version checks
   * - List packages
   * - Check environment
   */
  get quick() {
    return 5000 * getTIMEOUT_MULTIPLIER();
  },

  /**
   * Standard operations (30s)
   * - Package installation
   * - Package removal
   * - Virtual environment creation
   * - Dependency sync
   */
  get standard() {
    return 30000 * getTIMEOUT_MULTIPLIER();
  },

  /**
   * Extended operations (60s)
   * - Large package installations
   * - Initial cache population
   * - Complex dependency resolution
   * Note: Only used when explicitly needed
   */
  get extended() {
    return 60000 * getTIMEOUT_MULTIPLIER();
  },
};
