/**
 * TimeoutSimulator - Deterministic testing framework for ResilientTimeout
 *
 * Provides mock time control, event capture, scenario building, and performance
 * measurement utilities for comprehensive timeout behavior validation.
 */
import { performance } from 'node:perf_hooks';
import type {
  TimeoutConfig,
  TimeoutState,
  TimeoutEvent,
  TimerDependencies,
  TerminationReason,
} from '#bottles/shell-rpc/timeout/types.js';
import { ResilientTimeout } from '#bottles/shell-rpc/timeout/resilient-timeout.js';

/**
 * Simulation event for scenario building
 */
export interface SimulationEvent {
  /** Absolute time when event occurs */
  time: number;

  /** Type of simulation event */
  type: 'output' | 'silence' | 'time_jump' | 'checkpoint';

  /** Event data */
  data?: string;

  /** Duration for silence/time_jump events */
  duration?: number;

  /** Checkpoint label for validation */
  label?: string;
}

/**
 * State change tracking for validation
 */
export interface StateChange {
  /** Time when state changed */
  time: number;

  /** Previous state */
  from: 'ACTIVE' | 'GRACE' | 'EXPIRED';

  /** New state */
  to: 'ACTIVE' | 'GRACE' | 'EXPIRED';

  /** What triggered the change */
  trigger: string;

  /** Timeout event details */
  event?: TimeoutEvent;
}

/**
 * Performance measurement data
 */
export interface PerformanceMetrics {
  /** Total simulation time (ms) */
  totalTime: number;

  /** Number of processOutput calls */
  processOutputCalls: number;

  /** Average processOutput time (ms) */
  avgProcessOutputTime: number;

  /** Max processOutput time (ms) */
  maxProcessOutputTime: number;

  /** Pattern matching times */
  patternMatchingTimes: number[];

  /** Memory usage before/after */
  memoryUsage: {
    before: number;
    after: number;
    delta: number;
  };
}

/**
 * Simulation result with comprehensive validation data
 */
export interface SimulationResult {
  /** All state changes that occurred */
  stateChanges: StateChange[];

  /** Whether timeout terminated */
  terminated: boolean;

  /** Termination reason if terminated */
  terminationReason: TerminationReason | null;

  /** Final timeout state */
  finalState: TimeoutState;

  /** All timeout events captured */
  events: TimeoutEvent[];

  /** Performance metrics */
  performance: PerformanceMetrics;

  /** Validation errors found during simulation */
  validationErrors: string[];

  /** Simulation statistics */
  stats: {
    eventsProcessed: number;
    totalSimulationTime: number;
    checkpointsHit: number;
  };
}

/**
 * Checkpoint validation function
 */
export type CheckpointValidator = (
  state: TimeoutState,
  events: TimeoutEvent[],
  time: number,
) => string | null; // Returns error message or null if valid

/**
 * Scenario builder for fluent API construction
 */
export class ScenarioBuilder {
  private events: SimulationEvent[] = [];
  private checkpoints = new Map<string, CheckpointValidator>();

  /**
   * Add output at specific time
   */
  addOutput(time: number, output: string): this {
    this.events.push({ time, type: 'output', data: output });
    return this;
  }

  /**
   * Add silence period (no output)
   */
  addSilence(startTime: number, duration: number): this {
    this.events.push({
      time: startTime,
      type: 'silence',
      duration,
    });
    return this;
  }

  /**
   * Add time jump (advance time without triggering timers)
   */
  addTimeJump(time: number, duration: number): this {
    this.events.push({
      time,
      type: 'time_jump',
      duration,
    });
    return this;
  }

  /**
   * Add validation checkpoint
   */
  addCheckpoint(time: number, label: string, validator: CheckpointValidator): this {
    this.events.push({ time, type: 'checkpoint', label });
    this.checkpoints.set(label, validator);
    return this;
  }

  /**
   * Convenience method: expect state at time
   */
  expectState(time: number, expectedState: 'ACTIVE' | 'GRACE' | 'EXPIRED', label?: string): this {
    const checkpointLabel = label ?? `state_${expectedState}_at_${time}`;
    return this.addCheckpoint(time, checkpointLabel, (state) => {
      if (state.stage !== expectedState) {
        return `Expected state ${expectedState} but got ${state.stage}`;
      }
      return null;
    });
  }

  /**
   * Convenience method: expect termination at time
   */
  expectTermination(time: number, reason: TerminationReason, label?: string): this {
    const checkpointLabel = label ?? `termination_${reason}_at_${time}`;
    return this.addCheckpoint(time, checkpointLabel, (state) => {
      if (!state.terminated) {
        return `Expected termination with reason ${reason} but timeout is still active`;
      }
      if (state.terminationReason !== reason) {
        return `Expected termination reason ${reason} but got ${state.terminationReason}`;
      }
      return null;
    });
  }

