# Interface Stability Framework for pkg-local MCP

**Purpose**: Define architectural contracts and stability guarantees for the Bottles Phase 2+ development.

**Implementation Status**: Design Complete - Ready for system-developer implementation

## Core Principle: Infrastructure Services Abstraction

The fundamental architectural pattern separating **pure business logic** from **infrastructure concerns**.

### 1. InfrastructureServices Contract

**Location**: `src/bottles/infrastructure/services.ts`

```typescript
/**
 * Core infrastructure services abstraction
 * Enables testing and reduces coupling between adapters and infrastructure
 */
export interface InfrastructureServices {
  readonly shell: ShellExecutor;
  readonly cache: CacheProvider;
  readonly volumes: VolumeMounter;
  readonly environment: EnvironmentProvider;
}

export interface ShellExecutor {
  execute(command: string, options?: ExecuteOptions): Promise<ExecuteResult>;
  isAvailable(executable: string): Promise<boolean>;
  getVersion(executable: string): Promise<string | null>;
}

export interface CacheProvider {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<boolean>;
  clear(): Promise<void>;
}

export interface VolumeMounter {
  mount(paths: string[], options?: MountOptions): Promise<VolumeMount>;
  unmount(mount: VolumeMount): Promise<void>;
  getCachePaths(packageManager: string): Promise<CachePaths>;
}

export interface EnvironmentProvider {
  getVariable(name: string): string | undefined;
  setVariable(name: string, value: string): void;
  getWorkingDirectory(): string;
  resolvePath(path: string): string;
}

export interface ExecuteOptions {
  cwd?: string;
  timeout?: number;
  env?: Record<string, string>;
  shell?: boolean;
}

export interface ExecuteResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

export interface MountOptions {
  readOnly?: boolean;
  temporary?: boolean;
  preservePermissions?: boolean;
}
```

### 2. Revised PackageManagerAdapter Interface

**Location**: `src/bottles/package-managers/base.ts` (modified)

```typescript
/**
 * Stable package manager adapter interface
 * Version: 1.0.0 - Breaking changes require major version bump
 */
export interface PackageManagerAdapter {
  // === PURE PROPERTIES (no dependencies) ===
  readonly name: PackageManager;
  readonly displayName: string;
  readonly executable: string;
  readonly manifestFiles: string[];
  readonly lockFiles: string[];

  // === PURE FUNCTIONS (no infrastructure dependencies) ===
  parseManifest(projectDir: string): Promise<Manifest>;
  normalizePackageName(name: string): string;
  parseVersionSpec(spec: string): VersionSpec;
  
  // === INFRASTRUCTURE FUNCTIONS (require services) ===
  detectProject(dir: string, services: InfrastructureServices): Promise<DetectionResult>;
  installPackages(packages: string[], services: InfrastructureServices, options?: InstallOptions): Promise<void>;
  getInstalledPackages(services: InfrastructureServices, projectDir?: string): Promise<PackageInfo[]>;
  getCachePaths(services: InfrastructureServices): Promise<CachePaths>;
  getEnvironmentVariables(services: InfrastructureServices): Promise<Record<string, string>>;
  validateInstallation(services: InfrastructureServices): Promise<ValidationResult>;
  createEnvironment(projectDir: string, services: InfrastructureServices, options?: EnvironmentOptions): Promise<void>;
}

/**
 * Base implementation providing common functionality
 */
export abstract class BasePackageManagerAdapter implements PackageManagerAdapter {
  public abstract readonly name: PackageManager;
  public abstract readonly displayName: string;
  public abstract readonly executable: string;
  public abstract readonly manifestFiles: string[];
  public abstract readonly lockFiles: string[];

  // === PURE IMPLEMENTATIONS ===
  public normalizePackageName(name: string): string {
    return name.toLowerCase().replace(/[-_.]+/g, '-');
  }

  public parseVersionSpec(spec: string): VersionSpec {
    // Common version parsing logic
    const match = /^([^<>=!]+)(.*)$/.exec(spec.trim());
    if (!match) {
      return { name: spec.trim(), version: '*' };
    }
    return {
      name: this.normalizePackageName(match[1].trim()),
      version: match[2]?.trim() || '*',
      constraint: match[2]?.trim() || undefined,
    };
  }

  // === ABSTRACT METHODS ===
  public abstract parseManifest(projectDir: string): Promise<Manifest>;
  public abstract detectProject(dir: string, services: InfrastructureServices): Promise<DetectionResult>;
  public abstract installPackages(packages: string[], services: InfrastructureServices, options?: InstallOptions): Promise<void>;
  public abstract getCachePaths(services: InfrastructureServices): Promise<CachePaths>;

  // === COMMON INFRASTRUCTURE HELPERS ===
  protected async findManifestFiles(dir: string): Promise<string[]> {
    // Pure file system operations - no services needed
    const { access, constants } = await import('node:fs/promises');
    const { join } = await import('node:path');
    
    const foundFiles: string[] = [];
    for (const file of this.manifestFiles) {
      const filePath = join(dir, file);
      try {
        await access(filePath, constants.F_OK);
        foundFiles.push(filePath);
      } catch {
        // File doesn't exist, skip
      }
    }
    return foundFiles;
  }

  protected async executeCommand(command: string, services: InfrastructureServices, options?: ExecuteOptions): Promise<ExecuteResult> {
    return services.shell.execute(command, options);
  }
}
```

