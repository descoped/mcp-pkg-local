/**
 * Shell-RPC Resilient Timeout Integration Layer
 *
 * Public API for the resilient timeout system with factory functions,
 * integration hooks, and backward compatibility wrapper for Shell-RPC.
 */
import type { TimeoutConfig, PlatformTimeoutConfig, TimeoutStats } from './types.js';
import { ResilientTimeout } from './resilient-timeout.js';
import { createPatternConfig, mergePatterns } from './patterns.js';

// Re-export types for convenience
export type {
  TimeoutConfig,
  TimeoutState,
  TimeoutEvent,
  PatternAction,
  TerminationReason,
  TimerDependencies,
  ConfigValidation,
  TimeoutStats,
  PlatformTimeoutConfig,
} from './types.js';

// Re-export main classes
export { ResilientTimeout } from './resilient-timeout.js';
export { PatternMatcher, DEFAULT_PATTERNS, clearPatternCache } from './patterns.js';

/**
 * Factory functions for creating common timeout configurations
 */

/**
 * Create timeout config for pip install operations
 */
export function createPipInstallTimeout(overrides: Partial<TimeoutConfig> = {}): TimeoutConfig {
  return createPatternConfig('PIP_INSTALL', {
    baseTimeout: 30000, // 30 seconds initial
    activityExtension: 10000, // 10 seconds per output
    graceTimeout: 15000, // 15 seconds grace period
    absoluteMaximum: 600000, // 10 minutes absolute maximum
    debug: process.env.DEBUG_SHELL_RPC === 'true',
    ...overrides,
  });
}

/**
 * Create timeout config for pip uninstall operations
 */
export function createPipUninstallTimeout(overrides: Partial<TimeoutConfig> = {}): TimeoutConfig {
  return createPatternConfig('PIP_UNINSTALL', {
    baseTimeout: 15000, // 15 seconds initial
    activityExtension: 5000, // 5 seconds per output
    graceTimeout: 10000, // 10 seconds grace period
    absoluteMaximum: 120000, // 2 minutes absolute maximum
    debug: process.env.DEBUG_SHELL_RPC === 'true',
    ...overrides,
  });
}

/**
 * Create timeout config for uv operations
 */
export function createUvTimeout(overrides: Partial<TimeoutConfig> = {}): TimeoutConfig {
  return createPatternConfig('UV', {
    baseTimeout: 15000, // 15 seconds initial (uv is fast)
    activityExtension: 5000, // 5 seconds per output
    graceTimeout: 10000, // 10 seconds grace period
    absoluteMaximum: 300000, // 5 minutes absolute maximum
    debug: process.env.DEBUG_SHELL_RPC === 'true',
    ...overrides,
  });
}

/**
 * Create timeout config for npm operations
 */
export function createNpmTimeout(overrides: Partial<TimeoutConfig> = {}): TimeoutConfig {
  return createPatternConfig('NPM', {
    baseTimeout: 30000, // 30 seconds initial
    activityExtension: 10000, // 10 seconds per output
    graceTimeout: 15000, // 15 seconds grace period
    absoluteMaximum: 600000, // 10 minutes absolute maximum
    debug: process.env.DEBUG_SHELL_RPC === 'true',
    ...overrides,
  });
}

/**
 * Create timeout config for Maven operations
 */
export function createMavenTimeout(overrides: Partial<TimeoutConfig> = {}): TimeoutConfig {
  return createPatternConfig('MAVEN', {
    baseTimeout: 60000, // 60 seconds initial (Maven can be slow)
    activityExtension: 20000, // 20 seconds per output
    graceTimeout: 30000, // 30 seconds grace period
    absoluteMaximum: 1200000, // 20 minutes absolute maximum
    debug: process.env.DEBUG_SHELL_RPC === 'true',
    ...overrides,
  });
}

/**
 * Create timeout config for quick commands
 */