  /**
   * Build the scenario
   */
  build(): { events: SimulationEvent[]; checkpoints: Map<string, CheckpointValidator> } {
    return {
      events: [...this.events].sort((a, b) => a.time - b.time),
      checkpoints: new Map(this.checkpoints),
    };
  }
}

/**
 * Main TimeoutSimulator class
 */
export class TimeoutSimulator {
  private mockTime = 0;
  private timeout: ResilientTimeout;
  private events: TimeoutEvent[] = [];
  private stateChanges: StateChange[] = [];
  private readonly performanceData: PerformanceMetrics;
  private validationErrors: string[] = [];

  // Mock timer management
  private activeTimers = new Map<NodeJS.Timeout, { callback: () => void; fireTime: number }>();
  private timerIdCounter = 0;

  constructor(config: TimeoutConfig, startTime = 0) {
    this.mockTime = startTime;

    // Create mock dependencies
    const deps: TimerDependencies = {
      getCurrentTime: () => this.mockTime,
      setTimeout: (callback: () => void, delay: number) => {
        const timerId = ++this.timerIdCounter as unknown as NodeJS.Timeout;
        this.activeTimers.set(timerId, {
          callback,
          fireTime: this.mockTime + delay,
        });
        return timerId;
      },
      clearTimeout: (timerId: NodeJS.Timeout) => {
        this.activeTimers.delete(timerId);
      },
    };

    // Initialize performance tracking
    this.performanceData = {
      totalTime: 0,
      processOutputCalls: 0,
      avgProcessOutputTime: 0,
      maxProcessOutputTime: 0,
      patternMatchingTimes: [],
      memoryUsage: {
        before: this.getMemoryUsage(),
        after: 0,
        delta: 0,
      },
    };

    // Create timeout with mock dependencies
    // Note: We need to set up event listeners immediately as the constructor
    // will emit initial timer events during setup
    this.timeout = new ResilientTimeout(config, deps);

    // Capture all timeout events (must be set up immediately after construction)
    this.timeout.on('timeout-event', (event: TimeoutEvent) => {
      this.events.push({ ...event });

      // Also track state changes
      if (event.type === 'state_change') {
        this.stateChanges.push({
          time: event.timestamp,
          from: event.details.from as 'ACTIVE' | 'GRACE' | 'EXPIRED',
          to: event.details.to as 'ACTIVE' | 'GRACE' | 'EXPIRED',
          trigger: event.details.reason ?? 'unknown',
          event,
        });
      }
    });
  }

  /**
   * Run a complete scenario simulation
   */
  runScenario(scenario: {
    events: SimulationEvent[];
    checkpoints: Map<string, CheckpointValidator>;
  }): SimulationResult {
    const startTime = performance.now();
    let eventsProcessed = 0;
    let checkpointsHit = 0;

    for (const event of scenario.events) {
      // Advance time to event time
      this.advanceTimeTo(event.time);

      // Process the event
      switch (event.type) {
        case 'output':
          if (event.data) {
            this.processOutputWithTiming(event.data);
          }
          eventsProcessed++;
          break;

        case 'silence':
          // Silence is passive - advance to the end of silence period
          if (event.duration !== undefined) {
            this.advanceTimeTo(event.time + event.duration);
          }
          break;

        case 'time_jump':
          // Jump time without firing timers
          if (event.duration !== undefined) {
            this.mockTime += event.duration;
          }
          break;

        case 'checkpoint': {
          const validator = event.label ? scenario.checkpoints.get(event.label) : undefined;
          if (validator) {
            const error = validator(this.timeout.getState(), this.events, this.mockTime);
            if (error) {
              this.validationErrors.push(`Checkpoint ${event.label}: ${error}`);
            }
            checkpointsHit++;
          }
          break;
        }
      }

      // Stop processing if terminated (unless it's a checkpoint)
      if (this.timeout.isTerminated() && event.type !== 'checkpoint') {
        break;
      }
    }

    // Finalize performance metrics
    this.performanceData.totalTime = performance.now() - startTime;
    this.performanceData.memoryUsage.after = this.getMemoryUsage();
    this.performanceData.memoryUsage.delta =
      this.performanceData.memoryUsage.after - this.performanceData.memoryUsage.before;

    if (this.performanceData.processOutputCalls > 0) {
      this.performanceData.avgProcessOutputTime =
        this.performanceData.patternMatchingTimes.reduce((sum, time) => sum + time, 0) /
        this.performanceData.processOutputCalls;
    }

    return {
      stateChanges: [...this.stateChanges],
      terminated: this.timeout.isTerminated(),
      terminationReason: this.timeout.getTerminationReason() as TerminationReason,
      finalState: this.timeout.getState(),
      events: [...this.events],
      performance: { ...this.performanceData },
      validationErrors: [...this.validationErrors],
      stats: {
        eventsProcessed,
        totalSimulationTime: this.mockTime - startTime,
        checkpointsHit,
      },
    };
  }

