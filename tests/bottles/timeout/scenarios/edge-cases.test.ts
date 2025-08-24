/**
 * Edge Case Tests for ResilientTimeout
 *
 * Tests rapid output bursts, alternating patterns, boundary timing conditions,
 * multiple grace period entries/exits, and other complex edge case scenarios.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { TimeoutSimulator, ScenarioBuilder } from '../simulator.js';
import {
  TEST_CONFIGS,
  MockOutputGenerators,
  TimeoutAssertions,
  BenchmarkUtils,
  EdgeCaseGenerators,
} from '../test-utils.js';
import type { TimeoutConfig } from '#bottles/shell-rpc/timeout/types.js';

describe('Edge Case Testing', () => {
  let config: TimeoutConfig;

  beforeEach(() => {
    config = { ...TEST_CONFIGS.FAST };
    // Ensure we have the expected config
    config.baseTimeout = 1000;
    config.activityExtension = 500;
  });

  describe('Rapid Output Bursts', () => {
    it('should handle rapid successive outputs without performance degradation', () => {
      const rapidOutputs = MockOutputGenerators.rapidBurst(100, 5); // 100 outputs, 5ms apart

      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      rapidOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      scenario.expectState(900, 'ACTIVE', 'still_active_after_burst');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      BenchmarkUtils.validatePerformance(result, 'standard');

      // Should have processed all outputs
      expect(result.performance.processOutputCalls).toBe(101); // 100 + start

      // Should still be in ACTIVE state
      expect(result.finalState.stage).toBe('ACTIVE');

      simulator.cleanup();
    });

    it('should handle microsecond-level timing precision', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1, 'Output 1') // 1ms later
        .addOutput(2, 'Output 2') // 1ms after that
        .addOutput(3, 'Output 3') // 1ms after that
        .addOutput(4, 'Installing...') // Progress pattern
        .expectState(10, 'ACTIVE', 'reset_from_progress');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have processed all outputs in correct order
      expect(result.performance.processOutputCalls).toBe(5);

      // Should have progress pattern match
      TimeoutAssertions.assertEventOccurred(result.events, 'pattern_match', {
        reason: 'progress_pattern_matched',
      });

      simulator.cleanup();
    });

    it('should handle burst followed by long silence', () => {
      const burstOutputs = MockOutputGenerators.rapidBurst(50, 10);

      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Add rapid burst
      burstOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      // Then long silence that should trigger timeout
      const burstEndTime = burstOutputs[burstOutputs.length - 1]?.time ?? 0;
      scenario
        .addSilence(burstEndTime, config.baseTimeout + config.graceTimeout + 100)
        .expectTermination(
          burstEndTime + config.baseTimeout + config.graceTimeout + 200,
          'grace_period_expired',
        );

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'grace_period_expired');

      simulator.cleanup();
    });

    it('should handle interleaved pattern types in rapid succession', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(10, 'Installing...') // Progress
        .addOutput(20, 'Regular output') // Regular
        .addOutput(30, 'Downloading...') // Progress
        .addOutput(40, 'More output') // Regular
        .addOutput(50, 'Building...') // Progress
        .expectState(100, 'ACTIVE', 'final_active_state');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have 2 progress pattern matches (Installing and Downloading)
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches).toHaveLength(2);

      simulator.cleanup();
    });
  });

  describe('Boundary Timing Conditions', () => {
    it('should handle activity exactly at primary timeout boundary', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(config.baseTimeout - 10, 'Just in time!') // Activity just before timeout
        .expectState(
          config.baseTimeout + config.activityExtension - 20,
          'ACTIVE',
          'saved_by_boundary_activity',
        );

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should remain in ACTIVE due to activity before timeout
      expect(result.finalState.stage).toBe('ACTIVE');

      simulator.cleanup();
    });

    it('should handle activity exactly at grace timeout boundary', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addSilence(0, config.baseTimeout + 100) // Let primary timeout expire, enter grace
        .expectState(config.baseTimeout + 100, 'GRACE')
        .addOutput(config.baseTimeout + config.graceTimeout - 10, 'Grace period save!') // Just before grace expires
        .expectState(
          config.baseTimeout + config.graceTimeout + 100,
          'ACTIVE',
          'grace_boundary_recovery',
        );

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have recovered from grace period
      TimeoutAssertions.assertStateTransition(result.stateChanges, 'GRACE', 'ACTIVE');

      simulator.cleanup();
    });

    it('should handle simultaneous timer expiration scenarios', () => {
      // Test when multiple timers might expire at the same time
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        // Break up the silence to ensure checkpoints are processed
        .addSilence(10, config.baseTimeout) // Silence until grace period
        .addCheckpoint(config.baseTimeout + 10, 'grace_entered', (state) => {
          return state.stage === 'GRACE' ? null : `Expected GRACE, got ${state.stage}`;
        })
        .addSilence(config.baseTimeout + 50, config.graceTimeout - 100) // Continue silence until near grace expiry
        .addCheckpoint(
          config.baseTimeout + config.graceTimeout - 10,
          'about_to_expire',
          (state) => {
            return state.stage === 'GRACE' ? null : `Expected GRACE, got ${state.stage}`;
          },
        );

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.stats.checkpointsHit).toBe(2);

      simulator.cleanup();
    });

    it('should handle timer precision edge cases', () => {
      // Test with very small timeout values
      const precisionConfig = {
        ...config,
        baseTimeout: 10, // 10ms
        activityExtension: 5, // 5ms
        graceTimeout: 5, // 5ms
        absoluteMaximum: 100, // 100ms
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(8, 'Activity') // Just before timeout, extends to 8+5=13ms
        .addOutput(12, 'More activity') // Before expiry, extends to 12+5=17ms
        .expectState(15, 'ACTIVE', 'precision_timing'); // Check before 17ms expiry

      const simulator = new TimeoutSimulator(precisionConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.finalState.stage).toBe('ACTIVE');

      simulator.cleanup();
    });
  });

  describe('Multiple Grace Period Cycles', () => {
    it('should handle multiple grace period entries and exits', () => {
      // Manually construct scenario with proper timing for multiple cycles
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        // First cycle: enter grace, then recover
        .addSilence(10, config.baseTimeout + 50) // Enter grace
        .expectState(config.baseTimeout + 100, 'GRACE', 'grace_cycle_0')
        .addOutput(config.baseTimeout + 150, 'Recovery 0') // Recover from grace
        .expectState(config.baseTimeout + 200, 'ACTIVE', 'active_cycle_0')
        // Second cycle: wait for new timeout, enter grace again, then recover
        .addSilence(config.baseTimeout + 200, config.baseTimeout + 50) // Enter grace again
        .expectState(config.baseTimeout * 2 + 300, 'GRACE', 'grace_cycle_1')
        .addOutput(config.baseTimeout * 2 + 350, 'Recovery 1') // Recover from grace
        .expectState(config.baseTimeout * 2 + 400, 'ACTIVE', 'active_cycle_1');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.stats.checkpointsHit).toBe(4); // 2 grace + 2 active checkpoints

      simulator.cleanup();
    });

    it('should track grace recovery statistics correctly', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addSilence(0, config.baseTimeout + 100) // Grace 1
        .addOutput(config.baseTimeout + 200, 'Recovery 1') // Recover 1
        .addSilence(config.baseTimeout + 200, config.baseTimeout + 100) // Grace 2
        .addOutput(config.baseTimeout * 2 + 400, 'Recovery 2') // Recover 2
        .addSilence(config.baseTimeout * 2 + 400, config.baseTimeout + config.graceTimeout); // Final timeout

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have 2 grace recoveries total
      const graceRecoveries = result.stateChanges.filter(
        (sc) => sc.from === 'GRACE' && sc.to === 'ACTIVE',
      );
      expect(graceRecoveries).toHaveLength(2);

      simulator.cleanup();
    });

    it('should handle rapid grace transitions', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        // Rapid cycle: enter grace, recover immediately
        .addSilence(0, config.baseTimeout + 50)
        .addOutput(config.baseTimeout + 50, 'Quick recovery 1')
        .addSilence(config.baseTimeout + 50, config.baseTimeout + 50)
        .addOutput(config.baseTimeout * 2 + 100, 'Quick recovery 2')
        .addSilence(config.baseTimeout * 2 + 100, config.baseTimeout + 50)
        .addOutput(config.baseTimeout * 3 + 150, 'Quick recovery 3')
        .expectState(config.baseTimeout * 3 + 250, 'ACTIVE', 'final_recovery');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have 3 recovery transitions
      const recoveries = result.stateChanges.filter(
        (sc) => sc.from === 'GRACE' && sc.to === 'ACTIVE',
      );
      expect(recoveries).toHaveLength(3);

      simulator.cleanup();
    });

    it('should prevent infinite grace period cycling', () => {
      // Test that absolute maximum prevents infinite cycles
      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Create many grace cycles until we hit absolute maximum
      let time = 0;
      let cycles = 0;
      while (time < config.absoluteMaximum - (config.baseTimeout + config.graceTimeout)) {
        scenario
          .addSilence(time, config.baseTimeout + 100) // Enter grace
          .addOutput(time + config.baseTimeout + 200, `Recovery ${cycles}`); // Recover

        time += config.baseTimeout + 500;
        cycles++;
      }

      // Should terminate due to grace period expiration (prevents infinite cycling)
      scenario.expectTermination(3000, 'grace_period_expired');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'grace_period_expired');

      simulator.cleanup();
    });
  });

  describe('Alternating Pattern Edge Cases', () => {
    it('should handle rapid pattern type switching', () => {
      const alternatingOutputs = EdgeCaseGenerators.rapidStateTransitions(config);

      const scenario = new ScenarioBuilder();
      alternatingOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      // Should terminate on the error pattern
      scenario.expectTermination(300, 'error_detected');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle conflicting patterns in sequence', () => {
      const conflictingOutputs = EdgeCaseGenerators.patternConflicts();

      const scenario = new ScenarioBuilder();
      conflictingOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should terminate on first error pattern
      TimeoutAssertions.assertTermination(result, 'error_detected');

      // Should only process 2 outputs (before termination)
      expect(result.performance.processOutputCalls).toBe(2);

      simulator.cleanup();
    });

    it('should handle pattern boundaries correctly', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(100, 'Download') // Should not match pattern (too short)
        .addOutput(200, 'Downloading package') // Should match
        .addOutput(300, 'Error') // Should not match pattern (too short)
        .addOutput(400, 'ERROR: Failed') // Should match and terminate
        .expectTermination(500, 'error_detected');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have 1 progress match and 1 error match
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      const errorMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'error_pattern_matched',
      );

      expect(progressMatches).toHaveLength(1);
      expect(errorMatches).toHaveLength(1);

      simulator.cleanup();
    });
  });

  describe('Memory and Resource Edge Cases', () => {
    it('should handle large output buffers efficiently', () => {
      const largeOutput = 'x'.repeat(100000); // 100KB output line

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, largeOutput)
        .addOutput(2000, 'Installing huge package...') // Pattern in large output
        .expectState(2100, 'ACTIVE');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      BenchmarkUtils.validatePerformance(result, 'intensive');

      simulator.cleanup();
    });

    it('should handle many rapid timer operations', () => {
      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Create many timer set/clear cycles
      for (let i = 0; i < 100; i++) {
        scenario.addOutput(i * 50, `Activity ${i}`);
      }

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      BenchmarkUtils.validatePerformance(result, 'standard');

      // Should have many timer operations
      const timerEvents = result.events.filter(
        (e) => e.type === 'timer_set' || e.type === 'timer_cleared',
      );
      expect(timerEvents.length).toBeGreaterThan(50);

      simulator.cleanup();
    });

    it('should handle stress test with complex scenarios', () => {
      const stressOutputs = EdgeCaseGenerators.stressTest(500);

      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      stressOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      BenchmarkUtils.validatePerformance(result, 'intensive');

      simulator.cleanup();
    });
  });

  describe('Time Edge Cases', () => {
    it('should handle time overflow scenarios', () => {
      // Start with very large time values
      const largeStartTime = Date.now() + 1000000000; // Far in future

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, 'Installing...')
        .expectState(2000, 'ACTIVE');

      const simulator = new TimeoutSimulator(config, largeStartTime);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.finalState.stage).toBe('ACTIVE');

      simulator.cleanup();
    });

    it('should handle negative time deltas gracefully', () => {
      // This shouldn't happen in normal operation, but test robustness
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addTimeJump(1000, -500) // Jump backwards (edge case)
        .addOutput(1000, 'After time jump')
        .expectState(1500, 'ACTIVE');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      // Should handle gracefully without errors
      expect(result.validationErrors).toHaveLength(0);

      simulator.cleanup();
    });

    it('should handle zero-duration timeouts', () => {
      const zeroConfig = {
        ...config,
        baseTimeout: 1,
        activityExtension: 1,
        graceTimeout: 1,
        absoluteMaximum: 10,
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .expectTermination(5, 'grace_period_expired'); // Grace expires at 1+1=2ms

      const simulator = new TimeoutSimulator(zeroConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.terminated).toBe(true);

      simulator.cleanup();
    });
  });

  describe('Pattern Matching Edge Cases', () => {
    it('should handle malformed regex patterns gracefully', () => {
      // Note: This test assumes the patterns are pre-validated
      // but tests the robustness of the matching engine

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'Installing package...') // Progress pattern resets timeout
        .addOutput(800, 'Some [special] {characters} (in) output')
        .addOutput(1200, 'ERROR: Failed with special chars []{}()') // Within timeout window
        .expectTermination(1300, 'error_detected');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle empty and whitespace-only outputs', () => {
      const emptyOutputs = EdgeCaseGenerators.emptyOutputs();

      const scenario = new ScenarioBuilder();
      emptyOutputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      scenario.expectState(2100, 'ACTIVE'); // Should still be active after valid output

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      expect(result.finalState.stage).toBe('ACTIVE');

      simulator.cleanup();
    });

    it('should handle very long regex matches', () => {
      const longPattern = 'Installing ' + 'component-'.repeat(1000) + 'final';

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, longPattern)
        .expectState(1100, 'ACTIVE'); // Should match progress pattern

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      BenchmarkUtils.validatePerformance(result, 'intensive');

      simulator.cleanup();
    });
  });

  describe('Concurrency Simulation', () => {
    it('should handle simulated concurrent operations', () => {
      // Simulate what might happen with concurrent operations
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(100, 'Thread 1: Installing...')
        .addOutput(101, 'Thread 2: Downloading...')
        .addOutput(102, 'Thread 3: Building...')
        .addOutput(200, 'Thread 1: Done')
        .addOutput(201, 'Thread 2: Done')
        .addOutput(202, 'Thread 3: ERROR: Failed')
        .expectTermination(300, 'error_detected');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should maintain deterministic behavior under simulated load', () => {
      // Run the same scenario multiple times to ensure determinism
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'Installing...')
        .addSilence(500, config.baseTimeout - 100)
        .addOutput(config.baseTimeout + 400, 'Progress update')
        .expectState(config.baseTimeout + 500, 'ACTIVE');

      // Run multiple times
      const results = [];
      for (let i = 0; i < 5; i++) {
        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());
        results.push(result);
        simulator.cleanup();
      }

      // All results should be identical in terms of state transitions
      for (let i = 1; i < results.length; i++) {
        expect(results[i]?.stateChanges).toEqual(results[0]?.stateChanges);
        expect(results[i]?.terminated).toBe(results[0]?.terminated);
        expect(results[i]?.finalState.stage).toBe(results[0]?.finalState.stage);
      }
    });
  });
});
