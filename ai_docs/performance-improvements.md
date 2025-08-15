# Performance Improvements for mcp-pkg-local

## Executive Summary

After dogfooding the mcp-pkg-local tool in production, we've identified critical performance issues that significantly impact LLM token consumption. The current implementation returns excessive data (15-20K tokens per scan), when most use cases need only 1-2K tokens. This document outlines actionable improvements to reduce token usage by 80% while maintaining functionality.

## Current Performance Issues

### 1. Excessive Data Volume
- **Problem**: `scan-packages` returns all 282 packages with full metadata
- **Impact**: 15-20K tokens per scan
- **Reality**: LLMs typically need <10 packages per session

### 2. No Filtering Capability
- **Problem**: Cannot filter packages by name, type, or category
- **Impact**: Must process entire package list to find specific packages
- **Example**: Finding "typescript" requires scanning all 282 packages

### 3. Verbose Path Information
- **Problem**: Full absolute paths repeated for every package
- **Impact**: ~100 characters per package unnecessarily
- **Example**: `/Users/oranheim/PycharmProjects/descoped/mcp-pkg-local/node_modules/typescript`

### 4. Unoptimized File Trees
- **Problem**: Returns complete file trees even for large packages
- **Impact**: 5-10K tokens for packages with many files
- **Example**: TypeScript package returns 100+ files

## Actionable Improvements

### Priority 1: Core Performance (v0.1.1)

#### 1.1 Add Filtering to scan-packages
```typescript
interface ScanPackagesParams {
  forceRefresh?: boolean;
  filter?: string;        // NEW: Regex pattern for package names
  limit?: number;         // NEW: Max packages to return (default: 50)
  summary?: boolean;      // NEW: Return only counts and categories
}
```

**Implementation**:
- Modify `src/tools/scan-packages.ts` to filter results before returning
- Default limit of 50 packages unless explicitly requested
- Add regex filtering on package names

**Token Savings**: 90% reduction for filtered queries

#### 1.2 Summary Mode
```typescript
// When summary: true
{
  success: true,
  summary: {
    total: 282,
    languages: { javascript: 282, python: 0 },
    categories: { production: 87, development: 195 }
  },
  environment: { /* existing */ }
  // No packages array
}
```

**Implementation**:
- Add summary calculation in scan-packages tool
- Return counts instead of full package list

**Token Savings**: 99% reduction for discovery queries

#### 1.3 Relative Path Mode
```typescript
// Instead of full paths
packages: {
  "typescript": {
    name: "typescript",
    version: "5.9.2",
    location: "typescript",  // Relative to node_modules
    language: "javascript"
  }
}
```

**Implementation**:
- Store relative paths in cache
- Reconstruct full path only when needed

**Token Savings**: 30% reduction in package metadata

#### 2.1 Category-Based Filtering
```typescript
interface ScanPackagesParams {
  category?: 'production' | 'development' | 'all';  // NEW
  includeTypes?: boolean;   // NEW: Include @types packages
  includeBuiltin?: boolean;  // NEW: Include Node.js builtins
}
```

**Implementation**:
- Parse package.json dependencies vs devDependencies
- Filter @types/* packages separately
- Identify common build/lint tools

#### 2.2 Smart Package Groups
```typescript
// Predefined groups
interface PackageGroups {
  testing: ['vitest', 'jest', 'mocha', '@testing-library/*'];
  building: ['webpack', 'vite', 'rollup', 'esbuild', 'tsup'];
  linting: ['eslint', 'prettier', 'stylelint', '*lint*'];
  typescript: ['typescript', '@types/*', 'tsx', 'ts-node'];
}

// Usage
scanPackagesTool({ group: 'testing' })
```

**Implementation**:
- Define common package groups
- Support group-based queries

**Token Savings**: 95% reduction for targeted queries

#### 2.3 Lazy File Tree Loading
```typescript
interface ReadPackageResult {
  type: 'tree';
  fileCount: number;        // NEW: Just the count
  mainFiles: string[];      // NEW: Only key files
  hasTree?: boolean;        // NEW: Tree available on request
  // fileTree only if explicitly requested
}
```

**Implementation**:
- Don't include full tree by default
- Add `includeTree: true` parameter to request full tree
- Return only main/index files by default

**Token Savings**: 80% reduction in read-package responses

#### 2.4 File Pattern Filtering
```typescript
interface ReadPackageParams {
  packageName: string;
  filePath?: string;
  pattern?: string;        // NEW: Glob pattern like "*.ts" or "src/**"
  maxDepth?: number;       // NEW: Limit tree depth
}
```

**Implementation**:
- Add minimatch for glob patterns
- Limit directory traversal depth
- Filter by file extensions

#### 2.5 Partitioned Cache
```
.pkg-local-cache/
├── summary.json          # Package counts and categories
├── production.json        # Production dependencies only
├── development.json       # Dev dependencies only
└── full-index.json       # Complete index (current format)
```

**Implementation**:
- Split cache into multiple files
- Load only needed partitions
- Update partitions independently

#### 2.6 Incremental Updates
- Detect package.json changes
- Update only affected packages
- Maintain cache validity timestamps

## Implementation Timeline

### v0.1.1 Release (All Performance Improvements)

#### Core Features (1-2 days)
- [ ] Add `limit` parameter to scan-packages (default 50)
- [ ] Add `filter` parameter for regex matching
- [ ] Implement summary mode
- [ ] Switch to relative paths

#### Enhanced Filtering (2-3 days)
- [ ] Implement category filtering (dev/prod)
- [ ] Add predefined package groups
- [ ] Create @types filtering

#### File Optimization (2-3 days)
- [ ] Implement lazy file tree loading
- [ ] Add glob pattern support
- [ ] Add maxDepth parameter

#### Cache Improvements (1-2 days)
- [ ] Implement partitioned cache structure
- [ ] Add incremental cache updates
- [ ] Maintain cache validity timestamps

#### Documentation & Testing (1 day)
- [ ] Update documentation for new parameters
- [ ] Add tests for performance features

## Expected Results

### Token Usage Comparison

| Operation | Current | Optimized | Reduction |
|-----------|---------|-----------|-----------|
| Full scan | 20,000 | 2,000 | 90% |
| Summary scan | N/A | 200 | 99% |
| Filtered scan | 20,000 | 500 | 97.5% |
| Read package with tree | 5,000 | 1,000 | 80% |
| Read package (no tree) | 5,000 | 300 | 94% |

### Performance Metrics

- **Response time**: 50% faster with filtered queries
- **Cache size**: 60% smaller with partitioning
- **Memory usage**: 70% reduction with lazy loading
- **LLM context**: 80% less context consumed

## Migration Strategy

### Backward Compatibility
- All new parameters are optional
- Default behavior unchanged without parameters
- Existing cache files remain valid

### Release Strategy
1. v0.1.1: All performance improvements in a single release
   - Filtering and summary features
   - Enhanced filtering and groups
   - File optimization
   - Cache partitioning
   - Fully backward compatible

## Success Metrics

- Token usage reduced by 80% in typical sessions
- 90% of queries need <2K tokens
- Response time <100ms for filtered queries
- Cache size <100KB for typical projects

## Conclusion

These improvements will transform mcp-pkg-local from a comprehensive but verbose tool into an efficient, LLM-optimized service. The key insight: **LLMs need selective, not comprehensive data**. By implementing smart filtering and progressive disclosure, we can maintain full functionality while drastically reducing token consumption.