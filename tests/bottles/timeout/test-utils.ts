/**
 * Test utilities for Shell-RPC timeout testing
 *
 * Common configurations, assertion helpers, mock output generators,
 * and benchmark utilities for comprehensive timeout testing.
 */
import { expect } from 'vitest';
import type { TimeoutConfig, TimeoutEvent } from '#bottles/shell-rpc/timeout/types.js';
import type { SimulationResult, StateChange } from './simulator.js';

/**
 * Common test configurations for different scenarios
 */
export const TEST_CONFIGS = {
  /** Fast config for quick tests */
  FAST: {
    baseTimeout: 1000,
    activityExtension: 500,
    graceTimeout: 300,
    absoluteMaximum: 5000,
    progressPatterns: [/Downloading/, /Installing/],
    errorPatterns: [/ERROR:/, /Failed/],
    debug: false,
  } as TimeoutConfig,

  /** Standard config mimicking pip install */
  PIP_INSTALL: {
    baseTimeout: 5000,
    activityExtension: 2000,
    graceTimeout: 3000,
    absoluteMaximum: 30000,
    progressPatterns: [
      /Collecting .+/,
      /Downloading .+/,
      /Building wheel/,
      /Installing collected/,
      /Successfully installed/,
    ],
    errorPatterns: [
      /ERROR: .+/,
      /Failed building wheel/,
      /No matching distribution/,
      /Could not find a version/,
    ],
    debug: false,
  } as TimeoutConfig,

  /** Quick command config */
  QUICK: {
    baseTimeout: 500,
    activityExtension: 200,
    graceTimeout: 300,
    absoluteMaximum: 2000,
    progressPatterns: [],
    errorPatterns: [/command not found/, /not recognized/],
    debug: false,
  } as TimeoutConfig,

  /** Minimal config for edge case testing */
  MINIMAL: {
    baseTimeout: 100,
    activityExtension: 50,
    graceTimeout: 50,
    absoluteMaximum: 500,
    progressPatterns: [/progress/],
    errorPatterns: [/error/],
    debug: false,
  } as TimeoutConfig,
};

/**
 * Mock output generators for different package managers and scenarios
 */
export class MockOutputGenerators {
  /**
   * Generate pip install output sequence
   */
  static pipInstall(packageName = 'requests'): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: `pip install ${packageName}` },
      { time: 500, output: `Collecting ${packageName}` },
      { time: 1000, output: `Downloading ${packageName}-2.28.1-py3-none-any.whl (62 kB)` },
      { time: 2000, output: 'Collecting urllib3>=1.21.1' },
      { time: 2500, output: 'Downloading urllib3-1.26.12-py2.py3-none-any.whl (140 kB)' },
      { time: 4000, output: `Installing collected packages: urllib3, ${packageName}` },
      { time: 5000, output: `Successfully installed ${packageName}-2.28.1 urllib3-1.26.12` },
    ];
  }

  /**
   * Generate pip install failure sequence
   */
  static pipInstallFailure(
    packageName = 'nonexistent-package',
  ): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: `pip install ${packageName}` },
      { time: 500, output: `Collecting ${packageName}` },
      { time: 1000, output: `ERROR: No matching distribution found for ${packageName}` },
    ];
  }

  /**
   * Generate uv add output sequence
   */
  static uvAdd(packageName = 'requests'): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: `uv add ${packageName}` },
      { time: 200, output: 'Resolved 5 packages in 150ms' },
      { time: 400, output: `Downloaded ${packageName}-2.28.1-py3-none-any.whl` },
      { time: 600, output: 'Downloaded urllib3-1.26.12-py2.py3-none-any.whl' },
      { time: 800, output: `Installed 2 packages in 50ms` },
      { time: 1000, output: `Added ${packageName} (2.28.1)` },
    ];
  }

  /**
   * Generate npm install output sequence
   */
  static npmInstall(packageName = 'lodash'): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: `npm install ${packageName}` },
      {
        time: 1000,
        output: `npm WARN deprecated ${packageName}@4.17.20: This version is deprecated`,
      },
      { time: 2000, output: `added 1 package, and audited 2 packages in 1s` },
      { time: 2500, output: 'found 0 vulnerabilities' },
    ];
  }

  /**
   * Generate rapid output burst
   */
  static rapidBurst(count = 50, intervalMs = 10): Array<{ time: number; output: string }> {
    const burst = [];
    for (let i = 0; i < count; i++) {
      burst.push({
        time: i * intervalMs,
        output: `Rapid output ${i}`,
      });
    }
    return burst;
  }

  /**
   * Generate alternating patterns
   */
  static alternatingPatterns(cycles = 5): Array<{ time: number; output: string }> {
    const patterns = [];
    for (let i = 0; i < cycles; i++) {
      patterns.push(
        { time: i * 4000, output: 'Downloading package...' }, // Progress
        { time: i * 4000 + 1000, output: 'Regular output' }, // Regular
        { time: i * 4000 + 2000, output: 'Installing...' }, // Progress
        { time: i * 4000 + 3000, output: 'More output' }, // Regular
      );
    }
    return patterns.flat();
  }

  /**
   * Generate network stall simulation
   */
  static networkStall(
    preStallDuration = 2000,
    stallDuration = 10000,
  ): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: 'Starting download' },
      { time: 500, output: 'Downloading package.tar.gz (10MB)' },
      { time: 1000, output: '  |████        | 2.5MB 5.2MB/s' },
      { time: 1500, output: '  |████████    | 5.0MB 5.1MB/s' },
      { time: preStallDuration, output: '  |██████████  | 7.5MB 4.8MB/s' },
      // Network stall - no output for stallDuration
      { time: preStallDuration + stallDuration, output: '  |████████████| 10.0MB 2.1MB/s' },
      { time: preStallDuration + stallDuration + 500, output: 'Download complete' },
    ];
  }
}

