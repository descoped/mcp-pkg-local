# Breaking Changes - Plan 1 Implementation

## Summary
Plan 1 has been successfully implemented, fixing the critical architectural violation where adapters were directly importing and calling environment detection functions instead of using dependency injection.

## Breaking Changes

### 1. BasePackageManagerAdapter Constructor Signature Changed
**Before:**
```typescript
constructor(
  protected readonly shellRPC: ShellRPC,
  protected readonly volumeController: VolumeController,
  protected readonly projectDir: string = process.cwd(),
)
```

**After:**
```typescript
constructor(
  protected readonly shellRPC: ShellRPC,
  protected readonly volumeController: VolumeController,
  protected readonly environment: EnvironmentInfo,
  protected readonly projectDir: string = process.cwd(),
)
```

**Impact:** All adapter instantiations must now provide an EnvironmentInfo parameter.

### 2. PackageManagerAdapterFactory.create() Signature Changed
**Before:**
```typescript
static create(
  manager: PackageManager,
  shellRPC: ShellRPC,
  volumeController: VolumeController,
  projectDir?: string,
): PackageManagerAdapter
```

**After:**
```typescript
static create(
  manager: PackageManager,
  shellRPC: ShellRPC,
  volumeController: VolumeController,
  environment: EnvironmentInfo,
  projectDir?: string,
): PackageManagerAdapter
```

**Impact:** Factory method now requires environment parameter.

### 3. PackageManagerAdapterFactory.autoDetect() Signature Changed
**Before:**
```typescript
static async autoDetect(
  projectDir: string,
  shellRPC: ShellRPC,
  volumeController: VolumeController,
): Promise<PackageManagerAdapter[]>
```

**After:**
```typescript
static async autoDetect(
  projectDir: string,
  shellRPC: ShellRPC,
  volumeController: VolumeController,
  environment: EnvironmentInfo,
): Promise<PackageManagerAdapter[]>
```

**Impact:** Auto-detection now requires environment parameter.

## Migration Guide

### For Direct Adapter Usage
**Before:**
```typescript
const adapter = new PipAdapter(shellRPC, volumeController, projectDir);
```

**After:**
```typescript
import { EnvironmentManager } from '#bottles/environment-manager';

const envManager = EnvironmentManager.getInstance();
const environment = await envManager.getEnvironment(shellRPC);
const adapter = new PipAdapter(shellRPC, volumeController, environment, projectDir);
```

### For Factory Usage (Recommended)
Use the new convenience factory function:
```typescript
import { createPackageManagerAdapter } from '#bottles/package-managers/factory';

const adapter = await createPackageManagerAdapter(
  'pip',
  shellRPC,
  volumeController,
  projectDir
);
```

### For Test Code
Use the provided test fixtures:
```typescript
import { EnvironmentFixtures } from '../fixtures/environment-fixtures.js';

const mockEnvironment = EnvironmentFixtures.createMockEnvironment();
const adapter = new PipAdapter(shellRPC, volumeController, mockEnvironment, projectDir);
```

## Benefits
1. **Single Detection Per Process:** Environment is detected once and cached, improving performance
2. **Proper Dependency Injection:** Follows SOLID principles and makes testing easier
3. **CI Optimization:** Can inject pre-detected environment via BOTTLES_ENV_JSON
4. **Better Testability:** Can mock environments for consistent testing

## Verification
- ✅ All TypeScript compilation errors fixed
- ✅ All unit tests passing (61 tests)
- ✅ All bottles unit tests passing (135 tests)
- ✅ Integration tests passing
- ✅ Environment detection working correctly
- ✅ CI compatibility verified
- ✅ Build successful

## Next Steps
With Plan 1 completed and stabilized, the system is ready for Plan 2 implementation (Adapter Lifecycle Management) when needed.