export function createQuickCommandTimeout(overrides: Partial<TimeoutConfig> = {}): TimeoutConfig {
  return createPatternConfig('QUICK_COMMAND', {
    baseTimeout: 3000, // 3 seconds initial
    activityExtension: 500, // 500ms per output
    graceTimeout: 2000, // 2 seconds grace period
    absoluteMaximum: 10000, // 10 seconds absolute maximum
    debug: process.env.DEBUG_SHELL_RPC === 'true',
    ...overrides,
  });
}

/**
 * Create a generic timeout config suitable for most operations
 */
export function createGenericTimeout(overrides: Partial<TimeoutConfig> = {}): TimeoutConfig {
  const mergedPatterns = mergePatterns('PIP_INSTALL', 'UV', 'NPM', 'QUICK_COMMAND');

  return {
    baseTimeout: 30000, // 30 seconds initial
    activityExtension: 10000, // 10 seconds per output
    graceTimeout: 15000, // 15 seconds grace period
    absoluteMaximum: 600000, // 10 minutes absolute maximum
    debug: process.env.DEBUG_SHELL_RPC === 'true',
    ...mergedPatterns,
    ...overrides,
  };
}

// Import the smart classifier
import {
  smartDetectTimeoutConfig,
  classifyCommand,
  CommandCategory,
} from './command-classifier.js';

// Re-export for convenience
export { classifyCommand, CommandCategory };

/**
 * Auto-detect appropriate timeout config based on command
 * This now uses the smart command classifier for comprehensive detection
 */
export function autoDetectTimeoutConfig(command: string): TimeoutConfig {
  return smartDetectTimeoutConfig(command);
}

/**
 * Backward compatibility wrapper for current Shell-RPC timeout behavior
 *
 * This function creates a ResilientTimeout that mimics the current activity-based
 * timeout behavior in Shell-RPC, making it easy to integrate without breaking changes.
 */
export class ShellRPCCompatTimeout {
  private timeout: ResilientTimeout | null = null;
  private onTimeoutCallback: (() => void) | null = null;

  /**
   * Start a new timeout for the given command
   */
  start(command: string, timeoutMs: number, onTimeout: () => void): void {
    // Clean up any existing timeout
    this.stop();

    // Auto-detect config or create a simple one
    let config: TimeoutConfig;

    try {
      config = autoDetectTimeoutConfig(command);
      // Override the base timeout with the provided value
      config.baseTimeout = timeoutMs;
      config.absoluteMaximum = Math.max(timeoutMs * 3, config.absoluteMaximum);
    } catch {
      // Fallback to basic config if auto-detection fails
      config = {
        baseTimeout: timeoutMs,
        activityExtension: Math.min(timeoutMs / 3, 10000),
        graceTimeout: Math.min(timeoutMs / 2, 15000),
        absoluteMaximum: timeoutMs * 3,
        progressPatterns: [],
        errorPatterns: [],
        debug: process.env.DEBUG_SHELL_RPC === 'true',
      };
    }

    this.onTimeoutCallback = onTimeout;
    this.timeout = new ResilientTimeout(config);

    // Listen for timeout events
    this.timeout.on('timeout', (_reason) => {
      if (this.onTimeoutCallback) {
        this.onTimeoutCallback();
      }
    });
  }

  /**
   * Process output (activity detection)
   */
  processOutput(data: string): void {
    if (this.timeout && !this.timeout.isTerminated()) {
      this.timeout.processOutput(data);
    }
  }

  /**
   * Stop the timeout
   */
  stop(): void {
    if (this.timeout) {
      this.timeout.cleanup();
      this.timeout = null;
    }
    this.onTimeoutCallback = null;
  }

  /**
   * Check if timeout is active
   */
  isActive(): boolean {
    return this.timeout !== null && !this.timeout.isTerminated();
  }

  /**
   * Get current timeout state
   */
  getState(): { stage: string; elapsed: number; timeSinceActivity: number } | null {
    if (!this.timeout) return null;

    const state = this.timeout.getState();
    return {
      stage: state.stage,
      elapsed: this.timeout.getElapsedTime(),
      timeSinceActivity: this.timeout.getTimeSinceLastActivity(),
    };
  }
}

