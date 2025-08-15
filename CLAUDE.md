# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Permanent Rule (Never remove)

You can read `../authly/.venv/lib/**`. Authly uses python version `3.11`(./authly/.venv/lib/python3.11/site-packages/). If you need to enter the venv environment, go to `../authly` and invoke `source .venv/bin/activate`.

## Project Overview

This is an MCP (Model Context Protocol) tool called `mcp-pkg-local` that helps LLMs understand locally installed package source code. The project is in early development stage - only documentation exists, no implementation yet.

**Purpose**: Eliminate API hallucinations by providing LLMs with direct access to actual installed package source code rather than relying on training data.

## Development Commands

Since the project is not yet initialized, first run:
```bash
npm init -y
npm install --save-dev typescript @types/node tsx vitest @vitest/ui eslint prettier
npm install @modelcontextprotocol/sdk
```

Once initialized, use these commands:
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
- **Scanners**: `src/scanners/` - Language-specific package scanners (Python first)
- **Utils**: `src/utils/` - File system operations and caching

### Key MCP Tools

1. **scan-packages**: Indexes all packages in virtual environment
   - Scans `.venv` or `venv` directories
   - Extracts version info from `.dist-info`
   - Returns package list with metadata

2. **read-package**: Navigates and reads package source files
   - Accepts package name and optional file path
   - Returns file tree or specific file content
   - Supports navigation through package structure

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

The project specification is complete (see `ai_docs/initial-product-description-and-plan.md`), but no code has been implemented yet. When starting implementation:

1. Initialize npm project with TypeScript configuration
2. Set up MCP server boilerplate
3. Implement Python scanner as first language support
4. Add caching layer for performance
5. Create comprehensive test suite

## Important Context

- This is an AI-focused tool designed for LLM consumption
- Keep responses minimal - let LLMs interpret the source code
- Prioritize accuracy over features
- Python support is the primary goal before expanding to other languages
- The tool should work seamlessly with Claude Desktop and other MCP clients
