# Bottles Architecture Design Document

**Status**: ACTIVE  
**Date**: 2025-08-19  
**Version**: 1.0.0  
**Focus**: Python Package Managers Only (pip, poetry, uv, pipenv)

## Executive Summary

The Bottles architecture provides self-contained test environments for validating package scanners using native package managers via Shell-RPC. This design replaces the current mock-based Python testing with real package installations, achieving feature parity with Node.js testing capabilities.

## 1. Architecture Overview

### 1.1 Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Bottle System Architecture              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐     ┌──────────────┐    ┌─────────────┐ │
│  │ Bottle       │────▶│ Shell-RPC    │───▶│ Package     │ │
│  │ Manager      │     │ Engine       │    │ Managers    │ │
│  └──────────────┘     └──────────────┘    └─────────────┘ │
│         │                     │                    │        │
│         ▼                     ▼                    ▼        │
│  ┌──────────────┐     ┌──────────────┐    ┌─────────────┐ │
│  │ Volume       │     │ Process      │    │ pip         │ │
│  │ Controller   │     │ Manager      │    │ poetry      │ │
│  └──────────────┘     └──────────────┘    │ uv          │ │
│         │                     │            │ pipenv      │ │
│         ▼                     ▼            └─────────────┘ │
│  ┌──────────────┐     ┌──────────────┐                    │
│  │ Cache        │     │ Output       │                    │
│  │ Storage      │     │ Stream       │                    │
│  └──────────────┘     └──────────────┘                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │                  Scanner Integration                 │  │
│  │  ┌─────────────┐        ┌─────────────┐            │  │
│  │  │ Python      │───────▶│ Bottle      │            │  │
│  │  │ Scanner     │        │ Adapter     │            │  │
│  │  └─────────────┘        └─────────────┘            │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
1. Test Request → Bottle Manager
2. Bottle Manager → Creates/Reuses Bottle
3. Shell-RPC → Spawns persistent shell process
4. Package Manager → Installs dependencies in bottle
5. Volume Controller → Manages cache persistence
6. Scanner → Scans bottle environment
7. Results → Validated against expected packages
```

## 2. Shell-RPC Design

### 2.1 Core Implementation

```typescript
// src/bottles/shell-rpc.ts
interface ShellRPCOptions {
  shell: 'bash' | 'sh' | 'cmd' | 'powershell';
  cwd: string;
  env: Record<string, string>;
  timeout: number;
  keepAlive: boolean;
}

class ShellRPC {
  private process: ChildProcess | null = null;
  private outputBuffer: string[] = [];
  private errorBuffer: string[] = [];
  private commandQueue: CommandRequest[] = [];
  
  async spawn(options: ShellRPCOptions): Promise<void> {
    // Use node-pty for better cross-platform support
    // Fallback to child_process.spawn if needed
  }
  
  async execute(command: string): Promise<CommandResult> {
    // Send command to persistent shell
    // Handle output streaming
    // Return structured result
  }
  
  async terminate(): Promise<void> {
    // Graceful shutdown
    // Clean up resources
  }
}
```

### 2.2 Cross-Platform Strategy

**Unix/Linux/macOS**:
- Primary shell: `bash`
- Fallback: `sh`
- Virtual env activation: `source .venv/bin/activate`

**Windows**:
- Primary shell: `powershell`
- Fallback: `cmd`
- Virtual env activation: `.venv\Scripts\Activate.ps1` or `.venv\Scripts\activate.bat`

### 2.3 Error Handling

```typescript
class ShellRPCError extends Error {
  constructor(
    message: string,
    public readonly command: string,
    public readonly exitCode: number,
    public readonly stderr: string
  ) {
    super(message);
  }
}

// Retry logic for transient failures
async function executeWithRetry(
  rpc: ShellRPC,
  command: string,
  maxRetries = 3
): Promise<CommandResult> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await rpc.execute(command);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

## 3. Volume Management

### 3.1 Cache Directory Structure