/**
 * Assertion helpers for timeout testing
 */
export class TimeoutAssertions {
  /**
   * Assert state transition occurred
   */
  static assertStateTransition(
    stateChanges: StateChange[],
    from: 'ACTIVE' | 'GRACE' | 'EXPIRED',
    to: 'ACTIVE' | 'GRACE' | 'EXPIRED',
    trigger?: string,
  ): StateChange {
    const transition = stateChanges.find(
      (change) =>
        change.from === from && change.to === to && (!trigger || change.trigger.includes(trigger)),
    );

    expect(
      transition,
      `Expected state transition ${from} → ${to}${trigger ? ` (${trigger})` : ''}`,
    ).toBeDefined();
    return transition as StateChange;
  }

  /**
   * Assert specific timeout event occurred
   */
  static assertEventOccurred(
    events: TimeoutEvent[],
    type: TimeoutEvent['type'],
    detailsMatch?: Partial<TimeoutEvent['details']>,
  ): TimeoutEvent {
    const event = events.find((e) => {
      if (e.type !== type) return false;

      if (detailsMatch) {
        for (const [key, value] of Object.entries(detailsMatch)) {
          if ((e.details as Record<string, unknown>)[key] !== value) return false;
        }
      }

      return true;
    });

    expect(
      event,
      `Expected event ${type}${detailsMatch ? ` with details ${JSON.stringify(detailsMatch)}` : ''}`,
    ).toBeDefined();
    return event as TimeoutEvent;
  }

  /**
   * Assert simulation performance metrics
   */
  static assertPerformance(
    result: SimulationResult,
    expectations: {
      maxProcessOutputTime?: number;
      avgProcessOutputTime?: number;
      maxMemoryDelta?: number;
    },
  ): void {
    const { performance } = result;

    if (expectations.maxProcessOutputTime !== undefined) {
      expect(
        performance.maxProcessOutputTime,
        `Max processOutput time ${performance.maxProcessOutputTime}ms exceeds limit ${expectations.maxProcessOutputTime}ms`,
      ).toBeLessThanOrEqual(expectations.maxProcessOutputTime);
    }

    if (expectations.avgProcessOutputTime !== undefined) {
      expect(
        performance.avgProcessOutputTime,
        `Avg processOutput time ${performance.avgProcessOutputTime}ms exceeds limit ${expectations.avgProcessOutputTime}ms`,
      ).toBeLessThanOrEqual(expectations.avgProcessOutputTime);
    }

    if (expectations.maxMemoryDelta !== undefined) {
      expect(
        performance.memoryUsage.delta,
        `Memory usage delta ${performance.memoryUsage.delta} bytes exceeds limit ${expectations.maxMemoryDelta} bytes`,
      ).toBeLessThanOrEqual(expectations.maxMemoryDelta);
    }
  }

  /**
   * Assert no validation errors in simulation
   */
  static assertNoValidationErrors(result: SimulationResult): void {
    expect(
      result.validationErrors,
      `Simulation had validation errors: ${result.validationErrors.join(', ')}`,
    ).toHaveLength(0);
  }

  /**
   * Assert specific termination reason
   */
  static assertTermination(
    result: SimulationResult,
    expectedReason: string,
    expectTerminated = true,
  ): void {
    expect(result.terminated, `Expected terminated=${expectTerminated}`).toBe(expectTerminated);

    if (expectTerminated) {
      expect(result.terminationReason, `Expected termination reason ${expectedReason}`).toBe(
        expectedReason,
      );
    }
  }
}

