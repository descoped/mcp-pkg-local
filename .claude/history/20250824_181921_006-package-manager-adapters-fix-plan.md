# Package Manager Adapters Fix Plan

**Plan Number**: 2 of 4  
**Component**: Package Manager Adapters  
**Priority**: 🟡 HIGH  
**Estimated Time**: 2.5 days  
**Risk Level**: MEDIUM  
**Prerequisites**: Plan 1 (Environment Detector) MUST be complete  
**Required by**: Plans 3 and 4  

## Executive Summary

The Package Manager Adapters suffer from inconsistent error handling, different return patterns, no shared base implementation, and significant code duplication. These inconsistencies make the system unpredictable and harder to maintain. The fix requires implementing a proper base class with consistent behavior patterns across all adapters.

**⚠️ DEPENDENCY**: This plan requires Plan 1 to be complete. The BasePackageManagerAdapter depends on EnvironmentInfo being properly injected through EnvironmentManager created in Plan 1.

## Current State Analysis

### Critical Issues 🔴

1. **Inconsistent Error Handling**
   ```typescript
   // Pip adapter - THROWS
   if (!hasVenv) {
     throw new PackageManagerError('No virtual environment found');
   }
   
   // UV adapter - RETURNS EMPTY
   if (!hasVenv) {
     return [];
   }
   ```

2. **Different Manifest Parsing**
   ```typescript
   // Pip: Returns undefined on missing
   // UV: Used to throw, now returns undefined
   // NPM: Sometimes null, sometimes undefined
   ```

3. **No Environment Injection** (Fixed by Plan 1)
   ```typescript
   // Plan 1 already removes these violations
   // This plan builds on that foundation
   ```

4. **Code Duplication**
   - Shell command execution patterns repeated
   - JSON parsing logic duplicated
   - Error handling scattered
   - Path resolution duplicated

## Root Cause Analysis

The inconsistencies arose because:
1. No base class to enforce common patterns
2. Each adapter developed independently
3. No architectural guidelines for error handling
4. Copy-paste evolution without refactoring
5. Different developers with different styles

## Detailed Fix Implementation

### Phase 1: Create Base Adapter Class (Day 1, Morning)

#### Fix 1.1: Define Base Class with Common Behavior
**File**: `src/bottles/package-managers/base-adapter.ts`

