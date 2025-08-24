# Shell-RPC Command Instrumentation and Resilient Timeout Design

## Executive Summary

After 30-40 hours of development struggles with timeout control, this document presents a pragmatic, data-driven approach to building a rock-solid timeout system for Shell-RPC. The design evolves from a simple activity-based timeout to a sophisticated two-stage resilient timeout system with pattern-based command profiling.

## Problem Statement

Current challenges with Shell-RPC timeout management:
- Simple activity-based timeouts cause false positives on legitimate long-running operations
- No distinction between different command types (quick checks vs. long installations)
- Unable to detect progress patterns vs. actual hangs
- Network hiccups cause premature terminations
- Compilation tasks with silent periods are killed incorrectly

## Design Evolution

### Stage 1: Pragmatic Circuit Breaker (Initial Proposal)

The initial proposal introduced a simplified circuit breaker concept focused on practical command categorization:

```typescript
interface TimeoutStrategy {
  baseTimeout: number;         // Starting timeout value
  activityExtension: number;    // How much to extend on any activity
  silenceThreshold: number;     // When to worry about silence
  maxDuration: number;          // Absolute maximum runtime
  errorPatterns?: RegExp[];     // Fail immediately if detected
  progressPatterns?: RegExp[];  // Full reset if detected
}
```

Key insight: Instead of complex state machines, use **data-driven profiles** based on observed command behavior:

```typescript
const TIMEOUT_PROFILES = {
  'quick': {
    baseTimeout: 5000,
    activityExtension: 1000,
    silenceThreshold: 2000,
    maxDuration: 10000
  },
  
  'install': {
    baseTimeout: 30000,
    activityExtension: 15000,
    silenceThreshold: 60000,
    maxDuration: 600000,
    progressPatterns: [/downloading/i, /installing/i, /building/i],
    errorPatterns: [/fatal error/i, /cannot find/i]
  },
  
  'compile': {
    baseTimeout: 60000,
    activityExtension: 30000,
    silenceThreshold: 120000,
    maxDuration: 1200000,
    progressPatterns: [/\.cc?$/, /linking/i]
  }
};
```

### Stage 2: Two-Stage Resilient Timeout (Refined Design)

After review and refinement, the design evolved to a more sophisticated two-stage timeout system with flexible pattern-action mapping:

```typescript
interface PatternAction {
  regex: RegExp;
  action: 'reset_base_timeout' | 'extend_timeout' | 'terminate_immediately' | 'ignore' | 'log_only';
  value?: number;              // For extend_timeout action
  stream?: 'stdout' | 'stderr' | 'both';  // Stream specificity
}

interface TimeoutStrategy {
  baseTimeout: number;
  activityExtension: number;
  silenceThreshold: number;    // Grace period after primary timeout
  maxDuration: number;
  patterns: PatternAction[];    // Flexible pattern-action system
}
```

## Core Algorithm: Two-Stage Timeout with Grace Period

The refined algorithm introduces a "danger zone" concept - a grace period that prevents false positives while still catching genuine hangs:

### State Flow

```
NORMAL → [primary timeout expires] → DANGER → [grace period expires] → TERMINATED
   ↑                                      ↓
   └──────── [activity detected] ─────────┘
```

### Algorithm Steps

1. **Initialization**
   - Start with `NORMAL` state
   - Set primary timer to `baseTimeout`
   - Set absolute timer to `maxDuration`

2. **On Output Received**
   - Match against patterns in order (first match wins)
   - Execute pattern action if matched
   - Otherwise treat as regular activity

3. **Pattern Actions**
   - `reset_base_timeout`: Full confidence - reset to initial timeout
   - `extend_timeout`: Add time for known slow operations
   - `terminate_immediately`: Fail fast on known errors
   - `log_only`: Record for analysis without affecting timeout
   - `ignore`: No timeout impact

4. **Regular Activity Handling**
   - In `NORMAL` state: Extend by `activityExtension`
   - In `DANGER` state: Recover to `NORMAL`, reset timer

5. **Primary Timeout Expiration**
   - Enter `DANGER` state
   - Start grace timer with `silenceThreshold`
   - Any activity during grace period recovers to `NORMAL`

6. **Termination Conditions**
   - Grace period expires (silence threshold exceeded)
   - Absolute maximum duration reached
   - Error pattern matched

## Command Instrumentation Strategy

### Phase 1: Comprehensive Logging (Days 1-2)

Add instrumentation to capture all command execution metrics:

```typescript
interface CommandMetrics {
  // Command identification
  command: string;
  profile: string;
  timestamp: number;
  
  // Execution metrics
  startTime: number;
  endTime: number;
  duration: number;
  exitCode: number | null;
  
  // Timeout behavior
  timedOut: boolean;
  timeoutReason?: string;
  stateTransitions: Array<{
    from: string;
    to: string;
    reason: string;
    timestamp: number;
  }>;
  
  // Output analysis
  outputPatterns: Array<{
    pattern: string;
    count: number;
    firstSeen: number;
    lastSeen: number;
    stream: 'stdout' | 'stderr';
  }>;
  
  // Silence analysis
  silencePeriods: Array<{
    start: number;
    duration: number;
    recovered: boolean;
  }>;
  
  // Performance metrics
  outputVolume: {
    stdout: number;  // bytes
    stderr: number;  // bytes
    total: number;
  };
  outputRate: {
    peak: number;    // bytes/sec
    average: number;
  };
}
```

### Phase 2: Pattern Discovery (Days 3-7)

Analyze collected metrics to identify:

1. **Command Categories**
   ```sql
   SELECT 
     REGEXP_EXTRACT(command, '^(\w+)') as base_command,
     AVG(duration) as avg_duration,
     MAX(duration) as max_duration,
     COUNT(*) as frequency,
     SUM(timedOut) as timeout_count
   FROM command_metrics
   GROUP BY base_command
   ORDER BY frequency DESC;
   ```

2. **Progress Indicators**
   ```sql
   SELECT 
     pattern,
     COUNT(DISTINCT command) as unique_commands,
     AVG(duration_after_pattern) as avg_remaining_time
   FROM output_patterns
   WHERE followed_by_success = true
   GROUP BY pattern
   HAVING unique_commands > 5;
   ```

3. **Error Signatures**
   ```sql
   SELECT 
     pattern,
     COUNT(*) as occurrences,
     AVG(time_to_failure) as avg_fail_time
   FROM output_patterns
   WHERE followed_by_failure = true
   GROUP BY pattern
   ORDER BY occurrences DESC;
   ```

### Phase 3: Profile Generation (Days 8-9)

Convert analysis into timeout profiles:

```typescript
function generateProfile(commandStats: CommandStatistics): TimeoutStrategy {
  return {
    // Base timeout = P95 duration for quick commands, P50 for long ones
    baseTimeout: commandStats.isQuick ? 
      commandStats.p95Duration : 
      commandStats.p50Duration,
    
    // Activity extension based on output rate variability
    activityExtension: Math.min(
      commandStats.avgSilencePeriod * 2,
      commandStats.baseTimeout * 0.5
    ),
    
    // Grace period for network operations
    silenceThreshold: commandStats.hasNetworkOps ? 
      15000 : 
      5000,
    
    // Max = P99 duration + 50% buffer
    maxDuration: commandStats.p99Duration * 1.5,
    
    // Patterns from analysis
    patterns: [
      ...commandStats.progressPatterns.map(p => ({
        regex: new RegExp(p.pattern),
        action: 'reset_base_timeout' as const
      })),
      ...commandStats.errorPatterns.map(p => ({
        regex: new RegExp(p.pattern),
        action: 'terminate_immediately' as const
      }))
    ]
  };
}
```

## Implementation Roadmap

### Week 1: Instrumentation
- [ ] Add CommandMetrics interface
- [ ] Implement metrics collection in Shell-RPC
- [ ] Create metrics storage (JSONL format)
- [ ] Add debug output for monitoring
- [ ] Deploy instrumented version

### Week 2: Analysis & Profiles
- [ ] Collect production data (minimum 1000 commands)
- [ ] Run pattern analysis queries
- [ ] Identify command categories
- [ ] Generate initial profiles
- [ ] Document findings

### Week 3: Core Implementation
- [ ] Implement ResilientTimeout class
- [ ] Add pattern-action system
- [ ] Integrate with Shell-RPC
- [ ] Create profile registry
- [ ] Add configuration system

### Week 4: Testing & Refinement
- [ ] Unit tests for timeout logic
- [ ] Integration tests with real commands
- [ ] Performance benchmarking
- [ ] Profile tuning based on test results
- [ ] Documentation and deployment

## Success Metrics

The new timeout system will be considered successful when:

1. **False Positive Rate < 0.1%**
   - Legitimate operations not incorrectly timed out

2. **Detection Time < 2x optimal**
   - Hung processes detected within reasonable time

3. **Performance Impact < 1%**
   - Pattern matching overhead negligible

4. **Profile Coverage > 95%**
   - Most commands match a specific profile

5. **Recovery Success > 90%**
   - Commands recover from DANGER state when appropriate

## Risk Mitigation

### Risk: Pattern Drift
**Mitigation**: Continuous monitoring and automated profile updates based on new data.

### Risk: Performance Overhead
**Mitigation**: Compile patterns once, use efficient matching, sample output for high-volume commands.

### Risk: Complex Debugging
**Mitigation**: Comprehensive logging, clear state transitions, debug mode with verbose output.

### Risk: Breaking Changes
**Mitigation**: Feature flag for gradual rollout, fallback to simple timeout if profiles unavailable.

## Configuration Examples

### Development Environment
```typescript
{
  timeoutMode: 'resilient',
  profileSource: './timeout-profiles.json',
  defaultProfile: 'balanced',
  instrumentation: {
    enabled: true,
    logLevel: 'debug',
    metricsPath: './metrics/timeout-metrics.jsonl'
  }
}
```

### Production Environment
```typescript
{
  timeoutMode: 'resilient',
  profileSource: 'embedded',  // Use compiled-in profiles
  defaultProfile: 'conservative',
  instrumentation: {
    enabled: true,
    logLevel: 'warn',
    metricsPath: '/var/log/shell-rpc/metrics.jsonl',
    sampling: 0.1  // Sample 10% of commands
  }
}
```

### CI/CD Environment
```typescript
{
  timeoutMode: 'resilient',
  profileSource: 'embedded',
  defaultProfile: 'ci-optimized',
  overrides: {
    maxDuration: 300000,  // 5 min max for CI
    silenceThreshold: 30000  // More aggressive in CI
  }
}
```

## Conclusion

This design provides a pragmatic path from our current problematic timeout system to a robust, data-driven solution that can handle the complexities of real-world package management operations. By starting with instrumentation and building profiles from actual data, we ensure the solution matches reality rather than theoretical requirements.

The two-stage timeout with grace period provides the perfect balance between preventing false positives and catching genuine hangs, while the pattern-action system allows fine-grained control over timeout behavior based on command output.

Most importantly, this design is:
- **Observable**: We know what's happening and why
- **Maintainable**: Profiles are data, not code
- **Extensible**: New patterns and profiles are easy to add
- **Reliable**: Based on real-world behavior, not assumptions
- **Performant**: Minimal overhead with maximum benefit