# URGENT: Implementation Delegation - CI Architecture Fix

**TO**: system-developer  
**FROM**: solution-architect  
**PRIORITY**: P0 - Critical CI blocker  
**TIMELINE**: Complete within 24 hours

## Situation Summary

The CI pipeline is failing due to architectural coupling between infrastructure components (Shell-RPC, Volume Controller) and core business logic (package manager adapters). The solution is **Interface Stabilization** through the Infrastructure Services abstraction pattern.

## Architecture Decision Made

Implement **ADR-002** with the **Infrastructure Services Abstraction Pattern** to decouple core business logic from infrastructure concerns.

## Implementation Requirements

### Phase 1: Create Infrastructure Services Layer

**NEW FILES TO CREATE**:

1. **`src/bottles/infrastructure/services.ts`**
   - Define InfrastructureServices interface
   - Define ShellExecutor, CacheProvider, VolumeMounter, EnvironmentProvider interfaces
   - Copy interface definitions from `ai_docs/interface-stability-framework.md` lines 15-80

2. **`src/bottles/infrastructure/implementations/`** (directory)
   - `shell-executor.ts` - ShellRPCExecutor implementation
   - `cache-provider.ts` - CacheProvider implementation  
   - `volume-mounter.ts` - VolumeControllerMounter implementation
   - `environment-provider.ts` - EnvironmentProvider implementation

3. **`src/bottles/infrastructure/mocks/`** (directory)
   - `mock-services.ts` - Complete mock implementations for testing
   - Each mock should return reasonable default values, not throw errors

### Phase 2: Update Package Manager Adapters

**MODIFY EXISTING FILES**:

1. **`src/bottles/package-managers/base.ts`**
   - Update PackageManagerAdapter interface to match new contract
   - Modify BasePackageManagerAdapter class
   - **Critical**: Keep parseManifest() as pure function (no services parameter)
   - Add services parameter to detectProject(), installPackages(), etc.

2. **`src/bottles/package-managers/pip.ts`**
   - Update PipAdapter to use new interface pattern
   - **Key Change**: parseManifest() should only do file system operations
   - Move Shell-RPC and Volume Controller interactions to methods that take services parameter
   - **Test Focus**: This is where the current test failures are happening

3. **`src/bottles/package-managers/uv.ts`**
   - Apply same pattern as PipAdapter

### Phase 3: Update Test Files

**MODIFY EXISTING TEST FILES**:

1. **`tests/bottles/package-managers-pip.test.ts`**
   - Update tests to use mock services for infrastructure-dependent methods
   - Keep parseManifest tests as pure unit tests (no services needed)
   - Use mock services for detectProject tests

2. **`tests/bottles/package-managers-uv.test.ts`**
   - Apply same pattern as pip tests

3. **`tests/bottles/package-managers-base.test.ts`**  
   - Update to test new interface contracts

### Implementation Sequence

**Step 1** (Fix immediate CI failures):
```bash
# Create infrastructure services interfaces
touch src/bottles/infrastructure/services.ts
# Copy interfaces from framework document

# Create mock implementations  
mkdir -p src/bottles/infrastructure/mocks
touch src/bottles/infrastructure/mocks/mock-services.ts
# Implement basic mocks that don't throw errors
```

**Step 2** (Update adapters to use services):
```bash
# Update PipAdapter to accept services parameter where needed
# Keep parseManifest() as pure function
# Move Shell/Volume operations to infrastructure methods
```

**Step 3** (Fix tests):
```bash
# Update failing tests to use mock services
# Separate unit tests (pure functions) from integration tests (with services)
```

## Critical Success Criteria

**IMMEDIATE** (must achieve within 24 hours):
- [ ] All 7 failing pip adapter tests pass
- [ ] CI pipeline shows 100% green  
- [ ] Test execution time remains under 30 seconds
- [ ] No breaking changes to existing functionality

**VALIDATION** (verify during implementation):
- [ ] parseManifest() works without services parameter (pure function)
- [ ] detectProject() works with mock services (infrastructure function)  
- [ ] getCachePaths() delegates to services.volumes.getCachePaths()
- [ ] Tests clearly separate unit vs integration concerns

## Interface Contract (Non-Negotiable)

**Pure Functions** (NO services parameter):
```typescript
parseManifest(projectDir: string): Promise<Manifest>
normalizePackageName(name: string): string
parseVersionSpec(spec: string): VersionSpec
```

**Infrastructure Functions** (REQUIRE services parameter):
```typescript
detectProject(dir: string, services: InfrastructureServices): Promise<DetectionResult>
installPackages(packages: string[], services: InfrastructureServices): Promise<void>
getCachePaths(services: InfrastructureServices): Promise<CachePaths>
```

## Code Examples

**Mock Services Implementation**:
```typescript
export class MockShellExecutor implements ShellExecutor {
  async execute(command: string): Promise<ExecuteResult> {
    return {
      stdout: 'mock output',
      stderr: '',
      exitCode: 0,
      duration: 10,
    };
  }

  async isAvailable(executable: string): Promise<boolean> {
    return executable === 'pip' || executable === 'uv'; // Mock available tools
  }
}
```

**Updated PipAdapter detectProject**:
```typescript
public async detectProject(dir: string, services: InfrastructureServices): Promise<DetectionResult> {
  const manifestFiles = await this.findManifestFiles(dir); // Pure function
  
  if (manifestFiles.length === 0) {
    return { detected: false, confidence: 0.0, manifestFiles: [], lockFiles: [] };
  }
  
  let confidence = 0.4;
  
  // Use services for infrastructure checks
  const pipAvailable = await services.shell.isAvailable('pip');
  if (pipAvailable) {
    confidence += 0.2;
  }
  
  return { detected: true, confidence, manifestFiles, lockFiles: [] };
}
```

**Updated Test Pattern**:
```typescript
// Unit test - no services needed
it('should parse requirements.txt correctly', async () => {
  const adapter = new PipAdapter();
  const manifest = await adapter.parseManifest(testDir); // Pure function
  expect(manifest.dependencies['requests']).toBe('>=2.25.0');
});

// Integration test - uses mock services  
it('should detect pip projects', async () => {
  const adapter = new PipAdapter();
  const mockServices = new MockInfrastructureServices();
  const result = await adapter.detectProject(testDir, mockServices);
  expect(result.detected).toBe(true);
});
```

## Validation Commands

Run these after each step to ensure progress:

```bash
# Test specific failing functionality
npm test -- tests/bottles/package-managers-pip.test.ts

# Ensure no TypeScript errors
npm run typecheck  

# Verify lint passes
npm run lint

# Full test suite (should pass after completion)
npm test
```

## Escalation Protocol

**If blocked**: Document specific blocker and escalate immediately to solution-architect

**If architectural questions**: Refer to:
- `ai_docs/ADR-002-CI-Pipeline-Architecture-Resolution.md` - Decision rationale
- `ai_docs/interface-stability-framework.md` - Detailed implementation patterns

**Success Definition**: 
When `npm test` shows 100% green with no failing tests, and CI pipeline passes completely.

## Next Steps After Success

Once CI is green:
1. solution-architect will validate architectural quality
2. test-architect will validate test coverage
3. devops-engineer will set up architectural quality gates
4. Proceed to Phase 3 Bottles development

The critical path is: **Fix CI → Validate Architecture → Continue Phase 3 Development**

**GO/NO-GO**: Implementation must be completed within 24 hours to maintain project timeline.