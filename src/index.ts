#!/usr/bin/env node
import { startServer } from '#server';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

interface PackageJson {
  version: string;
  [key: string]: unknown;
}

// Get package.json version
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
  readFileSync(join(__dirname, '../package.json'), 'utf-8'),
) as PackageJson;
const version = packageJson.version;

// Handle command-line flags
const args = process.argv.slice(2);

if (args.includes('--version') || args.includes('-v')) {
  // eslint-disable-next-line no-console
  console.log(version);
  process.exit(0);
}

if (args.includes('--help') || args.includes('-h')) {
  // eslint-disable-next-line no-console
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