```typescript
import type { ShellRPC } from '../shell-rpc/index.js';
import type { VolumeController } from '../volume-controller/index.js';
import type { EnvironmentInfo } from '../environment-detector/types.js';  // From Plan 1
import type { PackageInfo, Manifest, PackageManager } from './types.js';

/**
 * Base class for all package manager adapters
 * Enforces consistent behavior patterns
 */
export abstract class BasePackageManagerAdapter {
  protected readonly shellRPC: ShellRPC;
  protected readonly volumeController: VolumeController;
  protected readonly environment: EnvironmentInfo;
  
  constructor(
    shellRPC: ShellRPC,
    volumeController: VolumeController,
    environment: EnvironmentInfo
  ) {
    this.shellRPC = shellRPC;
    this.volumeController = volumeController;
    this.environment = environment;
  }
  
  /**
   * Get package manager name
   */
  abstract get name(): PackageManager;
  
  /**
   * Check if this package manager is available
   */
  abstract isAvailable(): boolean;
  
  /**
   * CONSISTENT: Parse manifest file
   * @returns Manifest object or undefined if not found
   * NEVER throws - returns undefined for missing files
   */
  async parseManifest(projectDir?: string): Promise<Manifest | undefined> {
    try {
      const resolvedDir = this.resolveProjectDir(projectDir);
      return await this.doParseManifest(resolvedDir);
    } catch (error) {
      // Log but don't throw - consistent behavior
      this.logDebug(`Failed to parse manifest: ${error}`);
      return undefined;
    }
  }
  
  /**
   * CONSISTENT: Get installed packages
   * @returns Array of packages or empty array if none/error
   * NEVER throws - returns empty array for any error condition
   */
  async getInstalledPackages(projectDir?: string): Promise<PackageInfo[]> {
    try {
      const resolvedDir = this.resolveProjectDir(projectDir);
      
      // Check prerequisites (e.g., virtual environment)
      const ready = await this.checkPrerequisites(resolvedDir);
      if (!ready) {
        this.logDebug('Prerequisites not met, returning empty array');
        return [];
      }
      
      return await this.doGetInstalledPackages(resolvedDir);
    } catch (error) {
      // Log but don't throw - consistent behavior
      this.logDebug(`Failed to get packages: ${error}`);
      return [];
    }
  }
  
  /**
   * CONSISTENT: Install a package
   * @returns true if successful, false otherwise
   * NEVER throws - returns false for any error
   */
  async installPackage(
    name: string,
    version?: string,
    projectDir?: string
  ): Promise<boolean> {
    try {
      const resolvedDir = this.resolveProjectDir(projectDir);
      
      // Check prerequisites
      const ready = await this.checkPrerequisites(resolvedDir);
      if (!ready) {
        this.logDebug('Prerequisites not met for install');
        return false;
      }
      
      await this.doInstallPackage(name, version, resolvedDir);
      return true;
    } catch (error) {
      this.logDebug(`Failed to install ${name}: ${error}`);
      return false;
    }
  }
  
  /**
   * CONSISTENT: Uninstall a package
   * @returns true if successful, false otherwise
   * NEVER throws - returns false for any error
   */
  async uninstallPackage(
    name: string,
    projectDir?: string
  ): Promise<boolean> {
    try {
      const resolvedDir = this.resolveProjectDir(projectDir);
      
      // Check prerequisites
      const ready = await this.checkPrerequisites(resolvedDir);
      if (!ready) {
        this.logDebug('Prerequisites not met for uninstall');
        return false;
      }
      
      await this.doUninstallPackage(name, resolvedDir);
      return true;
    } catch (error) {
      this.logDebug(`Failed to uninstall ${name}: ${error}`);
      return false;
    }
  }
  
  /**
   * CONSISTENT: Create/initialize environment
   * @returns true if successful, false otherwise
   */
  async initializeEnvironment(projectDir?: string): Promise<boolean> {
    try {
      const resolvedDir = this.resolveProjectDir(projectDir);
      await this.doInitializeEnvironment(resolvedDir);
      return true;
    } catch (error) {
      this.logDebug(`Failed to initialize environment: ${error}`);
      return false;
    }
  }
  
  // Protected helper methods
  
  protected resolveProjectDir(projectDir?: string): string {
    return projectDir ?? process.cwd();
  }
  
  protected logDebug(message: string): void {
    if (process.env.DEBUG_BOTTLES) {
      console.error(`[${this.name}] ${message}`);
    }
  }
  
  protected async fileExists(path: string): Promise<boolean> {
    try {
      await this.shellRPC.execute(`test -e "${path}"`);
      return true;
    } catch {
      return false;
    }
  }
  
  protected async readJsonFile<T>(path: string): Promise<T | undefined> {
    try {
      const result = await this.shellRPC.execute(`cat "${path}"`);
      return JSON.parse(result.stdout);
    } catch {
      return undefined;
    }
  }
  
  protected parseJsonOutput<T>(output: string): T | undefined {
    try {
      // Handle various JSON formats (with/without prefix)
      const jsonMatch = output.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[1]);
      }
      return JSON.parse(output);
    } catch {
      return undefined;
    }
  }
  
  // Abstract methods for implementation
  
  protected abstract checkPrerequisites(projectDir: string): Promise<boolean>;
  protected abstract doParseManifest(projectDir: string): Promise<Manifest | undefined>;
  protected abstract doGetInstalledPackages(projectDir: string): Promise<PackageInfo[]>;
  protected abstract doInstallPackage(
    name: string,
    version: string | undefined,
    projectDir: string
  ): Promise<void>;
  protected abstract doUninstallPackage(
    name: string,
    projectDir: string
  ): Promise<void>;
  protected abstract doInitializeEnvironment(projectDir: string): Promise<void>;
}
```

### Phase 2: Migrate Existing Adapters (Day 1, Afternoon)

#### Fix 2.1: Migrate Pip Adapter
**File**: `src/bottles/package-managers/pip.ts`

