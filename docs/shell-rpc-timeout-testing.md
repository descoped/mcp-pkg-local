# Shell-RPC Timeout Test Guide 🧪

## Overview

The Shell-RPC timeout system includes a comprehensive test suite with **200+ tests** achieving **100% pass rate**. This guide covers the test architecture, utilities, and best practices for writing and maintaining timeout tests.

## Test Architecture

```
tests/bottles/timeout/
├── core.test.ts              # Core timeout functionality (87 tests)
├── patterns.test.ts          # Pattern matching engine (21 tests)
├── integration.test.ts       # Integration & factory functions (17 tests)
├── simulator.test.ts         # TimeoutSimulator utility (25 tests)
└── scenarios/
    ├── edge-cases.test.ts    # Edge case scenarios (26 tests)
    ├── state-transitions.test.ts # State machine transitions (24 tests)
    ├── pattern-behavior.test.ts  # Pattern-driven behavior (21 tests)
    ├── package-managers.test.ts  # Package manager scenarios (25 tests)
    └── performance.test.ts       # Performance benchmarks (17 tests)
```

## Test Utilities

### TimeoutSimulator

The `TimeoutSimulator` provides deterministic testing of timeout behavior without real timers:

```typescript
import { TimeoutSimulator } from '#bottles/shell-rpc/timeout/test-utils.js';

const simulator = new TimeoutSimulator();
const result = await simulator.run(config, scenario);

// Analyze results
expect(result.finalState).toBe('EXPIRED');
expect(result.events).toContainEqual({
  type: 'state_changed',
  from: 'ACTIVE',
  to: 'GRACE',
  timestamp: expect.any(Number)
});
```

#### Key Features
- **Deterministic execution**: Reproducible test results
- **Event tracking**: Complete audit trail of state changes
- **Performance metrics**: Memory usage, execution time
- **Pattern analysis**: Track all pattern matches

### ScenarioBuilder

Fluent API for constructing test scenarios:

```typescript
import { ScenarioBuilder } from '#bottles/shell-rpc/timeout/test-utils.js';

const scenario = new ScenarioBuilder()
  .addOutput(100, 'Starting installation...')
  .addSilence(5000)
  .addOutput(5100, 'Downloading packages...')
  .expectState(5100, 'ACTIVE')
  .addErrorOutput(10000, 'ERROR: Connection failed')
  .expectState(10001, 'EXPIRED')
  .build();
```

#### Builder Methods

| Method | Description | Example |
|--------|-------------|---------|
| `addOutput(time, text)` | Add regular output | `.addOutput(1000, 'Processing...')` |
| `addErrorOutput(time, text)` | Add error output | `.addErrorOutput(5000, 'ERROR: Failed')` |
| `addProgressOutput(time, text)` | Add progress output | `.addProgressOutput(2000, 'Downloading 50%')` |
| `addSilence(start, duration)` | Add silence period | `.addSilence(1000, 5000)` |
| `addCheckpoint(time, data)` | Add verification point | `.addCheckpoint(3000, { stage: 'GRACE' })` |
| `expectState(time, state)` | Assert state at time | `.expectState(5000, 'ACTIVE')` |
| `expectTimeout(time)` | Assert timeout occurs | `.expectTimeout(10000)` |

## Test Categories

### 1. Core Tests (`core.test.ts`)

Tests fundamental timeout behavior:

```typescript
describe('ResilientTimeout Core', () => {
  it('should transition through stages correctly', async () => {
    const config = { baseTimeout: 1000, graceTimeout: 500, ... };
    const timeout = new ResilientTimeout(config);
    
    timeout.start();
    // Test state transitions
    await sleep(1100);
    expect(timeout.getState().stage).toBe('GRACE');
  });
});
```

**Coverage Areas:**
- State machine transitions
- Timer management
- Event emission
- Configuration validation
- Memory cleanup

### 2. Pattern Tests (`patterns.test.ts`)

Tests regex pattern matching for package managers:

