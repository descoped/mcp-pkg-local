# CLAUDE.md

Project memory and guidance for Claude Code working with the `@descoped/mcp-pkg-local` repository.

## Project Overview

**Name**: `@descoped/mcp-pkg-local` (v0.2.0)  
**Purpose**: MCP server enabling LLMs to read locally installed package source code, eliminating API hallucinations.

**Status**: 🚀 PRODUCTION READY - All CI stages passing (100% success rate), 300+ tests passing, Bottles architecture fully operational.

**Milestone Achievement** (2025-08-22): After 60+ hours of intensive development:
- ✅ All 14 CI stages passing with 3m59s total runtime
- ✅ Virtual environment activation properly implemented
- ✅ Dynamic tool detection replaces hardcoded paths  
- ✅ Clean, isolated bottle environments per package manager
- ✅ Cross-adapter compatibility (pip/uv interoperability)

**Agent Team**: Specialized agents handle different aspects (see `.claude/agents/`):
- `system-developer`: Implementation, bug fixes, feature development  
- `solution-architect`: System design, architectural decisions
- `scanner-engineer`: Package scanners for different languages
- `token-optimizer`: Large output optimization, AST parsing
- `test-architect`: Testing, mock environments, coverage (validates significant changes)
- `performance-analyst`: Performance bottlenecks, benchmarking
- `bottles-architect`: Self-contained test environments
- `requirements-analyst`: Requirements management, documentation lifecycle, project specifications
- `devops-engineer`: CI/CD, git operations (autonomous commits/pushes), build fixes

**Agent Interaction Matrix** (Quick Reference):

| From ↓ / To → | solution-architect | system-developer | test-architect | devops-engineer | Others |
|---------------|-------------------|------------------|----------------|-----------------|---------|
| **solution-architect** | - | Implement design | Ensure testability | Setup infrastructure | Specialized tasks |
| **system-developer** | Design clarification | - | Validate tests | Fix CI issues | Implementation help |
| **test-architect** | Testability concerns | Fix test failures | - | CI test environment | Test data needs |
| **devops-engineer** | CI architecture | Code fixes | Test in CI | - | Pipeline optimization |
| **scanner-engineer** | Scanner architecture | Integration help | Test coverage | CI integration | - |
| **performance-analyst** | Performance requirements | Optimization | Benchmarks | Pipeline metrics | Profile specific areas |


## Agent Collaboration Patterns

### Pattern 1: Top-Down Feature Development
```
User Request → solution-architect
    ├→ Design architecture
    ├→ system-developer: "Implement this design"
    │   ├→ test-architect: "Validate test coverage"
    │   └→ performance-analyst: "Check performance"
    └→ devops-engineer: "Set up CI/CD pipeline"
```

### Pattern 2: Bottom-Up Problem Solving
```
CI Failure → devops-engineer
    ├→ Diagnose issue
    ├→ test-architect: "Tests failing in CI but not locally"
    │   └→ system-developer: "Fix environment-specific code"
    └→ git commit & push fix
```

### Pattern 3: Cross-Functional Optimization
```
Performance Issue → performance-analyst
    ├→ Profile and identify bottleneck
    ├→ token-optimizer: "Output too large"
    │   └→ system-developer: "Implement AST extraction"
    └→ solution-architect: "Need architecture change"
```

### Pattern 4: Specialized Deep Dive
```
New Language Support → scanner-engineer
    ├→ Design scanner architecture
    ├→ bottles-architect: "Create test environment"
    ├→ system-developer: "Integrate with adapter pattern"
    └→ test-architect: "Comprehensive test suite"
```


**Balanced Workflow**: Significant changes coordinate with test-architect for validation. DevOps-engineer has autonomous git operations for rapid CI fixes.

## Product Description (Never remove)

**pkg-local MCP - Product Specification**

`pkg-local` is a minimalist Model Context Protocol (MCP) server that enables Large Language Models (LLMs) like Claude to understand and comply with locally installed package contracts. It acts as a "librarian" that helps LLMs discover and read actual source code from local development environments, ensuring generated code matches the exact versions and APIs available in the project.

### Vision
Enable LLMs to write code that is perfectly compliant with the actual packages installed in a developer's local environment, eliminating version mismatch errors and API hallucinations.