```typescript
import { join } from 'node:path';
import { BasePackageManagerAdapter } from './base-adapter.js';
import type { PackageInfo, Manifest, PipManifest } from './types.js';

export class PipAdapter extends BasePackageManagerAdapter {
  get name() {
    return 'pip' as const;
  }
  
  isAvailable(): boolean {
    return Boolean(this.environment.pip?.available);
  }
  
  protected async checkPrerequisites(projectDir: string): Promise<boolean> {
    // Check for virtual environment
    const venvPath = join(projectDir, '.venv');
    const venvExists = await this.fileExists(venvPath);
    
    if (!venvExists) {
      const altVenvPath = join(projectDir, 'venv');
      return this.fileExists(altVenvPath);
    }
    
    return venvExists;
  }
  
  protected async doParseManifest(projectDir: string): Promise<Manifest | undefined> {
    // Try requirements.txt first
    const reqPath = join(projectDir, 'requirements.txt');
    const reqExists = await this.fileExists(reqPath);
    
    if (reqExists) {
      const result = await this.shellRPC.execute(`cat "${reqPath}"`);
      const dependencies = this.parseRequirementsTxt(result.stdout);
      
      return {
        name: 'python-project',
        version: '0.0.0',
        dependencies,
        devDependencies: {},
      };
    }
    
    // Try pyproject.toml
    const pyprojectPath = join(projectDir, 'pyproject.toml');
    const pyprojectExists = await this.fileExists(pyprojectPath);
    
    if (pyprojectExists) {
      // Parse TOML (simplified for example)
      const result = await this.shellRPC.execute(`cat "${pyprojectPath}"`);
      return this.parsePyprojectToml(result.stdout);
    }
    
    return undefined;
  }
  
  protected async doGetInstalledPackages(projectDir: string): Promise<PackageInfo[]> {
    const pythonCmd = this.environment.python?.command ?? 'python3';
    const pipCmd = this.environment.pip?.command ?? 'pip';
    
    // Activate venv and list packages
    const venvPath = join(projectDir, '.venv');
    const activateCmd = join(venvPath, 'bin', 'activate');
    
    const result = await this.shellRPC.execute(
      `source "${activateCmd}" && ${pipCmd} list --format=json`,
      { cwd: projectDir }
    );
    
    const packages = this.parseJsonOutput<PipPackageInfo[]>(result.stdout);
    if (!packages) return [];
    
    return packages.map(pkg => ({
      name: pkg.name,
      version: pkg.version,
      location: join(venvPath, 'lib', 'python3.x', 'site-packages', pkg.name),
      description: '',
      dependencies: {},
    }));
  }
  
  protected async doInstallPackage(
    name: string,
    version: string | undefined,
    projectDir: string
  ): Promise<void> {
    const pipCmd = this.environment.pip?.command ?? 'pip';
    const venvPath = join(projectDir, '.venv');
    const activateCmd = join(venvPath, 'bin', 'activate');
    
    const packageSpec = version ? `${name}==${version}` : name;
    
    await this.shellRPC.execute(
      `source "${activateCmd}" && ${pipCmd} install "${packageSpec}"`,
      { cwd: projectDir }
    );
  }
  
  protected async doUninstallPackage(
    name: string,
    projectDir: string
  ): Promise<void> {
    const pipCmd = this.environment.pip?.command ?? 'pip';
    const venvPath = join(projectDir, '.venv');
    const activateCmd = join(venvPath, 'bin', 'activate');
    
    await this.shellRPC.execute(
      `source "${activateCmd}" && ${pipCmd} uninstall -y "${name}"`,
      { cwd: projectDir }
    );
  }
  
  protected async doInitializeEnvironment(projectDir: string): Promise<void> {
    const pythonCmd = this.environment.python?.command ?? 'python3';
    const venvPath = join(projectDir, '.venv');
    
    // Create virtual environment
    await this.shellRPC.execute(
      `${pythonCmd} -m venv "${venvPath}"`,
      { cwd: projectDir }
    );
    
    // Upgrade pip
    const activateCmd = join(venvPath, 'bin', 'activate');
    await this.shellRPC.execute(
      `source "${activateCmd}" && pip install --upgrade pip`,
      { cwd: projectDir }
    );
  }
  
  private parseRequirementsTxt(content: string): Record<string, string> {
    const deps: Record<string, string> = {};
    const lines = content.split('\n').filter(line => 
      line.trim() && !line.startsWith('#')
    );
    
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9-_]+)\s*([=<>~!]+.*)?$/);
      if (match) {
        deps[match[1]] = match[2] || '*';
      }
    }
    
    return deps;
  }
  
  private parsePyprojectToml(content: string): Manifest | undefined {
    // Simplified TOML parsing - in reality use a proper parser
    const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
    const versionMatch = content.match(/version\s*=\s*"([^"]+)"/);
    
    return {
      name: nameMatch?.[1] ?? 'unknown',
      version: versionMatch?.[1] ?? '0.0.0',
      dependencies: {},
      devDependencies: {},
    };
  }
}

interface PipPackageInfo {
  name: string;
  version: string;
}
```

#### Fix 2.2: Migrate UV Adapter
**File**: `src/bottles/package-managers/uv.ts`

