# Bottles Architecture: Language-Agnostic Package Manager Testing Framework

**Status**: 📐 ARCHITECTURE SPECIFICATION - REVISED  
**Date**: 2025-08-16 (Revised)  
**Scope**: Multi-language Package Management Tools  
**Purpose**: Autonomous testing of package scanners across diverse package management ecosystems  

## Executive Summary

Bottles provide isolated, persistent shell environments where native package managers execute commands via RPC from Node.js. Each bottle represents a specific package management tool (pip, Maven, npm, Cargo, etc.) and maintains isolated caches for CI/CD performance. This architecture enables comprehensive validation of mcp-pkg-local's scanning capabilities without reimplementing complex package resolution logic.

## Core Principles

### 1. Native Tool Delegation
We don't reimplement package managers. Each bottle runs native commands (mvn, pip, npm) within its configured shell environment, letting tools handle their complex resolution logic.

### 2. Shell-Based RPC Architecture
Bottles are persistent shell processes with configured environments. Node.js sends commands via RPC and collects responses, never directly manipulating package files.

### 3. Storage Volume Management
Each bottle manages persistent cache volumes (`.m2/repository/`, `node_modules/`, `.venv/`) that survive between CI/CD runs, dramatically improving performance.

### 4. Language Agnostic Design
The bottle pattern works for any language. Python venvs, Maven's centralized repo, Go modules, Rust crates - all follow the same bottle lifecycle pattern.

## Revised Architecture

```
bottles/
├── manager/                      # Node.js bottle orchestration
│   ├── bottle-manager.ts         # Core lifecycle manager with RPC
│   ├── bottle-shell.ts           # Persistent shell process manager
│   ├── cache-manager.ts          # Volume and cache management
│   └── bottle-factory.ts         # Creates language-specific bottles
│
├── definitions/                  # Bottle specifications
│   ├── python/
│   │   ├── pip/
│   │   │   ├── bottle.yaml      # Environment configuration
│   │   │   └── requirements.txt
│   │   ├── poetry/
│   │   │   ├── bottle.yaml
│   │   │   └── pyproject.toml
│   │   └── uv/
│   │       ├── bottle.yaml
│   │       └── pyproject.toml
│   │
│   ├── java/
│   │   ├── maven/
│   │   │   ├── bottle.yaml
│   │   │   └── pom.xml
│   │   └── gradle/
│   │       ├── bottle.yaml
│   │       └── build.gradle
│   │
│   └── javascript/
│       ├── npm/
│       │   ├── bottle.yaml
│       │   └── package.json
│       └── pnpm/
│           ├── bottle.yaml
│           └── package.json
│
├── cache/                        # Persistent caches (git-ignored)
│   ├── maven/.m2/repository/    # Maven artifacts
│   ├── gradle/.gradle/caches/    # Gradle caches
│   ├── npm/.npm/                # npm cache
│   ├── python/.cache/pip/       # pip cache
│   └── metadata.json            # Cache tracking
│
└── environments/                 # Runtime environments (git-ignored)
    ├── python-pip/.venv/
    ├── java-maven/               # Uses centralized ~/.m2
    └── node-npm/node_modules/
```

## Bottle Configuration Schema

### Enhanced bottle.yaml Structure

```yaml
# bottle.yaml
name: java-maven
type: maven
version: 2.0.0
language: java

# Shell environment configuration
shell:
  type: bash  # or powershell, cmd
  env:
    JAVA_HOME: ${JAVA_HOME:-/usr/lib/jvm/java-17}
    MAVEN_OPTS: "-Xmx512m -Dmaven.repo.local=${BOTTLE_CACHE_ROOT}/maven/.m2/repository"
    PATH: "${PATH}:${MAVEN_HOME}/bin"

# Volume mounts for persistent storage
volumes:
  - name: maven-cache
    hostPath: "${BOTTLE_CACHE_ROOT}/maven/.m2/repository"
    bottlePath: "${HOME}/.m2/repository"
    persistent: true
    
  - name: project
    hostPath: "${PROJECT_DIR}"
    bottlePath: "/workspace"
    readOnly: false

# Package manager commands
commands:
  # Lifecycle commands
  install: "mvn clean install -DskipTests"
  update: "mvn dependency:go-offline -U"
  clean: "mvn clean"
  
  # Inspection commands
  listPackages: "mvn dependency:list -DoutputType=json"
  getTree: "mvn dependency:tree -DoutputType=json"
  resolve: "mvn dependency:resolve"
  
  # Analysis commands
  getClasspath: "mvn dependency:build-classpath"
  getSource: "mvn dependency:sources"

# Validation rules
validation:
  requiredPackages: ["org.springframework:spring-core", "junit:junit"]
  lockFiles: ["pom.xml"]
  cacheKey: "maven-${os}-${hash:pom.xml}"
```

## Shell-Based RPC Implementation

### Bottle Shell Manager

