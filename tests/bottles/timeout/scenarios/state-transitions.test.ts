/**
 * Comprehensive State Transition Tests for ResilientTimeout
 *
 * Tests all valid state transitions (ACTIVE → GRACE → EXPIRED),
 * invalid transition attempts, concurrent state changes, and race conditions
 * using the TimeoutSimulator for deterministic behavior validation.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { TimeoutSimulator, ScenarioBuilder, CommonScenarios } from '../simulator.js';
import { TEST_CONFIGS, TimeoutAssertions, BenchmarkUtils } from '../test-utils.js';
import type { TimeoutConfig } from '#bottles/shell-rpc/timeout/types.js';

describe('State Transitions - Comprehensive Testing', () => {
  let config: TimeoutConfig;

  beforeEach(() => {
    config = { ...TEST_CONFIGS.FAST };
  });

  describe('Valid State Transitions', () => {
    describe('ACTIVE → GRACE Transition', () => {
      it('should transition to GRACE when primary timeout expires', () => {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Starting process')
          .expectState(100, 'ACTIVE')
          .addSilence(200, config.baseTimeout - 100) // Start silence after checkpoint
          .expectState(config.baseTimeout + 200, 'GRACE')
          .build();

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario);

        TimeoutAssertions.assertNoValidationErrors(result);
        TimeoutAssertions.assertStateTransition(
          result.stateChanges,
          'ACTIVE',
          'GRACE',
          'primary_timeout',
        );

        // Should have cleared primary timer and set grace timer
        TimeoutAssertions.assertEventOccurred(result.events, 'timer_cleared', {
          timerType: 'primary',
        });
        TimeoutAssertions.assertEventOccurred(result.events, 'timer_set', { timerType: 'grace' });

        expect(result.finalState.stage).toBe('GRACE');
        expect(result.finalState.primaryTimer).toBeNull();
        expect(result.terminated).toBe(false);

        simulator.cleanup();
      });

      it('should transition to GRACE exactly at primary timeout expiration', () => {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Start')
          .addSilence(50, config.baseTimeout + 100) // Start silence after initial output, extend beyond timeout
          .addCheckpoint(config.baseTimeout + 50, 'exact_grace', (state) => {
            if (state.stage !== 'GRACE') {
              return `Expected GRACE at exact timeout, got ${state.stage}`;
            }
            return null;
          })
          .build();

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario);

        TimeoutAssertions.assertNoValidationErrors(result);
        expect(result.stats.checkpointsHit).toBe(1);

        simulator.cleanup();
      });

      it('should handle multiple rapid activities before primary timeout', () => {
        const scenario = new ScenarioBuilder().addOutput(0, 'Start');

        // Add multiple activities throughout the timeout period
        for (let i = 100; i < config.baseTimeout; i += 200) {
          scenario.addOutput(i, `Activity ${i}`);
        }

        scenario
          .addSilence(config.baseTimeout - 100, config.baseTimeout + 200)
          .expectState(config.baseTimeout + 300, 'GRACE');

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);
        // Each activity should have extended the timer
        expect(
          result.events.filter(
            (e) => e.type === 'timer_set' && e.details.reason === 'activity_extension',
          ).length,
        ).toBeGreaterThan(3);

        simulator.cleanup();
      });
    });

    describe('GRACE → EXPIRED Transition', () => {
      it('should transition to EXPIRED when grace period expires', () => {
        // const totalTimeout = config.baseTimeout + config.graceTimeout;
        const scenario = CommonScenarios.basicTimeout(config);

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);
        TimeoutAssertions.assertStateTransition(
          result.stateChanges,
          'GRACE',
          'EXPIRED',
          'grace_period_expired',
        );
        TimeoutAssertions.assertTermination(result, 'grace_period_expired');

        expect(result.finalState.stage).toBe('EXPIRED');
        expect(result.finalState.terminated).toBe(true);

        simulator.cleanup();
      });

      it('should emit termination events on EXPIRED transition', () => {
        const scenario = CommonScenarios.basicTimeout(config);

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);

        // Should emit both state change and termination events
        TimeoutAssertions.assertEventOccurred(result.events, 'state_change', {
          from: 'GRACE',
          to: 'EXPIRED',
        });
        TimeoutAssertions.assertEventOccurred(result.events, 'termination', {
          reason: 'grace_period_expired',
        });

        simulator.cleanup();
      });

      it('should clear all timers on termination', () => {
        const scenario = CommonScenarios.basicTimeout(config);

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);

        // Should clear both grace and absolute timers
        const timerClearEvents = result.events.filter((e) => e.type === 'timer_cleared');
        const clearedTimerTypes = timerClearEvents.map((e) => e.details.timerType);

        expect(clearedTimerTypes).toContain('grace');
        expect(clearedTimerTypes).toContain('absolute');

        simulator.cleanup();
      });
    });

    describe('GRACE → ACTIVE Transition (Recovery)', () => {
      it('should transition from GRACE back to ACTIVE on activity', () => {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Starting')
          .addSilence(50, config.baseTimeout + 50) // Enter grace
          .expectState(config.baseTimeout + 100, 'GRACE', 'in_grace')
          .addOutput(config.baseTimeout + 150, 'Recovery activity') // Recover within grace period
          .expectState(config.baseTimeout + 200, 'ACTIVE', 'recovered_to_active')
          .build();

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario);

        TimeoutAssertions.assertNoValidationErrors(result);

        // Should have both transitions
        TimeoutAssertions.assertStateTransition(result.stateChanges, 'ACTIVE', 'GRACE');
        TimeoutAssertions.assertStateTransition(result.stateChanges, 'GRACE', 'ACTIVE');

        expect(result.finalState.stage).toBe('ACTIVE');
        expect(result.terminated).toBe(false);

        simulator.cleanup();
      });

      it('should reset to full base timeout after grace recovery', () => {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Start')
          .addSilence(50, config.baseTimeout + 50) // Enter grace
          .expectState(config.baseTimeout + 100, 'GRACE')
          .addOutput(config.baseTimeout + 150, 'Recovery') // Recover within grace period
          .expectState(config.baseTimeout + 200, 'ACTIVE')
          // Now wait for full base timeout again from recovery point
          .addSilence(config.baseTimeout + 250, config.baseTimeout)
          .expectState(config.baseTimeout * 2 + 300, 'GRACE');

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);
        expect(result.stats.checkpointsHit).toBe(3);

        simulator.cleanup();
      });

      it('should handle multiple grace period entries and recoveries', () => {
        // Simplified to 2 cycles with proper timing like we did for edge cases
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Start')
          // First cycle: enter grace, then recover
          .addSilence(50, config.baseTimeout + 50) // Enter grace
          .expectState(config.baseTimeout + 100, 'GRACE', 'grace_0')
          .addOutput(config.baseTimeout + 150, 'Recovery 0') // Recover from grace
          .expectState(config.baseTimeout + 200, 'ACTIVE', 'active_0')
          // Second cycle: wait for new timeout, enter grace again, then recover
          .addSilence(config.baseTimeout + 250, config.baseTimeout + 50) // Enter grace again
          .expectState(config.baseTimeout * 2 + 350, 'GRACE', 'grace_1')
          .addOutput(config.baseTimeout * 2 + 400, 'Recovery 1') // Recover from grace
          .expectState(config.baseTimeout * 2 + 450, 'ACTIVE', 'active_1')
          .build();

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario);

        TimeoutAssertions.assertNoValidationErrors(result);
        expect(result.stats.checkpointsHit).toBe(4); // 2 grace + 2 active checkpoints

        simulator.cleanup();
      });
    });

    describe('Direct Termination Transitions', () => {
      it('should transition ACTIVE → EXPIRED on error pattern', () => {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Starting')
          .expectState(100, 'ACTIVE')
          .addOutput(500, 'ERROR: Something went wrong') // Error pattern before timeout expires
          .build();

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario);

        TimeoutAssertions.assertNoValidationErrors(result);
        TimeoutAssertions.assertStateTransition(result.stateChanges, 'ACTIVE', 'EXPIRED');
        TimeoutAssertions.assertTermination(result, 'error_detected');

        simulator.cleanup();
      });

      it('should transition GRACE → EXPIRED on error pattern', () => {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Start')
          .addSilence(50, config.baseTimeout + 50) // Enter grace
          .expectState(config.baseTimeout + 100, 'GRACE')
          .addOutput(config.baseTimeout + 200, 'ERROR: Failed during grace') // Error in grace - immediate termination
          .build();

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario);

        TimeoutAssertions.assertNoValidationErrors(result);
        TimeoutAssertions.assertStateTransition(
          result.stateChanges,
          'GRACE',
          'EXPIRED',
          'error_detected',
        );
        TimeoutAssertions.assertTermination(result, 'error_detected');

        simulator.cleanup();
      });

      it('should handle absolute maximum timeout from any state', () => {
        const scenario = new ScenarioBuilder().addOutput(0, 'Start');

        // Keep extending timeout with regular activity
        let time = 1000;
        while (time < config.absoluteMaximum - config.activityExtension) {
          scenario.addOutput(time, `Activity at ${time}`);
          time += config.activityExtension - 100; // Just before next timeout
        }

        scenario.expectTermination(config.absoluteMaximum + 100, 'absolute_maximum_reached');

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);
        TimeoutAssertions.assertTermination(result, 'absolute_maximum_reached');

        simulator.cleanup();
      });
    });
  });

  describe('Invalid State Transitions', () => {
    it('should not process output after termination', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, 'ERROR: Terminating')
        .expectTermination(1100, 'error_detected')
        .addOutput(2000, 'This should be ignored')
        .addOutput(3000, 'This too should be ignored');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should only have processed 2 outputs (start + error)
      expect(result.performance.processOutputCalls).toBe(2);

      // No new events after termination
      const expiredTime = result.stateChanges.find((sc) => sc.to === 'EXPIRED')?.time ?? 0;
      const eventsAfterTermination = result.events.filter((e) => e.timestamp > expiredTime);
      expect(eventsAfterTermination).toHaveLength(0);

      simulator.cleanup();
    });

    it('should maintain EXPIRED state regardless of input', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'ERROR: Failed') // Terminates immediately
        .addOutput(600, 'More output') // Should be ignored
        .addOutput(700, 'Even more') // Should be ignored
        .build();

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario);

      // Should terminate on error and stay terminated
      TimeoutAssertions.assertTermination(result, 'error_detected');
      expect(result.finalState.stage).toBe('EXPIRED');
      expect(result.terminated).toBe(true);

      // Should only process outputs up to the error
      expect(result.performance.processOutputCalls).toBe(2); // Start + ERROR

      simulator.cleanup();
    });
  });

  describe('Concurrent State Changes', () => {
    it('should handle rapid state transitions correctly', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(config.baseTimeout - 100, 'Installing...') // Reset just before timeout
        .addOutput(config.baseTimeout - 50, 'More output') // Extend
        .addOutput(config.baseTimeout, 'Even more') // Another extend
        // Now let it timeout
        .addSilence(config.baseTimeout, config.baseTimeout + config.graceTimeout + 100);

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should eventually timeout despite the resets/extensions
      TimeoutAssertions.assertTermination(result, 'grace_period_expired');

      // Should have multiple timer set events
      const timerSetEvents = result.events.filter((e) => e.type === 'timer_set');
      expect(timerSetEvents.length).toBeGreaterThan(3);

      simulator.cleanup();
    });

    it('should handle pattern conflicts deterministically', () => {
      // Create a custom config with overlapping patterns
      const conflictConfig = {
        ...config,
        progressPatterns: [/Installing package/],
        errorPatterns: [/ERROR: Installing package failed/],
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, 'ERROR: Installing package failed') // Should trigger error (priority)
        .expectTermination(1100, 'error_detected');

      const simulator = new TimeoutSimulator(conflictConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Error pattern should win over progress pattern
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle simultaneous timer expiration scenarios', () => {
      // Simplified test: just verify the transitions happen correctly
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addSilence(100, config.baseTimeout + config.graceTimeout + 100) // Long silence covers both timeouts
        .build();

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario);

      // Should have both transitions
      TimeoutAssertions.assertStateTransition(result.stateChanges, 'ACTIVE', 'GRACE');
      TimeoutAssertions.assertStateTransition(result.stateChanges, 'GRACE', 'EXPIRED');

      // Should terminate after grace period
      TimeoutAssertions.assertTermination(result, 'grace_period_expired');
      expect(result.terminated).toBe(true);

      simulator.cleanup();
    });
  });

  describe('Race Condition Prevention', () => {
    it('should handle timer clearing during state transitions', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addSilence(0, config.baseTimeout - 10) // Almost timeout
        .addOutput(config.baseTimeout - 10, 'Installing...') // Reset just before
        .addOutput(config.baseTimeout - 5, 'More progress') // Another reset
        .expectState(config.baseTimeout + 100, 'ACTIVE', 'should_be_active');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have properly cleared and reset timers
      const clearEvents = result.events.filter((e) => e.type === 'timer_cleared');
      const setEvents = result.events.filter((e) => e.type === 'timer_set');

      expect(clearEvents.length).toBeGreaterThan(0);
      expect(setEvents.length).toBeGreaterThan(clearEvents.length); // More sets than clears

      simulator.cleanup();
    });

    it('should maintain state consistency under rapid activity', () => {
      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Rapid activity bursts
      for (let i = 0; i < 10; i++) {
        const time = i * 50;
        scenario.addOutput(time, `Rapid ${i}`);
      }

      scenario
        .expectState(600, 'ACTIVE', 'still_active')
        .addSilence(500, config.baseTimeout + config.graceTimeout)
        .expectTermination(
          500 + config.baseTimeout + config.graceTimeout + 100,
          'grace_period_expired',
        );

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.performance.processOutputCalls).toBe(11); // 10 rapid + 1 start

      simulator.cleanup();
    });

    it('should handle overlapping timer operations', () => {
      // Test scenario where timer operations might overlap
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(100, 'Activity 1') // Sets timer
        .addOutput(150, 'Activity 2') // Should clear previous and set new
        .addOutput(200, 'Installing...') // Should clear and reset to base timeout
        .addOutput(250, 'Activity 3') // Should extend
        .expectState(500, 'ACTIVE', 'consistent_state');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Final state should be consistent
      expect(result.finalState.stage).toBe('ACTIVE');
      expect(result.finalState.terminated).toBe(false);

      simulator.cleanup();
    });
  });

  describe('Performance Under State Transitions', () => {
    it('should maintain performance during frequent transitions', () => {
      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Create many state-affecting events
      for (let i = 0; i < 100; i++) {
        const time = i * 20;
        if (i % 10 === 0) {
          scenario.addOutput(time, 'Installing...'); // Reset
        } else if (i % 15 === 0) {
          scenario.addOutput(time, 'ERROR: Temp failure'); // Would terminate, but let's use regular
        } else {
          scenario.addOutput(time, `Activity ${i}`); // Regular extend
        }
      }

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      // Validate performance
      BenchmarkUtils.validatePerformance(result, 'standard');
      TimeoutAssertions.assertNoValidationErrors(result);

      simulator.cleanup();
    });

    it('should handle state transitions efficiently', () => {
      const scenario = CommonScenarios.basicTimeout(config);

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      // Should complete quickly even with state transitions
      expect(result.performance.totalTime).toBeLessThan(10); // 10ms max
      expect(result.performance.avgProcessOutputTime).toBeLessThan(0.1); // 0.1ms max

      TimeoutAssertions.assertNoValidationErrors(result);

      simulator.cleanup();
    });
  });

  describe('State Transition Validation', () => {
    it('should track all state transitions correctly', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start') // → ACTIVE (initial)
        .addSilence(50, config.baseTimeout + 50) // → GRACE
        .addOutput(config.baseTimeout + 150, 'Recovery') // → ACTIVE (within grace period)
        .addSilence(config.baseTimeout + 200, config.baseTimeout + 50) // → GRACE again
        .addSilence(config.baseTimeout * 2 + 300, config.graceTimeout) // → EXPIRED
        .build();

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario);

      // Should have 4 state transitions total (ACTIVE→GRACE, GRACE→ACTIVE, ACTIVE→GRACE, GRACE→EXPIRED)
      expect(result.stateChanges).toHaveLength(4);

      // Verify the sequence
      expect(result.stateChanges[0]?.from).toBe('ACTIVE');
      expect(result.stateChanges[0]?.to).toBe('GRACE');

      expect(result.stateChanges[1]?.from).toBe('GRACE');
      expect(result.stateChanges[1]?.to).toBe('ACTIVE');

      expect(result.stateChanges[2]?.from).toBe('ACTIVE');
      expect(result.stateChanges[2]?.to).toBe('GRACE');

      expect(result.stateChanges[3]?.from).toBe('GRACE');
      expect(result.stateChanges[3]?.to).toBe('EXPIRED');

      TimeoutAssertions.assertNoValidationErrors(result);

      simulator.cleanup();
    });

    it('should provide accurate timing for all transitions', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addSilence(0, 1000) // Transition at T+1000
        .addOutput(1000, 'Recovery') // Recovery at T+1000
        .addSilence(1000, 500) // Next transition at T+1500
        .build();

      const simulator = new TimeoutSimulator(config, 10000); // Start at T+10000
      const result = simulator.runScenario(scenario);

      // All transition times should be relative to start time
      for (const change of result.stateChanges) {
        expect(change.time).toBeGreaterThanOrEqual(10000);
      }

      TimeoutAssertions.assertNoValidationErrors(result);

      simulator.cleanup();
    });
  });
});