```typescript
import { join } from 'node:path';
import { BasePackageManagerAdapter } from './base-adapter.js';
import type { PackageInfo, Manifest } from './types.js';

// NOW we can extend BasePackageManagerAdapter (created in Phase 1 of Plan 2)
export class UvAdapter extends BasePackageManagerAdapter {
  get name() {
    return 'uv' as const;
  }
  
  isAvailable(): boolean {
    return Boolean(this.environment.uv?.available);
  }
  
  protected async checkPrerequisites(projectDir: string): Promise<boolean> {
    // Check for virtual environment
    const venvPath = join(projectDir, '.venv');
    return this.fileExists(venvPath);
  }
  
  protected async doParseManifest(projectDir: string): Promise<Manifest | undefined> {
    // UV uses pyproject.toml
    const pyprojectPath = join(projectDir, 'pyproject.toml');
    const exists = await this.fileExists(pyprojectPath);
    
    if (!exists) {
      return undefined;
    }
    
    const result = await this.shellRPC.execute(`cat "${pyprojectPath}"`);
    return this.parsePyprojectToml(result.stdout);
  }
  
  protected async doGetInstalledPackages(projectDir: string): Promise<PackageInfo[]> {
    const uvCmd = this.environment.uv?.command ?? 'uv';
    
    // UV pip list with JSON format
    const result = await this.shellRPC.execute(
      `${uvCmd} pip list --format=json`,
      { 
        cwd: projectDir,
        env: {
          ...process.env,
          UV_PYTHON_PREFERENCE: 'only-system',
        }
      }
    );
    
    // UV sometimes prefixes output
    const packages = this.parseJsonOutput<UvPackageInfo[]>(result.stdout);
    if (!packages) return [];
    
    const venvPath = join(projectDir, '.venv');
    
    return packages.map(pkg => ({
      name: pkg.name,
      version: pkg.version,
      location: join(venvPath, 'lib', 'python3.x', 'site-packages', pkg.name),
      description: pkg.description || '',
      dependencies: {},
    }));
  }
  
  protected async doInstallPackage(
    name: string,
    version: string | undefined,
    projectDir: string
  ): Promise<void> {
    const uvCmd = this.environment.uv?.command ?? 'uv';
    const packageSpec = version ? `${name}==${version}` : name;
    
    await this.shellRPC.execute(
      `${uvCmd} pip install "${packageSpec}"`,
      { 
        cwd: projectDir,
        env: {
          ...process.env,
          UV_PYTHON_PREFERENCE: 'only-system',
        }
      }
    );
  }
  
  protected async doUninstallPackage(
    name: string,
    projectDir: string
  ): Promise<void> {
    const uvCmd = this.environment.uv?.command ?? 'uv';
    
    await this.shellRPC.execute(
      `${uvCmd} pip uninstall -y "${name}"`,
      { 
        cwd: projectDir,
        env: {
          ...process.env,
          UV_PYTHON_PREFERENCE: 'only-system',
        }
      }
    );
  }
  
  protected async doInitializeEnvironment(projectDir: string): Promise<void> {
    const uvCmd = this.environment.uv?.command ?? 'uv';
    
    // Create virtual environment with UV
    await this.shellRPC.execute(
      `${uvCmd} venv`,
      { 
        cwd: projectDir,
        env: {
          ...process.env,
          UV_PYTHON_PREFERENCE: 'only-system',
        }
      }
    );
    
    // UV automatically uses latest pip
  }
  
  private parsePyprojectToml(content: string): Manifest | undefined {
    // Simplified TOML parsing
    const nameMatch = content.match(/name\s*=\s*"([^"]+)"/);
    const versionMatch = content.match(/version\s*=\s*"([^"]+)"/);
    
    return {
      name: nameMatch?.[1] ?? 'unknown',
      version: versionMatch?.[1] ?? '0.0.0',
      dependencies: {},
      devDependencies: {},
    };
  }
}

interface UvPackageInfo {
  name: string;
  version: string;
  description?: string;
}
```

#### Fix 2.3: Migrate NPM Adapter (Example)
**File**: `src/bottles/package-managers/npm.ts`

```typescript
import { join } from 'node:path';
import { BasePackageManagerAdapter } from './base-adapter.js';
import type { PackageInfo, Manifest } from './types.js';

export class NpmAdapter extends BasePackageManagerAdapter {
  get name() {
    return 'npm' as const;
  }
  
  isAvailable(): boolean {
    return Boolean(this.environment.npm?.available);
  }
  
  protected async checkPrerequisites(projectDir: string): Promise<boolean> {
    // Check for node_modules
    const nodeModulesPath = join(projectDir, 'node_modules');
    return this.fileExists(nodeModulesPath);
  }
  
  protected async doParseManifest(projectDir: string): Promise<Manifest | undefined> {
    const packageJsonPath = join(projectDir, 'package.json');
    return this.readJsonFile<Manifest>(packageJsonPath);
  }
  
  protected async doGetInstalledPackages(projectDir: string): Promise<PackageInfo[]> {
    const npmCmd = this.environment.npm?.command ?? 'npm';
    const result = await this.shellRPC.execute(
      `${npmCmd} ls --json --depth=0`,
      { cwd: projectDir }
    );
    
    const data = this.parseJsonOutput<any>(result.stdout);
    if (!data?.dependencies) return [];
    
    return Object.entries(data.dependencies).map(([name, info]: [string, any]) => ({
      name,
      version: info.version,
      location: join(projectDir, 'node_modules', name),
      description: '',
      dependencies: {},
    }));
  }
  
  protected async doInstallPackage(
    name: string,
    version: string | undefined,
    projectDir: string
  ): Promise<void> {
    const npmCmd = this.environment.npm?.command ?? 'npm';
    const packageSpec = version ? `${name}@${version}` : name;
    await this.shellRPC.execute(
      `${npmCmd} install ${packageSpec}`,
      { cwd: projectDir }
    );
  }
  
  protected async doUninstallPackage(
    name: string,
    projectDir: string
  ): Promise<void> {
    const npmCmd = this.environment.npm?.command ?? 'npm';
    await this.shellRPC.execute(
      `${npmCmd} uninstall ${name}`,
      { cwd: projectDir }
    );
  }
  
  protected async doInitializeEnvironment(projectDir: string): Promise<void> {
    const npmCmd = this.environment.npm?.command ?? 'npm';
    await this.shellRPC.execute(
      `${npmCmd} init -y`,
      { cwd: projectDir }
    );
  }
}
```

