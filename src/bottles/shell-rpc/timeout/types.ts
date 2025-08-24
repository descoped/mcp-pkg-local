/**
 * TypeScript type definitions for the Shell-RPC Resilient Timeout system
 *
 * Core interfaces for timeout configuration, state management, and event handling
 * following the two-stage timeout algorithm (ACTIVE → GRACE → EXPIRED)
 */

/**
 * Configuration for resilient timeout behavior
 */
export interface TimeoutConfig {
  /** Initial timeout duration in milliseconds (Stage 1) */
  baseTimeout: number;

  /** Extension duration when activity is detected in ACTIVE stage */
  activityExtension: number;

  /** Grace period duration in milliseconds (Stage 2) */
  graceTimeout: number;

  /** Absolute maximum timeout - prevents infinite extension */
  absoluteMaximum: number;

  /** Patterns that indicate progress - trigger full timeout reset */
  progressPatterns: RegExp[];

  /** Patterns that indicate errors - trigger immediate termination */
  errorPatterns: RegExp[];

  /** Enable debug logging */
  debug?: boolean;
}

/**
 * Internal timeout state tracking
 */
export interface TimeoutState {
  /** Current stage of the timeout algorithm */
  stage: 'ACTIVE' | 'GRACE' | 'EXPIRED';

  /** Primary timer for ACTIVE stage */
  primaryTimer: NodeJS.Timeout | null;

  /** Grace period timer for GRACE stage */
  graceTimer: NodeJS.Timeout | null;

  /** Absolute maximum timer - always runs */
  absoluteTimer: NodeJS.Timeout | null;

  /** Timestamp of last detected activity */
  lastActivity: number;

  /** Timestamp when timeout was started */
  startTime: number;

  /** Whether the timeout has been terminated */
  terminated: boolean;

  /** Reason for termination if terminated */
  terminationReason: string | null;
}

/**
 * Events emitted by the timeout system for observability
 */
export interface TimeoutEvent {
  /** Event timestamp */
  timestamp: number;

  /** Type of timeout event */
  type:
    | 'state_change'
    | 'timer_set'
    | 'timer_cleared'
    | 'pattern_match'
    | 'termination'
    | 'activity';

  /** Event details */
  details: {
    /** Previous state (for state_change events) */
    from?: 'ACTIVE' | 'GRACE' | 'EXPIRED';

    /** New state (for state_change events) */
    to?: 'ACTIVE' | 'GRACE' | 'EXPIRED';

    /** Reason for the event */
    reason?: string;

    /** Pattern that matched (for pattern_match events) */
    pattern?: string;

    /** Timeout duration (for timer_set events) */
    timeout?: number;

    /** Timer type (for timer events) */
    timerType?: 'primary' | 'grace' | 'absolute';

    /** Output data that triggered the event */
    data?: string;
  };
}

/**
 * Result of pattern matching against output
 */
export interface PatternAction {
  /** Action to take based on pattern match */
  action: 'reset' | 'extend' | 'terminate' | 'ignore';

  /** Pattern that matched */
  pattern?: RegExp;

  /** Pattern source (for debugging) */
  patternSource?: string;
}

/**
 * Configuration validation result
 */
export interface ConfigValidation {
  /** Whether configuration is valid */
  valid: boolean;

  /** List of validation errors */
  errors: string[];

  /** List of validation warnings */
  warnings: string[];
}

/**
 * Timeout termination reasons
 */
export type TerminationReason =
  | 'error_detected'
  | 'grace_period_expired'
  | 'absolute_maximum_reached'
  | 'manual_termination'
  | 'external_termination';

/**
 * Timer dependencies for testing (dependency injection)
 */
export interface TimerDependencies {
  /** Get current timestamp */
  getCurrentTime: () => number;

  /** Set a timeout */
  setTimeout: (fn: () => void, ms: number) => NodeJS.Timeout;

  /** Clear a timeout */
  clearTimeout: (timer: NodeJS.Timeout) => void;
}

/**
 * Platform-specific timeout configuration
 */
export interface PlatformTimeoutConfig {
  /** Windows-specific signal handling */
  windowsSignal: 'SIGTERM' | 'SIGKILL';

  /** Unix-specific signal handling */
  unixSignal: NodeJS.Signals;

  /** Platform-specific cleanup strategy */
  cleanupStrategy: 'graceful' | 'immediate';

  /** Platform-specific recovery timeout */
  recoveryTimeout: number;
}

/**
 * Timeout statistics for monitoring
 */
export interface TimeoutStats {
  /** Total number of timeouts created */
  totalCreated: number;

  /** Number of successful completions */
  completions: number;

  /** Number of grace period recoveries */
  graceRecoveries: number;

  /** Number of terminations by reason */
  terminations: {
    error_detected: number;
    grace_period_expired: number;
    absolute_maximum_reached: number;
    manual_termination: number;
    external_termination: number;
  };

  /** Average processing time per output */
  avgProcessingTime: number;

  /** Pattern match statistics */
  patternMatches: {
    progress: number;
    error: number;
  };
}
