/**
 * Pattern Behavior Tests for ResilientTimeout
 *
 * Tests pattern-based behavior modification: error patterns → immediate termination,
 * progress patterns → full reset, mixed patterns handling, pattern priorities,
 * and pattern matching performance under various scenarios.
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

describe('Pattern Behavior Testing', () => {
  let config: TimeoutConfig;

  beforeEach(() => {
    config = { ...TEST_CONFIGS.FAST };
  });

  describe('Error Pattern Behavior', () => {
    it('should terminate immediately on error pattern match', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Starting process')
        .expectState(100, 'ACTIVE')
        .addOutput(500, 'ERROR: Something went wrong')
        .expectTermination(600, 'error_detected');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      // Should emit pattern match event
      TimeoutAssertions.assertEventOccurred(result.events, 'pattern_match', {
        reason: 'error_pattern_matched',
      });

      // Should have immediate termination at the time of error
      const terminationTime = result.stateChanges.find((sc) => sc.to === 'EXPIRED')?.time;
      expect(terminationTime).toBe(500); // Immediate termination when error occurs

      simulator.cleanup();
    });

    it('should handle multiple error patterns', () => {
      const errorPatterns = [
        'ERROR: Network timeout',
        'Failed to download package',
        'ERROR: Permission denied',
        'Failed: Could not find version',
      ];

      for (const pattern of errorPatterns) {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Start')
          .addOutput(1000, pattern)
          .expectTermination(1100, 'error_detected');

        const simulator = new TimeoutSimulator(config);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);
        TimeoutAssertions.assertTermination(result, 'error_detected');

        simulator.cleanup();
      }
    });

    it('should prioritize error patterns in any stage', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addSilence(0, config.baseTimeout + 100) // Enter grace period at 1000ms
        .expectState(config.baseTimeout + 100, 'GRACE') // Check at 1100ms (in grace)
        .addOutput(config.baseTimeout + 200, 'ERROR: Failed in grace period') // Error at 1200ms (still in grace)
        .expectTermination(config.baseTimeout + 300, 'error_detected');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should transition GRACE → EXPIRED directly
      TimeoutAssertions.assertStateTransition(
        result.stateChanges,
        'GRACE',
        'EXPIRED',
        'error_detected',
      );

      simulator.cleanup();
    });

    it('should ignore subsequent patterns after error termination', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'ERROR: First error')
        .expectTermination(600, 'error_detected')
        .addOutput(1000, 'Installing...') // This should be ignored
        .addOutput(1500, 'More output'); // This too

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should only process first 2 outputs
      expect(result.performance.processOutputCalls).toBe(2);

      // No pattern matches after termination
      const patternMatchEvents = result.events.filter((e) => e.type === 'pattern_match');
      expect(patternMatchEvents).toHaveLength(1); // Only the error pattern

      simulator.cleanup();
    });
  });

  describe('Progress Pattern Behavior', () => {
    it('should reset to base timeout on progress pattern match', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(config.baseTimeout - 200, 'Installing package...') // Progress reset at 800ms
        .expectState(config.baseTimeout - 100, 'ACTIVE') // Check at 900ms (after reset, should be ACTIVE)
        // After progress pattern reset at 800ms, timer expires at 800 + 1000 = 1800ms
        .addSilence(config.baseTimeout - 100, config.baseTimeout + 300) // Continue silence past 1800ms
        .expectState(config.baseTimeout + config.baseTimeout - 100, 'GRACE'); // Check at 1900ms

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have pattern match event
      TimeoutAssertions.assertEventOccurred(result.events, 'pattern_match', {
        reason: 'progress_pattern_matched',
      });

      // Should have reset state transition
      TimeoutAssertions.assertEventOccurred(result.events, 'state_change', {
        to: 'ACTIVE',
        reason: 'timeout_reset',
      });

      simulator.cleanup();
    });

    it('should handle multiple progress patterns with different resets', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, 'Downloading package...') // First reset
        .addSilence(1000, config.baseTimeout - 500)
        .addOutput(config.baseTimeout + 500, 'Installing dependencies...') // Second reset
        .addSilence(config.baseTimeout + 500, config.baseTimeout - 300)
        .addOutput(config.baseTimeout * 2 + 200, 'Building project...') // Third reset
        .expectState(config.baseTimeout * 2 + 300, 'ACTIVE');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have 2 progress pattern matches (Downloading and Installing only)
      const progressEvents = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressEvents).toHaveLength(2);

      simulator.cleanup();
    });

    it('should reset from grace period back to active on progress pattern', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addSilence(0, config.baseTimeout + 100) // Enter grace at 1000ms
        .expectState(config.baseTimeout + 100, 'GRACE') // Check at 1100ms (in grace period)
        .addOutput(config.baseTimeout + 200, 'Downloading recovery...') // Progress at 1200ms (still in grace)
        .expectState(config.baseTimeout + 300, 'ACTIVE'); // Check at 1300ms (should be active)

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should transition GRACE → ACTIVE
      TimeoutAssertions.assertStateTransition(
        result.stateChanges,
        'GRACE',
        'ACTIVE',
        'timeout_reset',
      );

      simulator.cleanup();
    });

    it('should track progress pattern statistics correctly', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'Downloading file1...')
        .addOutput(1000, 'Installing component1...')
        .addOutput(1500, 'Building module1...')
        .addOutput(2000, 'Regular output') // Not a progress pattern
        .addOutput(2500, 'Downloading file2...') // Another progress
        .expectState(3000, 'ACTIVE');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have 3 progress pattern matches (Downloading x2, Installing x1)
      const progressEvents = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressEvents).toHaveLength(3);

      simulator.cleanup();
    });
  });

  describe('Mixed Pattern Behavior', () => {
    it('should handle alternating progress and regular patterns', () => {
      const outputs = MockOutputGenerators.alternatingPatterns(3);
      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      outputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have at least 1 pattern match (progress patterns emit events)
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches.length).toBeGreaterThanOrEqual(1);

      simulator.cleanup();
    });

    it('should prioritize error over progress when both match', () => {
      // Create overlapping patterns
      const overlappingConfig = {
        ...config,
        progressPatterns: [/Installing/],
        errorPatterns: [/ERROR: Installing failed/],
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, 'ERROR: Installing failed') // Matches both patterns
        .expectTermination(1100, 'error_detected');

      const simulator = new TimeoutSimulator(overlappingConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have error pattern match, not progress
      TimeoutAssertions.assertEventOccurred(result.events, 'pattern_match', {
        reason: 'error_pattern_matched',
      });

      // Should NOT have progress pattern match
      const progressEvents = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressEvents).toHaveLength(0);

      simulator.cleanup();
    });

    it('should handle rapid pattern switching', () => {
      const outputs = EdgeCaseGenerators.rapidStateTransitions(config);
      const scenario = new ScenarioBuilder();

      outputs.forEach((output) => {
        scenario.addOutput(output.time, output.output);
      });

      // Should terminate on the ERROR pattern
      scenario.expectTermination(300, 'error_detected');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should maintain pattern matching accuracy under load', () => {
      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Add many mixed patterns
      for (let i = 0; i < 50; i++) {
        const time = i * 100;
        if (i % 10 === 0) {
          scenario.addOutput(time, `Installing package-${i}...`); // Progress
        } else if (i % 20 === 0) {
          scenario.addOutput(time, `Downloading component-${i}`); // Progress
        } else {
          scenario.addOutput(time, `Regular output ${i}`); // Regular
        }
      }

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      BenchmarkUtils.validatePerformance(result, 'standard');

      // Should have multiple progress matches
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches.length).toBeGreaterThanOrEqual(5);

      simulator.cleanup();
    });
  });

  describe('Pattern Priority and Conflicts', () => {
    it('should handle pattern conflicts deterministically', () => {
      // Test with same patterns multiple times to ensure deterministic behavior
      const conflictConfig = {
        ...config,
        progressPatterns: [/Package/, /Installing/],
        errorPatterns: [/ERROR: Package not found/, /Failed/],
      };

      for (let i = 0; i < 5; i++) {
        const scenario = new ScenarioBuilder()
          .addOutput(0, 'Start')
          .addOutput(1000, 'ERROR: Package not found') // Should match error first
          .expectTermination(1100, 'error_detected');

        const simulator = new TimeoutSimulator(conflictConfig);
        const result = simulator.runScenario(scenario.build());

        TimeoutAssertions.assertNoValidationErrors(result);
        TimeoutAssertions.assertTermination(result, 'error_detected');

        simulator.cleanup();
      }
    });

    it('should handle complex pattern hierarchies', () => {
      const complexConfig = {
        ...config,
        progressPatterns: [
          /Downloading/,
          /Installing/,
          /Building/,
          /Compiling/,
          /Linking/,
          /Packaging/,
        ],
        errorPatterns: [
          /ERROR:/,
          /Failed/,
          /Timeout/,
          /Not found/,
          /Permission denied/,
          /Out of space/,
        ],
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'Downloading dependencies...')
        .addOutput(1000, 'Installing packages...')
        .addOutput(1500, 'Building components...')
        .addOutput(2000, 'Compiling sources...')
        .addOutput(2500, 'ERROR: Out of space during compile')
        .expectTermination(2600, 'error_detected');

      const simulator = new TimeoutSimulator(complexConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have 4 progress matches + 1 error match
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      const errorMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'error_pattern_matched',
      );

      expect(progressMatches).toHaveLength(4);
      expect(errorMatches).toHaveLength(1);

      simulator.cleanup();
    });

    it('should handle empty pattern arrays gracefully', () => {
      const emptyPatternsConfig = {
        ...config,
        progressPatterns: [],
        errorPatterns: [],
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'ERROR: This would normally terminate')
        .addOutput(1000, 'Installing this would normally reset')
        .expectState(1100, 'ACTIVE'); // Should remain active

      const simulator = new TimeoutSimulator(emptyPatternsConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // No pattern matches should occur
      const patternMatches = result.events.filter((e) => e.type === 'pattern_match');
      expect(patternMatches).toHaveLength(0);

      // Should remain in ACTIVE state
      expect(result.finalState.stage).toBe('ACTIVE');

      simulator.cleanup();
    });
  });

  describe('Pattern Performance', () => {
    it('should maintain pattern matching performance under load', () => {
      const heavyPatternConfig = {
        ...config,
        progressPatterns: [
          /Downloading .+/,
          /Installing .+/,
          /Building .+ for .+/,
          /Compiling .+ sources/,
          /Linking .+ binaries/,
          /Packaging .+ artifacts/,
          /Uploading .+ to .+/,
          /Verifying .+ checksums/,
          /Extracting .+ archives/,
          /Cleaning .+ temporary files/,
        ],
        errorPatterns: [
          /ERROR: .+/,
          /FATAL: .+/,
          /Failed to .+/,
          /Could not .+/,
          /Unable to .+/,
          /Permission denied .+/,
          /No such file .+/,
          /Out of .+ space/,
          /Connection .+ refused/,
          /Timeout .+ exceeded/,
        ],
      };

      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Add many outputs to test pattern matching performance
      for (let i = 0; i < 1000; i++) {
        const time = i * 5; // Very rapid output
        let output: string;

        if (i % 100 === 0) {
          output = `Downloading package-${i}.tar.gz (${i}MB)`;
        } else if (i % 50 === 0) {
          output = `Installing component-${i} for project-${Math.floor(i / 50)}`;
        } else {
          output = `Processing item ${i} of 1000`;
        }

        scenario.addOutput(time, output);
      }

      const simulator = new TimeoutSimulator(heavyPatternConfig);
      const result = simulator.runScenario(scenario.build());

      // Validate performance despite heavy pattern matching
      BenchmarkUtils.validatePerformance(result, 'intensive');
      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have processed all outputs
      expect(result.performance.processOutputCalls).toBe(1001); // Including start

      simulator.cleanup();
    });

    it('should optimize pattern matching with caching', () => {
      const scenario = new ScenarioBuilder().addOutput(0, 'Start');

      // Repeat the same patterns to test caching
      const repeatedPatterns = [
        'Downloading package-1.tar.gz',
        'Installing component-1',
        'Regular output line',
      ];

      for (let i = 0; i < 100; i++) {
        const time = i * 10;
        const pattern = repeatedPatterns[i % 3] ?? '';
        scenario.addOutput(time, pattern);
      }

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      // Should be very fast due to pattern caching
      expect(result.performance.maxProcessOutputTime).toBeLessThan(0.05); // 0.05ms max
      TimeoutAssertions.assertNoValidationErrors(result);

      simulator.cleanup();
    });

    it('should handle regex compilation performance', () => {
      // Test with complex regex patterns
      const complexRegexConfig = {
        ...config,
        progressPatterns: [
          /^Downloading\s+[\w\-.]+\.(?:tar\.gz|zip|whl)\s+\([\d.]+\s*[KMGT]?B\)$/,
          /^Installing\s+collected\s+packages:\s+([\w\-.,\s]+)$/,
          /^Building\s+wheel\s+for\s+[\w\-.]+\s+\([\w\-./\s]+\)$/,
          /^Successfully\s+installed\s+([\w\-.\s]+\d*)$/,
        ],
        errorPatterns: [
          /^ERROR:\s+(?:No\s+matching\s+distribution|Could\s+not\s+find|Failed\s+building)/,
          /^FATAL:\s+.+$/,
          /^.*failed\s+with\s+exit\s+code\s+\d+$/,
        ],
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'Downloading numpy-1.21.0.tar.gz (7.8 MB)')
        .addOutput(1000, 'Building wheel for numpy (setup.py)')
        .addOutput(1500, 'Installing collected packages: numpy, scipy')
        .addOutput(2000, 'Successfully installed numpy-1.21.0 scipy-1.7.0')
        .expectState(2100, 'ACTIVE');

      const simulator = new TimeoutSimulator(complexRegexConfig);
      const result = simulator.runScenario(scenario.build());

      BenchmarkUtils.validatePerformance(result, 'standard');
      TimeoutAssertions.assertNoValidationErrors(result);

      simulator.cleanup();
    });
  });

  describe('Pattern Edge Cases', () => {
    it('should handle extremely long output lines', () => {
      const longOutput = 'Downloading ' + 'x'.repeat(10000) + '.tar.gz'; // 10K character line

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(1000, longOutput)
        .expectState(1100, 'ACTIVE');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      // Should still be reasonably fast
      expect(result.performance.maxProcessOutputTime).toBeLessThan(1); // 1ms max

      simulator.cleanup();
    });

    it('should handle unicode and special characters in patterns', () => {
      const unicodeConfig = {
        ...config,
        progressPatterns: [/Téléchargement/, /ダウンロード/, /下载/],
        errorPatterns: [/ERREUR:/, /エラー:/, /错误:/],
      };

      const scenario = new ScenarioBuilder()
        .addOutput(0, 'Start')
        .addOutput(500, 'Téléchargement du package...')
        .addOutput(1000, 'ダウンロード中...')
        .addOutput(1500, '下载文件...')
        .addOutput(2000, 'ERREUR: Échec du téléchargement')
        .expectTermination(2100, 'error_detected');

      const simulator = new TimeoutSimulator(unicodeConfig);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);
      TimeoutAssertions.assertTermination(result, 'error_detected');

      simulator.cleanup();
    });

    it('should handle null/undefined/empty outputs gracefully', () => {
      const scenario = new ScenarioBuilder()
        .addOutput(0, '')
        .addOutput(500, '   ')
        .addOutput(1000, '\n\n\n')
        .addOutput(1500, 'Installing...')
        .expectState(1600, 'ACTIVE');

      const simulator = new TimeoutSimulator(config);
      const result = simulator.runScenario(scenario.build());

      TimeoutAssertions.assertNoValidationErrors(result);

      // Should have one progress pattern match (Installing...)
      const progressMatches = result.events.filter(
        (e) => e.type === 'pattern_match' && e.details.reason === 'progress_pattern_matched',
      );
      expect(progressMatches).toHaveLength(1);

      simulator.cleanup();
    });
  });
});
