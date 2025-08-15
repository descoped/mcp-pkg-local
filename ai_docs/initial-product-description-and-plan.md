# pkg-local MCP - Product Specification Document

**Repository**: https://github.com/descoped/mcp-pkg-local  
**License**: MIT License  
**Description**: An MCP tool that scans and indexes local dependency source code, collaborating with an LLM MCP Host to fully understand source code contracts

## Executive Summary

`pkg-local` is a minimalist Model Context Protocol (MCP) server that enables Large Language Models (LLMs) like Claude to understand and comply with locally installed package contracts. It acts as a "librarian" that helps LLMs discover and read actual source code from local development environments, ensuring generated code matches the exact versions and APIs available in the project.

## Product Definition

### Vision
Enable LLMs to write code that is perfectly compliant with the actual packages installed in a developer's local environment, eliminating version mismatch errors and API hallucinations.

### Core Philosophy
- **Minimal complexity**: The MCP only locates and serves files; the LLM does the understanding
- **Source of truth**: Always read actual installed code, never rely on documentation or training data
- **Language agnostic**: Start with Python, but architecture supports future language plugins
- **Zero configuration**: Works out of the box with standard project structures

## Goals and Objectives

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

## Scope

### In Scope (v1.0) ✅ COMPLETE
1. **Python Support** ✅
   - Scan packages in `.venv` or `venv` directories ✅
   - Read Python source files from installed packages ✅
   - Support standard pip-installed packages ✅
   - Support for poetry, uv, pipenv package managers ✅

2. **Node.js/JavaScript Support** ✅
   - Scan packages in `node_modules` directory ✅
   - Read JavaScript/TypeScript source files ✅
   - Support npm, pnpm, yarn, bun package managers ✅
   - Handle scoped packages (@org/package) ✅

3. **MCP Tools** ✅
   - `scan-packages`: Index all installed packages with versions ✅
   - `read-package`: Navigate and read package source files ✅
   - Auto-detection of project type (Python/Node.js) ✅

4. **Storage** ✅
   - Simple JSON index file (`.pkg-local-index.json`) ✅
   - Package name, version, and filesystem location

### Out of Scope (v1.0)
- AST parsing or code analysis
- Dependency graph generation
- Package documentation extraction
- Support for system packages or global installations
- Non-Python languages (future versions)
- Package alias resolution (e.g., `pillow` → `PIL`)
- Complex caching mechanisms

## Technical Architecture

### Technology Stack (Latest Versions)
- **Core Server**: TypeScript 5.7+ with Node.js 22.x LTS
- **MCP SDK**: Latest @modelcontextprotocol/sdk
- **Package Manager**: npm 10.x+ / pnpm 9.x for faster installs
- **Build Tool**: esbuild or tsx for fast compilation
- **Python Integration**: Child process spawning for Python 3.9+ operations
- **Storage**: JSON with optional JSON Schema validation
- **MCP Protocol**: Standard stdio transport with SSE/HTTP support ready

