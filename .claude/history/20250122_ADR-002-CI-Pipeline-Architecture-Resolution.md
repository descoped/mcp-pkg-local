# ADR-002: CI Pipeline Architecture Resolution Strategy

**Status**: Approved  
**Date**: 2025-01-20  
**Context**: Critical architectural escalation - CI infrastructure vs core functionality conflict

## Context and Problem Statement

The pkg-local project faces a critical architectural conflict preventing 100% green CI pipeline achievement for Phase 2 Bottles architecture. Despite multiple rounds of infrastructure fixes, we have a fundamental mismatch between:

1. **Infrastructure Requirements**: Shell-RPC, Volume Controller, caching systems
2. **Core Logic**: Package manager adapters, manifest parsing, type contracts
3. **Test Architecture**: Integration vs unit test boundaries and expectations

### Current Failure Analysis

**Root Cause Identified**: The issue is not with individual implementations but with **architectural boundaries and interface contracts**. The PipAdapter implementation appears functionally correct, but the integration between components creates implicit dependencies that cause test failures.

**Specific Issues**:
1. **Interface Contract Violations**: Adapter interface expectations don't match Volume Controller mount requirements  
2. **Type System Brittleness**: Changes to infrastructure types cascade through core logic
3. **Test Coupling**: Tests expect full infrastructure stack even for unit-level functionality
4. **Missing Abstraction Layers**: No clear separation between infrastructure concerns and core parsing logic

## Analysis of Strategic Options

### Option A: Interface Stabilization ✅ **RECOMMENDED**
**Approach**: Create robust interface contracts with clear separation of concerns

**Advantages**:
- Preserves existing functionality while fixing architectural issues
- Creates sustainable long-term architecture  
- Enables parallel development of infrastructure and core logic
- Clear boundaries prevent future conflicts

**Disadvantages**:
- Requires immediate architectural refactoring
- May take 1-2 days to implement properly

**Implementation Plan**:
1. Define stable PackageManagerAdapter interface with minimal dependencies
2. Create Infrastructure Service Layer for Volume Controller/Shell-RPC interactions
3. Implement adapter interface compliance tests
4. Isolate core parsing logic from infrastructure dependencies
5. Add mock infrastructure layers for pure unit tests

### Option B: Test Architecture Redesign  
**Approach**: Restructure testing to separate unit vs integration concerns

**Advantages**:
- Faster test execution
- More isolated failure diagnosis
- Cleaner separation of test concerns

**Disadvantages**:
- Doesn't address fundamental interface issues
- May hide architectural problems rather than solve them
- Still requires infrastructure coordination

### Option C: Rollback and Iterative Approach  
**Approach**: Reset to last known good state and apply incremental fixes

**Advantages**:
- Guaranteed working state as baseline
- Incremental validation at each step

**Disadvantages**:
- Loses significant development progress
- Doesn't solve underlying architectural issues
- May recreate same problems

### Option D: Alternative Implementation  
**Approach**: Simplify adapter pattern or defer complex features

**Advantages**:
- Might enable faster delivery
- Reduced complexity

**Disadvantages**:
- Compromises Phase 2 architectural goals
- May not support full Python package manager ecosystem
- Could create technical debt

## Decision

**ARCHITECTURAL DECISION**: Implement **Option A - Interface Stabilization** with the following specific architectural changes:

### 1. Infrastructure Service Layer Pattern

Create abstraction layer between adapters and infrastructure:

```typescript
interface InfrastructureServices {
  readonly shell: ShellExecutor;
  readonly cache: CacheProvider; 
  readonly volumes: VolumeMounter;
}

interface ShellExecutor {
  execute(command: string, options?: ExecuteOptions): Promise<ExecuteResult>;
}

interface CacheProvider {
  get(key: string): Promise<unknown>;
  set(key: string, value: unknown, ttl?: number): Promise<void>;
}

interface VolumeMounter {
  mount(paths: string[]): Promise<VolumeMount>;
  unmount(mount: VolumeMount): Promise<void>;
}
```

### 2. Simplified Adapter Interface

