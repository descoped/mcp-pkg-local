# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Permanent Rules (Never remove)

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

## Project Overview

**Name**: `@descoped/mcp-pkg-local` (v0.1.1)
**Purpose**: An MCP (Model Context Protocol) server that enables LLMs to read and understand locally installed package source code, helping reduce API hallucinations by providing direct access to actual installed packages.

### Project Status
- **Current Version**: v0.1.1 (published to npm)
- **Core Features**: Complete and working
- **Performance**: SQLite cache provides 40x faster validity checks
- **Language Support**: Full Node.js, basic Python (see gaps below)

## Development Commands

```bash
npm run dev       # Development mode with watch
npm run build     # Compile TypeScript to dist/
npm run test      # Run Vitest test suite (59 tests)
npm run lint      # ESLint code quality checks
npm run format    # Prettier auto-formatting
npm run typecheck # TypeScript type checking
npm run clean     # Remove all build artifacts and cache
npm run clean:cache # Remove cache files only
```

### Testing Notes
- Run tests sequentially to avoid SQLite locking: `npm test -- --pool=forks --poolOptions.forks.singleFork`
- All 59 tests pass in clean environment
- Integration tests cover both Python and Node.js environments

## Architecture

The project follows a modular MCP server architecture:

### Core Components
- **Entry Point**: `src/index.ts` - MCP server initialization
- **Core Server**: `src/server.ts` - MCP protocol implementation with stdio transport
- **Tools**: `src/tools/` - MCP tool implementations
  - `scan-packages.ts` - Package discovery and indexing
  - `read-package.ts` - Package file reading and navigation
- **Scanners**: `src/scanners/` - Language-specific implementations
  - `base.ts` - Abstract BaseScanner class
  - `python.ts` - PythonScanner for venv/.venv environments
  - `nodejs.ts` - NodeJSScanner for node_modules
- **Utils**: `src/utils/`
  - `cache.ts` - UnifiedCache with SQLite/JSON fallback
  - `sqlite-cache.ts` - High-performance SQLite caching
  - `package-scorer.ts` - Relevance scoring for packages
  - `scanner-factory.ts` - Auto-detection of project type
  - `file-utils.ts` - Safe file operations

### Cache Architecture (v0.1.1)
- **Primary**: SQLite database (`.pkg-local-cache/cache.db`) with WAL mode
- **Fallback**: Partitioned JSON cache in `.pkg-local-cache/` directory
- **Performance**: 40x faster validity checks, ~5ms cache hits
- **TTL**: 1-hour cache validity with automatic refresh

### MCP Tools

#### scan-packages
Indexes all packages in the environment with smart filtering:
```typescript
interface ScanPackagesParams {
  forceRefresh?: boolean;  // Force fresh scan
  filter?: string;         // Regex pattern filter
  category?: 'production' | 'development' | 'all';
  limit?: number;          // Max packages (default: 50)
  includeTypes?: boolean;  // Include @types packages
  group?: PackageGroup;    // Filter by group (testing, linting, etc.)
  summary?: boolean;       // Return summary only (99% token reduction)
}
```
- Auto-detects Python/Node.js projects
- Categorizes dependencies (production/development)
- Applies relevance scoring (direct deps scored higher)
- Returns metadata: version, location, category, language

#### read-package
Navigates and reads package source files:
```typescript
interface ReadPackageParams {
  packageName: string;     // Required package name
  filePath?: string;       // Optional file path within package
  includeTree?: boolean;   // Include full file tree
  maxDepth?: number;       // Tree traversal depth
  pattern?: string;        // Glob pattern for files
}
```
- Lazy loading mode for quick navigation
- Security: Path sanitization prevents traversal attacks
- File size limits: 10MB max, binary files blocked
- Returns tree view or specific file content

## Implementation Details

### TypeScript Configuration
- **Strict Mode**: All TypeScript checks enabled
- **Target**: ES2022+ with Node.js 20+ features
- **Module System**: ES modules with import maps (#utils, #tools, etc.)
- **Build**: esbuild for fast compilation, excludes CLAUDE.md and ai_docs

### Performance Optimizations (v0.1.1)
- **SQLite Cache**: 40x faster validity checks (0.03ms vs 1.2ms)
- **Token Reduction**: 90% reduction through smart filtering
- **Summary Mode**: 99% token reduction (20K → 200 tokens)
- **Lazy Loading**: ~10ms for package navigation
- **Response Times**: scan ~150ms, read ~10ms, cache hits ~5ms

### Known Gaps

#### Python Implementation (Critical)
- **Missing**: Dependency file parsing (requirements.txt, pyproject.toml, Pipfile)
- **Missing**: Package categorization (all packages show undefined category)
- **Missing**: Smart prioritization (no distinction between direct/transitive)
- **Impact**: Python users get random 50 packages instead of relevant ones
- **Reference**: `ai_docs/python-implementation-gaps.md`

#### Node.js Implementation (Complete)
- ✅ Full package.json parsing
- ✅ Production vs development categorization
- ✅ Smart prioritization of direct dependencies
- ✅ Support for all major package managers (npm, pnpm, yarn, bun)

## Testing & Quality

### Test Coverage
- **59 tests** covering unit, integration, and performance
- **Mock environments** for Python and Node.js testing
- **Performance benchmarks** validating optimization goals
- **CI/CD**: GitHub Actions with automated testing

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

## Important Context

### Design Principles
- **LLM-First**: Designed for AI consumption, not human reading
- **Minimal Output**: Let LLMs interpret source code directly
- **Accuracy Over Features**: Better to be correct than comprehensive
- **Performance Critical**: Direct MCP calls 12,000x faster than Task tool

### Best Practices
- **Always quote scoped packages**: Use `"@babel/core"` not `@babel/core`
- **Use summary mode** for quick environment overview
- **Direct MCP calls** for simple operations (avoid Task tool)
- **Lazy loading** for package navigation

### Compatibility
- **MCP Clients**: Claude Desktop, Claude Code, Gemini CLI, Cursor
- **Node.js**: Requires v20+ (ES modules)
- **Python**: Supports 3.9+ virtual environments
- **Package Managers**: pip, poetry, uv, pipenv, npm, pnpm, yarn, bun

### Future Priorities (ai_docs/TODO.md)
1. **Python Parity**: Fix missing dependency categorization
2. **Smart Prioritization**: Implement relevance scoring
3. **MCP SDK Guardrails**: Add safety and UX improvements
4. **Testing**: Complete unit test coverage
5. **Documentation**: Architecture diagrams and guides