  /**
   * Advance mock time to specific time and fire timers
   */
  private advanceTimeTo(targetTime: number): void {
    while (this.mockTime < targetTime) {
      // Find next timer to fire
      let nextFireTime = targetTime;
      let nextTimer: NodeJS.Timeout | null = null;

      for (const [timerId, timer] of this.activeTimers) {
        if (timer.fireTime <= targetTime && timer.fireTime > this.mockTime) {
          // Timer should fire between now and target
          if (timer.fireTime < nextFireTime) {
            nextFireTime = timer.fireTime;
            nextTimer = timerId;
          }
        }
      }

      // If we have a timer to fire, advance to its time and fire it
      if (nextTimer && nextFireTime <= targetTime) {
        this.mockTime = nextFireTime;
        const timer = this.activeTimers.get(nextTimer);
        if (timer) {
          this.activeTimers.delete(nextTimer);
          timer.callback();
        }

        // Stop if timeout is terminated
        if (this.timeout.isTerminated()) {
          break;
        }
      } else {
        // No more timers to fire, advance to target
        break;
      }
    }

    // Ensure we reach the target time
    this.mockTime = Math.max(this.mockTime, targetTime);
  }

  /**
   * Process output with performance timing
   */
  private processOutputWithTiming(output: string): void {
    const start = performance.now();
    this.timeout.processOutput(output);
    const end = performance.now();

    const processingTime = end - start;
    this.performanceData.processOutputCalls++;
    this.performanceData.patternMatchingTimes.push(processingTime);
    this.performanceData.maxProcessOutputTime = Math.max(
      this.performanceData.maxProcessOutputTime,
      processingTime,
    );
  }

  /**
   * Get current memory usage (approximate)
   */
  private getMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage().heapUsed;
    }
    return 0;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.timeout.cleanup();
    this.activeTimers.clear();
  }
}

/**
 * Factory function to create common test scenarios
 */
export class CommonScenarios {
  /**
   * Basic timeout scenario - no activity, should timeout
   */
  static basicTimeout(config: TimeoutConfig): ScenarioBuilder {
    const totalTimeout = config.baseTimeout + config.graceTimeout;

    return new ScenarioBuilder()
      .addOutput(0, 'Starting command')
      .expectState(100, 'ACTIVE', 'initial_active')
      .addSilence(0, totalTimeout + 1000)
      .expectState(config.baseTimeout + 100, 'GRACE', 'grace_period')
      .expectTermination(totalTimeout + 100, 'grace_period_expired', 'final_timeout');
  }
}

/**
 * Performance testing utilities
 */
export class PerformanceTester {
  /**
   * Run performance benchmark with specified number of iterations
   */
  static benchmark(
    config: TimeoutConfig,
    iterations = 10000,
  ): {
    avgProcessOutputTime: number;
    maxProcessOutputTime: number;
    minProcessOutputTime: number;
    totalTime: number;
    operationsPerSecond: number;
  } {
    const times: number[] = [];
    const startTime = performance.now();

    // Create a simple scenario
    const scenario = new ScenarioBuilder()
      .addOutput(0, 'Starting')
      .addOutput(1000, 'Regular output')
      .addOutput(2000, 'Downloading something...')
      .addOutput(3000, 'More output')
      .build();

    // Run multiple iterations
    for (let i = 0; i < iterations; i++) {
      const simulator = new TimeoutSimulator(config, i * 10000);
      const iterationStart = performance.now();

      simulator.runScenario(scenario);

      const iterationTime = performance.now() - iterationStart;
      times.push(iterationTime);

      simulator.cleanup();
    }

    const totalTime = performance.now() - startTime;
    const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;

    return {
      avgProcessOutputTime: avgTime,
      maxProcessOutputTime: Math.max(...times),
      minProcessOutputTime: Math.min(...times),
      totalTime,
      operationsPerSecond: (iterations * 1000) / totalTime,
    };
  }

  /**
   * Test pattern matching performance
   */
  static benchmarkPatterns(
    config: TimeoutConfig,
    patterns: string[],
    iterations = 1000,
  ): {
    avgPatternMatchTime: number;
    patternsPerSecond: number;
  } {
    const startTime = performance.now();

    for (let i = 0; i < iterations; i++) {
      const simulator = new TimeoutSimulator(config);

      for (const pattern of patterns) {
        simulator['processOutputWithTiming'](pattern);
      }

      simulator.cleanup();
    }

    const totalTime = performance.now() - startTime;
    const totalOperations = iterations * patterns.length;

    return {
      avgPatternMatchTime: totalTime / totalOperations,
      patternsPerSecond: (totalOperations * 1000) / totalTime,
    };
  }
}
