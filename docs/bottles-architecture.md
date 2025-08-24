# Bottles Architecture Documentation

## Overview

The Bottles architecture is a containerized environment system for managing package manager operations in isolated, reproducible contexts. It provides persistent shell sessions, volume-managed caches, and standardized adapters for different package managers.

## Core Concepts

### 1. Bottle
A **Bottle** is a self-contained environment consisting of:
- A persistent shell session (Shell-RPC)
- Mounted cache volumes (Volume Controller)
- Package manager adapters
- Isolated or inherited environment variables

### 2. Architecture Components

```
┌─────────────────────────────────────────────┐
│              Bottle Environment              │
├─────────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐    │
│  │     Package Manager Adapters        │    │
│  │        (pip, uv)                    │    │
│  └────────────┬────────────────────────┘    │
│               │                              │
│  ┌────────────▼─────────┬──────────────┐    │
│  │    Shell-RPC         │   Volume      │    │
│  │  (Persistent Shell)  │  Controller   │    │
│  └──────────────────────┴──────────────┘    │
│               │                │             │
│  ┌────────────▼────────────────▼────────┐   │
│  │        Host System Resources         │   │
│  │  (Processes, File System, Network)   │   │
│  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

## Component Details

### Shell-RPC (Remote Procedure Call via Shell)

**Purpose**: Provides persistent shell processes that stay alive between commands, enabling stateful operations and performance optimization.

**Key Features**:
- **Persistent Sessions**: Shell processes remain active between commands
- **Command Queueing**: Sequential command execution with proper ordering
- **Enhanced Timeout System**: Two-stage resilient timeout with pattern matching
- **Cross-Platform Support**: Works on Windows (PowerShell), macOS (bash/zsh), Linux (bash/sh)
- **Clean Environment Mode**: Option to run with minimal environment variables
- **Signal Support**: SIGINT, SIGTERM, SIGKILL for process control

**Implementation**: `src/bottles/shell-rpc/`
- `index.ts`: Main ShellRPC class
- `process-manager.ts`: Process lifecycle management
- `command-queue.ts`: Command sequencing and queuing
- `platform.ts`: Platform-specific configurations
- `environment.ts`: Environment variable management
- `enhanced-timeout.ts`: Timeout integration layer
- `timeout/`: Resilient timeout system

### Volume Controller

**Purpose**: Manages cache directories for package managers, providing persistent cache volumes that survive across sessions.

**Key Features**:
- **Cache Mounting**: Maps package manager caches to bottle-specific directories
- **Cross-Platform Paths**: Handles platform-specific cache locations
- **Environment Variables**: Injects cache paths into shell environment
- **Auto-detection**: Skips detection in test environments

**Cache Structure**:
```
output/cache/bottles/
├── pip/          # Pip package cache
├── uv/           # UV package cache
├── npm/          # NPM package cache (future)
└── yarn/         # Yarn package cache (future)
```

**Implementation**: `src/bottles/volume-controller/`
- `volume-controller.ts`: Main VolumeController class
- `cache-paths.ts`: Platform-specific cache path resolution
- `types.ts`: Type definitions

### Package Manager Adapters

**Purpose**: Provide standardized interfaces for different package managers, abstracting their specific commands and behaviors.

**Base Interface**:
```typescript
interface PackageManagerAdapter {
  // Core properties
  readonly name: string;
  readonly displayName: string;
  
  // Detection and validation
  detectProject(dir: string): Promise<DetectionResult>;
  validateEnvironment(): Promise<ValidationResult>;
  
  // Package operations
  installPackages(packages: string[], options?: InstallOptions): Promise<void>;
  uninstallPackages(packages: string[]): Promise<void>;
  listPackages(options?: ListOptions): Promise<PackageInfo[]>;
  
  // Manifest management
  parseManifest(projectDir: string): Promise<Manifest>;
  syncDependencies(projectDir: string): Promise<void>;
  