```
.bottles/
├── cache/
│   ├── pip/
│   │   ├── wheels/
│   │   └── http/
│   ├── poetry/
│   │   ├── cache/
│   │   └── virtualenvs/
│   ├── uv/
│   │   └── cache/
│   └── pipenv/
│       └── cache/
├── environments/
│   ├── test-pip-django/
│   ├── test-poetry-fastapi/
│   ├── test-uv-flask/
│   └── test-pipenv-requests/
└── manifests/
    ├── test-pip-django.yaml
    ├── test-poetry-fastapi.yaml
    ├── test-uv-flask.yaml
    └── test-pipenv-requests.yaml
```

### 3.2 Cache Key Generation

```typescript
interface CacheKeyOptions {
  packageManager: 'pip' | 'poetry' | 'uv' | 'pipenv';
  lockFile: string; // Path to lock file
  pythonVersion: string;
  platform: NodeJS.Platform;
}

function generateCacheKey(options: CacheKeyOptions): string {
  const lockContent = await fs.readFile(options.lockFile, 'utf-8');
  const hash = crypto
    .createHash('sha256')
    .update(lockContent)
    .update(options.pythonVersion)
    .update(options.platform)
    .digest('hex');
  
  return `${options.packageManager}-${hash.substring(0, 16)}`;
}
```

### 3.3 Volume Controller

```typescript
class VolumeController {
  private readonly cacheDir: string;
  private readonly maxCacheSize: number = 5 * 1024 * 1024 * 1024; // 5GB
  
  async mount(bottleId: string, packageManager: string): Promise<MountPoint> {
    // Create cache directories if needed
    // Set up symlinks or bind mounts
    // Return mount configuration
  }
  
  async unmount(bottleId: string): Promise<void> {
    // Clean up symlinks
    // Persist cache changes
  }
  
  async prune(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<void> {
    // Remove caches older than maxAge
    // Enforce maxCacheSize limit
  }
}
```

## 4. Bottle Configuration System

### 4.1 YAML Schema

```yaml
# bottles/specs/test-pip-django.yaml
version: '1.0'
name: test-pip-django
description: Django test environment with pip

environment:
  python: '3.11'
  packageManager: pip
  
dependencies:
  - django==4.2.0
  - djangorestframework==3.14.0
  - celery==5.3.0
  - redis==5.0.0
  - psycopg2-binary==2.9.9

setup:
  - pip install --upgrade pip
  - pip install -r requirements.txt

validation:
  packages:
    - name: django
      version: '4.2.0'
      files:
        - __init__.py
        - core/management/__init__.py
    - name: rest_framework
      version: '3.14.0'

cache:
  key: '${lockfile_hash}-${python_version}'
  paths:
    - ~/.cache/pip
```

### 4.2 Configuration Templates

```typescript
// src/bottles/templates.ts
export const BOTTLE_TEMPLATES = {
  pip: {
    minimal: {
      dependencies: ['requests', 'pytest'],
      setup: ['pip install --upgrade pip'],
    },
    web: {
      dependencies: ['flask', 'django', 'fastapi'],
      setup: ['pip install --upgrade pip'],
    },
    data: {
      dependencies: ['pandas', 'numpy', 'scikit-learn'],
      setup: ['pip install --upgrade pip'],
    },
  },
  poetry: {
    minimal: {
      pyproject: `[tool.poetry]
name = "test"
version = "0.1.0"

[tool.poetry.dependencies]
python = "^3.11"
requests = "^2.31.0"`,
      setup: ['poetry install'],
    },
  },
  uv: {
    minimal: {
      pyproject: `[project]
name = "test"
version = "0.1.0"
dependencies = ["requests>=2.31.0"]`,
      setup: ['uv pip sync requirements.txt'],
    },
  },
  pipenv: {
    minimal: {
      pipfile: `[[source]]
url = "https://pypi.org/simple"
verify_ssl = true

[packages]
requests = "*"`,
      setup: ['pipenv install'],
    },
  },
};
```

## 5. Scanner Integration

### 5.1 Bottle Adapter