/**
 * Benchmark utilities for performance testing
 */
export class BenchmarkUtils {
  /**
   * Performance thresholds for different test categories
   * CI environments are slower, so we adjust thresholds accordingly
   */
  static readonly PERFORMANCE_THRESHOLDS = {
    PROCESS_OUTPUT_MAX: process.env.CI ? 1.5 : 0.5, // 1.5ms in CI, 0.5ms locally
    PROCESS_OUTPUT_AVG: process.env.CI ? 0.5 : 0.2, // 0.5ms in CI, 0.2ms locally
    PATTERN_MATCH_MAX: process.env.CI ? 0.3 : 0.1, // 0.3ms in CI, 0.1ms locally
    MEMORY_DELTA_MAX: 4 * 1024 * 1024, // 4MB maximum memory growth
  };

  /**
   * Run performance validation on simulation result
   */
  static validatePerformance(
    result: SimulationResult,
    category: 'fast' | 'standard' | 'intensive' = 'standard',
  ): void {
    const thresholds = this.getThresholdsForCategory(category);

    TimeoutAssertions.assertPerformance(result, {
      maxProcessOutputTime: thresholds.processOutputMax,
      avgProcessOutputTime: thresholds.processOutputAvg,
      maxMemoryDelta: thresholds.memoryDeltaMax,
    });
  }

  /**
   * Get performance thresholds for test category
   */
  private static getThresholdsForCategory(category: 'fast' | 'standard' | 'intensive'): {
    processOutputMax: number;
    processOutputAvg: number;
    memoryDeltaMax: number;
  } {
    const base = this.PERFORMANCE_THRESHOLDS;

    switch (category) {
      case 'fast':
        return {
          processOutputMax: base.PROCESS_OUTPUT_MAX * 0.5,
          processOutputAvg: base.PROCESS_OUTPUT_AVG * 0.5,
          memoryDeltaMax: base.MEMORY_DELTA_MAX * 0.5,
        };
      case 'intensive':
        return {
          processOutputMax: base.PROCESS_OUTPUT_MAX * 2,
          processOutputAvg: base.PROCESS_OUTPUT_AVG * 1.5,
          memoryDeltaMax: base.MEMORY_DELTA_MAX * 2,
        };
      case 'standard':
      default:
        return {
          processOutputMax: base.PROCESS_OUTPUT_MAX,
          processOutputAvg: base.PROCESS_OUTPUT_AVG,
          memoryDeltaMax: base.MEMORY_DELTA_MAX,
        };
    }
  }
}

/**
 * Test data generators for edge cases
 */
export class EdgeCaseGenerators {
  /**
   * Generate edge case: rapid state transitions
   */
  static rapidStateTransitions(_config: TimeoutConfig): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: 'Start' },
      { time: 50, output: 'Installing...' }, // Progress reset
      { time: 100, output: 'Regular output' }, // Regular activity
      { time: 150, output: 'Downloading...' }, // Progress reset again
      { time: 200, output: 'More output' }, // Regular activity
      { time: 250, output: 'ERROR: Failed' }, // Immediate termination
    ];
  }

  /**
   * Generate edge case: pattern conflicts
   */
  static patternConflicts(): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: 'Start' },
      { time: 1000, output: 'ERROR: Failed to download package' }, // Error pattern should win
      { time: 2000, output: 'Downloading recovery...' }, // This should not process (already terminated)
    ];
  }

  /**
   * Generate edge case: empty/whitespace outputs
   */
  static emptyOutputs(): Array<{ time: number; output: string }> {
    return [
      { time: 0, output: '' },
      { time: 500, output: '   ' },
      { time: 1000, output: '\n' },
      { time: 1500, output: '\t\t' },
      { time: 2000, output: 'Valid output' },
    ];
  }

  /**
   * Generate stress test: many rapid patterns
   */
  static stressTest(patternCount = 1000): Array<{ time: number; output: string }> {
    const outputs = [];

    for (let i = 0; i < patternCount; i++) {
      const patternType = i % 3;
      let output: string;

      switch (patternType) {
        case 0:
          output = `Downloading package-${i}`;
          break;
        case 1:
          output = `Installing component-${i}`;
          break;
        case 2:
          output = `Regular output ${i}`;
          break;
        default:
          output = `Output ${i}`;
      }

      outputs.push({
        time: i * 10, // 10ms intervals
        output,
      });
    }

    return outputs;
  }
}
