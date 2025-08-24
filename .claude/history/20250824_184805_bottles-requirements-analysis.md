# Bottles Architecture - Comprehensive Requirements Analysis

**Status**: 📋 REQUIREMENTS SPECIFICATION  
**Date**: 2025-08-19  
**Purpose**: Complete requirements analysis for bottles architecture implementation  
**Priority**: Critical for Python packaging tools and test robustness  

## Executive Summary

The bottles architecture is essential for creating robust, isolated test environments that validate mcp-pkg-local across diverse package management ecosystems. Current limitations with mock tests and external dependencies (authly) create testing gaps that bottles will address through persistent shell-based RPC environments.

**Key Findings**:
- Current Python testing relies on fragile mock environments or skipped external tests
- Bottles architecture is well-specified but unimplemented 
- Shell-RPC approach provides native tool delegation without TypeScript reimplementation
- Priority focus should be Python bottles to replace authly dependency

## Current State Assessment

### 1. Testing Infrastructure Analysis

#### Current Test Status (70 tests, 67 passing, 5 skipped)
```bash
✓ 67 passing tests across unit, integration, and performance
↓ 5 skipped tests in authly.test.ts (external Python environment)
✓ Python mock tests working but limited in scope
✓ Node.js integration tests comprehensive and robust
```

#### Python Testing Gaps Identified

**Mock Environment Limitations**:
- **Limited Package Scope**: Mock tests cover only 4 packages vs real-world hundreds
- **Artificial Dependencies**: Mock packages lack realistic dependency trees
- **No Package Manager Validation**: Cannot test pip, poetry, uv, pipenv behavior
- **Missing Edge Cases**: No testing of corrupted packages, permission issues, version conflicts

**External Dependency Issues**:
- **Authly Tests Skipped**: `TEST_AUTHLY=1` required to run, always skipped in CI
- **Environment Fragility**: Requires external project with specific Python version
- **No CI Integration**: Cannot validate Python functionality in automated testing
- **Development Friction**: Local developers cannot run full test suite

### 2. Python Implementation Parity Gap

**Critical Finding**: Python scanner significantly behind Node.js capabilities

**Missing Features in Python**:
- ❌ **Dependency Categorization**: No production/development/test classification
- ❌ **Smart Prioritization**: Cannot filter to project-specific packages  
- ❌ **Package Manager Detection**: Basic detection, no advanced features
- ❌ **AST Parsing**: No Python AST extraction for large files
- ❌ **Token Optimization**: Limited optimization vs 99.7% reduction in Node.js

**Node.js vs Python Comparison**:
```typescript
// Node.js: Rich categorization
categories: { production: 15, development: 120, testing: 45 }

// Python: Basic detection only
categories: { production: 4 } // Everything marked as production
```

### 3. Current Architecture Strengths

**Solid Foundation**:
- ✅ **Cache System**: SQLite cache provides 40x performance improvement
- ✅ **Scanner Factory**: Extensible pattern ready for bottles integration  
- ✅ **Error Handling**: Comprehensive with actionable suggestions
- ✅ **Security**: Path sanitization and file size limits

## Bottles Architecture Requirements

### 1. Functional Requirements

#### Core Capabilities
- **FR-001**: Create isolated environments for each Python package manager (pip, poetry, uv, pipenv, conda)
- **FR-002**: Execute native package manager commands via persistent shell RPC
- **FR-003**: Maintain package cache persistence across test runs and CI/CD
- **FR-004**: Support parallel bottle execution for performance testing
- **FR-005**: Provide deterministic package sets for reproducible testing

#### Language Support Requirements
- **FR-006**: Python bottles must support Python 3.9-3.12
- **FR-007**: Handle different virtual environment types (.venv, venv, conda, virtualenv)
- **FR-008**: Support all major Python package managers with their native command sets
- **FR-009**: Test binary vs source package installations
- **FR-010**: Handle platform-specific packages (Linux, macOS, Windows)