### Project Structure
```
mcp-pkg-local/
├── package.json           # npm configuration with type: "module"
├── tsconfig.json         # TypeScript 5.7+ strict configuration
├── README.md             # User documentation with badges
├── LICENSE               # MIT License
├── .github/
│   └── workflows/
│       ├── ci.yml        # GitHub Actions CI/CD
│       └── release.yml   # Automated npm publishing
├── src/
│   ├── index.ts          # MCP server entry point
│   ├── types.ts          # TypeScript interfaces
│   ├── server.ts         # MCP server setup with latest SDK
│   ├── tools/
│   │   ├── scan-packages.ts
│   │   └── read-package.ts
│   ├── scanners/
│   │   ├── base.ts       # Abstract scanner class
│   │   └── python.ts     # Python-specific scanner
│   └── utils/
│       ├── fs.ts         # File system utilities with node:fs/promises
│       └── cache.ts      # Index file management
├── tests/
│   ├── unit/            # Vitest unit tests
│   └── integration/     # Integration tests
└── dist/                # Compiled JavaScript output (ESM)

### MCP Tools Specification

#### Tool 1: `scan-packages`
**Purpose**: Scan and index all packages in the virtual environment

**Parameters**: None

**Returns**:
```json
{
  "success": true,
  "packages": {
    "fastapi": {
      "version": "0.104.1",
      "location": ".venv/lib/python3.11/site-packages/fastapi"
    },
    "pydantic": {
      "version": "2.5.0",
      "location": ".venv/lib/python3.11/site-packages/pydantic"
    }
  },
  "environment": {
    "type": "venv",
    "path": ".venv",
    "python_version": "3.11.5"
  },
  "scan_time": "2024-01-15T10:30:00Z"
}
```

**Behavior**:
1. Detect virtual environment (check `.venv`, then `venv`)
2. Use `which python` or `sys.prefix` to confirm active environment
3. List all directories in `site-packages`
4. Extract version from `.dist-info` directories or `__version__` attributes
5. Save index to `.pkg-local-index.json`
6. Return summary to LLM

#### Tool 2: `read-package`
**Purpose**: Read source files from a specific package

**Parameters**:
- `package_name` (string, required): Name of the package to read
- `file_path` (string, optional): Specific file to read within the package

**Returns when `file_path` is not provided**:
```json
{
  "success": true,
  "package": "fastapi",
  "version": "0.104.1",
  "init_content": "# __init__.py content here...",
  "file_tree": [
    "fastapi/__init__.py",
    "fastapi/applications.py",
    "fastapi/routing.py",
    "fastapi/middleware/__init__.py",
    "fastapi/middleware/cors.py"
  ]
}
```

**Returns when `file_path` is provided**:
```json
{
  "success": true,
  "package": "fastapi",
  "file_path": "fastapi/routing.py",
  "content": "# Full source code of routing.py..."
}
```

**Behavior**:
1. Load package location from index (run scan if index missing)
2. If no `file_path` specified:
   - Read `__init__.py` if it exists
   - Generate file tree (excluding `__pycache__`, `.pyc`, etc.)
   - Return both for LLM navigation
3. If `file_path` specified:
   - Read and return the specific file content
4. Handle errors gracefully with informative messages

### Auto-Trigger Mechanism

The MCP should monitor the LLM's context and automatically activate when:
1. Import statements are detected (e.g., `import fastapi`, `from pydantic import BaseModel`)
2. Package names are mentioned in comments or docstrings
3. Error messages reference package modules

**Auto-Trigger Response**:
```json
{
  "notification": "Detected usage of fastapi, pydantic. Local versions available: fastapi==0.104.1, pydantic==2.5.0",
  "suggestion": "Would you like me to read the source code to ensure compatibility?"
}
```

## Implementation Guidelines

### Development Principles
1. **Fail fast with clear errors**: If environment not found, say so immediately
2. **No silent failures**: Always return meaningful error messages
3. **Minimize dependencies**: Use Node.js built-ins where possible
4. **Respect filesystem boundaries**: Never read outside the package directories
5. **Performance first**: Index once, read many times

### Error Handling

All errors should return structured responses:
```json
{
  "success": false,
  "error": "No virtual environment found. Please ensure .venv or venv exists.",
  "suggestion": "Run 'python -m venv .venv' to create a virtual environment"
}
```

Common error scenarios:
- No virtual environment found
- Package not found in environment
- File not found within package
- Permission denied reading files
- Corrupted or invalid package structure

### Installation and Setup

#### For End Users
```bash
# Global installation (recommended)
npm install -g pkg-local

# Or use directly with npx
npx pkg-local
```

#### MCP Client Configuration

**Claude Desktop / Cursor / VS Code**:
```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "npx",
      "args": ["pkg-local"]
    }
  }
}
```

#### For Development
```bash
# Clone repository
git clone <repository>
cd pkg-local

# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally
npm run start