### 3. Implementation Strategy

#### Phase 1: Core Infrastructure Services

**Target Files**:
1. `src/bottles/infrastructure/services.ts` - New interface definitions
2. `src/bottles/infrastructure/implementations/` - Concrete implementations
3. `src/bottles/infrastructure/mocks/` - Test mock implementations

**Concrete Implementations**:

```typescript
// src/bottles/infrastructure/implementations/shell-executor.ts
export class ShellRPCExecutor implements ShellExecutor {
  constructor(private readonly shellRPC: ShellRPC) {}
  
  async execute(command: string, options?: ExecuteOptions): Promise<ExecuteResult> {
    return this.shellRPC.execute(command, options);
  }
  
  async isAvailable(executable: string): Promise<boolean> {
    try {
      const result = await this.execute(`${executable} --version`);
      return result.exitCode === 0;
    } catch {
      return false;
    }
  }
}

// src/bottles/infrastructure/implementations/volume-mounter.ts
export class VolumeControllerMounter implements VolumeMounter {
  constructor(private readonly volumeController: VolumeController) {}
  
  async mount(paths: string[], options?: MountOptions): Promise<VolumeMount> {
    return this.volumeController.mount(paths, options);
  }
  
  async getCachePaths(packageManager: string): Promise<CachePaths> {
    return this.volumeController.getCachePaths(packageManager);
  }
}

// src/bottles/infrastructure/mocks/mock-services.ts
export class MockInfrastructureServices implements InfrastructureServices {
  public readonly shell = new MockShellExecutor();
  public readonly cache = new MockCacheProvider();
  public readonly volumes = new MockVolumeMounter();
  public readonly environment = new MockEnvironmentProvider();
}
```

#### Phase 2: Adapter Migration

**Modified PipAdapter** (example):

```typescript
export class PipAdapter extends BasePackageManagerAdapter {
  // === PURE PROPERTIES ===
  public readonly name = 'pip' as const;
  public readonly displayName = 'pip';
  public readonly executable = 'pip';
  public readonly manifestFiles = ['requirements.txt', 'setup.py', 'setup.cfg', 'pyproject.toml'];
  public readonly lockFiles = ['requirements-lock.txt', 'requirements.lock'];

  // === PURE FUNCTION (no services dependency) ===
  public async parseManifest(projectDir: string): Promise<Manifest> {
    const manifestFiles = await this.findManifestFiles(projectDir);
    if (manifestFiles.length === 0) {
      throw new PackageManagerError('No pip manifest files found');
    }
    
    // Pure parsing logic - only reads files, no shell/cache/volume operations
    const dependencies: Record<string, string> = {};
    const devDependencies: Record<string, string> = {};
    const optionalDependencies: Record<string, string> = {};
    
    for (const manifestFile of manifestFiles) {
      const filename = manifestFile.split('/').pop() ?? '';
      if (filename.includes('requirements') && filename.endsWith('.txt')) {
        const requirements = await this.parseRequirementsFile(manifestFile);
        const isDev = filename.includes('dev') || filename.includes('test');
        const targetDeps = isDev ? devDependencies : dependencies;
        for (const req of requirements) {
          targetDeps[req.name] = req.version;
        }
      }
      // Additional parsing logic...
    }

    return {
      dependencies,
      devDependencies,
      optionalDependencies,
      metadata: { hasRequirements: Object.keys(dependencies).length > 0 },
    };
  }

  // === INFRASTRUCTURE FUNCTION (requires services) ===
  public async detectProject(dir: string, services: InfrastructureServices): Promise<DetectionResult> {
    const manifestFiles = await this.findManifestFiles(dir);
    const lockFiles = await this.findLockFiles(dir);
    
    if (manifestFiles.length === 0) {
      return { detected: false, confidence: 0.0, manifestFiles: [], lockFiles: [] };
    }
    
    let confidence = 0.4;
    
    // Use services for checking if pip is available
    const pipAvailable = await services.shell.isAvailable('pip');
    if (pipAvailable) {
      confidence += 0.2;
    }
    
    return {
      detected: true,
      confidence,
      manifestFiles,
      lockFiles,
      metadata: { pipAvailable, manifestFiles: manifestFiles.length },
    };
  }

  public async getCachePaths(services: InfrastructureServices): Promise<CachePaths> {
    return services.volumes.getCachePaths('pip');
  }
}
```