### Core Philosophy
- **Minimal complexity**: The MCP only locates and serves files; the LLM does the understanding
- **Source of truth**: Always read actual installed code, never rely on documentation or training data
- **Language agnostic**: Start with Python, but architecture supports future language plugins
- **Zero configuration**: Works out of the box with standard project structures

### Primary Goals
1. **Eliminate API hallucinations**: LLMs read actual source code instead of guessing APIs
2. **Version compliance**: Ensure generated code matches exact installed package versions
3. **Automatic context**: Smart detection of relevant packages based on coding context
4. **Developer efficiency**: No manual documentation lookups or version checking

### Success Metrics ✅ ACHIEVED
- LLM generates code that runs first time without import/API errors ✅
- Zero configuration required for standard Python and Node.js projects ✅
- Response time under 1 second for package scanning ✅ (~300ms for 85 packages)
- Works with all major MCP clients (Claude Desktop, Cursor, VS Code, etc.) ✅

## Permanent Rules (Never remove)

**git add is allowed**: for this project git add and commit is allowed
**WHEN using git commit**: don't add claude marketing at bottom of the commit message

**CRITICALLY IMPORTANT RULE - Bottles Subsystem**: The Bottles Subsystem is STABLE and COMPLETED. DO NOT refactor, redesign, or make architectural changes to the Bottles subsystem. The current implementation is production-ready and battle-tested. Only additions for supporting more package managers (poetry, pipenv, conda, etc.) should be made, following the existing adapter pattern. Any changes to Bottles should be limited to:
1. Bug fixes (if any are discovered)
2. Adding new package manager adapters following existing patterns
3. Minor performance optimizations that don't change architecture
4. Documentation updates
The Shell-RPC engine, Volume Controller, and adapter pattern are final and working perfectly.

**JetBrains MCP Tool Usage**: When explicitly asked to check for code issues or warnings:
- Code inspection: Use `mcp__jetbrains__get_file_problems` with filePath parameter for specific file inspection
- Current file inspection: Use `mcp__jetbrains__get_current_file_errors` for the file currently open in WebStorm
- File search: Can use `mcp__jetbrains__search_in_files_*` when needed (faster than grep/ripgrep)
- Symbol info: Can use `mcp__jetbrains__get_symbol_info` for code understanding
- Refactoring: Can use `mcp__jetbrains__rename_refactoring` for safe renaming
- **IMPORTANT**: Only use these tools when explicitly requested, not automatically
- See `.claude/jetbrains-mcp-tool-instructions.md` for comprehensive usage

**AI Documentation Migration Rule**: When migrating documents from `ai_docs/` to `.claude/history/`:
0. FIRST validate status in all documents and mark completed tasks as COMPLETED
1. ALWAYS use UTC datetime format for filenames: `YYYYMMDD_HHMMSS_original-filename.md`
2. ONLY migrate documents where ALL tasks are COMPLETED
3. For `TODO.md`: Extract ONLY completed tasks to history, keep non-completed tasks in `ai_docs/TODO.md`
4. NEVER migrate documents with pending/incomplete work
5. ALWAYS verify task completion status before migration

**Package Manager Architecture**: Python package managers are not limited to `pip`. Modern Python uses various package managers:
- **pip**: Traditional, uses `requirements.txt`
- **poetry**: Modern, uses `pyproject.toml`
- **uv**: Superior Rust-implemented Python package manager, full replacement for pip/poetry/pipenv, uses `pyproject.toml`
- **pipenv**: Uses `Pipfile`/`Pipfile.lock`
- **conda**: Uses `environment.yml`

All these package managers install packages into the same virtual environment structure (`.venv/lib/python*/site-packages/` or `venv/lib/python*/site-packages/`). The scanner should focus on scanning the virtual environment directories directly, which works regardless of the package manager used. This same principle applies to Node.js package managers (npm, pnpm, yarn, bun) that all populate `node_modules/`.

**Coding Rules & Practices**: Strict adherence to these coding standards:
1. **No Coding Without Confirmation**: Do not start working on coding or execute any task without explicit confirmation
2. **Strong Typing**: Never use `any` type, explicit return types required
3. **No Inventions**: Track current implementation state, adapt to existing codebase
4. **Respect Configuration**: Follow `package.json` imports and `tsconfig.json` strict settings
5. **Code Hygiene**: Lint with ESLint, no unused vars/params, handle all Promise rejections
6. **Module System**: Use ES modules with `.js` extensions in imports
7. **Path Aliases**: Use `#` imports as defined in package.json. Run `npm run update-paths` manually when adding new files