/**
 * Platform-specific timeout configurations
 */
export const PLATFORM_CONFIGS: Partial<Record<NodeJS.Platform, PlatformTimeoutConfig>> = {
  win32: {
    windowsSignal: 'SIGTERM',
    unixSignal: 'SIGTERM',
    cleanupStrategy: 'immediate',
    recoveryTimeout: 5000,
  },
  darwin: {
    windowsSignal: 'SIGTERM',
    unixSignal: 'SIGTERM',
    cleanupStrategy: 'graceful',
    recoveryTimeout: 3000,
  },
  linux: {
    windowsSignal: 'SIGTERM',
    unixSignal: 'SIGTERM',
    cleanupStrategy: 'graceful',
    recoveryTimeout: 3000,
  },
  freebsd: {
    windowsSignal: 'SIGTERM',
    unixSignal: 'SIGTERM',
    cleanupStrategy: 'graceful',
    recoveryTimeout: 3000,
  },
  openbsd: {
    windowsSignal: 'SIGTERM',
    unixSignal: 'SIGTERM',
    cleanupStrategy: 'graceful',
    recoveryTimeout: 3000,
  },
  sunos: {
    windowsSignal: 'SIGTERM',
    unixSignal: 'SIGTERM',
    cleanupStrategy: 'graceful',
    recoveryTimeout: 3000,
  },
  aix: {
    windowsSignal: 'SIGTERM',
    unixSignal: 'SIGTERM',
    cleanupStrategy: 'graceful',
    recoveryTimeout: 3000,
  },
};

/**
 * Get platform-specific timeout config
 */
export function getPlatformTimeoutConfig(): PlatformTimeoutConfig {
  const config = PLATFORM_CONFIGS[process.platform] ?? PLATFORM_CONFIGS.linux;
  if (!config) {
    // Fallback to linux config if not found
    return {
      windowsSignal: 'SIGTERM',
      unixSignal: 'SIGTERM',
      cleanupStrategy: 'graceful',
      recoveryTimeout: 3000,
    };
  }
  return config;
}

/**
 * Integration utility for Shell-RPC execute() method
 */
export interface TimeoutIntegration {
  /** Start timeout for command */
  start: (command: string, timeoutMs: number) => void;

  /** Process output */
  processOutput: (data: string) => void;

  /** Check if timed out */
  isTimedOut: () => boolean;

  /** Get timeout reason */
  getTimeoutReason: () => string | null;

  /** Stop timeout */
  stop: () => void;

  /** Get statistics */
  getStats: () => TimeoutStats | null;
}

/**
 * Create a timeout integration for Shell-RPC
 */
export function createTimeoutIntegration(): TimeoutIntegration {
  let currentTimeout: ResilientTimeout | null = null;
  let isTimedOut = false;
  let timeoutReason: string | null = null;

  return {
    start(command: string, timeoutMs: number): void {
      // Clean up existing timeout
      if (currentTimeout) {
        currentTimeout.cleanup();
      }

      // Reset state
      isTimedOut = false;
      timeoutReason = null;

      // Create new timeout
      const config = autoDetectTimeoutConfig(command);
      config.baseTimeout = timeoutMs;
      config.absoluteMaximum = Math.max(timeoutMs * 3, config.absoluteMaximum);

      currentTimeout = new ResilientTimeout(config);

      currentTimeout.on('timeout', (reason: string) => {
        isTimedOut = true;
        timeoutReason = reason;
      });
    },

    processOutput(data: string): void {
      if (currentTimeout && !currentTimeout.isTerminated()) {
        currentTimeout.processOutput(data);
      }
    },

    isTimedOut(): boolean {
      return isTimedOut;
    },

    getTimeoutReason(): string | null {
      return timeoutReason;
    },

    stop(): void {
      if (currentTimeout) {
        currentTimeout.cleanup();
        currentTimeout = null;
      }
      isTimedOut = false;
      timeoutReason = null;
    },

    getStats(): TimeoutStats | null {
      return currentTimeout?.getStats() ?? null;
    },
  };
}