```typescript
interface BottleShell {
  private process: ChildProcess;
  private env: Record<string, string>;
  private cwd: string;
  
  async start(): Promise<void> {
    this.process = spawn(this.shellType, [], {
      env: this.buildEnvironment(),
      cwd: this.bottlePath,
      stdio: ['pipe', 'pipe', 'pipe']
    });
    
    // Setup RPC communication
    this.setupRPC();
  }
  
  async execute(command: string): Promise<CommandResult> {
    return this.sendCommand(command);
  }
  
  async stop(): Promise<void> {
    this.process.kill();
  }
}

interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}
```

### Language-Specific Bottle Implementations

```typescript
class PythonBottle extends BaseBottle {
  async initialize() {
    // Create virtual environment
    await this.execute('python -m venv .venv');
    
    // Activate and install packages
    const activate = process.platform === 'win32' 
      ? '.venv\\Scripts\\activate' 
      : 'source .venv/bin/activate';
    
    await this.execute(`${activate} && pip install -r requirements.txt`);
  }
  
  async listPackages(): Promise<Package[]> {
    const result = await this.execute('pip list --format=json');
    return JSON.parse(result.stdout);
  }
}

class JavaMavenBottle extends BaseBottle {
  async initialize() {
    // Maven uses centralized ~/.m2/repository
    // Just resolve dependencies
    await this.execute('mvn dependency:resolve');
  }
  
  async listPackages(): Promise<Package[]> {
    // Let Maven handle all the complexity
    const result = await this.execute('mvn dependency:list -DoutputType=json');
    return this.parseMavenOutput(result.stdout);
  }
  
  async getDependencyTree(): Promise<DependencyTree> {
    // Maven knows transitive dependencies
    const result = await this.execute('mvn dependency:tree -DoutputType=json');
    return this.parseMavenTree(result.stdout);
  }
}

class NodeBottle extends BaseBottle {
  async initialize() {
    // Use appropriate package manager
    switch(this.packageManager) {
      case 'npm':
        await this.execute('npm ci');
        break;
      case 'pnpm':
        await this.execute('pnpm install --frozen-lockfile');
        break;
      case 'yarn':
        await this.execute('yarn install --frozen-lockfile');
        break;
    }
  }
  
  async listPackages(): Promise<Package[]> {
    const result = await this.execute('npm ls --json --depth=0');
    return this.parseNpmOutput(result.stdout);
  }
}
```

## Cache Volume Management

### CI/CD Cache Strategy

```typescript
class CacheManager {
  private cacheRoot: string;
  
  constructor() {
    this.cacheRoot = process.env.BOTTLE_CACHE_ROOT || 
                    (process.env.CI ? '/tmp/bottle-cache' : 
                     path.join(os.homedir(), '.bottle-cache'));
  }
  
  async mountVolume(bottle: Bottle, volume: VolumeConfig): void {
    const hostPath = this.resolvePath(volume.hostPath);
    
    // Ensure cache directory exists
    await fs.mkdir(hostPath, { recursive: true });
    
    // Configure environment for package manager
    switch(bottle.language) {
      case 'java':
        bottle.env.MAVEN_OPTS = `-Dmaven.repo.local=${hostPath}`;
        break;
      case 'python':
        bottle.env.PIP_CACHE_DIR = hostPath;
        break;
      case 'javascript':
        bottle.env.NPM_CONFIG_CACHE = hostPath;
        break;
    }
  }
  
  getCacheKey(bottle: Bottle): string {
    const lockFiles = {
      'maven': ['pom.xml'],
      'gradle': ['build.gradle', 'gradle.lock'],
      'pip': ['requirements.txt'],
      'poetry': ['pyproject.toml', 'poetry.lock'],
      'npm': ['package.json', 'package-lock.json']
    };
    
    const files = lockFiles[bottle.type] || [];
    const hash = this.hashFiles(files);
    
    return `${bottle.type}-${process.platform}-${hash}`;
  }
}
```

### GitHub Actions Integration

```yaml
name: Bottle Tests
on: [push, pull_request]

env:
  BOTTLE_CACHE_ROOT: /tmp/bottle-cache

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      # Cache Maven dependencies
      - name: Cache Maven
        uses: actions/cache@v3
        with:
          path: /tmp/bottle-cache/maven/.m2/repository
          key: maven-${{ runner.os }}-${{ hashFiles('**/pom.xml') }}
          
      # Cache Python environments
      - name: Cache Python
        uses: actions/cache@v3
        with:
          path: |
            /tmp/bottle-cache/python/.cache/pip
            bottles/environments/python-*/.venv
          key: python-${{ runner.os }}-${{ hashFiles('**/requirements.txt', '**/pyproject.toml') }}
      
      - name: Test Bottles
        run: |
          npm run bottles:test
```

## Testing Strategy

### Integration Tests