### Phase 3: Create Adapter Test Suite (Day 2, Morning)

#### Fix 3.1: Adapter Compliance Tests
**File**: `tests/bottles/adapters/adapter-compliance.test.ts`

```typescript
import { PipAdapter } from '#bottles/package-managers/pip';
import { UvAdapter } from '#bottles/package-managers/uv';
import { NpmAdapter } from '#bottles/package-managers/npm';
import type { BasePackageManagerAdapter } from '#bottles/package-managers/base-adapter';
import { createTestEnvironment } from '../test-utils.js';

describe('Adapter Compliance Tests', () => {
  const adapters = [
    { name: 'pip', AdapterClass: PipAdapter },
    { name: 'uv', AdapterClass: UvAdapter },
    { name: 'npm', AdapterClass: NpmAdapter },
  ];
  
  describe.each(adapters)('$name adapter compliance', ({ name, AdapterClass }) => {
    let adapter: BasePackageManagerAdapter;
    let testEnv: any;
    
    beforeEach(async () => {
      testEnv = await createTestEnvironment(`compliance-${name}`);
      adapter = new AdapterClass(
        testEnv.shellRPC,
        testEnv.volumeController,
        testEnv.environment
      );
    });
    
    afterEach(async () => {
      await testEnv.cleanup();
    });
    
    describe('Error Handling Consistency', () => {
      it('should return undefined for missing manifest, not throw', async () => {
        const result = await adapter.parseManifest('/non/existent/path');
        expect(result).toBeUndefined();
      });
      
      it('should return empty array for missing environment, not throw', async () => {
        const result = await adapter.getInstalledPackages('/non/existent/path');
        expect(result).toEqual([]);
      });
      
      it('should return false for failed install, not throw', async () => {
        const result = await adapter.installPackage('non-existent-package');
        expect(result).toBe(false);
      });
      
      it('should return false for failed uninstall, not throw', async () => {
        const result = await adapter.uninstallPackage('non-existent-package');
        expect(result).toBe(false);
      });
    });
    
    describe('Return Type Consistency', () => {
      it('should always return PackageInfo[] from getInstalledPackages', async () => {
        const result = await adapter.getInstalledPackages();
        expect(Array.isArray(result)).toBe(true);
        
        if (result.length > 0) {
          expect(result[0]).toHaveProperty('name');
          expect(result[0]).toHaveProperty('version');
          expect(result[0]).toHaveProperty('location');
        }
      });
      
      it('should always return Manifest or undefined from parseManifest', async () => {
        const result = await adapter.parseManifest();
        
        if (result !== undefined) {
          expect(result).toHaveProperty('name');
          expect(result).toHaveProperty('version');
          expect(result).toHaveProperty('dependencies');
        }
      });
      
      it('should always return boolean from install operations', async () => {
        const result = await adapter.initializeEnvironment();
        expect(typeof result).toBe('boolean');
      });
    });
    
    describe('Method Availability', () => {
      it('should implement all required methods', () => {
        expect(adapter.name).toBeDefined();
        expect(adapter.isAvailable).toBeDefined();
        expect(adapter.parseManifest).toBeDefined();
        expect(adapter.getInstalledPackages).toBeDefined();
        expect(adapter.installPackage).toBeDefined();
        expect(adapter.uninstallPackage).toBeDefined();
        expect(adapter.initializeEnvironment).toBeDefined();
      });
      
      it('should have consistent method signatures', () => {
        expect(adapter.parseManifest.length).toBeLessThanOrEqual(1);
        expect(adapter.getInstalledPackages.length).toBeLessThanOrEqual(1);
        expect(adapter.installPackage.length).toBeLessThanOrEqual(3);
        expect(adapter.uninstallPackage.length).toBeLessThanOrEqual(2);
        expect(adapter.initializeEnvironment.length).toBeLessThanOrEqual(1);
      });
    });
  });
});
```

#### Fix 3.2: Cross-Adapter Compatibility Tests
**File**: `tests/bottles/adapters/cross-adapter.test.ts`

