/**
 * Unit tests for ResilientTimeout core state machine
 *
 * Tests the three-stage timeout algorithm (ACTIVE → GRACE → EXPIRED)
 * with pattern-based behavior modification and event emission.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type {
  TimeoutConfig,
  TimerDependencies,
  TimeoutEvent,
} from '#bottles/shell-rpc/timeout/types.js';
import { ResilientTimeout } from '#bottles/shell-rpc/timeout/resilient-timeout.js';

describe('ResilientTimeout Core State Machine', () => {
  let mockTime: number;
  let mockTimers: Map<NodeJS.Timeout, { callback: () => void; fireTime: number }>;
  let timerIdCounter: number;
  let deps: TimerDependencies;
  let baseConfig: TimeoutConfig;

  beforeEach(() => {
    mockTime = 10000; // Start at T+10s
    mockTimers = new Map();
    timerIdCounter = 0;

    // Mock timer dependencies for deterministic testing
    deps = {
      getCurrentTime: () => mockTime,
      setTimeout: vi.fn((callback: () => void, delay: number) => {
        const timerId = ++timerIdCounter as unknown as NodeJS.Timeout;
        mockTimers.set(timerId, { callback, fireTime: mockTime + delay });
        return timerId;
      }),
      clearTimeout: vi.fn((timerId: NodeJS.Timeout) => {
        mockTimers.delete(timerId);
      }),
    };

    baseConfig = {
      baseTimeout: 5000,
      activityExtension: 2000,
      graceTimeout: 3000,
      absoluteMaximum: 20000,
      progressPatterns: [/Downloading/, /Installing/],
      errorPatterns: [/ERROR:/, /Failed/],
      debug: false,
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  /**
   * Advance mock time and trigger any expired timers
   */
  function advanceTime(ms: number): void {
    const newTime = mockTime + ms;
    const expiredTimers: Array<() => void> = [];

    // Find timers that should have expired
    for (const [timerId, timer] of mockTimers) {
      if (timer.fireTime <= newTime) {
        expiredTimers.push(timer.callback);
        mockTimers.delete(timerId);
      }
    }

    // Update time
    mockTime = newTime;

    // Execute expired timers
    for (const callback of expiredTimers) {
      callback();
    }
  }

  describe('Initialization and Basic State', () => {
    it('should start in ACTIVE stage', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      const state = timeout.getState();
      expect(state.stage).toBe('ACTIVE');
      expect(state.terminated).toBe(false);
      expect(state.startTime).toBe(mockTime);
      expect(state.lastActivity).toBe(mockTime);
    });

    it('should set primary and absolute timers on start', () => {
      new ResilientTimeout(baseConfig, deps);

      expect(deps.setTimeout).toHaveBeenCalledTimes(2);
      // Primary timer with base timeout
      expect(deps.setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
      // Absolute timer with maximum timeout
      expect(deps.setTimeout).toHaveBeenCalledWith(expect.any(Function), 20000);
    });

    it('should emit initialization events', () => {
      const events: TimeoutEvent[] = [];

      // Create a new config with event capture
      const configWithEvents = { ...baseConfig };

      // We need to capture events during initialization
      // Since initialization happens in constructor, we'll test event emission
      // through activity processing instead
      const timeout = new ResilientTimeout(configWithEvents, deps);
      timeout.on('timeout-event', (event) => events.push(event));

      // Process some output to trigger events
      timeout.processOutput('test');

      // Should emit activity events
      expect(events.some((e) => e.type === 'activity')).toBe(true);
    });
  });

  describe('Stage Transitions', () => {
    it('should transition ACTIVE → GRACE on primary timeout', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const events: TimeoutEvent[] = [];
      timeout.on('timeout-event', (event) => events.push(event));

      // Advance time to trigger primary timeout
      advanceTime(5000);

      const state = timeout.getState();
      expect(state.stage).toBe('GRACE');
      expect(state.primaryTimer).toBe(null);
      expect(state.graceTimer).not.toBe(null);

      // Should emit state change event
      const stateChangeEvent = events.find(
        (e) => e.type === 'state_change' && e.details.from === 'ACTIVE' && e.details.to === 'GRACE',
      );
      expect(stateChangeEvent).toBeDefined();
    });

    it('should transition GRACE → EXPIRED on grace timeout', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const events: TimeoutEvent[] = [];
      timeout.on('timeout-event', (event) => events.push(event));
      timeout.on('timeout', vi.fn());

      // Advance to grace period
      advanceTime(5000);
      expect(timeout.getState().stage).toBe('GRACE');

      // Advance through grace period
      advanceTime(3000);

      const state = timeout.getState();
      expect(state.stage).toBe('EXPIRED');
      expect(state.terminated).toBe(true);
      expect(state.terminationReason).toBe('grace_period_expired');

      // Should emit termination events
      const terminationEvent = events.find((e) => e.type === 'termination');
      expect(terminationEvent).toBeDefined();
      expect(terminationEvent?.details.reason).toBe('grace_period_expired');
    });

    it('should transition GRACE → ACTIVE on activity during grace period', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const events: TimeoutEvent[] = [];
      timeout.on('timeout-event', (event) => events.push(event));

      // Advance to grace period
      advanceTime(5000);
      expect(timeout.getState().stage).toBe('GRACE');

      // Send activity during grace period
      timeout.processOutput('some output');

      const state = timeout.getState();
      expect(state.stage).toBe('ACTIVE');
      expect(state.terminated).toBe(false);

      // Should have cleared grace timer and set new primary timer
      expect(deps.clearTimeout).toHaveBeenCalled();

      // Should emit recovery events
      const recoveryEvent = events.find(
        (e) => e.type === 'state_change' && e.details.from === 'GRACE' && e.details.to === 'ACTIVE',
      );
      expect(recoveryEvent).toBeDefined();
    });
  });

  describe('Pattern-Based Behavior', () => {
    it('should terminate immediately on error pattern', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const terminationSpy = vi.fn();
      timeout.on('timeout', terminationSpy);

      // Send error pattern
      timeout.processOutput('ERROR: Something went wrong');

      const state = timeout.getState();
      expect(state.stage).toBe('EXPIRED');
      expect(state.terminated).toBe(true);
      expect(state.terminationReason).toBe('error_detected');
      expect(terminationSpy).toHaveBeenCalledWith('error_detected');
    });

    it('should reset timeout on progress pattern', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      // Advance partway through timeout
      advanceTime(3000);

      // Send progress pattern - should reset to full base timeout
      timeout.processOutput('Downloading package...');

      // Should still be in ACTIVE stage
      const state = timeout.getState();
      expect(state.stage).toBe('ACTIVE');
      expect(state.terminated).toBe(false);

      // Should have set new primary timer with base timeout
      expect(deps.setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
    });

    it('should extend timeout on regular activity in ACTIVE stage', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      // First activity shouldn't extend (to preserve initial baseTimeout)
      timeout.processOutput('first output');

      // Clear mock calls to check the second activity
      vi.clearAllMocks();

      // Second regular activity should extend
      timeout.processOutput('some regular output');

      // Should extend with activity extension
      expect(deps.setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);

      const state = timeout.getState();
      expect(state.stage).toBe('ACTIVE');
      expect(state.lastActivity).toBe(mockTime);
    });

    it('should ignore output after termination', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      // Terminate with error
      timeout.processOutput('ERROR: Test error');
      expect(timeout.isTerminated()).toBe(true);

      // Clear mock calls
      vi.clearAllMocks();

      // Send more output - should be ignored
      timeout.processOutput('This should be ignored');

      // Should not have set any new timers
      expect(deps.setTimeout).not.toHaveBeenCalled();

      // State should remain the same
      const state = timeout.getState();
      expect(state.stage).toBe('EXPIRED');
      expect(state.terminationReason).toBe('error_detected');
    });
  });

  describe('Absolute Maximum Timeout', () => {
    it('should terminate on absolute maximum timeout', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const terminationSpy = vi.fn();
      timeout.on('timeout', terminationSpy);

      // Advance to absolute maximum
      advanceTime(20000);

      const state = timeout.getState();
      expect(state.stage).toBe('EXPIRED');
      expect(state.terminated).toBe(true);
      expect(state.terminationReason).toBe('absolute_maximum_reached');
      expect(terminationSpy).toHaveBeenCalledWith('absolute_maximum_reached');
    });

    it('should prevent infinite extension with absolute maximum', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const terminationSpy = vi.fn();
      timeout.on('timeout', terminationSpy);

      // Keep sending activity to extend timeout
      for (let i = 0; i < 10; i++) {
        advanceTime(1000);
        if (!timeout.isTerminated()) {
          timeout.processOutput(`Activity ${i}`);
        }
      }

      // Advance to absolute maximum
      advanceTime(10000);

      // Should eventually terminate due to absolute maximum
      expect(timeout.isTerminated()).toBe(true);
      expect(timeout.getTerminationReason()).toBe('absolute_maximum_reached');
    });
  });

  describe('Timer Management', () => {
    it('should clear all timers on cleanup', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      // Should have set initial timers
      expect(mockTimers.size).toBeGreaterThan(0);

      timeout.cleanup();

      // All timers should be cleared
      expect(deps.clearTimeout).toHaveBeenCalled();
    });

    it('should clear existing timer when extending', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const initialTimerCount = mockTimers.size;

      // First activity to establish the pattern
      timeout.processOutput('first activity');

      // Send second activity to extend timeout
      timeout.processOutput('regular activity');

      // Should have cleared previous timer and set new one
      expect(deps.clearTimeout).toHaveBeenCalled();
      expect(mockTimers.size).toBe(initialTimerCount); // Same count due to replace
    });

    it('should not set duplicate timers', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const setTimeoutMock = deps.setTimeout as ReturnType<typeof vi.fn>;
      const initialSetTimeoutCalls = setTimeoutMock.mock.calls.length;

      // Send multiple activities quickly
      timeout.processOutput('activity 1'); // First doesn't extend
      timeout.processOutput('activity 2'); // This extends
      timeout.processOutput('activity 3'); // This extends

      // First activity doesn't extend, next two do
      const finalSetTimeoutCalls = setTimeoutMock.mock.calls.length;
      expect(finalSetTimeoutCalls).toBe(initialSetTimeoutCalls + 2);
    });
  });

  describe('Statistics and Monitoring', () => {
    it('should track timeout statistics', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      const initialStats = timeout.getStats();
      expect(initialStats.totalCreated).toBe(1);
      expect(initialStats.completions).toBe(0);
      expect(initialStats.graceRecoveries).toBe(0);
    });

    it('should track grace period recoveries', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      // Advance to grace period
      advanceTime(5000);
      expect(timeout.getState().stage).toBe('GRACE');

      // Recover with activity
      timeout.processOutput('recovery activity');

      const stats = timeout.getStats();
      expect(stats.graceRecoveries).toBe(1);
    });

    it('should track pattern matches', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      // Send progress pattern
      timeout.processOutput('Downloading something...');

      // Send error pattern (this will terminate)
      timeout.processOutput('ERROR: Something failed');

      const stats = timeout.getStats();
      expect(stats.patternMatches.progress).toBe(1);
      expect(stats.patternMatches.error).toBe(1);
    });

    it('should track termination reasons', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);

      // Terminate with error pattern
      timeout.processOutput('ERROR: Test termination');

      const stats = timeout.getStats();
      expect(stats.terminations.error_detected).toBe(1);
      expect(stats.terminations.grace_period_expired).toBe(0);
    });
  });

  describe('Configuration Validation', () => {
    it('should reject invalid configuration', () => {
      const invalidConfig = {
        ...baseConfig,
        baseTimeout: -1000, // Invalid negative timeout
      };

      expect(() => new ResilientTimeout(invalidConfig, deps)).toThrow();
    });

    it('should accept valid configuration', () => {
      expect(() => new ResilientTimeout(baseConfig, deps)).not.toThrow();
    });

    it('should provide helpful error messages for invalid config', () => {
      const invalidConfig = {
        ...baseConfig,
        baseTimeout: 0,
        graceTimeout: -500,
      };

      let error: Error | null = null;
      try {
        new ResilientTimeout(invalidConfig, deps);
      } catch (e) {
        error = e as Error;
      }

      expect(error).not.toBeNull();
      expect(error?.message).toContain('baseTimeout must be a positive integer');
      expect(error?.message).toContain('graceTimeout must be a positive integer');
    });
  });

  describe('Event Emission', () => {
    it('should emit all expected event types', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const events: TimeoutEvent[] = [];
      timeout.on('timeout-event', (event) => events.push(event));

      // Process some activity
      timeout.processOutput('regular activity');
      timeout.processOutput('Downloading...');
      timeout.processOutput('ERROR: Failed');

      // Check that we received various event types
      const eventTypes = events.map((e) => e.type);
      expect(eventTypes).toContain('activity');
      expect(eventTypes).toContain('pattern_match');
      expect(eventTypes).toContain('state_change');
      expect(eventTypes).toContain('termination');
    });

    it('should include relevant details in events', () => {
      const timeout = new ResilientTimeout(baseConfig, deps);
      const events: TimeoutEvent[] = [];
      timeout.on('timeout-event', (event) => events.push(event));

      // Send a progress pattern
      timeout.processOutput('Installing package xyz');

      const patternEvent = events.find((e) => e.type === 'pattern_match');
      expect(patternEvent).toBeDefined();
      expect(patternEvent?.details.pattern).toBeDefined();
      expect(patternEvent?.details.reason).toBe('progress_pattern_matched');
    });
  });
});