  // Environment setup
  createVirtualEnvironment(projectDir: string): Promise<void>;
  activateVirtualEnvironment(projectDir: string): Promise<void>;
}
```

**Current Adapters**:
- **PipAdapter**: Python pip package manager
- **UVAdapter**: Rust-based Python package manager (uv)

**Implementation**: `src/bottles/package-managers/`
- `base.ts`: Abstract base class and factory
- `pip.ts`: Pip adapter implementation
- `uv.ts`: UV adapter implementation
- `registry.ts`: Adapter registration system
- `timeouts.ts`: Timeout configurations

## Usage Patterns

### Basic Bottle Setup

```typescript
import { ShellRPC } from '#bottles/shell-rpc';
import { VolumeController } from '#bottles/volume-controller';
import { PipAdapter } from '#bottles/package-managers/pip';
import { EnvironmentInfo } from '#bottles/environment-detector';

// 1. Create core components
const shellRPC = new ShellRPC({
  cwd: projectDir,
  cleanEnv: true,  // Use minimal environment
});

const volumeController = new VolumeController('my-bottle-id', {
  skipAutoDetection: true,  // Recommended for explicit control
});

// 2. Initialize components
await shellRPC.initialize();

// 3. Get environment info (centralized detection)
const environment: EnvironmentInfo = {
  pip: { available: true, version: '23.0.0', command: 'pip', path: '/usr/bin/pip' },
  uv: { available: true, version: '0.5.0', command: 'uv', path: '/usr/local/bin/uv' },
  detected: true,
  timestamp: Date.now(),
};

// 4. Create adapter with environment
const pipAdapter = new PipAdapter(shellRPC, environment, {
  cwd: projectDir,
});

// 5. Use adapter for package operations
await pipAdapter.createVirtualEnvironment(projectDir);
await pipAdapter.installPackages(['requests', 'pytest']);

// 6. Cleanup
await shellRPC.cleanup();
```

### Auto-Detection Pattern

```typescript
import { PackageManagerAdapterFactory } from '#bottles/package-managers/base';
import { EnvironmentManager } from '#bottles/environment-manager';

// Get centralized environment
const envManager = EnvironmentManager.getInstance();
const environment = await envManager.getEnvironment();

// Auto-detect package managers in project
const adapters = await PackageManagerAdapterFactory.autoDetect(
  projectDir,
  shellRPC,
  environment
);

for (const adapter of adapters) {
  console.log(`Found: ${adapter.displayName}`);
  const packages = await adapter.listPackages();
  console.log(`Installed: ${packages.length} packages`);
}
```

## Environment Management

### Environment Inheritance

By default, bottles inherit the host environment with safety modifications:

```typescript
const defaultEnv = {
  ...process.env,           // Inherit host environment
  TERM: 'xterm-256color',   // Terminal support
  NO_COLOR: '1',            // Disable color output (optional)
  CI: 'true',               // Indicate CI environment (when in CI)
};
```

### Clean Environment Mode

For maximum isolation:

```typescript
const shellRPC = new ShellRPC({
  cleanEnv: true,
  preservePaths: [],  // Minimal PATH is auto-created
});
```

### Volume Environment Variables

The Volume Controller injects cache paths into the environment:

```typescript
// For pip
PIP_CACHE_DIR=/path/to/cache/pip

// For uv
UV_CACHE_DIR=/path/to/cache/uv

// For npm (future)
NPM_CONFIG_CACHE=/path/to/cache/npm
```

## Error Handling

### Error Types

1. **ShellRPCError**: Shell process failures
   - `INIT_FAILED`: Initialization failure
   - `TIMEOUT`: Command timeout
   - `SHELL_DIED`: Unexpected shell termination

2. **PackageManagerError**: Adapter-specific errors
   - `COMMAND_FAILED`: Command execution failure
   - `MANIFEST_NOT_FOUND`: Missing manifest file
   - `INVALID_PROJECT`: Not a valid project
   - `JSON_PARSE_ERROR`: Failed to parse JSON output

### Recovery Strategies

```typescript
import { retryWithBackoff } from '#bottles/integration/common/test-utils';

// Automatic retry with exponential backoff
const result = await retryWithBackoff(
  () => adapter.installPackages(['package']),
  3,     // max retries (5 in CI)
  1000   // base delay (2000ms in CI)
);
```

## Performance Considerations

### Shell Process Reuse

- Keep shells alive between commands to avoid spawn overhead
- Typical savings: 100-200ms per command
- Use ShellRPCPool for concurrent operations

### Cache Persistence

- Volume mounting eliminates repeated downloads
- Typical savings: 50-90% reduction in install time

### Command Batching

```typescript
// Inefficient: Multiple round trips
await shell.execute('pip install package1');
await shell.execute('pip install package2');