#### Phase 3: Layered Test Architecture

**Unit Tests** (no infrastructure):

```typescript
// tests/unit/package-managers/pip-parsing.test.ts
describe('PipAdapter - Pure Parsing Functions', () => {
  it('should parse requirements.txt correctly', async () => {
    const adapter = new PipAdapter();
    const manifest = await adapter.parseManifest('/path/to/test/fixtures');
    
    expect(manifest.dependencies['requests']).toBe('>=2.25.0');
    expect(manifest.dependencies['flask']).toBe('==2.3.2');
  });
  
  it('should parse version specifications correctly', () => {
    const adapter = new PipAdapter();
    
    expect(adapter.parseVersionSpec('requests>=2.25.0')).toEqual({
      name: 'requests',
      version: '>=2.25.0',
      constraint: '>=2.25.0',
    });
  });
});
```

**Integration Tests** (full infrastructure):

```typescript
// tests/integration/package-managers/pip-integration.test.ts
describe('PipAdapter - Infrastructure Integration', () => {
  let services: InfrastructureServices;
  
  beforeEach(() => {
    services = {
      shell: new ShellRPCExecutor(new ShellRPC()),
      cache: new SQLiteCacheProvider(),
      volumes: new VolumeControllerMounter(new VolumeController('test')),
      environment: new ProcessEnvironmentProvider(),
    };
  });
  
  it('should detect pip projects with infrastructure', async () => {
    const adapter = new PipAdapter();
    const result = await adapter.detectProject('/test/project', services);
    
    expect(result.detected).toBe(true);
    expect(result.confidence).toBeGreaterThan(0.5);
  });
});
```

**Interface Compliance Tests**:

```typescript
// tests/contracts/adapter-interface.test.ts
describe('PackageManagerAdapter Interface Compliance', () => {
  const adapters = [new PipAdapter(), new UvAdapter()];
  
  test.each(adapters)('$name implements required interface', (adapter) => {
    // Test interface contract compliance
    expect(typeof adapter.parseManifest).toBe('function');
    expect(typeof adapter.detectProject).toBe('function');
    expect(Array.isArray(adapter.manifestFiles)).toBe(true);
    expect(typeof adapter.name).toBe('string');
  });
  
  test.each(adapters)('$name pure functions work without services', async (adapter) => {
    // Test that pure functions don't require services
    expect(async () => {
      await adapter.parseManifest('/nonexistent/path');
    }).not.toThrow('services');
  });
});
```

## Quality Gates and Validation

### 1. Interface Compliance Tests

All adapters must pass interface compliance tests:
- [ ] Implements all required interface methods
- [ ] Pure functions work without services parameter  
- [ ] Infrastructure functions fail gracefully without services
- [ ] Type contracts match interface definitions exactly

### 2. Architectural Boundaries Validation

- [ ] Unit tests must not import infrastructure implementations
- [ ] Pure functions cannot call infrastructure services
- [ ] Infrastructure functions must handle service failures gracefully
- [ ] Mock implementations must match interface contracts exactly

### 3. CI Pipeline Quality Gates

```yaml
# .github/workflows/quality-gates.yml
- name: Interface Compliance Tests
  run: npm test -- tests/contracts/

- name: Unit Test Isolation
  run: |
    # Ensure unit tests don't depend on infrastructure
    npm test -- tests/unit/ --reporter=json | jq '.testResults[].assertionResults[] | select(.failureMessages | length > 0) | select(.title | contains("infrastructure"))'

- name: Architecture Boundary Validation  
  run: npm run lint -- --rule "no-restricted-imports"
```

## Migration Timeline

### Week 1: Infrastructure Services
- [ ] Define InfrastructureServices interfaces
- [ ] Implement concrete service classes
- [ ] Create mock implementations for testing
- [ ] Add interface compliance test framework

### Week 2: Adapter Migration
- [ ] Migrate PipAdapter to new interface
- [ ] Migrate UvAdapter to new interface  
- [ ] Update test suites to use layered architecture
- [ ] Validate all existing functionality works

### Week 3: Quality Assurance
- [ ] Run full test suite with new architecture
- [ ] Performance validation (ensure no regressions)
- [ ] Documentation updates
- [ ] CI pipeline quality gate implementation

## Success Metrics

**Immediate Success (CI Green)**:
- [ ] 100% test pass rate with new architecture
- [ ] Clear separation between unit/integration tests
- [ ] No infrastructure dependencies in unit tests
- [ ] Test execution time < 30 seconds

**Long-term Success (Architectural Quality)**:
- [ ] New adapters implementable following clear patterns
- [ ] Infrastructure changes don't break core adapter tests
- [ ] Interface compliance automatically validated in CI
- [ ] Clear architectural documentation and examples

This framework provides the stable architectural foundation needed to resolve the CI pipeline conflicts while establishing sustainable development patterns for the Bottles architecture phases.