Reduce coupling between adapters and infrastructure:

```typescript
interface PackageManagerAdapter {
  // Core identity (no dependencies)
  readonly name: PackageManager;
  readonly manifestFiles: string[];
  
  // Core functionality (minimal infrastructure dependencies)
  detectProject(dir: string, services: InfrastructureServices): Promise<DetectionResult>;
  parseManifest(projectDir: string): Promise<Manifest>; // Pure function - no services
  
  // Infrastructure operations (clear service dependencies)
  getCachePaths(services: InfrastructureServices): Promise<CachePaths>;
  installPackages(packages: string[], services: InfrastructureServices): Promise<void>;
}
```

### 3. Layered Test Architecture

**Unit Tests** (no infrastructure dependencies):
- Manifest parsing with mocked file system
- Version specification parsing
- Detection logic with stubbed services

**Integration Tests** (full infrastructure):
- End-to-end adapter workflows
- Shell-RPC command execution
- Volume mounting and caching

**Interface Compliance Tests** (contract validation):
- Adapter interface implementation validation
- Service contract compliance
- Type system consistency

### 4. Implementation Sequence

**Phase 1** (Immediate - Fix CI):
1. Extract InfrastructureServices abstraction layer
2. Modify existing PipAdapter to use service layer
3. Create mock implementations for unit tests
4. Update failing tests to use appropriate abstraction level

**Phase 2** (Architectural Cleanup):
1. Apply same pattern to UvAdapter and future adapters
2. Implement interface compliance test framework
3. Add architectural quality gates to CI pipeline

## Success Criteria

**Immediate (CI Green)**:
- [ ] All pip adapter tests pass with new architecture
- [ ] Test execution time < 30 seconds for full suite  
- [ ] No infrastructure dependencies in unit tests
- [ ] Clear failure isolation (infrastructure vs core logic)

**Long-term (Architectural Quality)**:
- [ ] New adapters implementable without infrastructure coupling
- [ ] Infrastructure changes don't break core adapter logic
- [ ] Test suite clearly separates unit vs integration concerns
- [ ] CI pipeline provides clear feedback on failure categories

## Implementation Notes

### Interface Stability Framework

1. **Semantic Versioning for Interfaces**: Breaking changes to PackageManagerAdapter interface require major version bump
2. **Backward Compatibility**: Existing adapters must continue working during transition
3. **Progressive Migration**: New interface adopted gradually with deprecation warnings

### Risk Mitigation

1. **Feature Flag**: New architecture behind feature flag during development
2. **Parallel Implementation**: Keep existing implementation working until new one is validated
3. **Incremental Testing**: Validate each architectural layer independently
4. **Rollback Plan**: Clear rollback path if new architecture fails validation

### Quality Gates

All future changes must:
- [ ] Pass interface compliance tests
- [ ] Maintain clear separation between infrastructure and core logic
- [ ] Include both unit and integration test coverage  
- [ ] Document architectural decision rationale

## Consequences

### Positive
- **Sustainable Architecture**: Clear boundaries enable independent development
- **Test Reliability**: Isolated tests provide better failure diagnosis
- **Development Velocity**: Parallel development of infrastructure and core features
- **Quality Assurance**: Interface contracts prevent architectural drift

### Negative  
- **Implementation Time**: 1-2 days for architectural refactoring
- **Complexity**: Additional abstraction layers to understand and maintain
- **Migration Work**: Existing adapters need to be updated

### Neutral
- **Learning Curve**: Team needs to understand new architectural patterns
- **Documentation**: Additional architectural documentation required

## Follow-up Actions

1. **system-developer**: Implement InfrastructureServices abstraction layer
2. **test-architect**: Create layered test architecture with proper mocking
3. **bottles-architect**: Validate architecture supports Phase 3 requirements  
4. **devops-engineer**: Add architectural quality gates to CI pipeline

This decision resolves the critical CI pipeline conflict by establishing clear architectural boundaries that prevent infrastructure concerns from leaking into core business logic, enabling sustainable development of the Bottles architecture.