# Tech Note: Bottle Storage Volumes and CI/CD Cache Management

**Status**: 🔬 TECHNICAL ANALYSIS  
**Date**: 2025-08-16  
**Topic**: Persistent storage volumes for bottles in CI/CD environments  
**Complexity**: High - Cross-platform, multi-language, CI/CD integration  

## Problem Statement

The bottle architecture requires persistent storage for package manager caches (Maven's `.m2/repository/`, npm's `node_modules/`, Python's `.venv/`) to avoid re-downloading dependencies on every CI/CD run. This creates several technical challenges:

1. **Cache Persistence**: How to persist storage between CI pipeline runs
2. **Volume Management**: How to mount/map storage locations across different environments
3. **Isolation**: How to prevent cache conflicts between different bottles
4. **Portability**: How to work across GitHub Actions, GitLab CI, Jenkins, local development
5. **Performance**: How to optimize cache usage for faster builds

## Technical Requirements

### Storage Requirements by Language

#### Java/Maven
- **Cache Location**: `~/.m2/repository/` (500MB-2GB typical)
- **Configuration**: `settings.xml`, `MAVEN_OPTS`
- **Scope**: Global to user, shared across projects
- **Key Files**: `pom.xml`, `pom.lock` (for cache invalidation)

#### Java/Gradle
- **Cache Location**: `~/.gradle/caches/`, `~/.gradle/wrapper/`
- **Size**: 1-3GB typical
- **Scope**: Global, with project-specific caches
- **Key Files**: `build.gradle`, `gradle.lock`, `gradle-wrapper.properties`

#### Python/pip
- **Cache Location**: `~/.cache/pip/` or project `.venv/`
- **Size**: 100MB-1GB per environment
- **Scope**: Can be global or project-local
- **Key Files**: `requirements.txt`, `requirements.lock`

#### Python/Poetry
- **Cache Location**: `~/.cache/pypoetry/`, project `.venv/`
- **Size**: Similar to pip
- **Scope**: Global cache + project virtual environment
- **Key Files**: `pyproject.toml`, `poetry.lock`

#### Node.js/npm
- **Cache Location**: `~/.npm/`, project `node_modules/`
- **Size**: 200MB-2GB per project
- **Scope**: Global cache + project modules
- **Key Files**: `package.json`, `package-lock.json`

## Architectural Approaches

### Approach 1: Shell-Based with Environment Variables

```typescript
interface ShellBottle {
  private shell: ChildProcess;
  private env: Record<string, string>;
  
  constructor(config: BottleConfig) {
    this.env = {
      ...process.env,
      // Maven configuration
      M2_HOME: config.cacheDir + '/.m2',
      MAVEN_OPTS: `-Dmaven.repo.local=${config.cacheDir}/.m2/repository`,
      
      // Python configuration  
      PIP_CACHE_DIR: config.cacheDir + '/.pip',
      POETRY_CACHE_DIR: config.cacheDir + '/.poetry',
      
      // Node configuration
      NPM_CONFIG_CACHE: config.cacheDir + '/.npm',
    };
  }
  
  async execute(cmd: string): Promise<string> {
    return execSync(cmd, { env: this.env });
  }
}
```

**Pros**:
- Simple implementation
- Fast execution
- Direct control over environment

**Cons**:
- Platform-specific path handling
- Harder to ensure true isolation
- May conflict with system packages

### Approach 2: Docker-Based with Volume Mounts

```typescript
interface DockerBottle {
  private containerName: string;
  private volumes: VolumeMount[];
  
  async start() {
    const volumeArgs = this.volumes.map(v => 
      `-v ${v.hostPath}:${v.containerPath}`
    ).join(' ');
    
    await exec(`docker run -d ${volumeArgs} --name ${this.containerName} ${this.image}`);
  }
  
  async execute(cmd: string): Promise<string> {
    return await exec(`docker exec ${this.containerName} ${cmd}`);
  }
}
```

**Pros**:
- True isolation
- Consistent across platforms
- No system conflicts

**Cons**:
- Requires Docker
- Slower startup
- Complex volume permission management

### Approach 3: Hybrid Approach

```typescript
class HybridBottle {
  static create(config: BottleConfig): Bottle {
    if (process.env.CI === 'true') {
      // Use Docker in CI for consistency
      return new DockerBottle(config);
    } else if (process.platform === 'win32') {
      // Use Docker on Windows for compatibility
      return new DockerBottle(config);
    } else {
      // Use native shell on Unix for speed
      return new ShellBottle(config);
    }
  }
}
```

**This seems optimal**: Docker where needed, native where possible.

## Volume Mount Strategy

### Directory Structure

```
project-root/
├── bottles/
│   ├── definitions/           # Bottle configurations
│   │   ├── java-maven/
│   │   ├── python-pip/
│   │   └── node-npm/
│   └── cache/                # Persistent caches (git-ignored)
│       ├── maven/
│       │   └── .m2/
│       │       └── repository/
│       ├── gradle/
│       │   └── .gradle/
│       ├── pip/
│       │   └── cache/
│       ├── poetry/
│       │   └── cache/
│       └── npm/
│           └── .npm/
```

### Volume Configuration Schema

```yaml
# bottle.yaml
name: java-maven
type: maven
version: 1.0.0

volumes:
  - name: maven-repo
    hostPath: "${BOTTLE_CACHE_ROOT}/maven/.m2/repository"
    containerPath: "/root/.m2/repository"
    persistent: true
    cacheKey: "maven-${hash:pom.xml}"
    
  - name: project
    hostPath: "${PROJECT_DIR}"
    containerPath: "/workspace"
    persistent: false
    readOnly: false

environment:
  JAVA_HOME: /usr/lib/jvm/java-17
  MAVEN_OPTS: "-Dmaven.repo.local=/root/.m2/repository -Xmx512m"
  
commands:
  install: "mvn clean install -DskipTests"
  listPackages: "mvn dependency:list -DoutputType=json"
  getClasspath: "mvn dependency:build-classpath"
```

## CI/CD Integration

### GitHub Actions

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
          restore-keys: |
            maven-${{ runner.os }}-
      
      # Cache Python environments
      - name: Cache Python
        uses: actions/cache@v3
        with:
          path: /tmp/bottle-cache/python
          key: python-${{ runner.os }}-${{ hashFiles('**/requirements.txt', '**/pyproject.toml') }}
      
      # Cache Node modules
      - name: Cache Node
        uses: actions/cache@v3
        with:
          path: /tmp/bottle-cache/npm
          key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
      
      - name: Run Bottle Tests
        run: |
          npm run bottles:test
```

### GitLab CI

```yaml
variables:
  BOTTLE_CACHE_ROOT: ${CI_PROJECT_DIR}/.bottle-cache

cache:
  key: ${CI_COMMIT_REF_SLUG}
  paths:
    - .bottle-cache/maven/
    - .bottle-cache/python/
    - .bottle-cache/npm/

test:
  script:
    - npm run bottles:test
```

### Jenkins

```groovy
pipeline {
  agent any
  
  environment {
    BOTTLE_CACHE_ROOT = "${WORKSPACE}/.bottle-cache"
  }
  
  options {
    // Use Jenkins workspace caching
    buildDiscarder(logRotator(artifactNumToKeepStr: '10'))
  }
  
  stages {
    stage('Test') {
      steps {
        sh 'npm run bottles:test'
      }
    }
  }
}
```

## Implementation Considerations

### 1. Cache Invalidation Strategy

```typescript
class CacheManager {
  /**
   * Determine if cache needs refresh based on lockfile changes
   */
  async needsRefresh(bottle: Bottle): Promise<boolean> {
    const lockFiles = {
      'maven': ['pom.xml', 'pom.lock'],
      'gradle': ['build.gradle', 'gradle.lock'],
      'pip': ['requirements.txt', 'requirements.lock'],
      'poetry': ['pyproject.toml', 'poetry.lock'],
      'npm': ['package.json', 'package-lock.json']
    };
    
    const files = lockFiles[bottle.type];
    const currentHash = await this.hashFiles(files);
    const cachedHash = await this.getCachedHash(bottle);
    
    return currentHash !== cachedHash;
  }
  
  /**
   * Smart cache update - only fetch changed dependencies
   */
  async updateCache(bottle: Bottle): Promise<void> {
    if (bottle.type === 'maven') {
      // Maven can update incrementally
      await bottle.execute('mvn dependency:go-offline -U');
    } else if (bottle.type === 'npm') {
      // npm ci is faster than npm install for clean installs
      await bottle.execute('npm ci');
    } else if (bottle.type === 'pip') {
      // pip can use --upgrade strategically
      await bottle.execute('pip install -r requirements.txt --upgrade-strategy eager');
    }
  }
}
```

### 2. Cross-Platform Path Resolution

```typescript
class PathResolver {
  static resolveCachePath(bottleType: string): string {
    const base = process.env.BOTTLE_CACHE_ROOT || 
                (process.env.CI ? '/tmp/bottle-cache' : 
                 process.platform === 'win32' ? 'C:\\bottle-cache' :
                 path.join(os.homedir(), '.bottle-cache'));
    
    return path.join(base, bottleType);
  }
  
  static resolveBottlePath(variable: string): string {
    return variable
      .replace('${BOTTLE_CACHE_ROOT}', this.resolveCachePath(''))
      .replace('${HOME}', os.homedir())
      .replace('${PROJECT_DIR}', process.cwd())
      .replace('${TEMP}', os.tmpdir());
  }
}
```

### 3. Permission Management

```typescript
class VolumePermissions {
  /**
   * Ensure cache directories have correct permissions
   */
  static async ensurePermissions(cachePath: string): Promise<void> {
    if (process.platform !== 'win32') {
      // Ensure user owns cache directory
      const uid = process.getuid();
      const gid = process.getgid();
      
      await fs.chown(cachePath, uid, gid);
      await fs.chmod(cachePath, 0o755);
    }
  }
  
  /**
   * Fix Docker volume permission issues
   */
  static async fixDockerPermissions(volume: VolumeMount): Promise<void> {
    if (volume.persistent && process.env.CI) {
      // CI often runs as different user than Docker container
      await exec(`docker exec ${containerName} chown -R $(id -u):$(id -g) ${volume.containerPath}`);
    }
  }
}
```

### 4. Storage Optimization

```typescript
class StorageOptimizer {
  /**
   * Clean up old/unused cache entries
   */
  async pruneCache(bottle: Bottle, maxAge: number = 30): Promise<void> {
    const cachePath = PathResolver.resolveCachePath(bottle.type);
    const now = Date.now();
    
    // Find and remove old artifacts
    const files = await this.walkDir(cachePath);
    for (const file of files) {
      const stats = await fs.stat(file);
      const ageInDays = (now - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (ageInDays > maxAge) {
        await fs.unlink(file);
      }
    }
  }
  
  /**
   * Report cache sizes for monitoring
   */
  async getCacheStats(): Promise<CacheStats> {
    const stats: CacheStats = {};
    
    for (const bottleType of ['maven', 'gradle', 'pip', 'npm']) {
      const cachePath = PathResolver.resolveCachePath(bottleType);
      stats[bottleType] = await this.getDirSize(cachePath);
    }
    
    return stats;
  }
}
```

## Performance Benchmarks

### Expected Cache Performance

| Operation | Without Cache | With Cache | Improvement |
|-----------|--------------|------------|-------------|
| Maven install (Spring Boot) | 3-5 min | 10-15 sec | 20x |
| npm ci (React app) | 1-2 min | 5-10 sec | 12x |
| pip install (Django) | 30-60 sec | 3-5 sec | 10x |
| Gradle build (Android) | 5-10 min | 30-45 sec | 10x |

### Storage Requirements

| Package Manager | Typical Cache Size | Max Recommended |
|-----------------|-------------------|-----------------|
| Maven | 500MB - 2GB | 5GB |
| Gradle | 1GB - 3GB | 10GB |
| npm | 200MB - 1GB | 3GB |
| pip | 100MB - 500MB | 2GB |
| Poetry | 200MB - 1GB | 3GB |

Total recommended cache allocation: ~25GB for comprehensive testing

## Security Considerations

### 1. Cache Poisoning Prevention

```typescript
class SecurityValidator {
  /**
   * Verify cache integrity
   */
  async validateCache(bottle: Bottle): Promise<boolean> {
    // Check for suspicious files
    const suspiciousPatterns = [
      /\.exe$/, /\.dll$/, /\.so$/, // Unexpected binaries
      /\.git\//, /\.ssh\//, // Sensitive directories
    ];
    
    const files = await this.walkCache(bottle);
    for (const file of files) {
      if (suspiciousPatterns.some(p => p.test(file))) {
        console.warn(`Suspicious file in cache: ${file}`);
        return false;
      }
    }
    
    return true;
  }
}
```

### 2. Isolation Enforcement

```typescript
class IsolationManager {
  /**
   * Ensure bottles can't access each other's caches
   */
  static validateIsolation(bottle: Bottle): void {
    const allowedPaths = [
      PathResolver.resolveCachePath(bottle.type),
      process.cwd(), // Project directory
    ];
    
    // Verify all volume mounts are within allowed paths
    for (const volume of bottle.config.volumes) {
      const resolvedPath = PathResolver.resolveBottlePath(volume.hostPath);
      
      if (!allowedPaths.some(p => resolvedPath.startsWith(p))) {
        throw new Error(`Volume mount outside allowed paths: ${resolvedPath}`);
      }
    }
  }
}
```

## Open Questions and Considerations

### 1. Cache Sharing Strategy
- **Question**: Should bottles share caches when using the same package manager?
- **Trade-off**: Storage efficiency vs isolation
- **Recommendation**: Share global caches (Maven, npm) but isolate project-specific (venv, node_modules)

### 2. Network Dependency
- **Question**: How to handle bottles in offline/air-gapped environments?
- **Options**: Pre-populated caches, local package mirrors, vendored dependencies
- **Recommendation**: Support offline mode with pre-populated caches

### 3. Container Runtime Alternatives
- **Question**: Should we support Podman, containerd, or other runtimes?
- **Trade-off**: Flexibility vs complexity
- **Recommendation**: Start with Docker, add abstraction layer for future runtimes

### 4. Cache Warmup Strategy
- **Question**: Should we pre-warm caches in CI base images?
- **Trade-off**: Faster builds vs stale dependencies
- **Recommendation**: Weekly base image rebuilds with common dependencies

### 5. Multi-Architecture Support
- **Question**: How to handle ARM64 vs x86_64 caches?
- **Consideration**: Binary packages differ between architectures
- **Recommendation**: Separate cache keys per architecture

## Recommendations

### For Initial Implementation

1. **Start with Shell-Based Approach**: Simpler, faster for development
2. **Use Environment Variables**: For cache path configuration
3. **Implement Basic Cache Key Strategy**: Based on lockfile hashes
4. **Support GitHub Actions First**: Most common CI platform
5. **Add Docker Support Later**: When isolation becomes critical

### For Production

1. **Use Hybrid Approach**: Docker in CI, native in development
2. **Implement Smart Cache Updates**: Incremental dependency updates
3. **Add Cache Monitoring**: Track sizes, hit rates, performance
4. **Support Multiple CI Platforms**: GitHub, GitLab, Jenkins
5. **Implement Security Scanning**: Validate cache contents

### For Scale

1. **Distributed Cache**: Consider S3, Artifactory for shared caches
2. **Cache Layers**: Global, project, branch-level caches
3. **Parallel Bottle Operations**: Initialize multiple bottles concurrently
4. **Cache Preloading**: Base images with common dependencies
5. **Metrics and Observability**: Cache performance dashboards

## Conclusion

The bottle storage volume architecture requires careful consideration of:

1. **Portability**: Must work across local dev, CI/CD, and different platforms
2. **Performance**: Caching is critical for acceptable build times
3. **Isolation**: Bottles shouldn't interfere with each other
4. **Simplicity**: Complex caching strategies increase maintenance burden
5. **Security**: Cached dependencies are an attack vector

The recommended approach is a hybrid model that uses native shells with environment-based cache configuration for development, and Docker with volume mounts for CI/CD environments. This provides the best balance of performance, isolation, and portability.

Key success factor: **Keep the cache strategy pluggable** so we can adapt as requirements evolve.