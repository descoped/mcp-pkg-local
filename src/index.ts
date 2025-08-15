#!/usr/bin/env node
import { startServer } from '#server';

// Handle command-line flags
const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  console.log('0.1.0');
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
mcp-pkg-local - MCP server for reading local package source code

Usage:
  mcp-pkg-local              Start the MCP server
  mcp-pkg-local --version    Show version
  mcp-pkg-local --help       Show this help message

Environment Variables:
  DEBUG=mcp-pkg-local:*      Enable debug logging

MCP Client Configuration:
  {
    "mcpServers": {
      "pkg-local": {
        "command": "npx",
        "args": ["@descoped/mcp-pkg-local"]
      }
    }
  }
`);
  process.exit(0);
}

// Start the server
startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
