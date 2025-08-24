/**
 * ResilientTimeout - Core state machine for two-stage timeout algorithm
 *
 * Implements the ACTIVE → GRACE → EXPIRED state transition model with
 * pattern-based behavior modification and comprehensive event emission
 * for observability and debugging.
 */
import { EventEmitter } from 'node:events';
import { setTimeout, clearTimeout } from 'node:timers';
import type {
  TimeoutConfig,
  TimeoutState,
  TimeoutEvent,
  TerminationReason,
  TimerDependencies,
  ConfigValidation,
  TimeoutStats,
} from './types.js';
import { PatternMatcher } from './patterns.js';

/**
 * Main ResilientTimeout class implementing the two-stage timeout algorithm
 */
export class ResilientTimeout extends EventEmitter {
  private readonly config: TimeoutConfig;
  private readonly patternMatcher: PatternMatcher;
  private readonly deps: TimerDependencies;
  private readonly debug: boolean;

  private readonly state: TimeoutState;
  private readonly stats: TimeoutStats;
  private hasReceivedActivity = false;

  constructor(config: TimeoutConfig, dependencies?: Partial<TimerDependencies>) {
    super();

    this.config = this.validateConfig(config);
    this.patternMatcher = new PatternMatcher(this.config);
    this.debug = config.debug ?? false;

    // Allow dependency injection for testing
    this.deps = {
      getCurrentTime: dependencies?.getCurrentTime ?? (() => Date.now()),
      setTimeout: dependencies?.setTimeout ?? setTimeout,
      clearTimeout: dependencies?.clearTimeout ?? clearTimeout,
      ...dependencies,
    };

    // Initialize state
    const now = this.deps.getCurrentTime();
    this.state = {
      stage: 'ACTIVE',
      primaryTimer: null,
      graceTimer: null,
      absoluteTimer: null,
      lastActivity: now,
      startTime: now,
      terminated: false,
      terminationReason: null,
    };

    // Initialize stats
    this.stats = {
      totalCreated: 1,
      completions: 0,
      graceRecoveries: 0,
      terminations: {
        error_detected: 0,
        grace_period_expired: 0,
        absolute_maximum_reached: 0,
        manual_termination: 0,
        external_termination: 0,
      },
      avgProcessingTime: 0,
      patternMatches: {
        progress: 0,
        error: 0,
      },
    };

    // Start the timeout system
    this.start();
  }

  /**
   * Process output data and update timeout state accordingly
   * This is the main entry point for timeout activity detection
   */
  processOutput(data: string): void {
    const startTime = this.deps.getCurrentTime();

    if (this.state.terminated) {
      return; // Already terminated, ignore further output
    }

    this.emitEvent({
      timestamp: startTime,
      type: 'activity',
      details: {
        data: this.debug ? data : data.substring(0, 100), // Truncate for logging
      },
    });

    // Process pattern matching
    const action = this.patternMatcher.processOutput(data);

    // Handle pattern-based actions
    switch (action.action) {
      case 'terminate':
        this.stats.patternMatches.error++;
        this.emitEvent({
          timestamp: this.deps.getCurrentTime(),
          type: 'pattern_match',
          details: {
            pattern: action.patternSource,
            reason: 'error_pattern_matched',
          },
        });
        this.internalTerminate('error_detected');
        break;

      case 'reset':
        this.stats.patternMatches.progress++;
        this.emitEvent({
          timestamp: this.deps.getCurrentTime(),
          type: 'pattern_match',
          details: {
            pattern: action.patternSource,
            reason: 'progress_pattern_matched',
          },
        });
        this.hasReceivedActivity = true;
        this.transitionToActive(this.config.baseTimeout);
        break;

      case 'extend':
      default:
        // Handle regular activity based on current stage
        this.handleRegularActivity();
        break;
    }

    this.state.lastActivity = this.deps.getCurrentTime();

    // Update processing time stats
    const processingTime = this.deps.getCurrentTime() - startTime;
    this.stats.avgProcessingTime = (this.stats.avgProcessingTime + processingTime) / 2;
  }

