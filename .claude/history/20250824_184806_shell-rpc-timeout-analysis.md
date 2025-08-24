# Shell-RPC Timeout Strategy Analysis: Circuit Breaker vs Activity-Based

## Executive Summary

This document analyzes whether implementing a circuit breaker pattern would improve Shell-RPC's resilience compared to the current activity-based timeout strategy. We examine industry practices, failure scenarios, and propose multiple solution alternatives.

## Current Implementation: Activity-Based Timeout

```typescript
// ANY output (stdout or stderr) = activity, reset timeout
// No output at all = enforce timeout
if (currentTotalOutput > lastTotalOutput) {
  lastActivityTime = now;
  lastTotalOutput = currentTotalOutput;
}
if (timeSinceActivity > timeout) {
  // Terminate after timeout period of inactivity
}
```

### Strengths
- Simple and predictable
- Matches CI/CD systems (Jenkins, GitHub Actions, GitLab CI)
- No false positives from stderr warnings/progress
- Easy to understand and debug

### Weaknesses
- Cannot distinguish between healthy long-running operations and hung processes
- Fixed timeout for all scenarios
- No early termination on actual errors
- Package installations can legitimately take 30+ minutes

## Circuit Breaker Pattern Analysis

### What Is a Circuit Breaker?

A circuit breaker has three states:
1. **Closed (Normal)**: Traffic flows, monitoring for failures
2. **Open (Failed)**: All requests fail immediately
3. **Half-Open (Testing)**: Limited traffic to test recovery

### Applied to Shell-RPC

```
CLOSED (Healthy):
  - stdout activity → Stay closed, no timeout
  - Command runs indefinitely
  
HALF-OPEN (Warning):  
  - stderr detected OR no activity
  - Start timeout countdown (15-30s)
  - Can return to CLOSED on stdout
  
OPEN (Failed):
  - Timeout expired OR error pattern detected
  - Terminate command immediately
```

## Industry Analysis

### How Major Tools Handle This

#### 1. **Docker Build**
- Uses activity-based timeout (10 minutes default)
- Special handling for download progress in stderr
- Pattern matching for actual errors vs progress

#### 2. **Kubernetes kubectl**
- Multiple timeout levels:
  - Request timeout: 30s
  - Watch timeout: 5-10 minutes  
  - No timeout for logs --follow

#### 3. **npm/yarn/pnpm**
- Network timeout: 30s for downloads
- No timeout for local operations
- Progress indicators prevent timeout
- Exit code determines success/failure

#### 4. **Python pip**
- Network timeout: 15s default
- No timeout for compilation
- Uses stderr for progress (not errors)
- Exit code is source of truth

#### 5. **GitHub Actions**
- Job timeout: 6 hours default
- Step timeout: 360 minutes default
- No output timeout: 10 minutes
- Allows custom timeout per step

#### 6. **systemd**
- TimeoutStartSec: Time to wait for startup
- TimeoutStopSec: Time to wait for shutdown
- WatchdogSec: Regular heartbeat required
- Different timeouts for different phases

### Key Insights

1. **No single timeout strategy fits all** - Everyone uses multiple timeouts
2. **Exit codes are the primary error signal** - Not stderr content
3. **Progress detection is critical** - Prevents false timeouts
4. **Phase-aware timeouts** - Different operations need different limits

## Failure Scenarios Analysis

### Scenario 1: Large Package Installation
```bash
uv sync  # Installing PyTorch, TensorFlow, etc.
```
- Can legitimately take 30+ minutes
- Produces periodic progress output
- **Activity-based**: Works if progress shown
- **Circuit breaker**: Better - no timeout if healthy

### Scenario 2: Network Hang
```bash
pip install package  # Network connection drops
```
- No output for extended period
- Should timeout after reasonable wait
- **Activity-based**: ✓ Times out correctly
- **Circuit breaker**: ✓ Times out correctly

### Scenario 3: Compilation Error Loop
```bash
pip install numpy  # Missing compiler, retrying
```
- Continuous stderr output (errors)
- Should detect and fail quickly
- **Activity-based**: ✗ Keeps running (stderr = activity)
- **Circuit breaker**: ✓ Detects error state

### Scenario 4: Interactive Prompt
```bash
uv init  # Asks "Overwrite? [y/n]"
```
- Waiting for user input
- No output while waiting
- **Activity-based**: ✗ Times out while waiting
- **Circuit breaker**: ✗ Times out while waiting
- **Need**: Prompt detection

### Scenario 5: Silent Success
```bash
mkdir /some/dir  # Succeeds silently
```
- Completes instantly, no output
- Should not timeout
- **Activity-based**: ✓ Completes before timeout
- **Circuit breaker**: ✓ Completes before timeout

## Proposed Solutions

### Solution 1: Enhanced Circuit Breaker (Recommended)

```typescript
interface CircuitBreakerConfig {
  states: {
    CLOSED: {
      // Healthy operation - no timeout enforcement
      triggers: {
        toHalfOpen: ['stderr_error_pattern', 'no_activity_30s'],
        toOpen: ['exit_code_nonzero', 'fatal_error_pattern']
      }
    },
    HALF_OPEN: {
      // Warning state - timeout enforced
      timeout: 30000,
      triggers: {
        toClosed: ['stdout_progress', 'success_pattern'],
        toOpen: ['timeout_expired', 'error_pattern']
      }
    },
    OPEN: {
      // Failed state - terminate immediately
      action: 'terminate'
    }
  },
  
  patterns: {
    error: [/error:/i, /fatal:/i, /failed:/i, /cannot find/i],
    warning: [/warning:/i, /deprecated:/i],
    progress: [/\d+%/, /\[\s*=+>?\s*\]/, /\d+\/\d+/],
    success: [/success/i, /complete/i, /done/i]
  }
}
```