```typescript
// src/bottles/adapter.ts
class BottleAdapter {
  constructor(
    private bottle: Bottle,
    private scanner: BaseScanner
  ) {}
  
  async scan(options?: ScanOptions): Promise<ScanResult> {
    // Switch scanner context to bottle environment
    const originalCwd = process.cwd();
    const originalEnv = { ...process.env };
    
    try {
      process.chdir(this.bottle.path);
      process.env = { ...process.env, ...this.bottle.env };
      
      // Perform scan in bottle context
      return await this.scanner.scan(options);
    } finally {
      process.chdir(originalCwd);
      process.env = originalEnv;
    }
  }
}
```

### 5.2 Modified Python Scanner

```typescript
// Changes to src/scanners/python.ts
class PythonScanner extends BaseScanner {
  private bottleMode: boolean = false;
  private bottlePath?: string;
  
  setBottleMode(enabled: boolean, path?: string): void {
    this.bottleMode = enabled;
    this.bottlePath = path;
  }
  
  async findVirtualEnvironment(): Promise<string | null> {
    if (this.bottleMode && this.bottlePath) {
      // Use bottle's virtual environment
      return join(this.bottlePath, '.venv');
    }
    // Existing logic for regular scanning
    return super.findVirtualEnvironment();
  }
}
```

## 6. Implementation Phases

### Phase 1: Core Infrastructure (Week 1)

**Components**:
1. Shell-RPC engine with cross-platform support
2. Basic volume controller with cache management
3. Bottle manager with lifecycle hooks
4. Error handling and logging

**Deliverables**:
- `src/bottles/shell-rpc.ts`
- `src/bottles/volume-controller.ts`
- `src/bottles/manager.ts`
- Unit tests for each component

### Phase 2: Python Package Manager Support (Week 2)

**Components**:
1. Package manager adapters (pip, poetry, uv, pipenv)
2. Bottle configuration parser
3. Template system for common scenarios
4. Validation framework

**Deliverables**:
- `src/bottles/package-managers/*.ts`
- `src/bottles/config-parser.ts`
- `src/bottles/templates.ts`
- `src/bottles/validator.ts`

### Phase 3: Scanner Integration & Migration (Week 3)

**Components**:
1. Bottle adapter for scanners
2. Modified Python scanner with bottle support
3. Test migration from mocks to bottles
4. Performance benchmarks

**Deliverables**:
- `src/bottles/adapter.ts`
- Updated `src/scanners/python.ts`
- Migrated test files
- Performance report

## 7. Technical Decisions

### 7.1 Shell Process Management

**Decision**: Use `node-pty` library with `child_process` fallback

**Rationale**:
- node-pty provides better cross-platform PTY support
- Handles terminal control codes properly
- Fallback ensures compatibility if node-pty fails
- Native child_process is sufficient for simple commands

### 7.2 Process Model

**Decision**: In-process bottles with isolated environments

**Rationale**:
- Simpler architecture than separate processes
- Better performance for test execution
- Easier debugging and error handling
- Can leverage existing scanner infrastructure

### 7.3 Windows Support

**Decision**: Full Windows support with PowerShell preference

**Rationale**:
- Many Python developers use Windows
- PowerShell provides better scripting capabilities
- Virtual environments work differently on Windows
- Need to handle path separators and activation scripts

### 7.4 Package Manager Priority

**Decision**: Implement in order: pip → uv → poetry → pipenv

**Rationale**:
- pip is most widely used (80%+ of projects)
- uv is fastest growing, modern alternative
- poetry is popular for modern projects
- pipenv has declining usage but still significant

### 7.5 Backward Compatibility

**Decision**: Maintain full backward compatibility during migration

**Rationale**:
- Existing mock tests continue working
- Gradual migration path for test suite
- No breaking changes to public API
- Feature flag for bottle mode activation

## 8. Risk Analysis & Mitigation

### 8.1 Technical Risks

**Risk**: Shell-RPC complexity across platforms
- **Mitigation**: Extensive cross-platform testing, fallback mechanisms