```typescript
describe('Pattern Matching', () => {
  it('should detect pip install progress', () => {
    const matcher = new PatternMatcher(pipConfig);
    const result = matcher.processOutput('Collecting tensorflow');
    
    expect(result.action).toBe('reset');
    expect(result.pattern).toBeDefined();
  });
});
```

**Pattern Categories:**
- Progress patterns (reset timer)
- Error patterns (terminate immediately)
- Package manager specific patterns

### 3. Integration Tests (`integration.test.ts`)

Tests factory functions and Shell-RPC integration:

```typescript
describe('Auto-Detection', () => {
  it('should detect pip install commands', () => {
    const config = autoDetectTimeoutConfig('pip install numpy');
    
    expect(config.baseTimeout).toBe(30000);
    expect(config.progressPatterns).toContain(/Collecting/);
  });
});
```

**Test Areas:**
- Command auto-detection
- Configuration factories
- Shell-RPC compatibility layer
- Platform-specific configurations

### 4. Scenario Tests

#### Edge Cases (`edge-cases.test.ts`)

Tests boundary conditions and race conditions:

```typescript
it('should handle simultaneous timer expiration', async () => {
  const scenario = new ScenarioBuilder()
    .addSilence(0, baseTimeout)
    .addOutput(baseTimeout, 'Recovery attempt')
    .addSilence(baseTimeout + 1, graceTimeout)
    .expectState(baseTimeout + graceTimeout + 1, 'EXPIRED')
    .build();
});
```

**Scenarios:**
- Simultaneous timer events
- Rapid state changes
- Timer precision boundaries
- Maximum timeout enforcement

#### State Transitions (`state-transitions.test.ts`)

Tests all possible state machine paths:

```typescript
it('should handle ACTIVE → GRACE → ACTIVE recovery', async () => {
  const scenario = new ScenarioBuilder()
    .addSilence(0, baseTimeout)
    .expectState(baseTimeout + 1, 'GRACE')
    .addProgressOutput(baseTimeout + 100, 'Downloading...')
    .expectState(baseTimeout + 101, 'ACTIVE')
    .build();
});
```

**Transition Matrix:**
```
ACTIVE → GRACE (timeout)
ACTIVE → EXPIRED (error pattern)
GRACE → ACTIVE (progress pattern)
GRACE → EXPIRED (grace timeout)
```

#### Pattern Behavior (`pattern-behavior.test.ts`)

Tests pattern-driven timeout behavior:

```typescript
it('should reset timer on progress patterns', async () => {
  const scenario = new ScenarioBuilder()
    .addProgressOutput(1000, 'Downloading package...')
    .addProgressOutput(6000, 'Installing dependencies...')
    .expectState(11000, 'ACTIVE') // Still active due to resets
    .build();
});
```

**Test Cases:**
- Progress pattern timer resets
- Error pattern immediate termination
- Pattern priority (error > progress)
- Pattern caching performance

#### Package Managers (`package-managers.test.ts`)

Real-world scenarios for different package managers:

```typescript
describe('pip install', () => {
  it('should handle large package installation', async () => {
    const scenario = createPipInstallScenario('tensorflow', {
      downloadTime: 60000,
      installTime: 30000,
      hasCompilation: true
    });
    
    const result = await simulator.run(pipConfig, scenario);
    expect(result.finalState).toBe('COMPLETED');
  });
});
```

**Package Managers Tested:**
- **pip**: Python packages with compilation
- **uv**: Fast Python package manager
- **npm**: Node.js packages
- **Maven**: Java dependencies
- **Generic**: Unknown commands

#### Performance Tests (`performance.test.ts`)

Benchmarks and resource usage:

```typescript
it('should handle high-frequency output efficiently', async () => {
  const scenario = createHighFrequencyScenario(1000); // 1000 outputs
  const result = await simulator.run(config, scenario);
  
  expect(result.performance.totalTime).toBeLessThan(100);
  expect(result.performance.memoryUsage.delta).toBeLessThan(3_000_000);
});
```