#### Integration Requirements  
- **FR-011**: Replace authly external dependency with pip bottle
- **FR-012**: Integrate with existing cache system (SQLite primary, JSON fallback)
- **FR-013**: Support CI/CD environments (GitHub Actions, GitLab CI, Jenkins)
- **FR-014**: Provide same API as existing scanner tests for seamless migration

### 2. Non-Functional Requirements

#### Performance Requirements
- **NFR-001**: Bottle initialization must complete in < 30 seconds
- **NFR-002**: Cache persistence should reduce CI build time by 10x
- **NFR-003**: Support concurrent access to shared cache volumes safely
- **NFR-004**: Memory usage per bottle limited to 512MB baseline

#### Reliability Requirements
- **NFR-005**: Bottles must provide isolated environments with no cross-contamination
- **NFR-006**: Handle package manager failures gracefully with clear error messages
- **NFR-007**: Support cleanup and teardown of bottle environments
- **NFR-008**: Recover from corrupted cache states automatically

#### Scalability Requirements
- **NFR-009**: Support 10+ concurrent bottles for comprehensive testing
- **NFR-010**: Cache volume management under 5GB per bottle type
- **NFR-011**: Cross-platform compatibility (Linux, macOS, Windows)
- **NFR-012**: Horizontal scaling for CI/CD environments

### 3. Architecture Requirements

#### Shell-RPC System
- **AR-001**: Persistent shell processes with bidirectional communication
- **AR-002**: Environment variable configuration per bottle type
- **AR-003**: Command timeout and failure handling mechanisms
- **AR-004**: Native tool delegation (never reimplement package manager logic)

#### Volume Management
- **AR-005**: Configurable cache mount points for different package managers
- **AR-006**: CI/CD cache key generation based on lock files
- **AR-007**: Cleanup utilities for cache maintenance and pruning
- **AR-008**: Cross-platform volume mounting (Unix sockets, Windows pipes)

#### Bottle Configuration
- **AR-009**: YAML-based bottle specifications with schema validation
- **AR-010**: Template system for creating new bottle types
- **AR-011**: Environment-specific configuration (local dev vs CI)
- **AR-012**: Version pinning for reproducible test environments

## Conceptual Architecture

### 1. Bottle Components

```typescript
interface Bottle {
  // Identification
  name: string;           // "python-pip", "python-poetry"
  type: string;           // "pip", "poetry", "maven"  
  language: string;       // "python", "java", "javascript"
  version: string;        // Bottle specification version
  
  // Runtime
  shell: ShellRPC;        // Persistent shell process
  environment: EnvConfig; // Environment variables
  volumes: VolumeMount[]; // Cache and project mounts
  
  // Lifecycle
  initialize(): Promise<void>;
  execute(cmd: string): Promise<CommandResult>;
  cleanup(): Promise<void>;
}
```

### 2. Shell-RPC Pattern

**Core Principle**: Native tool delegation through persistent shell processes

```bash
# Inside Python pip bottle shell environment
$ source .venv/bin/activate
$ pip install -r requirements.txt  # Native pip handles complexity
$ pip list --format=json          # Native pip provides output
$ pip show package-name            # Native pip resolves dependencies
```

**Benefits**:
- No TypeScript reimplementation of package manager logic
- Handles all edge cases and platform differences natively
- Maintains environment state across commands
- Supports any command-line package manager

### 3. Volume Management Strategy

```yaml
# Example: Python pip bottle configuration
volumes:
  - name: pip-cache
    hostPath: "${BOTTLE_CACHE_ROOT}/python/.cache/pip"
    bottlePath: "${HOME}/.cache/pip"
    persistent: true
    
  - name: venv
    hostPath: "${BOTTLE_ENV_ROOT}/python-pip/.venv"
    bottlePath: "/workspace/.venv" 
    persistent: true
    
  - name: project
    hostPath: "${PROJECT_DIR}"
    bottlePath: "/workspace"
    readOnly: false
```

## Gap Analysis

### 1. Current Testing Gaps