**Risk**: Large cache sizes (5GB+ for comprehensive testing)
- **Mitigation**: Intelligent pruning, shared cache layers, compression

**Risk**: Network dependency for package downloads
- **Mitigation**: Aggressive caching, offline mode support, retry logic

**Risk**: Windows virtual environment differences
- **Mitigation**: Platform-specific activation scripts, extensive Windows testing

### 8.2 Performance Risks

**Risk**: Slow bottle initialization (>30 seconds)
- **Mitigation**: Pre-built bottles, parallel initialization, cache warming

**Risk**: CI/CD timeout issues
- **Mitigation**: Cache persistence across runs, parallel execution

### 8.3 Maintenance Risks

**Risk**: Package manager API changes
- **Mitigation**: Version pinning, compatibility layer, regular updates

## 9. Success Metrics

### 9.1 Performance Targets
- Bottle initialization: <30 seconds (with cache)
- Cache hit rate: >80% in CI/CD
- Test execution time: <2x current mock tests
- Memory usage: <500MB per bottle

### 9.2 Quality Targets
- Python package coverage: 100+ real packages tested
- Cross-platform success rate: >95%
- Test reliability: >99% (no flaky tests)
- Scanner accuracy: 100% for standard packages

### 9.3 Developer Experience
- Zero configuration for standard projects
- Clear error messages with remediation steps
- Comprehensive logging for debugging
- Simple migration from mock tests

## 10. Future Considerations

### 10.1 Extended Python Support
- Conda environment support
- System package integration
- Multiple Python version testing
- Virtual environment detection improvements

### 10.2 Performance Optimizations
- Parallel bottle initialization
- Distributed cache sharing
- Binary package caching
- Incremental dependency updates

### 10.3 Advanced Features
- Dependency conflict detection
- Security vulnerability scanning
- License compliance checking
- Package size analysis

## Appendix A: API Specifications

### Bottle Manager API

```typescript
interface BottleManager {
  create(spec: BottleSpec): Promise<Bottle>;
  get(id: string): Promise<Bottle | null>;
  list(): Promise<Bottle[]>;
  destroy(id: string): Promise<void>;
  prune(options?: PruneOptions): Promise<void>;
}

interface Bottle {
  id: string;
  name: string;
  path: string;
  env: Record<string, string>;
  packageManager: PackageManager;
  packages: Map<string, PackageInfo>;
  
  initialize(): Promise<void>;
  install(packages: string[]): Promise<void>;
  scan(): Promise<ScanResult>;
  validate(): Promise<ValidationResult>;
  cleanup(): Promise<void>;
}
```

### Shell-RPC API

```typescript
interface ShellRPC {
  spawn(options: ShellOptions): Promise<void>;
  execute(command: string): Promise<CommandResult>;
  stream(command: string): AsyncIterable<string>;
  terminate(): Promise<void>;
  
  readonly isAlive: boolean;
  readonly pid: number | null;
}

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}
```

## Appendix B: Configuration Examples

### Complete Bottle Configuration

```yaml
version: '1.0'
name: comprehensive-test
description: Comprehensive Python testing environment

environment:
  python: '3.11'
  packageManager: uv
  platform: linux
  
dependencies:
  # Web frameworks
  - django==4.2.0
  - flask==3.0.0
  - fastapi==0.104.0
  
  # Data science
  - pandas==2.1.0
  - numpy==1.25.0
  - scikit-learn==1.3.0
  
  # Testing
  - pytest==7.4.0
  - pytest-cov==4.1.0
  
  # Utilities
  - requests==2.31.0
  - pydantic==2.5.0

setup:
  - uv pip install --upgrade pip
  - uv pip sync requirements.txt
  - uv pip list

validation:
  command: python -c "import django; print(django.__version__)"
  packages:
    - name: django
      minVersion: '4.0.0'
    - name: pandas
      minVersion: '2.0.0'

cache:
  strategy: aggressive
  maxSize: 2GB
  ttl: 7d
```