**Performance Metrics:**
- Execution time per operation
- Memory usage and leaks
- Pattern matching speed
- Event processing overhead

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { TimeoutSimulator, ScenarioBuilder } from '#bottles/shell-rpc/timeout/test-utils.js';

describe('My Timeout Feature', () => {
  let simulator: TimeoutSimulator;
  let config: TimeoutConfig;

  beforeEach(() => {
    simulator = new TimeoutSimulator();
    config = {
      baseTimeout: 5000,
      activityExtension: 2000,
      graceTimeout: 3000,
      absoluteMaximum: 20000,
      progressPatterns: [/Progress:/],
      errorPatterns: [/ERROR:/]
    };
  });

  it('should handle my scenario', async () => {
    const scenario = new ScenarioBuilder()
      .addOutput(100, 'Starting...')
      .addProgressOutput(1000, 'Progress: 50%')
      .expectState(1001, 'ACTIVE')
      .build();

    const result = await simulator.run(config, scenario);
    
    expect(result.finalState).toBe('COMPLETED');
    expect(result.events).toHaveLength(2);
  });
});
```

### Testing Best Practices

#### 1. Use Deterministic Times

```typescript
// ❌ Bad: Non-deterministic
await sleep(Math.random() * 1000);

// ✅ Good: Deterministic
const scenario = new ScenarioBuilder()
  .addOutput(1000, 'Fixed time output')
  .build();
```

#### 2. Test State Transitions

```typescript
// Always verify state changes
.expectState(5000, 'ACTIVE')
.addSilence(5000, baseTimeout)
.expectState(5000 + baseTimeout + 1, 'GRACE')
```

#### 3. Break Up Long Silences

```typescript
// ❌ Bad: Single long silence
.addSilence(0, 15000)

// ✅ Good: Break into chunks for checkpoints
.addSilence(0, 5000)
.addCheckpoint(5000, { verify: 'still ACTIVE' })
.addSilence(5001, 10000)
```

#### 4. Test Error Conditions

```typescript
it('should handle timeout callback errors gracefully', async () => {
  const config = {
    ...baseConfig,
    onTimeout: () => { throw new Error('Callback failed'); }
  };
  
  // Should not throw
  const result = await simulator.run(config, scenario);
  expect(result.errors).toHaveLength(1);
});
```

#### 5. Verify Event Sequences

```typescript
const result = await simulator.run(config, scenario);

// Verify correct event order
const stateEvents = result.events.filter(e => e.type === 'state_changed');
expect(stateEvents).toEqual([
  expect.objectContaining({ from: 'ACTIVE', to: 'GRACE' }),
  expect.objectContaining({ from: 'GRACE', to: 'EXPIRED' })
]);
```

## Common Test Patterns

### Testing Timer Extensions

```typescript
it('should extend timer on activity', async () => {
  const scenario = new ScenarioBuilder()
    .addOutput(1000, 'Activity 1')  // Extends by activityExtension
    .addOutput(2000, 'Activity 2')  // Extends again
    .expectState(baseTimeout + 2000, 'ACTIVE') // Still active
    .build();
});
```

### Testing Pattern Matches

```typescript
it('should count pattern matches correctly', async () => {
  const scenario = new ScenarioBuilder()
    .addProgressOutput(1000, 'Downloading file1.zip')
    .addProgressOutput(2000, 'Downloading file2.zip')
    .addProgressOutput(3000, 'Downloading file3.zip')
    .build();

  const result = await simulator.run(config, scenario);
  
  const progressMatches = result.patternMatches.filter(
    m => m.action === 'reset'
  );
  expect(progressMatches).toHaveLength(3);
});
```

### Testing Grace Period Recovery

```typescript
it('should recover from grace period', async () => {
  const scenario = new ScenarioBuilder()
    .addSilence(0, baseTimeout)
    .expectState(baseTimeout + 1, 'GRACE')
    .addProgressOutput(baseTimeout + 100, 'Recovering...')
    .expectState(baseTimeout + 101, 'ACTIVE')
    .build();
});
```

## Debugging Tests

### Enable Debug Logging

```typescript
const config = {
  ...baseConfig,
  debug: true  // Enables detailed logging
};