```typescript
describe('Multi-Language Bottle Tests', () => {
  describe('Python Bottles', () => {
    test('pip and poetry produce consistent results', async () => {
      const pipBottle = await bottleManager.create('python-pip');
      const poetryBottle = await bottleManager.create('python-poetry');
      
      await pipBottle.initialize();
      await poetryBottle.initialize();
      
      const pipPackages = await pipBottle.listPackages();
      const poetryPackages = await poetryBottle.listPackages();
      
      // Core packages should be in both
      expect(pipPackages.find(p => p.name === 'fastapi')).toBeDefined();
      expect(poetryPackages.find(p => p.name === 'fastapi')).toBeDefined();
    });
  });
  
  describe('Java Bottles', () => {
    test('Maven resolves transitive dependencies', async () => {
      const mavenBottle = await bottleManager.create('java-maven');
      await mavenBottle.initialize();
      
      const tree = await mavenBottle.getDependencyTree();
      
      // Spring Boot brings in many transitive deps
      expect(tree.totalDependencies).toBeGreaterThan(50);
      expect(tree.find('org.springframework:spring-core')).toBeDefined();
    });
  });
  
  describe('Cross-Language Consistency', () => {
    test('All bottles respect cache configuration', async () => {
      const bottles = [
        await bottleManager.create('python-pip'),
        await bottleManager.create('java-maven'),
        await bottleManager.create('node-npm')
      ];
      
      for (const bottle of bottles) {
        const cacheDir = cacheManager.getCacheDir(bottle);
        expect(cacheDir).toContain('/tmp/bottle-cache');
      }
    });
  });
});
```

## Hybrid Execution Model

### Local Development vs CI/CD

```typescript
class BottleFactory {
  static create(config: BottleConfig): Bottle {
    // Docker for CI/CD consistency
    if (process.env.CI === 'true') {
      return new DockerBottle(config);
    }
    
    // Docker for complex environments (Java with specific JDK versions)
    if (config.requiresDocker) {
      return new DockerBottle(config);
    }
    
    // Native shell for local development speed
    return new ShellBottle(config);
  }
}

class DockerBottle extends BaseBottle {
  async start() {
    await exec(`docker run -d \
      -v ${this.cacheDir}:/cache \
      -v ${this.projectDir}:/workspace \
      --name ${this.name} \
      ${this.image}`);
  }
  
  async execute(cmd: string) {
    return await exec(`docker exec ${this.name} ${cmd}`);
  }
}
```

## Implementation Phases

### Phase 1: Core Shell RPC System
- [ ] Implement BottleShell with persistent process management
- [ ] Create RPC communication protocol
- [ ] Add environment variable configuration
- [ ] Build cache volume management

### Phase 2: Python Bottles (Replace Authly)
- [ ] Implement pip bottle with requirements.txt
- [ ] Add poetry bottle with pyproject.toml
- [ ] Add uv bottle for modern Python
- [ ] Migrate authly tests to bottle tests

### Phase 3: Java Support
- [ ] Implement Maven bottle with pom.xml
- [ ] Add Gradle bottle with build.gradle
- [ ] Handle centralized .m2/repository
- [ ] Test transitive dependency resolution

### Phase 4: JavaScript/Node.js
- [ ] Implement npm bottle
- [ ] Add pnpm and yarn support
- [ ] Handle node_modules complexity
- [ ] Test monorepo scenarios

### Phase 5: CI/CD Optimization
- [ ] Implement cache warming strategies
- [ ] Add parallel bottle initialization
- [ ] Create cache pruning utilities
- [ ] Add performance monitoring

## Key Architectural Changes from Original

### 1. Shell RPC Instead of Direct Execution
- **Old**: Node.js directly executes package manager commands
- **New**: Persistent shell processes with RPC communication
- **Benefit**: Maintains environment state, handles complex tools

### 2. Native Tool Delegation
- **Old**: Try to parse and understand package manager outputs
- **New**: Let native tools handle all complexity, we just orchestrate
- **Benefit**: No reimplementation of complex resolution logic

### 3. Volume-Based Cache Management
- **Old**: Simple file-based caching
- **New**: Explicit volume mounts with CI/CD integration
- **Benefit**: Dramatic performance improvement in CI/CD

### 4. Language-Agnostic Design
- **Old**: Python-focused with Node.js as afterthought
- **New**: Designed for any language from the start
- **Benefit**: Easy to add Go, Rust, Ruby, etc.

## Success Criteria

### Immediate (Python Parity)
- ✅ All Python package managers supported (pip, poetry, uv, pipenv)
- ✅ Authly test replaced with bottle tests
- ✅ CI/CD cache reduces build time by 10x

### Short-term (Multi-Language)
- ✅ Java/Maven support with transitive dependencies
- ✅ Node.js/npm with node_modules handling
- ✅ Consistent scanning across all languages

### Long-term (Ecosystem)
- ✅ 10+ package managers supported
- ✅ Community-contributed bottles
- ✅ Industry-standard testing approach
- ✅ Sub-second package scanning with cache

## Conclusion

The revised bottles architecture embraces the complexity of modern package management by delegating to native tools via shell RPC. This approach provides true language agnosticism, CI/CD performance optimization through volume management, and eliminates the naive attempt to reimplement package manager logic. The result is a robust, scalable testing framework that can validate mcp-pkg-local across any language or package management ecosystem.