## Development Commands

```bash
npm run dev         # Development mode with watch
npm run build       # Compile TypeScript to dist/
npm run test        # Run Vitest test suite
npm run lint        # ESLint code quality checks
npm run format      # Prettier auto-formatting
npm run typecheck   # TypeScript type checking
npm run update-paths # Manually generate TypeScript path mappings when adding new files
npm run clean       # Remove all build artifacts and cache
npm run clean:cache # Remove cache files only
```

### TSConfig Path Management
- **Script**: `scripts/generate-tsconfig-paths.ts` maintains TypeScript path mappings
- **When to Run**: Manually run `npm run update-paths` when adding new TypeScript files
- **Coverage**: Scans `src/` directory, generates 55+ `#` import paths
- **Note**: No longer runs automatically before build/test to improve performance

### Testing Notes
- Run tests sequentially to avoid SQLite locking: `npm test -- --pool=forks --poolOptions.forks.singleFork`
- All tests pass in clean environment
- Integration tests cover both Python and Node.js environments

### Bottle Integration Test Organization
Fine-grained test structure for multiple package managers:

**Test Categories:**
- `npm run test:bottles:integration:common` - Cross-package-manager compatibility and shared functionality
- `npm run test:bottles:integration:pip` - Pip-specific integration tests
- `npm run test:bottles:integration:uv` - UV-specific integration tests

**CI Pipeline Stages (File-Targeted):**
- `integration-setup-tests` - Fast baseline validation (stage5: integration-setup.test.ts)
- `ci-environment-tests` - Environment-specific validation (stage6: ci-environment.test.ts)
- `pip-integration-tests` - Pip package manager tests (stage7: pip-bottle.test.ts)
- `uv-integration-tests` - UV package manager tests (stage8: uv-bottle.test.ts) 
- `cross-adapter-tests` - Interoperability tests (stage9: cross-adapter-compatibility.test.ts)
- `volume-cache-tests` - Cache validation (stage10: volume-controller-cache.test.ts)

**Directory Structure:**
```
tests/bottles/integration/
├── common/           # Cross-manager tests, CI environment validation
├── pip/             # Pip-specific package manager tests
└── uv/              # UV-specific package manager tests
```

**CI Test Targeting (Try Fast, Fail Fast):**

**Local Commands:**
```bash
# Target specific file
npm run test:ci:run tests/bottles/integration/pip/pip-bottle.test.ts

# Target specific test function  
npm run test:ci:run-pattern "should install packages using uv add" tests/bottles/integration/uv/uv-bottle.test.ts

# Target test suite
npm run test:ci:run-pattern "Basic Package Installation" tests/bottles/integration/pip/pip-bottle.test.ts
```

**GitHub Workflow Dispatch:**

**ci.yml** (File-Targeted Pipeline):
- test_filter: Applies pattern to ALL 6 bottle integration stages
- Example: `test_filter="Virtual Environment"` runs only those tests across all stages

**test-selective.yml** (Category-Based Testing):
- test_type: Choose category (unit, integration, bottles, bottles-integration, etc.)
- test_filter: Optional pattern within selected category
- skip_build: Skip build step for faster iteration
- Example: `test_type="bottles-integration"` + `test_filter="Virtual Environment"`

**Future Package Managers:**
- Poetry: `tests/bottles/integration/poetry/` + `test:ci:stage12`
- Pyenv: `tests/bottles/integration/pyenv/` + `test:ci:stage13`

## Architecture

**Modular MCP server**: Entry point (`src/index.ts`) → Server (`src/server.ts`) → Tools (scan/read) → Scanners (language-specific) → Adapters (content processing) → Parsers (AST analysis).

**Cache**: SQLite primary, JSON fallback, 40x performance improvement, 1-hour TTL.

### MCP Tools (Simplified Interface v0.2.0)

#### scan-packages
```typescript
interface ScanPackagesParams {
  scope?: 'all' | 'project';  // 'all' = summary mode, 'project' = detailed
  forceRefresh?: boolean;      // Force fresh scan
}
```
- Smart defaults: 'all' scope auto-enables summary mode (99% token reduction)
- Auto-detects Python/Node.js projects, categorizes dependencies
- Returns metadata: version, location, category, language