  /**
   * Handle regular activity (no pattern match) based on current stage
   */
  private handleRegularActivity(): void {
    switch (this.state.stage) {
      case 'ACTIVE':
        // Only extend timer if we've received activity before
        // The first activity shouldn't modify the initial baseTimeout
        if (this.hasReceivedActivity) {
          // Extend the primary timer
          this.extendPrimaryTimer(this.config.activityExtension);
        }
        // Mark that we've now received activity
        this.hasReceivedActivity = true;
        break;

      case 'GRACE':
        // Activity during grace period - recover to ACTIVE!
        this.stats.graceRecoveries++;
        this.hasReceivedActivity = true;
        this.transitionToActive(this.config.baseTimeout);
        break;

      case 'EXPIRED':
        // Too late, already terminated
        break;
    }
  }

  /**
   * Start the timeout system
   */
  private start(): void {
    // Set the absolute maximum timer (always runs)
    this.state.absoluteTimer = this.deps.setTimeout(() => {
      if (!this.state.terminated) {
        this.internalTerminate('absolute_maximum_reached');
      }
    }, this.config.absoluteMaximum);

    // Emit absolute timer event before transitioning to active
    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'timer_set',
      details: {
        timerType: 'absolute',
        timeout: this.config.absoluteMaximum,
        reason: 'absolute_maximum_timer',
      },
    });

    // Start in ACTIVE stage
    this.transitionToActive(this.config.baseTimeout);
  }

  /**
   * Transition to ACTIVE stage with specified timeout
   */
  private transitionToActive(timeout: number): void {
    const previousStage = this.state.stage;

    // Clear any existing timers
    this.clearAllTimers(false); // Don't clear absolute timer

    // Set new primary timer
    this.state.stage = 'ACTIVE';
    this.state.primaryTimer = this.deps.setTimeout(() => {
      this.onPrimaryTimeout();
    }, timeout);

    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'state_change',
      details: {
        from: previousStage,
        to: 'ACTIVE',
        reason: 'timeout_reset',
      },
    });

    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'timer_set',
      details: {
        timerType: 'primary',
        timeout,
        reason: 'active_stage_timer',
      },
    });
  }

  /**
   * Extend the primary timer (only in ACTIVE stage)
   */
  private extendPrimaryTimer(extensionMs: number): void {
    if (this.state.stage !== 'ACTIVE' || !this.state.primaryTimer) {
      return;
    }

    // Clear the existing timer
    this.deps.clearTimeout(this.state.primaryTimer);

    // Set a new timer with the extension
    this.state.primaryTimer = this.deps.setTimeout(() => {
      this.onPrimaryTimeout();
    }, extensionMs);

    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'timer_set',
      details: {
        timerType: 'primary',
        timeout: extensionMs,
        reason: 'activity_extension',
      },
    });
  }

  /**
   * Handle primary timer expiration - transition to GRACE stage
   */
  private onPrimaryTimeout(): void {
    if (this.state.terminated || this.state.stage !== 'ACTIVE') {
      return;
    }

    // Transition to GRACE stage
    this.state.stage = 'GRACE';
    this.state.primaryTimer = null;

    // Emit timer cleared event since primary timer has expired
    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'timer_cleared',
      details: { timerType: 'primary' },
    });

    // Set grace timer
    this.state.graceTimer = this.deps.setTimeout(() => {
      this.onGraceTimeout();
    }, this.config.graceTimeout);

    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'state_change',
      details: {
        from: 'ACTIVE',
        to: 'GRACE',
        reason: 'primary_timeout_expired',
      },
    });

    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'timer_set',
      details: {
        timerType: 'grace',
        timeout: this.config.graceTimeout,
        reason: 'grace_period_timer',
      },
    });
  }

  /**
   * Handle grace timer expiration - terminate
   */
  private onGraceTimeout(): void {
    if (this.state.terminated) {
      return;
    }

    this.internalTerminate('grace_period_expired');
  }

  /**
   * Terminate the timeout with specified reason
   */
  private internalTerminate(reason: TerminationReason): void {
    if (this.state.terminated) {
      return; // Already terminated
    }

    // Update state
    const previousStage = this.state.stage;
    this.state.stage = 'EXPIRED';
    this.state.terminated = true;
    this.state.terminationReason = reason;

    // Clear all timers
    this.clearAllTimers(true);

    // Update stats
    this.stats.terminations[reason]++;

    // Emit events
    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'state_change',
      details: {
        from: previousStage,
        to: 'EXPIRED',
        reason: `terminated_${reason}`,
      },
    });

    this.emitEvent({
      timestamp: this.deps.getCurrentTime(),
      type: 'termination',
      details: {
        reason,
      },
    });

    // Emit termination event for external listeners
    this.emit('timeout', reason);
  }

  /**
   * Manually terminate the timeout
   */
  terminate(reason: TerminationReason = 'manual_termination'): void {
    this.internalTerminate(reason);
  }

  /**
   * Clear all timers
   */
  private clearAllTimers(includeAbsolute = true): void {
    if (this.state.primaryTimer) {
      this.deps.clearTimeout(this.state.primaryTimer);
      this.state.primaryTimer = null;
      this.emitEvent({
        timestamp: this.deps.getCurrentTime(),
        type: 'timer_cleared',
        details: { timerType: 'primary' },
      });
    }

    if (this.state.graceTimer) {
      this.deps.clearTimeout(this.state.graceTimer);
      this.state.graceTimer = null;
      this.emitEvent({
        timestamp: this.deps.getCurrentTime(),
        type: 'timer_cleared',
        details: { timerType: 'grace' },
      });
    }

    if (includeAbsolute && this.state.absoluteTimer) {
      this.deps.clearTimeout(this.state.absoluteTimer);
      this.state.absoluteTimer = null;
      this.emitEvent({
        timestamp: this.deps.getCurrentTime(),
        type: 'timer_cleared',
        details: { timerType: 'absolute' },
      });
    }
  }

  /**
   * Emit a timeout event with debug logging
   */
  private emitEvent(event: TimeoutEvent): void {
    this.emit('timeout-event', event);

    if (this.debug) {
      const details = Object.keys(event.details).length > 0 ? event.details : '';
      console.error(`[ResilientTimeout] ${event.type}:`, details);
    }
  }

  /**
   * Get current timeout state (read-only)
   */
  getState(): Readonly<TimeoutState> {
    return { ...this.state };
  }

  /**
   * Get timeout statistics
   */
  getStats(): Readonly<TimeoutStats> {
    return { ...this.stats };
  }

  /**
   * Check if timeout is terminated
   */
  isTerminated(): boolean {
    return this.state.terminated;
  }

  /**
   * Get termination reason (if terminated)
   */
  getTerminationReason(): string | null {
    return this.state.terminationReason;
  }

  /**
   * Get elapsed time since timeout started
   */
  getElapsedTime(): number {
    return this.deps.getCurrentTime() - this.state.startTime;
  }

  /**
   * Get time since last activity
   */
  getTimeSinceLastActivity(): number {
    return this.deps.getCurrentTime() - this.state.lastActivity;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.clearAllTimers(true);
    this.removeAllListeners();
  }

  /**
   * Validate timeout configuration
   */
  private validateConfig(config: TimeoutConfig): TimeoutConfig {
    const validation = this.validateConfigInternal(config);

    if (!validation.valid) {
      throw new Error(`Invalid timeout configuration: ${validation.errors.join(', ')}`);
    }

    if (validation.warnings.length > 0 && this.debug) {
      console.warn('[ResilientTimeout] Configuration warnings:', validation.warnings);
    }

    return config;
  }

  /**
   * Internal configuration validation
   */
  private validateConfigInternal(config: TimeoutConfig): ConfigValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required numeric fields
    if (!Number.isInteger(config.baseTimeout) || config.baseTimeout <= 0) {
      errors.push('baseTimeout must be a positive integer');
    }

    if (!Number.isInteger(config.activityExtension) || config.activityExtension <= 0) {
      errors.push('activityExtension must be a positive integer');
    }

    if (!Number.isInteger(config.graceTimeout) || config.graceTimeout <= 0) {
      errors.push('graceTimeout must be a positive integer');
    }

    if (!Number.isInteger(config.absoluteMaximum) || config.absoluteMaximum <= 0) {
      errors.push('absoluteMaximum must be a positive integer');
    }

    // Validate relationships between timeouts
    if (config.absoluteMaximum <= config.baseTimeout + config.graceTimeout) {
      warnings.push(
        'absoluteMaximum should be significantly larger than baseTimeout + graceTimeout',
      );
    }

    if (config.graceTimeout >= config.baseTimeout) {
      warnings.push(
        'graceTimeout is larger than or equal to baseTimeout - this may cause unexpected behavior',
      );
    }

    // Validate pattern arrays
    if (!Array.isArray(config.progressPatterns)) {
      errors.push('progressPatterns must be an array');
    }

    if (!Array.isArray(config.errorPatterns)) {
      errors.push('errorPatterns must be an array');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