# Run in development mode with watch
npm run dev
```

### Package.json Configuration

```json
{
  "name": "@descoped/mcp-pkg-local",
  "version": "0.1.0",
  "description": "An MCP tool that scans and indexes local dependency source code",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "mcp-pkg-local": "./dist/index.js"
  },
  "scripts": {
    "build": "tsx build.ts",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "vitest",
    "test:coverage": "vitest run --coverage",
    "lint": "eslint . --ext .ts",
    "format": "prettier --write \"src/**/*.ts\"",
    "typecheck": "tsc --noEmit",
    "prepare": "npm run build",
    "prepublishOnly": "npm run test && npm run lint"
  },
  "engines": {
    "node": ">=20.0.0"
  },
  "repository": {
    "type": "git",
    "url": "https://github.com/descoped/mcp-pkg-local.git"
  },
  "keywords": ["mcp", "model-context-protocol", "llm", "ai", "claude", "packages"],
  "author": "Descoped",
  "license": "MIT"
}
```

### TypeScript Configuration (tsconfig.json)

Use the strictest, most modern TypeScript configuration:
```json
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2023"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "allowJs": false,
    "noEmit": false,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "allowUnreachableCode": false,
    "allowUnusedLabels": false
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

Key scripts to include:
- `build`: Compile TypeScript to JavaScript using tsx or esbuild
- `start`: Run the compiled server
- `dev`: Run with tsx in watch mode for development
- `test`: Run test suite with Vitest
- `lint`: Check code quality with ESLint 9+
- `format`: Auto-format with Prettier 3+
- `typecheck`: Validate TypeScript without building

### Testing Approach

1. **Unit Tests**: Test individual scanner functions with Vitest
2. **Integration Tests**: Test MCP tool responses with real packages
3. **Environment Tests**: Test with Python 3.9, 3.10, 3.11, 3.12, 3.13
4. **Client Tests**: Verify compatibility with Claude Desktop, Cursor, VS Code
5. **CI/CD**: GitHub Actions for automated testing on push/PR

## Limitations and Constraints

### Current Limitations
1. **Python only**: No support for other languages yet
2. **Local environments only**: No system-wide or conda support
3. **Read-only**: Cannot modify packages or install new ones
4. **File size limits**: Should warn for extremely large files
5. **Binary files**: Cannot read `.so`, `.pyd`, or compiled extensions

### Security Considerations
1. Never read files outside the virtual environment
2. Sanitize file paths to prevent directory traversal
3. Limit file size reads to prevent memory issues
4. No execution of package code, only reading

## Future Enhancements (Post v1.0)

### Version 1.1
- Package alias resolution (pillow → PIL)
- Support for conda environments
- Basic import graph visualization

### Version 1.2
- JavaScript/Node.js support (node_modules)
- Go modules support
- Rust crates support

### Version 1.3
- Intelligent caching with file watching
- Incremental index updates
- Performance optimizations for large environments

### Version 2.0
- AST parsing for better code understanding
- Documentation extraction from docstrings
- API compatibility checking between versions

## Success Criteria

The project is successful when:
1. An LLM can write Python code that imports and uses packages correctly on first attempt
2. Developers never see "ModuleNotFoundError" or "AttributeError" from LLM-generated code
3. The tool requires zero configuration for standard Python projects
4. Installation and setup takes less than 1 minute
5. The tool works reliably across all major MCP clients

## Development Notes for Claude Code

### Modern Development Practices

#### Use Latest Dependencies
```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "latest",
    "zod": "^3.x"  // For runtime type validation
  },
  "devDependencies": {
    "@types/node": "^22.x",
    "typescript": "^5.7.x",
    "tsx": "^4.x",
    "vitest": "^2.x",
    "@vitest/coverage-v8": "^2.x",
    "eslint": "^9.x",
    "prettier": "^3.x",
    "@typescript-eslint/eslint-plugin": "^8.x",
    "@typescript-eslint/parser": "^8.x"
  }
}
```