```typescript
describe('Cross-Adapter Compatibility', () => {
  let pipAdapter: PipAdapter;
  let uvAdapter: UvAdapter;
  let testEnv: any;
  let testProjectDir: string;
  
  beforeAll(async () => {
    testEnv = await createTestEnvironment('cross-adapter');
    testProjectDir = await createTempProject();
    
    pipAdapter = new PipAdapter(
      testEnv.shellRPC,
      testEnv.volumeController,
      testEnv.environment
    );
    
    uvAdapter = new UvAdapter(
      testEnv.shellRPC,
      testEnv.volumeController,
      testEnv.environment
    );
  });
  
  afterAll(async () => {
    await cleanupTempProject(testProjectDir);
    await testEnv.cleanup();
  });
  
  describe('Shared Virtual Environment', () => {
    it('should allow pip and uv to work with same venv', async () => {
      // Initialize with pip
      const pipInit = await pipAdapter.initializeEnvironment(testProjectDir);
      expect(pipInit).toBe(true);
      
      // Install with pip
      const pipInstall = await pipAdapter.installPackage('requests', undefined, testProjectDir);
      expect(pipInstall).toBe(true);
      
      // Read with uv
      const uvPackages = await uvAdapter.getInstalledPackages(testProjectDir);
      expect(uvPackages).toContainEqual(
        expect.objectContaining({ name: 'requests' })
      );
      
      // Install with uv
      const uvInstall = await uvAdapter.installPackage('httpx', undefined, testProjectDir);
      expect(uvInstall).toBe(true);
      
      // Read with pip
      const pipPackages = await pipAdapter.getInstalledPackages(testProjectDir);
      expect(pipPackages).toContainEqual(
        expect.objectContaining({ name: 'httpx' })
      );
    });
    
    it('should have consistent manifest parsing', async () => {
      const pipManifest = await pipAdapter.parseManifest(testProjectDir);
      const uvManifest = await uvAdapter.parseManifest(testProjectDir);
      
      // Both should return same structure
      if (pipManifest && uvManifest) {
        expect(pipManifest.name).toBe(uvManifest.name);
        expect(pipManifest.version).toBe(uvManifest.version);
      }
    });
  });
  
  describe('Error Behavior Consistency', () => {
    it('should handle missing venv consistently', async () => {
      const emptyDir = await createTempProject();
      
      const pipResult = await pipAdapter.getInstalledPackages(emptyDir);
      const uvResult = await uvAdapter.getInstalledPackages(emptyDir);
      
      // Both should return empty array
      expect(pipResult).toEqual([]);
      expect(uvResult).toEqual([]);
      
      await cleanupTempProject(emptyDir);
    });
    
    it('should handle missing manifest consistently', async () => {
      const emptyDir = await createTempProject();
      
      const pipResult = await pipAdapter.parseManifest(emptyDir);
      const uvResult = await uvAdapter.parseManifest(emptyDir);
      
      // Both should return undefined
      expect(pipResult).toBeUndefined();
      expect(uvResult).toBeUndefined();
      
      await cleanupTempProject(emptyDir);
    });
  });
});
```

### Phase 4: Enhance Factory with Validation (Day 2, Afternoon)

#### Fix 4.1: Enhanced Factory with Validation
**File**: `src/bottles/package-managers/factory.ts`

```typescript
import { BasePackageManagerAdapter } from './base-adapter.js';
import { PipAdapter } from './pip.js';
import { UvAdapter } from './uv.js';
import { NpmAdapter } from './npm.js';
import { EnvironmentManager } from '../environment-manager.js';  // From Plan 1
import type { PackageManager } from './types.js';

/**
 * Factory for creating package manager adapters with validation
 */
export class PackageManagerFactory {
  private static adapters = new Map<PackageManager, typeof BasePackageManagerAdapter>();
  
  static {
    // Register all adapters
    this.register('pip', PipAdapter);
    this.register('uv', UvAdapter);
    this.register('npm', NpmAdapter);
  }
  
  /**
   * Register a new adapter class
   */
  static register(
    manager: PackageManager,
    AdapterClass: typeof BasePackageManagerAdapter
  ): void {
    this.adapters.set(manager, AdapterClass);
  }
  
  /**
   * Create adapter instance with validation
   */
  static async create(
    manager: PackageManager,
    shellRPC: ShellRPC,
    volumeController: VolumeController
  ): Promise<BasePackageManagerAdapter> {
    const AdapterClass = this.adapters.get(manager);
    if (!AdapterClass) {
      throw new Error(`Unknown package manager: ${manager}`);
    }
    
    // Get environment from centralized manager (Plan 1)
    const envManager = EnvironmentManager.getInstance();
    const environment = await envManager.getEnvironment(shellRPC);
    
    // NOTE: Plan 3 will handle proper volume mounting
    // For now, basic mount operation
    if (volumeController.isInitialized()) {
      await volumeController.mount(manager);
    }
    
    // Create adapter instance with injected environment
    const adapter = new AdapterClass(shellRPC, volumeController, environment);
    
    // Validate adapter implementation
    this.validateAdapter(adapter);
    
    return adapter;
  }
  
  /**
   * Validate adapter implements required interface
   */
  private static validateAdapter(adapter: BasePackageManagerAdapter): void {
    const required = [
      'name',
      'isAvailable',
      'parseManifest',
      'getInstalledPackages',
      'installPackage',
      'uninstallPackage',
      'initializeEnvironment',
    ];
    
    for (const method of required) {
      if (!(method in adapter)) {
        throw new Error(
          `Adapter ${adapter.constructor.name} missing required method: ${method}`
        );
      }
    }
    
    // Validate return types in development
    if (process.env.NODE_ENV !== 'production') {
      this.validateReturnTypes(adapter);
    }
  }
  
  /**
   * Runtime validation of return types
   */
  private static async validateReturnTypes(
    adapter: BasePackageManagerAdapter
  ): Promise<void> {
    // Quick validation with empty project
    const testDir = '/tmp/adapter-validation-' + Date.now();
    
    try {
      // parseManifest should return undefined for missing
      const manifest = await adapter.parseManifest(testDir);
      if (manifest !== undefined && typeof manifest !== 'object') {
        throw new Error(`${adapter.name}: parseManifest must return object or undefined`);
      }
      
      // getInstalledPackages should return array
      const packages = await adapter.getInstalledPackages(testDir);
      if (!Array.isArray(packages)) {
        throw new Error(`${adapter.name}: getInstalledPackages must return array`);
      }
      
      // install operations should return boolean
      const installResult = await adapter.installPackage('test-package', undefined, testDir);
      if (typeof installResult !== 'boolean') {
        throw new Error(`${adapter.name}: installPackage must return boolean`);
      }
    } catch (error) {
      console.warn(`Adapter validation warning for ${adapter.name}:`, error);
    }
  }
}

// Export convenience function
export async function createPackageManagerAdapter(
  manager: PackageManager,
  shellRPC: ShellRPC,
  volumeController: VolumeController
): Promise<BasePackageManagerAdapter> {
  return PackageManagerFactory.create(manager, shellRPC, volumeController);
}
```