| Gap Area | Current State | Bottles Solution |
|----------|---------------|------------------|
| **Python Package Managers** | Only pip via mock | Native pip, poetry, uv, pipenv bottles |
| **Dependency Resolution** | Artificial mock deps | Real package manager resolution |
| **Version Conflicts** | Cannot test | Native conflict resolution testing |
| **Cache Behavior** | No cache testing | Full cache persistence validation |
| **Platform Differences** | Single platform mock | Multi-platform bottle support |
| **CI Integration** | Skipped authly tests | Full CI integration with cache |

### 2. Implementation Capabilities

**Can Reuse from Existing Architecture**:
- ✅ Scanner factory pattern for bottle integration
- ✅ Cache system (SQLite/JSON) for bottle metadata
- ✅ Error handling and logging infrastructure  
- ✅ Path sanitization and security measures
- ✅ Test framework structure and patterns

**Need New Implementation**:
- ❌ Shell-RPC persistent process management
- ❌ Volume mounting and cache persistence
- ❌ Bottle configuration system (YAML parsing)
- ❌ CI/CD cache integration patterns
- ❌ Multi-bottle orchestration and cleanup

### 3. Risk Assessment

#### High Risk Areas
- **Shell Process Management**: Complex cross-platform shell handling
- **Cache Corruption**: Shared cache access in concurrent environments
- **CI/CD Integration**: Platform-specific cache mount configurations
- **Resource Management**: Memory and disk usage in container environments

#### Mitigation Strategies
- **Incremental Implementation**: Start with single Python pip bottle
- **Fallback Mechanisms**: Graceful degradation to mock tests if bottles fail
- **Comprehensive Testing**: Bottles must be tested as thoroughly as the code they test
- **Documentation**: Clear bottle creation and debugging guides

## Implementation Roadmap

### Phase 1: Core Infrastructure (Priority: Critical)
**Timeline**: 1-2 weeks  
**Dependencies**: None

```bash
# Deliverables
├── bottles/manager/bottle-shell.ts     # Shell RPC implementation
├── bottles/manager/cache-manager.ts    # Volume management  
├── bottles/manager/bottle-factory.ts   # Bottle creation
└── bottles/definitions/python/pip/    # First bottle definition
```

**Acceptance Criteria**:
- [ ] Single pip bottle can initialize Python environment
- [ ] Execute pip commands via shell RPC successfully
- [ ] Cache persistence works across bottle restarts
- [ ] Integration with existing test framework

### Phase 2: Python Bottles (Priority: High)
**Timeline**: 1-2 weeks  
**Dependencies**: Phase 1 complete

```bash
# Deliverables  
├── bottles/definitions/python/poetry/  # Poetry bottle
├── bottles/definitions/python/uv/      # UV bottle  
├── bottles/definitions/python/pipenv/  # Pipenv bottle
└── tests/bottles/python-bottles.test.ts # Comprehensive tests
```

**Acceptance Criteria**:
- [ ] All Python package managers supported via bottles
- [ ] Authly tests migrated to bottle equivalents
- [ ] Test coverage matches or exceeds current mock tests
- [ ] CI/CD integration working with cache persistence

### Phase 3: Python Feature Parity (Priority: High)
**Timeline**: 1-2 weeks  
**Dependencies**: Phase 2 complete

**Target**: Achieve Node.js feature parity for Python

```bash
# Deliverables
├── src/scanners/python.ts              # Enhanced with categorization
├── src/adapters/python-categorizer.ts  # Dependency classification
├── src/parsers/python-ast-extractor.ts # Python AST parsing
└── tests/integration/python-parity.test.ts # Parity validation
```

**Acceptance Criteria**:
- [ ] Python dependency categorization (production/development/test)
- [ ] Smart prioritization and filtering for Python projects
- [ ] Python AST extraction for large files (token optimization)
- [ ] Performance parity: Python scanning < 500ms for 50-100 packages

### Phase 4: Multi-Language Expansion (Priority: Medium)
**Timeline**: 2-3 weeks  
**Dependencies**: Phase 3 complete

**Target**: Prove bottle pattern works for other languages

