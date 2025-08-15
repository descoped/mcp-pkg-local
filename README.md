# mcp-pkg-local

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Tool](https://img.shields.io/badge/MCP-Tool-green.svg)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue.svg)](https://www.typescriptlang.org)

An MCP (Model Context Protocol) server that enables LLMs to read and understand locally installed package source code, eliminating API hallucinations by providing direct access to actual installed packages.

## Features

- 🔍 **Package Scanning**: Automatically discovers and indexes all packages in Python and Node.js environments
- 📖 **Source Code Reading**: Direct access to actual installed package source code
- ⚡ **Smart Caching**: Fast responses with intelligent index caching
- 🐍 **Python Support**: Full support for Python 3.9+ virtual environments (venv, .venv)
- 📦 **Node.js Support**: Complete support for Node.js packages in node_modules
- 🎯 **Zero Configuration**: Works out of the box with standard Python and Node.js projects
- 🛠️ **Multi Package Manager**: Supports pip, poetry, uv, pipenv, npm, pnpm, yarn, and bun
- 🚀 **Modern Stack**: Built with TypeScript 5.7+, Node.js 20+, and latest MCP SDK

## Why mcp-pkg-local?

LLMs often hallucinate APIs or use outdated syntax from their training data. This tool solves that by letting LLMs read the actual source code of packages installed in your environment, ensuring generated code matches your exact package versions.

## Installation

### Global Installation (Recommended)

```bash
npm install -g @descoped/mcp-pkg-local
```

### Or use directly with npx

```bash
npx @descoped/mcp-pkg-local
```

## MCP Client Configuration

### Claude Desktop

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "npx",
      "args": ["@descoped/mcp-pkg-local"]
    }
  }
}
```

### Claude Code

Add `.mcp.json` to your project root:

```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "npx",
      "args": ["@descoped/mcp-pkg-local"],
      "env": {
        "DEBUG": "mcp-pkg-local:*"
      }
    }
  }
}
```

### Local Development with Claude Code

For local testing with Claude Code, use the built version:

```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "node",
      "args": ["/path/to/mcp-pkg-local/dist/index.js"],
      "env": {
        "DEBUG": "mcp-pkg-local:*"
      }
    }
  }
}
```

### Cursor / VS Code

Add to your MCP settings:

```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "mcp-pkg-local"
    }
  }
}
```

## Usage

Once configured, the MCP server provides two main tools:

### 1. scan-packages

Scans and indexes all packages in your environment (Python or Node.js):

**Python Example:**
```
Scanning virtual environment...
Found 85 packages in .venv
Python version: 3.11.9
```

**Node.js Example:**
```
Scanning node_modules...
Found 304 packages
Node version: v20.12.0
Package manager: npm
```

The scan results are cached for performance. Use `forceRefresh: true` to rescan.

### 2. read-package

Read source files from installed packages:

**Python Example:**
```
# Get file tree and __init__.py
read-package fastapi

# Read specific file
read-package fastapi routing.py
```

**Node.js Example:**
```
# Get file tree and package.json
read-package express

# Read specific file
read-package express lib/router/index.js
```

## How It Works

1. **Environment Detection**: Automatically detects Python (`.venv`/`venv`) or Node.js (`package.json`) projects
2. **Package Discovery**: 
   - Python: Scans `site-packages` and reads `.dist-info` metadata
   - Node.js: Scans `node_modules` including scoped packages
3. **Smart Indexing**: Creates `.pkg-local-index.json` cache for fast lookups
4. **Source Reading**: Provides file trees and actual source code to LLMs

## Development

### Prerequisites

- Node.js 20+ (LTS recommended)
- npm 10+ or pnpm
- Python 3.9+ with virtual environment (for Python support)
- Node.js project with node_modules (for Node.js support)

### Setup

```bash
# Clone the repository
git clone https://github.com/descoped/mcp-pkg-local.git
cd mcp-pkg-local

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Development mode
npm run dev
```

### Project Structure

```
mcp-pkg-local/
├── src/
│   ├── index.ts          # Entry point
│   ├── server.ts         # MCP server setup
│   ├── tools/            # MCP tool implementations
│   ├── scanners/         # Language-specific scanners
│   └── utils/            # Utilities
├── tests/                # Test suite
└── dist/                 # Compiled output
```

## Testing

The project includes comprehensive tests using Vitest:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:ui
```

## Configuration

### Environment Variables

- `DEBUG=mcp-pkg-local:*` - Enable debug logging
- `NODE_ENV=production` - Production mode

### Cache Management

The index cache (`.pkg-local-index.json`) is automatically managed:
- Created on first scan
- Updated when packages change
- 1-hour default TTL
- Can be forced to refresh

## Supported Environments

### Python
- ✅ Virtual environments (venv, .venv)
- ✅ Package managers: pip, poetry, uv, pipenv
- ✅ Standard pip packages
- ✅ Editable installations (-e)
- ✅ Namespace packages
- 🚧 Conda environments (coming soon)

### Node.js/JavaScript
- ✅ node_modules directory
- ✅ Package managers: npm, pnpm, yarn, bun
- ✅ Scoped packages (@org/package)
- ✅ TypeScript packages
- ✅ ESM and CommonJS modules

## Limitations

- Python and Node.js/JavaScript only (Go, Rust support planned)
- Local environments only (no system packages)
- Read-only access (cannot modify packages)
- 10MB file size limit for source files

## Security

- Never reads files outside virtual environment or node_modules
- Path sanitization prevents directory traversal
- No code execution, only reading
- Binary files are blocked

## Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch
3. Write tests for new features
4. Ensure all tests pass
5. Submit a pull request

## Roadmap

### v0.2.0
- [x] Node.js/JavaScript support
- [x] Multi-package manager support
- [ ] Conda environment support
- [ ] Package alias resolution

### v0.3.0
- [ ] Go modules support
- [ ] Rust/Cargo support
- [ ] Auto-trigger on import detection

### v1.0.0
- [ ] Stable API
- [ ] Performance optimizations
- [ ] Advanced caching strategies
- [ ] Cross-language dependency resolution

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

Built with:
- [Model Context Protocol SDK](https://github.com/anthropics/mcp)
- [TypeScript](https://www.typescriptlang.org)
- [Vitest](https://vitest.dev)

## Support

- [GitHub Issues](https://github.com/descoped/mcp-pkg-local/issues)
- [Documentation](https://github.com/descoped/mcp-pkg-local/wiki)

---

Made with ❤️ for better LLM code generation