#### Modern JavaScript/TypeScript Patterns
1. **Use ES modules exclusively** - `import`/`export` syntax, no `require()`
2. **Node.js built-in modules** - Use `node:` protocol (e.g., `import fs from 'node:fs/promises'`)
3. **Top-level await** - Supported in ES modules for cleaner async code
4. **Optional chaining & nullish coalescing** - Use `?.` and `??` operators
5. **Structured error handling** - Use custom error classes extending `Error`
6. **Type-safe MCP SDK** - Use the official TypeScript SDK with full type inference

#### Code Organization Best Practices
1. **Single Responsibility Principle** - Each module does one thing well
2. **Dependency Injection** - Pass dependencies as parameters, not global imports
3. **Pure Functions** - Prefer functions without side effects where possible
4. **Immutable Data** - Use `const` by default, avoid mutations
5. **Early Returns** - Return early from functions to reduce nesting

### Key Implementation Points
1. **MCP Server Setup** - Use the latest @modelcontextprotocol/sdk with TypeScript
2. **Async Everything** - All I/O operations should be async with proper error handling
3. **Streaming Responses** - For large files, consider streaming instead of loading entirely
4. **Graceful Degradation** - If Python detection fails, try multiple strategies
5. **Comprehensive Logging** - Use structured logging with levels (debug, info, warn, error)
6. **Environment Variables** - Support `DEBUG=mcp-pkg-local:*` for debugging
7. **Signal Handling** - Properly handle SIGTERM/SIGINT for clean shutdown

### Code Quality Requirements
1. **TypeScript Strict Mode** - All strict flags enabled in tsconfig.json
2. **100% Type Coverage** - No `any` types unless absolutely necessary
3. **Error Boundaries** - Every tool wrapped in try-catch with meaningful errors
4. **Input Validation** - Use Zod schemas for runtime validation of tool inputs
5. **Exhaustive Checks** - Use TypeScript's exhaustive checks for enums/unions
6. **Documentation** - JSDoc comments for all public APIs
7. **Unit Test Coverage** - Minimum 80% code coverage

### Modern CLI Practices
1. **Shebang for Direct Execution** - `#!/usr/bin/env node` at the top of entry file
2. **Support for Flags** - Use standard `--version`, `--help` flags
3. **Exit Codes** - Use proper exit codes (0 for success, 1+ for errors)
4. **POSIX Compliance** - Follow POSIX conventions for CLI tools
5. **JSON Output Option** - Support `--json` flag for machine-readable output

### Performance Targets
- Package scanning: < 500ms for typical environment (50-100 packages)
- File reading: < 50ms for individual files
- File tree generation: < 200ms for large packages
- Index file size: < 500KB for typical projects
- Memory usage: < 100MB for scanning large environments
- Startup time: < 100ms for MCP server initialization

### GitHub Repository Setup

#### Branch Protection Rules
- **main branch**: Require PR reviews, status checks, up-to-date branches
- **CI must pass**: All tests, linting, and type checking
- **Signed commits**: Recommended for security

#### GitHub Actions Workflows
1. **CI Workflow** (.github/workflows/ci.yml)
   - Triggered on: Push to main, PRs
   - Matrix testing: Node 20.x, 22.x on Ubuntu, macOS, Windows
   - Steps: Install → Lint → Type Check → Test → Build
   
2. **Release Workflow** (.github/workflows/release.yml)
   - Triggered on: Version tags (v*)
   - Auto-publish to npm
   - Generate GitHub release with changelog

#### Documentation Requirements
- **README.md**: Installation, usage, examples, badges
- **CONTRIBUTING.md**: Development setup, coding standards
- **CHANGELOG.md**: Keep a changelog format
- **API.md**: Detailed tool documentation
- **LICENSE**: MIT License file

---

*This specification embraces modern JavaScript/TypeScript practices and the latest tooling to ensure the project is maintainable, performant, and compatible with current LLM development workflows. The focus remains on simplicity while using best-in-class development practices.*