```bash
# Deliverables (Future Priority)
├── bottles/definitions/java/maven/     # Maven bottle
├── bottles/definitions/java/gradle/    # Gradle bottle
├── bottles/definitions/javascript/npm/ # Additional JS bottles
└── bottles/definitions/rust/cargo/     # Rust bottle (future)
```

### Phase 5: Advanced Features (Priority: Low)
**Timeline**: Ongoing  
**Dependencies**: Phases 1-3 complete

- [ ] Performance monitoring and benchmarking
- [ ] Docker-based bottles for CI consistency
- [ ] Community bottle contribution system
- [ ] Bottle debugging and troubleshooting tools

## Success Criteria & Metrics

### Immediate Success (Python Parity)
- [ ] ✅ All Python package managers tested via bottles (pip, poetry, uv, pipenv)
- [ ] ✅ Zero skipped tests in CI/CD (authly replacement complete)
- [ ] ✅ CI build time reduced by 10x through cache persistence
- [ ] ✅ Python feature parity with Node.js (categorization, prioritization, AST)

### Short-term Success (Robust Testing)
- [ ] ✅ 100+ Python packages tested in realistic environments  
- [ ] ✅ Dependency conflicts and edge cases covered
- [ ] ✅ Cross-platform testing (Linux, macOS, Windows)
- [ ] ✅ Performance targets met: initialization < 30s, scanning < 500ms

### Long-term Success (Ecosystem Growth)
- [ ] ✅ 5+ programming languages supported via bottles
- [ ] ✅ Community contributions to bottle definitions
- [ ] ✅ Industry adoption as standard MCP testing approach
- [ ] ✅ Zero package manager logic implemented in TypeScript

## Recommendations

### 1. Implementation Strategy: Incremental Approach

**Immediate Priority**: Start with single Python pip bottle
- Proves shell-RPC concept works  
- Provides immediate value replacing authly tests
- Lower risk than full multi-bottle implementation
- Quick win to build confidence in approach

**Validation Approach**: 
- Implement pip bottle and replace authly tests first
- Validate cache persistence and CI integration  
- Prove performance benefits before expanding
- Use learnings to refine other bottle implementations

### 2. Architecture Decision: Shell-RPC Over Direct Implementation

**Recommended**: Continue with shell-RPC approach
- **Benefit**: Native tool delegation avoids reimplementation complexity
- **Risk**: Shell process management complexity
- **Mitigation**: Start simple, add features incrementally
- **Alternative**: Direct TypeScript implementation rejected due to complexity

### 3. Resource Allocation: Focus on Python First

**Recommended Priority Order**:
1. **Python bottles** (Replaces critical authly dependency)
2. **Python feature parity** (Addresses documented gaps)  
3. **Multi-language expansion** (Proves pattern scalability)
4. **Advanced features** (Performance monitoring, Docker integration)

**Rationale**: 
- Python gaps are well-documented and critical
- Node.js implementation proves the scanner patterns work
- Bottles provide the missing test infrastructure for validation

### 4. Risk Management: Fallback Strategy

**Recommended**: Maintain dual testing approach during transition
- Keep existing mock tests as fallback
- Gradually migrate tests to bottles as they prove stable
- Provide clear debugging tools for bottle failures  
- Document rollback procedures for CI/CD issues

## Conclusion

The bottles architecture addresses critical testing gaps in mcp-pkg-local, particularly for Python package manager validation. The well-specified shell-RPC approach provides native tool delegation without TypeScript reimplementation complexity.

**Key Implementation Insights**:
- **Start Small**: Single pip bottle provides immediate value
- **Native Tools**: Let package managers handle their own complexity  
- **Cache Performance**: 10x CI speedup justifies implementation effort
- **Python Priority**: Address documented parity gaps first

**Success Probability**: High - architecture is well-designed, requirements are clear, and the incremental approach manages risk while delivering value quickly.

The bottles implementation will transform mcp-pkg-local from a Node.js-centric tool with Python limitations into a truly language-agnostic package scanner with robust, comprehensive testing across all supported ecosystems.