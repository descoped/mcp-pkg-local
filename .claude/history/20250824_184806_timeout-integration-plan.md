# Shell-RPC Timeout Integration Plan

## Executive Summary

Integration of the new ResilientTimeout system with existing Shell-RPC to replace the old inline timeout implementation. This will provide advanced timeout capabilities while maintaining backward compatibility.

## Current vs New Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| **Architecture** | Inline in processCommand() | Modular, event-driven |
| **Timeout Stages** | Single stage | Two-stage (ACTIVE → GRACE → EXPIRED) |
| **Activity Detection** | Any output resets | Pattern-based (progress/error) |
| **Configuration** | Single timeout value | Rich config with patterns |
| **Testing** | Basic integration tests | 200+ tests with TimeoutSimulator |
| **Observability** | Console.error only | Event emitter with detailed events |
| **Recovery** | None | Grace period recovery |
| **Termination** | Immediate on timeout | Configurable with patterns |

## Integration Strategy

### Phase 1: Compatibility Layer (2 days)
Create a bridge between old and new systems without breaking changes.

```typescript
// src/bottles/shell-rpc/timeout/compat-bridge.ts
export class TimeoutCompatBridge {
  private timeout: ResilientTimeout | null = null;
  
  startTimeout(command: string, timeoutMs: number): void {
    // Auto-detect config based on command
    const config = autoDetectTimeoutConfig(command);
    
    // Override with provided timeout
    config.baseTimeout = timeoutMs;
    
    // Create new timeout instance
    this.timeout = new ResilientTimeout(config);
    
    // Bridge events to Shell-RPC
    this.timeout.on('timeout', (event) => {
      // Trigger terminateCurrentCommand()
    });
  }
  
  processActivity(output: string): void {
    this.timeout?.processOutput(output);
  }
  
  cleanup(): void {
    this.timeout?.cleanup();
  }
}
```

### Phase 2: Shell-RPC Refactoring (3 days)

#### Step 1: Extract Timeout Logic
Move timeout logic from `processCommand()` to use TimeoutCompatBridge:

```typescript
// Before (lines 149-189 in index.ts)
let lastActivityTime = Date.now();
const timeoutPromise = new Promise((_, reject) => {
  // Old inline timeout logic
});

// After
const timeoutBridge = new TimeoutCompatBridge();
timeoutBridge.startTimeout(command, timeout);

const timeoutPromise = new Promise((_, reject) => {
  timeoutBridge.on('expired', () => {
    this.terminateCurrentCommand();
    reject(new ShellRPCError('Command timed out', 'TIMEOUT'));
  });
});
```

#### Step 2: Hook Output Processing
Connect output handlers to new timeout system:

```typescript
// In setupOutputHandlers()
private setupOutputHandlers(): void {
  if (this.shell) {
    this.shell.onData((data: string) => {
      this.outputBuffer += data;
      
      // Feed to timeout system
      if (this.timeoutBridge && this.isCommandRunning) {
        this.timeoutBridge.processActivity(data);
      }
    });
  }
}
```

#### Step 3: Configuration Options
Extend ShellOptions to support new timeout features:

```typescript
interface ShellOptions {
  // Existing options
  defaultTimeout?: number;
  
  // New options
  timeoutConfig?: 'auto' | 'pip' | 'uv' | 'npm' | 'maven' | TimeoutConfig;
  enableGracePeriod?: boolean;
  enablePatternDetection?: boolean;
}
```

### Phase 3: Migration Path (2 days)

#### Backward Compatibility Mode (Default)
```typescript
// Preserves exact old behavior
new ShellRPC({
  defaultTimeout: 30000,
  timeoutConfig: 'legacy'  // Uses simple activity-based timeout
})
```

#### Enhanced Mode (Opt-in)
```typescript
// New features with auto-detection
new ShellRPC({
  timeoutConfig: 'auto'  // Auto-detects based on command
})

// Custom configuration
new ShellRPC({
  timeoutConfig: {
    baseTimeout: 30000,
    graceTimeout: 10000,
    progressPatterns: [/Downloading/, /Installing/],
    errorPatterns: [/ERROR:/, /Failed/]
  }
})
```

### Phase 4: Testing Integration (2 days)

1. **Preserve Existing Tests**: All current shell-rpc-timeout.test.ts tests must pass
2. **Add Bridge Tests**: Test compatibility layer thoroughly
3. **Migration Tests**: Test both legacy and enhanced modes
4. **Performance Tests**: Ensure no regression

## Implementation Order

### Week 1
1. **Day 1-2**: Create TimeoutCompatBridge class
   - Implement bridge between old interface and new system
   - Add event mapping and state translation
   - Test with existing shell-rpc-timeout.test.ts

2. **Day 3-4**: Refactor Shell-RPC
   - Extract timeout logic to use bridge
   - Hook output processing
   - Maintain backward compatibility

3. **Day 5**: Testing & Validation
   - Run all existing tests
   - Add integration tests for bridge
   - Performance benchmarking

### Week 2 (Optional - Full Migration)
1. **Day 1-2**: Remove old timeout code
   - Replace inline timeout with ResilientTimeout
   - Update all references

2. **Day 3-4**: Enhanced Features
   - Add UI for timeout configuration
   - Package-specific timeout profiles
   - Grace period recovery in Shell-RPC

3. **Day 5**: Documentation & Release
   - Update Shell-RPC documentation
   - Migration guide for users
   - Performance report

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Breaking changes | HIGH | Feature flag for new behavior |
| Performance regression | MEDIUM | Benchmark before/after |
| Test failures | MEDIUM | Keep old tests, add new ones |
| Complex migration | LOW | Phased rollout with compatibility mode |

## Success Criteria

1. **No Breaking Changes**: All existing tests pass
2. **Performance**: No measurable regression (<5ms overhead)
3. **Features**: Grace period recovery works in Shell-RPC
4. **Patterns**: Package manager detection works correctly
5. **Testing**: 100% test coverage maintained

## Configuration Examples

### pip install (Large Packages)
```typescript
{
  baseTimeout: 30000,      // 30s initial
  graceTimeout: 15000,     // 15s grace
  absoluteMaximum: 600000, // 10 min max
  progressPatterns: [
    /Collecting/,
    /Downloading/,
    /Building wheel/,
    /Installing/
  ],
  errorPatterns: [
    /ERROR:/,
    /Failed building wheel/
  ]
}
```

### Quick Commands
```typescript
{
  baseTimeout: 3000,       // 3s initial
  graceTimeout: 2000,      // 2s grace
  absoluteMaximum: 10000,  // 10s max
  progressPatterns: [],    // No patterns needed
  errorPatterns: []
}
```

## Next Steps

1. **Review & Approve** this integration plan
2. **Create feature branch** for integration work
3. **Start Phase 1** with TimeoutCompatBridge
4. **Daily progress updates** during implementation
5. **Performance benchmarks** at each phase

## Notes

- The new timeout system is fully tested and production-ready
- Integration can be done incrementally without breaking changes
- Enhanced features are opt-in to minimize risk
- The TimeoutSimulator can be used to test integration scenarios