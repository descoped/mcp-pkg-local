# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Permanent Rules (Never remove)

**Package Manager Architecture**: Python package managers are not limited to `pip`. Modern Python uses various package managers:
- **pip**: Traditional, uses `requirements.txt`
- **poetry**: Modern, uses `pyproject.toml`
- **uv**: Superior Rust-implemented Python package manager, full replacement for pip/poetry/pipenv, uses `pyproject.toml`
- **pipenv**: Uses `Pipfile`/`Pipfile.lock`
- **conda**: Uses `environment.yml`

All these package managers install packages into the same virtual environment structure (`.venv/lib/python*/site-packages/` or `venv/lib/python*/site-packages/`). The scanner should focus on scanning the virtual environment directories directly, which works regardless of the package manager used. This same principle applies to Node.js package managers (npm, pnpm, yarn, bun) that all populate `node_modules/`.

## Project Overview

This is an MCP (Model Context Protocol) tool called `mcp-pkg-local` that helps LLMs understand locally installed package source code. The project is complete and ready for v0.1.0 release.

**Purpose**: Help reduce API hallucinations by providing LLMs with direct access to actual installed package source code rather than relying on training data.

## Development Commands

The project is fully initialized. Use these commands:
```bash
npm run dev       # Development mode with watch
npm run build     # Compile TypeScript to dist/
npm run test      # Run Vitest test suite
npm run lint      # ESLint code quality checks
npm run format    # Prettier auto-formatting
```

## Architecture

The project follows a modular MCP server architecture:

- **Entry Point**: `src/index.ts` - MCP server initialization
- **Core Server**: `src/server.ts` - MCP protocol implementation
- **Tools**: `src/tools/` - MCP tool implementations (scan-packages, read-package)
- **Scanners**: `src/scanners/` - Language-specific package scanners (Python, Node.js)
- **Utils**: `src/utils/` - File system operations and caching

### Key MCP Tools

1. **scan-packages**: Indexes all packages in environment
   - Scans Python `.venv`/`venv` directories
   - Scans Node.js `node_modules` directories
   - Auto-detects project type
   - Returns package list with metadata

2. **read-package**: Navigates and reads package source files
   - Accepts package name and optional file path
   - Returns file tree or specific file content
   - Supports navigation through package structure
   - Works with both Python and JavaScript/TypeScript files

## Implementation Guidelines

### TypeScript Configuration
- Use strict mode with all checks enabled
- Target ES2022+ with Node.js 20+ features
- Enable source maps for debugging
- Use ES modules (type: "module" in package.json)

### MCP Integration
- Follow MCP SDK patterns for tool registration
- Implement proper error handling with MCP error codes
- Use streaming responses for large file reads
- Include metadata in tool responses (package version, file paths)

### Python Package Scanning
- Start with `.venv` and `venv` directory detection
- Parse `.dist-info` directories for package metadata
- Handle both .py files and compiled .pyc gracefully
- Support site-packages and dist-packages layouts

### Testing Strategy
- Unit test each scanner independently
- Integration test with real Python environments
- Mock file system for edge cases
- Test with various package structures (namespace packages, single files, etc.)

## Current Status

The project has a complete working implementation with:
- MCP server with Python and Node.js/JavaScript package scanning
- Extensible architecture with TypeScript interfaces for language scanners  
- Caching layer for performance optimization
- Comprehensive test suite with mock environments
- Support for multiple package managers (pip/poetry/uv/pipenv for Python, npm/pnpm/yarn/bun for Node.js)

## Important Context

- This is an AI-focused tool designed for LLM consumption
- Keep responses minimal - let LLMs interpret the source code
- Prioritize accuracy over features
- Both Python and Node.js/JavaScript are fully supported
- The tool works seamlessly with Claude Desktop, Claude Code, Gemini CLI, Cursor, and other MCP clients