#### read-package  
```typescript
interface ReadPackageParams {
  packageName: string;  // Only required parameter
}
```
- Returns comprehensive package info with file tree and unified content
- AST extraction for large TypeScript/JavaScript files (99.7% token reduction)
- Lazy loading, security controls, backward compatibility with deprecation warnings

## Implementation Details

### TypeScript Configuration
- **Strict Mode**: All TypeScript checks enabled
- **Target**: ES2022+ with Node.js 20+ features
- **Module System**: ES modules with import maps (#utils, #tools, etc.)
- **Auto-Generated Paths**: TypeScript path mappings automatically generated from file structure via `scripts/generate-tsconfig-paths.ts`
- **Build**: esbuild for fast compilation, excludes CLAUDE.md and ai_docs

### Performance Optimizations (v0.2.0)
- **SQLite Cache**: 40x faster validity checks (0.03ms vs 1.2ms)
- **Parameter Simplification**: 77% reduction (13 → 3 parameters total)
- **Token Optimization**: 99.7% reduction on large files through AST extraction
- **Summary Mode**: 99% token reduction (20K → 200 tokens)
- **Response Times**: scan ~150ms, read ~10ms, cache hits ~5ms

### Bottles Architecture (STABLE & COMPLETED) ✅

#### Shell-RPC Engine (BRPC-001) ✅
- Persistent shell process management for native package manager operations
- Cross-platform support (Windows PowerShell, Linux bash, macOS bash)
- Command queueing with dynamic timeout handling
- Virtual environment activation support
- Node-pty preference with child_process fallback

#### Volume Controller (BVOL-001) ✅
- Cache management for 12 package managers (npm, pip, poetry, maven, etc.)
- Cross-platform cache path detection and mounting
- Environment variable injection for Shell-RPC integration
- 10x CI/CD performance improvement through cache persistence
- Proper error handling with actionable error messages

#### Dynamic Environment Detection ✅
- Runtime tool detection replaces hardcoded paths
- Minimal PATH creation with only required tools
- Package manager specific environments (pip/uv/npm)
- Cross-platform compatibility without OS-specific code
- Clean, isolated environments preventing system pollution

### Language Support

#### Node.js Implementation
- ✅ Full package.json parsing and metadata extraction
- ✅ AST-based content extraction with ts-morph
- ✅ Support for all major package managers (npm, pnpm, yarn, bun)
- ✅ TypeScript type detection and exports analysis

#### Python Implementation
- ✅ Virtual environment detection (.venv, venv, conda)
- ✅ Package discovery via dist-info metadata
- ✅ Basic content extraction and module structure
- 🚧 Future: Python AST parsing for deeper analysis (not critical)

## Testing & Quality

### Test Coverage
- **300+ tests passing across all categories** - Complete test suite with 100% CI success rate
- **14 CI stages** including unit, integration, performance, and bottle tests
- **Parallel test execution** optimized for 3m59s total runtime (from ~6min)
- **Mock environments** for Python and Node.js testing
- **Performance benchmarks** validating optimization goals (99.7% token reduction achieved)
- **CI/CD**: GitHub Actions with automated testing and parallel execution

### Code Quality
- **ESLint**: Strict TypeScript rules, no any types
- **Prettier**: Consistent formatting
- **TypeScript**: Strict mode, no implicit any
- **Build verification**: Ensures CLAUDE.md excluded from dist

### Error Handling
- **Custom error classes** with actionable suggestions
- **MCP error codes** for proper client integration
- **Graceful fallbacks** for cache and scanner failures
- **Security**: Path sanitization, file size limits

## Key Context & Usage

**Design Principles**: LLM-first, minimal output, accuracy over features, performance critical.

**Best Practices**: 
- Always quote scoped packages: `"@babel/core"` not `@babel/core`
- Use scope 'all' for quick overviews (auto-summary mode)
- Direct MCP calls preferred over Task tool for simple operations

**Compatibility**: Claude Desktop, Claude Code, Cursor; Node.js 20+, Python 3.9+; All major package managers.

**Future Priorities** (see `ai_docs/TODO.md`): Additional package manager support (poetry, pipenv, conda), Python AST parsing, performance monitoring. NOTE: Bottles architecture is complete - only new adapters will be added.
