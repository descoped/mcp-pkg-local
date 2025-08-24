/**
 * Enhanced Timeout Integration for Shell-RPC
 *
 * This module provides advanced timeout capabilities with event-driven
 * observability, grace period recovery, and intelligent command classification.
 */
import { EventEmitter } from 'node:events';
import type { TimeoutConfig, TimeoutEvent } from './timeout/types.js';
import {
  ResilientTimeout,
  autoDetectTimeoutConfig,
  CommandCategory,
  classifyCommand,
} from './timeout/index.js';

/**
 * Enhanced timeout integration with full feature utilization
 */
export class EnhancedTimeoutIntegration extends EventEmitter {
  private timeout: ResilientTimeout | null = null;
  private category: CommandCategory = CommandCategory.UNKNOWN;
  private config: TimeoutConfig | null = null;
  private graceRecoveryAttempts = 0;

  constructor() {
    super();
  }

  /**
   * Start timeout with intelligent configuration
   */
  start(command: string, requestedTimeout?: number): void {
    // Clean up any existing timeout
    this.stop();

    // Reset state
    this.graceRecoveryAttempts = 0;

    // Classify the command
    this.category = classifyCommand(command);

    // If a specific timeout is requested, use it directly
    if (requestedTimeout !== undefined && requestedTimeout > 0) {
      // For explicit timeouts (especially in tests), use the exact requested value
      // For small timeouts (< 1000ms), use minimal grace period
      const isSmallTimeout = requestedTimeout < 1000;

      this.config = {
        // Use the exact requested timeout as the base, don't reduce it
        baseTimeout: requestedTimeout,
        // Small activity extension for small timeouts
        activityExtension: isSmallTimeout ? 50 : Math.min(requestedTimeout * 0.1, 1000),
        // Small grace period for small timeouts
        graceTimeout: isSmallTimeout ? 100 : Math.floor(requestedTimeout * 0.15),
        // Allow some headroom for maximum
        absoluteMaximum: requestedTimeout * 3,
        progressPatterns: [],
        errorPatterns: [],
        debug: process.env.DEBUG_TIMEOUT === 'true',
      };
    } else {
      // Get smart timeout configuration for unspecified timeouts
      this.config = autoDetectTimeoutConfig(command);
    }

    // Log configuration if debug is enabled
    if (this.config.debug || process.env.DEBUG_TIMEOUT) {
      console.error('[EnhancedTimeout] Starting timeout for command:', {
        command: command.substring(0, 100),
        category: this.category,
        baseTimeout: this.config.baseTimeout,
        graceTimeout: this.config.graceTimeout,
        absoluteMaximum: this.config.absoluteMaximum,
        progressPatterns: this.config.progressPatterns?.length ?? 0,
        errorPatterns: this.config.errorPatterns?.length ?? 0,
      });
    }

    // Create the resilient timeout
    this.timeout = new ResilientTimeout(this.config);

    // Set up event listeners for observability
    this.setupEventListeners();

    // Emit start event
    this.emit('timeout:started', command, this.category, this.config);
  }

  /**
   * Process output with pattern matching and activity detection
   */
  processOutput(data: string): void {
    if (!this.timeout || this.timeout.isTerminated()) {
      return;
    }

    // Process through timeout system (this handles pattern matching internally)
    this.timeout.processOutput(data);

    // Emit activity event
    // Note: We can't get the exact action from ResilientTimeout, so we emit a generic activity
    this.emit('timeout:activity', data, 'extend');

    // Check if we're in grace period and potentially recovered
    const state = this.timeout.getState();
    if (state.stage === 'GRACE' && state.lastActivity > Date.now() - 1000) {
      // Recent activity in grace period might indicate recovery
      this.graceRecoveryAttempts++;
      this.emit('timeout:grace_recovered');

      if (this.config?.debug) {
        console.error(
          `[EnhancedTimeout] Potential grace period recovery #${this.graceRecoveryAttempts}`,
        );
      }
    }
  }

  /**
   * Get current timeout state
   */
  getState(): ReturnType<ResilientTimeout['getState']> | null {
    return this.timeout?.getState() ?? null;
  }

  /**
   * Stop the timeout and clean up
   */
  stop(): void {
    if (this.timeout) {
      const stats = this.timeout.getStats();
      this.timeout.cleanup();
      this.timeout = null;

      // Emit stop event with final stats
      this.emit('timeout:stopped', stats);
    }

    // Reset state
    this.graceRecoveryAttempts = 0;
  }

  /**
   * Set up event listeners on the ResilientTimeout
   */
  private setupEventListeners(): void {
    if (!this.timeout) return;

    // State change events
    this.timeout.on('state_changed', (event: TimeoutEvent) => {
      const { from, to } = event.details as { from: string; to: string };
      this.emit('timeout:state_changed', from, to);

      if (to === 'GRACE') {
        this.emit('timeout:grace_entered');

        if (this.config?.debug) {
          console.error('[EnhancedTimeout] Entered grace period - command has chance to recover');
        }
      }
    });

    // Timeout event
    this.timeout.on('timeout', (reason: string) => {
      this.emit('timeout:expired', reason);

      if (this.config?.debug) {
        console.error(`[EnhancedTimeout] Timeout expired: ${reason}`);
      }
    });

    // Pattern match events for debugging
    if (this.config?.debug) {
      this.timeout.on('pattern_matched', (event: TimeoutEvent) => {
        console.error('[EnhancedTimeout] Pattern matched:', event.details);
      });

      this.timeout.on('timer_extended', (event: TimeoutEvent) => {
        console.error('[EnhancedTimeout] Timer extended:', event.details);
      });

      this.timeout.on('timer_reset', (event: TimeoutEvent) => {
        console.error('[EnhancedTimeout] Timer reset:', event.details);
      });
    }
  }
}
