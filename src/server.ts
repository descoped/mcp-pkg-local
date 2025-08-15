import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { scanPackagesTool } from '#tools/scan-packages';
import { readPackageTool } from '#tools/read-package';
import type { ReadPackageParams, ScanPackagesParams } from '#types';

const PKG_LOCAL_VERSION = '0.1.0';
const DEBUG = process.env.DEBUG?.includes('mcp-pkg-local');

function log(level: 'info' | 'error' | 'debug', message: string, ...args: unknown[]): void {
  if (level === 'debug' && !DEBUG) return;
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

  if (level === 'error') {
    console.error(prefix, message, ...args);
  } else {
    console.error(prefix, message, ...args); // Use stderr for all logs
  }
}

export function createServer(): Server {
  log('info', `Starting mcp-pkg-local server v${PKG_LOCAL_VERSION}`);

  const server = new Server(
    {
      name: 'mcp-pkg-local',
      version: PKG_LOCAL_VERSION,
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  // Tool definitions
  const tools: Tool[] = [
    {
      name: 'scan-packages',
      description: 'Scan and index all packages in the virtual environment',
      inputSchema: {
        type: 'object',
        properties: {
          forceRefresh: {
            type: 'boolean',
            description: 'Force rescan even if index exists',
            default: false,
          },
          filter: {
            type: 'string',
            description: 'Regex pattern to filter package names (e.g., "^@types/" or "eslint")',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of packages to return (default: 50)',
            default: 50,
          },
          summary: {
            type: 'boolean',
            description: 'Return only summary counts instead of full package list',
            default: false,
          },
          category: {
            type: 'string',
            enum: ['production', 'development', 'all'],
            description: 'Filter packages by category (production/development/all)',
            default: 'all',
          },
          includeTypes: {
            type: 'boolean',
            description: 'Include @types packages in results',
            default: true,
          },
          group: {
            type: 'string',
            enum: ['testing', 'building', 'linting', 'typescript', 'framework', 'utility'],
            description: 'Filter by predefined package group (testing, building, linting, etc.)',
          },
        },
      },
    },
    {
      name: 'read-package',
      description: 'Read source files from a specific package',
      inputSchema: {
        type: 'object',
        properties: {
          packageName: {
            type: 'string',
            description: 'Name of the package to read',
          },
          filePath: {
            type: 'string',
            description: 'Specific file to read within the package (optional)',
          },
          includeTree: {
            type: 'boolean',
            description: 'Include full file tree (default: false, only shows main files)',
            default: false,
          },
          maxDepth: {
            type: 'number',
            description: 'Maximum depth for file tree traversal (default: 2)',
            default: 2,
          },
          pattern: {
            type: 'string',
            description: 'Glob pattern to filter files (e.g., "*.ts", "src/**")',
          },
        },
        required: ['packageName'],
      },
    },
  ];

  // Handle list tools request
  server.setRequestHandler(ListToolsRequestSchema, () => {
    log('debug', 'Listing available tools');
    return { tools };
  });

  // Handle tool calls
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    log('info', `Tool called: ${name}`, args);

    try {
      switch (name) {
        case 'scan-packages': {
          const params = args as ScanPackagesParams;
          const result = await scanPackagesTool(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        case 'read-package': {
          const params = args as ReadPackageParams;
          const result = await readPackageTool(params);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        }

        default:
          log('error', `Unknown tool: ${name}`);
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  error: `Unknown tool: ${name}`,
                  availableTools: tools.map(t => t.name),
                }, null, 2),
              },
            ],
          };
      }
    } catch (error) {
      log('error', `Tool execution failed: ${name}`, error);

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const suggestion =
        error instanceof Error && 'suggestion' in error 
          ? (error as { suggestion?: string }).suggestion 
          : undefined;

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: false,
                error: errorMessage,
                suggestion,
              },
              null,
              2,
            ),
          },
        ],
        isError: true,
      };
    }
  });

  // Error handling
  server.onerror = (error) => {
    log('error', 'Server error:', error);
  };

  return server;
}

export async function startServer(): Promise<void> {
  const transport = new StdioServerTransport();
  const server = createServer();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    log('info', 'Received SIGINT, shutting down gracefully...');
    void server.close();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    log('info', 'Received SIGTERM, shutting down gracefully...');
    void server.close();
    process.exit(0);
  });

  await server.connect(transport);
  log('info', 'MCP server connected and ready');
}
