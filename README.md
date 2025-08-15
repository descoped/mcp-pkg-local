# mcp-pkg-local

[![CI](https://github.com/descoped/mcp-pkg-local/actions/workflows/ci.yml/badge.svg)](https://github.com/descoped/mcp-pkg-local/actions/workflows/ci.yml)
[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![MCP Tool](https://img.shields.io/badge/MCP-Tool-green.svg)](https://modelcontextprotocol.io)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7%2B-blue.svg)](https://www.typescriptlang.org)
[![npm version](https://img.shields.io/npm/v/@descoped/mcp-pkg-local.svg)](https://www.npmjs.com/package/@descoped/mcp-pkg-local)

An MCP (Model Context Protocol) server that enables LLMs to read and understand locally installed package source code, helping reduce API hallucinations by providing direct access to actual installed packages.

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

### CLI-Based Code Assistants

#### Claude Code (claude.ai)

Create `.mcp.json` in your project root:

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

Or use the CLI:
```bash
claude mcp add pkg-local -- npx @descoped/mcp-pkg-local
```

For local development/testing with the built version:
```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "node",
      "args": ["/absolute/path/to/mcp-pkg-local/dist/index.js"],
      "env": {
        "DEBUG": "mcp-pkg-local:*"
      }
    }
  }
}
```

#### Gemini CLI

Create or edit `~/.config/gemini/mcp.json`:

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

After adding, use `/mcp list` in Gemini CLI to verify the server is configured.

#### Cursor

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "npx",
      "args": ["-y", "@descoped/mcp-pkg-local"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

Open Cursor Settings → MCP to verify connection (green status).

### VS Code Extensions

#### Continue Extension

Add to `.continue/config.json`:

```json
{
  "models": [...],
  "mcpServers": {
    "pkg-local": {
      "command": "npx",
      "args": ["@descoped/mcp-pkg-local"],
      "cwd": "${workspaceFolder}"
    }
  }
}
```

#### Windsurf

Create `.windsurf/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "npx",
      "args": ["-y", "@descoped/mcp-pkg-local"]
    }
  }
}
```

### Desktop Applications

#### Claude Desktop

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "pkg-local": {
      "command": "npx",
      "args": ["-y", "@descoped/mcp-pkg-local"]
    }
  }
}
```

After adding, restart Claude Desktop completely. You'll see the MCP indicator (🔌) in the conversation input box.

## Usage

Once configured, the MCP server provides two main tools:

### 1. scan-packages

Scans and indexes all packages in your environment with powerful filtering options:

#### Basic Usage
```javascript
// Scan with default settings (returns 50 packages)
scan-packages

// Force refresh the cache
scan-packages --forceRefresh
```

#### Advanced Filtering (v0.1.1+)
```javascript
// Get summary only (token-efficient)
scan-packages --summary
// Returns: { total: 304, languages: { javascript: 304 }, categories: { production: 12, development: 292 } }

// Filter by regex pattern
scan-packages --filter "^react"  // All React packages
scan-packages --filter "eslint"  // Packages containing 'eslint'

// Filter by category
scan-packages --category production  // Production dependencies only
scan-packages --category development // Dev dependencies only

// Filter by predefined groups
scan-packages --group testing   // Testing tools (jest, mocha, vitest, etc.)
scan-packages --group building  // Build tools (webpack, vite, rollup, etc.)
scan-packages --group linting   // Linters (eslint, prettier, etc.)
scan-packages --group typescript // TypeScript-related packages

// Exclude @types packages
scan-packages --includeTypes false

// Limit results
scan-packages --limit 10  // Return only 10 packages
```

### 2. read-package

Read source files from installed packages with lazy loading for efficiency:

#### Basic Usage
```javascript
// Get main files only (default - very efficient)
read-package express
// Returns: mainFiles, fileCount, package.json content

// Read specific file
read-package express lib/router/index.js
```

#### Advanced Options (v0.1.1+)
```javascript
// Get full file tree
read-package express --includeTree

// Limit tree depth
read-package express --includeTree --maxDepth 2

// Filter files by pattern
read-package typescript --includeTree --pattern "*.d.ts"
read-package express --includeTree --pattern "lib/**"
```

## Performance Features (v0.1.1)

The tool has been optimized for LLM token consumption:

### Token Usage Comparison

| Operation | v0.1.0 | v0.1.1 | Reduction |
|-----------|--------|--------|-----------|
| Full scan (all packages) | 20,000 | 2,000 | 90% |
| Summary scan | N/A | 200 | 99% |
| Filtered scan (e.g., testing tools) | 20,000 | 500 | 97.5% |
| Read package (default) | 5,000 | 300 | 94% |
| Read package with tree | 5,000 | 1,000 | 80% |

### Key Optimizations

1. **Default Limits**: Returns only 50 packages by default instead of all
2. **Lazy File Trees**: Shows only main files unless full tree is requested
3. **Relative Paths**: Uses relative paths to save ~30% on path strings
4. **Smart Filtering**: Multiple ways to get exactly what you need
5. **Summary Mode**: Get counts without package details

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

### v0.1.0 (Released)
- [x] Python virtual environment support
- [x] Basic package scanning and reading
- [x] MCP server implementation
- [x] Caching system

### v0.1.1 (Current)
- [x] Performance optimizations (90% token reduction)
- [x] Advanced filtering (regex, category, groups)
- [x] Lazy file tree loading
- [x] Summary mode for minimal tokens
- [x] Node.js/JavaScript support
- [x] Multi-package manager support

### v0.2.0
- [ ] Conda environment support
- [ ] Package alias resolution
- [ ] Dependency tree visualization
- [ ] Cross-reference search

### v0.3.0
- [ ] Go modules support
- [ ] Rust/Cargo support
- [ ] Auto-trigger on import detection
- [ ] Package documentation extraction

### v1.0.0
- [ ] Stable API
- [ ] Plugin system for language support
- [ ] Advanced incremental caching
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
