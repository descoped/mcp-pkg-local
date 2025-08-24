# MCP-PKG-Local Documentation

## Overview

This directory contains comprehensive documentation for the MCP-PKG-Local project's Bottles architecture and Shell-RPC implementation.

## Documentation Structure

### Core Documentation

1. **[Bottles Architecture](./bottles-architecture.md)**
   - Complete overview of the Bottles containerized environment system
   - Component details: Shell-RPC, Volume Controller, Package Manager Adapters
   - Usage patterns and best practices
   - Testing strategies and debugging guides
   - Security considerations and performance optimization

2. **[Shell-RPC Implementation](./shell-rpc-implementation.md)**
   - Detailed implementation guide for the persistent shell system
   - Cross-platform support (Windows, macOS, Linux)
   - Command execution flow and timeout management
   - Signal support and error handling
   - Advanced features and customization options

## Quick Start

### For Users

If you want to use the Bottles architecture in your project:

1. Read the [Bottles Architecture](./bottles-architecture.md) overview section
2. Review the "Usage Patterns" section for common scenarios
3. Check the "Best Practices" section for recommendations

### For Contributors

If you're contributing to the project:

1. Start with [Shell-RPC Implementation](./shell-rpc-implementation.md) to understand the core engine
2. Study the [Bottles Architecture](./bottles-architecture.md) for the complete system design
3. Review the "Testing" sections in both documents
4. Check the "Debugging" sections for troubleshooting

### For Package Manager Adapter Developers

If you're adding support for a new package manager:

1. Read the "Package Manager Adapters" section in [Bottles Architecture](./bottles-architecture.md)
2. Study the base interface and existing implementations
3. Follow the adapter registration pattern
4. Implement comprehensive tests

## Key Concepts

### Bottle
A self-contained environment with persistent shell, mounted caches, and package manager adapters.

### Shell-RPC
Remote Procedure Call via Shell - manages persistent shell processes for stateful command execution.

### Volume Controller
Manages cache directories for package managers, providing persistence across sessions.

### Package Manager Adapter
Standardized interface for different package managers (pip, uv, npm, yarn, etc.).

## Architecture Highlights

```
┌─────────────────────────────────────────────┐
│              Bottle Environment              │
├─────────────────────────────────────────────┤
│  Package Manager Adapters                   │
│  ↓                                          │
│  Shell-RPC ←→ Volume Controller             │
│  ↓                                          │
│  Host System Resources                      │
└─────────────────────────────────────────────┘
```

## Current Status

### Implemented Features
- ✅ Shell-RPC with cross-platform support
- ✅ Volume Controller with cache management
- ✅ Package Manager Adapters (pip, uv)
- ✅ Command queueing and timeout handling
- ✅ Clean environment mode
- ✅ Signal support (SIGINT, SIGTERM, SIGKILL)
- ✅ Test utilities with preservation on failure

### Planned Features
- 📋 Additional package managers (poetry, npm, yarn, cargo)
- 📋 Container backend (Docker/Podman)
- 📋 Distributed cache sharing
- 📋 Resource limits and monitoring

## Environment Variables

### Runtime Configuration
- `DEBUG_SHELL_RPC=1` - Enable Shell-RPC debug logging
- `DEBUG_VOLUME=1` - Enable Volume Controller debug logging
- `DEBUG_ADAPTER=1` - Enable adapter debug logging

### Testing Configuration
- `PRESERVE_TEST_DIRS_ON_FAILURE=true/false` - Keep test directories for debugging
- `USE_SYSTEM_TEMP=true/false` - Use system temp directory for tests
- `CI=true` - Indicates CI environment (affects timeouts and temp directories)

## File Structure

```
src/bottles/
├── shell-rpc/           # Shell-RPC implementation
│   ├── index.ts         # Main ShellRPC class
│   ├── process-manager.ts # Process lifecycle
│   ├── command-queue.ts  # Command sequencing
│   ├── platform.ts      # Platform-specific logic
│   └── environment.ts   # Environment management
├── volume-controller/   # Volume management
│   ├── volume-controller.ts # Main controller
│   ├── cache-paths.ts   # Path resolution
│   └── types.ts         # Type definitions
└── package-managers/    # Package manager adapters
    ├── base.ts          # Base adapter class
    ├── pip.ts           # Pip adapter
    ├── uv.ts            # UV adapter
    └── registry.ts      # Adapter registration
```

## Contributing

When updating or extending the Bottles architecture:

1. **Update Documentation**: Keep these docs in sync with code changes
2. **Add Tests**: Comprehensive test coverage is required
3. **Follow Patterns**: Use existing patterns for consistency
4. **Type Safety**: Leverage TypeScript's type system fully
5. **Error Handling**: Provide meaningful error messages with recovery suggestions

## Support

For questions or issues:
1. Check the debugging sections in the documentation
2. Review test files for usage examples
3. Enable debug logging for troubleshooting
4. Open an issue with detailed reproduction steps

## License

This documentation is part of the MCP-PKG-Local project and follows the same license terms.