**Benefits:**
- Intelligent state management
- No timeout for healthy operations
- Quick failure on errors
- Configurable patterns

**Implementation Complexity:** High

### Solution 2: Multi-Level Timeout Strategy

```typescript
interface MultiLevelTimeouts {
  noOutput: 30000,        // 30s without any output
  noProgress: 120000,     // 2min without detected progress  
  errorState: 15000,      // 15s after error detected
  absolute: 3600000,      // 1 hour absolute maximum
  
  phases: {
    download: { noOutput: 60000 },     // Network operations
    compile: { noOutput: 300000 },     // Compilation can be slow
    install: { noProgress: 180000 },   // Installation phase
  }
}
```

**Benefits:**
- Different timeouts for different scenarios
- Phase-aware (download vs compile vs install)
- Absolute maximum prevents infinite runs

**Implementation Complexity:** Medium

### Solution 3: Activity-Based with Error Detection

```typescript
interface EnhancedActivityBased {
  resetOnAnyOutput: true,
  timeout: 30000,
  
  // Early termination on error patterns
  errorPatterns: [/error:/i, /fatal:/i],
  onErrorPattern: (match) => {
    // Reduce timeout to 5s on error detection
    this.timeout = 5000;
  },
  
  // Extend timeout on progress patterns  
  progressPatterns: [/\d+%/, /downloading/i],
  onProgressPattern: (match) => {
    // Extend timeout for downloads
    this.timeout = 60000;
  }
}
```

**Benefits:**
- Builds on current simple approach
- Adaptive timeout based on output
- Lower complexity than circuit breaker

**Implementation Complexity:** Low

### Solution 4: Command-Aware Strategy

```typescript
interface CommandAwareTimeout {
  commandProfiles: {
    'uv init': { interactive: true, timeout: 60000 },
    'uv sync': { timeout: 'unlimited', requiresProgress: true },
    'uv add': { timeout: 180000, phases: ['resolve', 'download', 'install'] },
    'pip install': { timeout: 300000, resetOnStderr: true },
    'npm install': { timeout: 600000, progressInStderr: true },
    default: { timeout: 30000 }
  }
}
```

**Benefits:**
- Optimal timeout per command type
- Handles tool-specific behaviors
- Most accurate

**Implementation Complexity:** Medium (requires command parsing)

## Recommendation

### Primary: Solution 1 - Enhanced Circuit Breaker

The circuit breaker pattern offers the best balance of:
1. **Resilience**: Handles all failure scenarios well
2. **Flexibility**: Configurable for different tools
3. **Intelligence**: State-based reasoning about command health
4. **Industry alignment**: Similar to Hystrix, Resilience4j patterns

### Implementation Plan

#### Phase 1: Core Circuit Breaker (Week 1)
- Implement three states (Closed, Half-Open, Open)
- Basic state transitions
- Stdout keeps closed, no-activity triggers half-open

#### Phase 2: Pattern Detection (Week 2)
- Add error pattern detection
- Add progress pattern detection
- Configure per-language patterns (Python, Node.js)

#### Phase 3: Command Profiles (Week 3)
- Add command-specific configurations
- Handle special cases (interactive, compilation)
- Add metrics/logging for tuning

### Fallback: Solution 3 - Enhanced Activity-Based

If circuit breaker proves too complex:
- Keep current simple activity-based approach
- Add pattern detection for early termination
- Add adaptive timeout adjustment
- 80% of benefits with 20% of complexity

## Testing Strategy

### Test Cases Required

1. **Long-running success** (PyTorch installation - 30+ min)
2. **Quick failure** (network error - should fail in 30s)
3. **Error recovery** (transient failure then success)
4. **Interactive prompts** (user input required)
5. **Silent commands** (mkdir, touch)
6. **Compilation** (numpy from source)
7. **Progress in stderr** (git clone, docker pull)
8. **Cascading failures** (retry logic)

### Metrics to Track

- False positive rate (good commands killed)
- False negative rate (hung commands not killed)
- Average time to detect failure
- Command success rate
- Timeout distribution by command type

## Configuration Examples

### For Conservative Users (Prefer Completion)
```javascript
{
  strategy: 'circuit-breaker',
  states: {
    CLOSED: { timeout: null },  // Never timeout when healthy
    HALF_OPEN: { timeout: 120000 }, // 2 minutes in warning
  }
}
```

### For CI/CD (Prefer Fast Failure)
```javascript
{
  strategy: 'circuit-breaker',
  states: {
    CLOSED: { timeout: 600000 }, // 10 min max even if healthy
    HALF_OPEN: { timeout: 15000 }, // 15s in warning
  },
  errorPatterns: [/error/i, /fail/i],
  terminateOnError: true
}
```

### For Development (Balanced)
```javascript
{
  strategy: 'multi-level',
  timeouts: {
    noOutput: 30000,
    noProgress: 120000,
    absolute: 1800000  // 30 minutes max
  }
}
```

## Conclusion

The **circuit breaker pattern would significantly improve Shell-RPC's resilience** by:

1. **Eliminating false timeouts** on long-running healthy operations
2. **Detecting failures faster** through state transitions
3. **Providing configurability** for different use cases
4. **Matching sophisticated industry practices** (Kubernetes, Docker)

The current activity-based approach is good but treats all scenarios equally. A circuit breaker adds intelligence about command health, leading to better decisions about when to wait vs when to terminate.

**Recommendation**: Implement the Enhanced Circuit Breaker (Solution 1) with a phased rollout, keeping the current approach as a fallback mode for simpler use cases.