// Or set environment variable
process.env.DEBUG_TIMEOUT = 'true';
```

### Inspect Simulator Results

```typescript
const result = await simulator.run(config, scenario);

console.log('Final state:', result.finalState);
console.log('Events:', result.events);
console.log('Pattern matches:', result.patternMatches);
console.log('State changes:', result.stateChanges);
console.log('Performance:', result.performance);
```

### Common Issues and Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| Test timing off by 1ms | Timer precision | Use `>= expected` instead of exact match |
| State not as expected | Checkpoint timing | Break up silence periods |
| Pattern not matching | Regex escape issues | Test pattern separately |
| Memory leak in tests | Timers not cleaned | Ensure proper cleanup in afterEach |
| Flaky tests | Real timers used | Use TimeoutSimulator instead |

## Performance Benchmarks

Current performance benchmarks (as of 100% test success):

```typescript
// Baseline performance thresholds
const PERFORMANCE_THRESHOLDS = {
  maxExecutionTime: 100,        // ms for 1000 events
  maxMemoryDelta: 3_000_000,    // 3MB max memory increase
  maxProcessOutputTime: 0.3,    // ms per output
  minStateChanges: 2,           // Minimum expected transitions
  maxTimerPrecisionError: 5     // ms tolerance
};
```

## Test Coverage Report

```
✅ Core Functionality: 87/87 tests passing
✅ Pattern Matching: 21/21 tests passing
✅ Integration: 17/17 tests passing
✅ Simulator: 25/25 tests passing
✅ Edge Cases: 26/26 tests passing
✅ State Transitions: 24/24 tests passing
✅ Pattern Behavior: 21/21 tests passing
✅ Package Managers: 25/25 tests passing
✅ Performance: 17/17 tests passing

Total: 263/263 tests passing (100% success rate)
```

## Continuous Integration

Tests run automatically on:
- Every push to main branch
- All pull requests
- Nightly performance regression tests

### CI Configuration

```yaml
# .github/workflows/test.yml
- name: Run Timeout Tests
  run: |
    npm test tests/bottles/timeout/
    npm run test:performance
```

## Contributing

When adding new timeout features:

1. **Write tests first**: Follow TDD approach
2. **Use existing utilities**: TimeoutSimulator, ScenarioBuilder
3. **Add scenarios**: Cover edge cases and real-world usage
4. **Update patterns**: Add package-specific patterns as needed
5. **Benchmark performance**: Ensure no regression
6. **Document behavior**: Update this guide with new patterns

## Quick Reference

### Essential Imports

```typescript
import { TimeoutSimulator, ScenarioBuilder } from '#bottles/shell-rpc/timeout/test-utils.js';
import { ResilientTimeout } from '#bottles/shell-rpc/timeout/resilient-timeout.js';
import { PatternMatcher, createPatternConfig } from '#bottles/shell-rpc/timeout/patterns.js';
import { autoDetectTimeoutConfig } from '#bottles/shell-rpc/timeout/index.js';
```

### Test Template

```typescript
describe('Feature', () => {
  let simulator: TimeoutSimulator;
  
  beforeEach(() => {
    simulator = new TimeoutSimulator();
  });

  it('should behave correctly', async () => {
    const config = { /* ... */ };
    const scenario = new ScenarioBuilder()
      // Build scenario
      .build();
    
    const result = await simulator.run(config, scenario);
    
    // Assertions
    expect(result.finalState).toBe('COMPLETED');
  });
});
```

## Conclusion

The Shell-RPC timeout test suite provides comprehensive coverage with deterministic, fast, and maintainable tests. The TimeoutSimulator and ScenarioBuilder utilities make it easy to write expressive tests that accurately model real-world timeout scenarios while maintaining 100% reproducibility.

For questions or issues, refer to the main [Shell-RPC Timeout Documentation](./shell-rpc-timeout-system.md) or the source code in `tests/bottles/timeout/`.