### Phase 5: Documentation & Migration (Day 3)

#### Fix 5.1: Migration Guide
**File**: `docs/adapter-migration.md`

```markdown
# Package Manager Adapter Migration Guide

## Overview

All package manager adapters must now extend `BasePackageManagerAdapter` and follow consistent behavior patterns.

## Key Changes

### 1. Error Handling
**Before:**
```typescript
if (!hasVenv) {
  throw new Error('No virtual environment');  // WRONG
}
```

**After:**
```typescript
if (!hasVenv) {
  return [];  // Consistent: return empty array
}
```

### 2. Return Types
- `parseManifest()` → `Manifest | undefined` (never throws)
- `getInstalledPackages()` → `PackageInfo[]` (never throws)
- `installPackage()` → `boolean` (success/failure)
- `uninstallPackage()` → `boolean` (success/failure)
- `initializeEnvironment()` → `boolean` (success/failure)

### 3. Environment Injection
**Before:**
```typescript
const { detectEnvironment } = await import('../environment-detector.js');
const env = await detectEnvironment();  // WRONG
```

**After:**
```typescript
// Environment injected via constructor
this.environment.pip?.available  // Use injected
```

## Implementation Checklist

- [ ] Extend `BasePackageManagerAdapter`
- [ ] Remove all direct environment detection
- [ ] Implement all abstract methods
- [ ] Follow consistent error handling (no throws)
- [ ] Return correct types (see above)
- [ ] Add debug logging using `this.logDebug()`
- [ ] Use helper methods (`fileExists`, `readJsonFile`, etc.)

## Testing

Run compliance tests:
```bash
npm test -- adapter-compliance
```

Run cross-adapter tests:
```bash
npm test -- cross-adapter
```
```

#### Fix 5.2: Adapter Template
**File**: `src/bottles/package-managers/template.ts.example`

```typescript
import { BasePackageManagerAdapter } from './base-adapter.js';
import type { PackageInfo, Manifest } from './types.js';

/**
 * Template for new package manager adapters
 * Copy this file and implement all abstract methods
 */
export class TemplateAdapter extends BasePackageManagerAdapter {
  get name() {
    return 'template' as const;  // Change to actual manager name
  }
  
  isAvailable(): boolean {
    // Check if package manager is available in environment
    return Boolean(this.environment.template?.available);
  }
  
  protected async checkPrerequisites(projectDir: string): Promise<boolean> {
    // Check any prerequisites (e.g., virtual environment, config files)
    // Return true if ready, false otherwise
    return true;
  }
  
  protected async doParseManifest(projectDir: string): Promise<Manifest | undefined> {
    // Parse manifest file (package.json, requirements.txt, etc.)
    // Return undefined if not found
    // Use this.fileExists() and this.readJsonFile() helpers
    return undefined;
  }
  
  protected async doGetInstalledPackages(projectDir: string): Promise<PackageInfo[]> {
    // Get list of installed packages
    // Return empty array if none or error
    // Use this.shellRPC.execute() for commands
    // Use this.parseJsonOutput() for JSON parsing
    return [];
  }
  
  protected async doInstallPackage(
    name: string,
    version: string | undefined,
    projectDir: string
  ): Promise<void> {
    // Install a package
    // Throw error if fails (will be caught by base class)
    const cmd = `template install ${name}`;
    await this.shellRPC.execute(cmd, { cwd: projectDir });
  }
  
  protected async doUninstallPackage(
    name: string,
    projectDir: string
  ): Promise<void> {
    // Uninstall a package
    // Throw error if fails (will be caught by base class)
    const cmd = `template uninstall ${name}`;
    await this.shellRPC.execute(cmd, { cwd: projectDir });
  }
  
  protected async doInitializeEnvironment(projectDir: string): Promise<void> {
    // Initialize environment (create venv, init project, etc.)
    // Throw error if fails (will be caught by base class)
    const cmd = `template init`;
    await this.shellRPC.execute(cmd, { cwd: projectDir });
  }
}
```

