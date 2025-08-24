# Bottles ShellRPC Environment Initialization - Revised Plan

**Date**: 2025-08-22
**Current Commit**: 37ceb8d (feature/rework)
**Status**: PARTIAL SUCCESS - Reduced failures from 28 to 10

## Executive Summary

After reverting to stable commit d7ee690c and applying a minimal targeted fix, we've successfully reduced bottle integration test failures from 28 to 10. The root cause was identified as environment variable names with special characters being misinterpreted as bash commands.

## Root Cause Analysis

### The Problem
When ShellRPC executes commands with environment variables inline, bash was interpreting variables like `npm_package_bin_mcp-pkg-local=dist/index.js` as commands rather than variable assignments. This happened because:

1. The variable name contains underscores and hyphens
2. The value contains special characters (equals sign, slashes)
3. The inline format `VAR=value command` was failing when VAR had certain patterns

### Evidence
```bash
bash: npm_package_bin_mcp-pkg-local=dist/index.js: No such file or directory
```

### The Fix Applied
Changed from inline variable assignment:
```bash
UV_CACHE_DIR='...' npm_package_bin_mcp-pkg-local='...' uv venv --clear
```

To proper export statements:
```bash
export UV_CACHE_DIR='...'; export npm_package_bin_mcp-pkg-local='...'; uv venv --clear
```

## Current State

### What's Working
- UV virtual environment creation tests (✅)
- Basic ShellRPC command execution (✅)
- Environment variable escaping with single quotes (✅)
- Proper export statement generation (✅)

### What's Still Failing (10 tests)
1. **Hook timeout issues** (3 tests) - beforeAll/afterEach hooks timing out at 1000ms
2. **CI environment validation** (1 test) - Virtual environment activation path issues
3. **UV package installation** (3 tests) - Package installation commands failing
4. **UV manifest parsing** (1 test) - Lock file parsing expectations
5. **UV cache management** (2 tests) - Cache path configuration and persistence

## Architecture Context (from ai_docs review)

### Key Documents Referenced
- **bottles-work-breakdown.md**: Shows Phase 1 & 2 completed, Phase 3 pending
- **bottles-architecture-design.md**: Defines Shell-RPC as persistent shell for package managers
- **bottles-architecture-diagrams.md**: Shows data flow and component relationships
- **bottles-try-fix-safe-environemnt-initialization-anomaly.md**: Documents failed attempts

### Bottles Design Principles
1. **Isolation**: Each bottle is a self-contained test environment
2. **Predictability**: Same commands should work across different user environments
3. **Native Tools**: Use actual package managers (pip, uv) via Shell-RPC
4. **Cache Persistence**: VolumeController manages cache across test runs

## Critical Code Areas Requiring Analysis

### 1. ShellRPC Implementation (`src/bottles/shell-rpc/index.ts`)
- How commands are sent to the shell
- How environment is initialized and maintained
- Timeout handling and signal management
- Output buffering and completion detection

### 2. Base Adapter (`src/bottles/package-managers/base.ts`)
- Environment variable handling (lines 250-263)
- Command execution flow
- Error handling and result processing
- Working directory management

### 3. Test Utils (`tests/bottles/integration/test-utils.ts`)
- How test environments are created
- ShellRPC initialization parameters
- VolumeController setup
- Cleanup procedures

### 4. Package Manager Adapters
- UV Adapter (`src/bottles/package-managers/uv.ts`)
- Pip Adapter (`src/bottles/package-managers/pip.ts`)
- How they build commands and set environment

## Remaining Issues to Fix

### Issue 1: Hook Timeouts
**Location**: `tests/bottles/integration/*.test.ts`
**Problem**: beforeAll and afterEach hooks have 1000ms timeout
**Solution**: Increase timeout or optimize initialization

### Issue 2: Environment Inheritance
**Location**: ShellRPC environment setup
**Problem**: Inherited npm variables still polluting some commands
**Solution**: Need to filter environment variables at ShellRPC level

### Issue 3: Path Resolution
**Location**: Virtual environment activation
**Problem**: Tests expect packages in `.venv` but finding them in system Python
**Solution**: Ensure virtual environment is properly activated

## Next Steps

### Immediate Actions
1. **Fix hook timeouts** - Add proper timeout values to test hooks
2. **Analyze remaining failures** - Deep dive into each failing test
3. **Review ShellRPC environment** - Ensure clean environment initialization

### Strategic Actions
1. **Complete code analysis** of entire bottles implementation
2. **Document environment flow** from test setup to command execution
3. **Create integration test** for environment variable edge cases
4. **Implement comprehensive logging** for debugging

## Lessons Learned

1. **Minimal fixes work** - The simple export change fixed major issues
2. **Environment pollution is real** - npm variables cause unexpected problems
3. **Shell syntax matters** - Inline vs export has different parsing rules
4. **Need systematic approach** - Random changes without understanding waste time

## Dependencies Between Components

```
Test Setup (test-utils.ts)
    ↓ Creates ShellRPC with environment
    ↓ Creates VolumeController for cache
Package Manager Adapter (pip.ts, uv.ts)
    ↓ Uses ShellRPC.execute()
    ↓ Builds commands with environment
Base Adapter (base.ts)
    ↓ Handles environment variable formatting
    ↓ Executes through ShellRPC
ShellRPC (index.ts)
    ↓ Sends to persistent shell process
    ↓ Manages output and timeouts
```

## Mission Focus

The core mission is to enable **real package testing** through bottles instead of mocks. We must:

1. Ensure **predictable environments** across different user setups
2. Maintain **isolation** between test runs
3. Provide **native tool access** (pip, uv) through Shell-RPC
4. Enable **cache persistence** for CI/CD performance

The current partial fix shows we're on the right track, but we need systematic analysis and targeted fixes for the remaining issues.