// Efficient: Single command
await shell.execute('pip install package1 package2');
```

### Parallel Operations

```typescript
// Use Promise.all for independent operations
await Promise.all([
  adapter.installPackages(['package1']),
  adapter.installPackages(['package2']),
]);
```

## Testing

### Test Environment Pattern

```typescript
import { createTestEnvironment } from '#bottles/integration/common/test-utils';

// Create isolated test environment
const env = await createTestEnvironment('my-test');

try {
  // Components use test environment
  const adapter = new PipAdapter(env.shellRPC, env.environment, {
    cwd: env.projectDir,
  });
  
  // Test operations...
  await adapter.installPackages(['six']);
  
} finally {
  // Cleanup
  await env.cleanup();
}
```

### Timeout Configuration

Tests use centralized timeout configurations:

```typescript
import { TEST_TIMEOUTS } from '#bottles/integration/common/test-utils';

it('should install packages', async () => {
  // ... test code ...
}, TEST_TIMEOUTS.install);  // CI-aware timeout
```

## Enhanced Timeout System

### Two-Stage Resilient Algorithm

The Shell-RPC uses a sophisticated timeout system:

1. **ACTIVE Stage**: Initial working period with activity-based extensions
2. **GRACE Stage**: Recovery buffer before termination
3. **EXPIRED Stage**: Terminal state

### Pattern-Based Behavior

```typescript
// Progress patterns reset timeout
const progressPatterns = [
  /Downloading .+/,
  /Installing .+/,
  /Building .+/,
  /Processing .+/,
];

// Error patterns trigger immediate termination
const errorPatterns = [
  /ERROR: .+/,
  /FATAL: .+/,
  /Failed to .+/,
  /Permission denied/,
];
```

### Command Classification

The system automatically classifies commands and applies appropriate timeouts:

```typescript
// Package installation: longer timeout with progress tracking
await shell.execute('pip install tensorflow', PACKAGE_MANAGER_TIMEOUTS.standard);

// Quick operations: shorter timeout
await shell.execute('pip --version', PACKAGE_MANAGER_TIMEOUTS.quick);
```

## Security Considerations

### Input Sanitization

Always sanitize user input to prevent command injection:

```typescript
// Use proper escaping for shell arguments
const safePackage = packageName.replace(/[^a-zA-Z0-9._-]/g, '');
await shell.execute(`pip install ${safePackage}`);
```

### Path Validation

```typescript
// Ensure paths are within project boundaries
const safePath = path.normalize(userPath);
if (!safePath.startsWith(projectDir)) {
  throw new Error('Path traversal detected');
}
```

## Performance Metrics

### Typical Operation Times

```
Shell initialization:     50-200ms
Virtual env creation:     1-3s
Package installation:     2-30s (depends on package size)
Cache hit rate:          70-90% after initial population
```

### CI Environment Adjustments

All timeouts are automatically adjusted in CI:
- 4x multiplier for network operations
- Extended grace periods for package downloads
- Performance test thresholds adapted for variable CI performance

## Best Practices

### 1. Resource Management

Always clean up resources:

```typescript
try {
  await shellRPC.initialize();
  // ... operations ...
} finally {
  await shellRPC.cleanup();
}
```

### 2. Error Context

Provide meaningful error messages:

```typescript
throw new PackageManagerError(
  `Failed to install ${packageName}`,
  'COMMAND_FAILED',
  stderr  // Include actual error output
);
```

### 3. Environment Detection

Use centralized environment detection:

```typescript
// DON'T: Direct detection in adapters
const pip = await detectPip();

// DO: Use EnvironmentManager
const env = await EnvironmentManager.getInstance().getEnvironment();
```

### 4. Test Isolation

Use proper test utilities for isolation:

```typescript
import { skipIfUnavailable } from '#bottles/integration/common/test-utils';

skipIfUnavailable(
  'should work with pip',
  'pip',
  async () => {
    // Test implementation
  },
  TEST_TIMEOUTS.install
);
```

## Conclusion

The Bottles architecture provides a robust, extensible foundation for managing package operations across different languages and package managers. Its modular design, enhanced timeout system, and comprehensive testing utilities make it production-ready for reliable package management operations.