## Dependencies and Handoffs

### From Plan 1 (Environment Detector)
- EnvironmentManager singleton for centralized detection
- EnvironmentInfo type for injection
- Factory pattern prepared for environment injection

### To Plan 3 (Volume Controller)
- BasePackageManagerAdapter available for consistent integration
- Factory pattern ready for volume mounting

### To Plan 4 (Shell-RPC)
- Consistent adapter interfaces for pooling
- Standardized error handling for better monitoring

## Implementation Timeline

### Day 1: Base Class & Core Adapters
**Morning (4 hours)**
- [ ] Create BasePackageManagerAdapter class (2 hours)
- [ ] Define consistent interfaces and types (1 hour)
- [ ] Implement helper methods (1 hour)

**Afternoon (4 hours)**
- [ ] Migrate PipAdapter (1.5 hours)
- [ ] Migrate UvAdapter (1.5 hours)
- [ ] Initial testing (1 hour)

### Day 2: Testing & Validation
**Morning (4 hours)**
- [ ] Create compliance test suite (2 hours)
- [ ] Create cross-adapter tests (2 hours)

**Afternoon (4 hours)**
- [ ] Enhance factory with validation (2 hours)
- [ ] Fix any compliance issues (2 hours)

### Day 3: Documentation & Cleanup
**Morning (2 hours)**
- [ ] Create migration guide (1 hour)
- [ ] Create adapter template (1 hour)

## Performance Impact

### Current State
- Inconsistent error paths: 10-100ms variance
- Duplicate environment detection: 700-4000ms each
- No shared utilities: Code duplication overhead

### Expected After Fixes
- Consistent error paths: <5ms overhead
- Single environment detection: 0ms (injected)
- Shared utilities: 20% less code

## Success Metrics

### Immediate (Day 1)
- ✅ All adapters extend base class
- ✅ Consistent error handling across all adapters
- ✅ No direct environment detection

### Short-term (Day 2)
- ✅ All compliance tests pass
- ✅ Cross-adapter compatibility verified
- ✅ Factory validation in place

### Long-term (Week 1)
- ✅ No inconsistent behaviors reported
- ✅ Easy to add new adapters
- ✅ 50% reduction in adapter code

## Risk Mitigation

### Medium Risk Items
- **Breaking existing tests**
  - Mitigation: Update tests incrementally
  - Fallback: Keep old behavior in comments
  
- **Missing edge cases**
  - Mitigation: Comprehensive test suite
  - Fallback: Add cases as discovered

### Low Risk Items
- **Performance regression**
  - Mitigation: Benchmark before/after
  - Fallback: Optimize hot paths

## Monitoring & Validation

### Consistency Monitor
```typescript
class AdapterConsistencyMonitor {
  static async validateAllAdapters(): Promise<boolean> {
    const managers: PackageManager[] = ['pip', 'uv', 'npm'];
    const results = new Map<string, any>();
    
    for (const manager of managers) {
      const adapter = await createPackageManagerAdapter(
        manager,
        testShellRPC,
        testVolumeController
      );
      
      // Test consistent behavior
      const emptyDirResult = await adapter.getInstalledPackages('/empty');
      const missingManifest = await adapter.parseManifest('/empty');
      
      results.set(manager, {
        emptyDir: emptyDirResult,
        missingManifest,
      });
    }
    
    // All should have same behavior
    const behaviors = Array.from(results.values());
    const consistent = behaviors.every(b => 
      Array.isArray(b.emptyDir) &&
      b.emptyDir.length === 0 &&
      b.missingManifest === undefined
    );
    
    if (!consistent) {
      console.error('❌ Inconsistent adapter behavior:', results);
      return false;
    }
    
    console.log('✅ All adapters behave consistently');
    return true;
  }
}
```

## Conclusion

The Package Manager Adapters inconsistency issues stem from lack of a common base implementation. By introducing `BasePackageManagerAdapter` with enforced patterns, we achieve:

1. **Consistent error handling**: No surprises for consumers
2. **Predictable return types**: Always arrays or undefined, never throws
3. **Code reuse**: 50% reduction through shared utilities
4. **Easier maintenance**: Single place to fix common issues
5. **Better testability**: Compliance tests ensure consistency

The migration is straightforward and can be done incrementally without breaking existing functionality.

---

**Document Version**: 1.1.0  
**Created**: 2025-08-23  
**Updated**: 2025-08-23 (reordered as Plan 2)  
**Priority**: HIGH  
**Prerequisites**: Plan 1 MUST be complete  
**Next Review**: After Day 1 implementation  
**Next Plan**: Plan 3 - Volume Controller