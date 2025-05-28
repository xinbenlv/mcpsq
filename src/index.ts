#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import cors from 'cors';
import express, { Request, Response } from 'express';
import fs from "node:fs";
import path from "node:path";
import { z } from 'zod';
import { defaultConfigSchema, mcpServerSchema } from "./config-schema";
import { url } from "node:inspector";
import packageJson from '../package.json';

// CLI argument parsing
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const showVersion = args.includes('--version') || args.includes('-v');

if (showHelp) {
  console.log(`
MCPSQ - MCP Server Discovery and Management Tool

Usage:
  npx @mcpsq/mcpsq [options]
  mcpsq [options]

Options:
  --help, -h     Show this help message
  --version, -v  Show version information
  --port <port>  Specify port (default: 3000)

Description:
  MCPSQ is an MCP server that helps you discover and manage other MCP servers.
  When started, it provides an HTTP server with MCP tools for:
  - Finding relevant MCP servers
  - Adding MCP servers to Cursor configuration
  - Listing current MCP servers
  - Removing MCP servers from configuration

Examples:
  npx @mcpsq/mcpsq              # Start the server on port 3000
  npx @mcpsq/mcpsq --port 8080  # Start the server on port 8080

For more information, visit: https://mcpsq.xyz
`);
  process.exit(0);
}

if (showVersion) {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  console.log(`MCPSQ v${packageJson.version}`);
  process.exit(0);
}

// Parse port from arguments
const portIndex = args.indexOf('--port');
const PORT = process.env.PORT ? parseInt(process.env.PORT) : (portIndex !== -1 && args[portIndex + 1] ? parseInt(args[portIndex + 1]) : 3000);

if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
  console.error('Error: Invalid port number. Port must be between 1 and 65535.');
  process.exit(1);
}

const cacheFileAndKeyNameToValidatedMcpServerConfig = new Map<string, z.infer<typeof mcpServerSchema>>();
const readFullMcpServerListFromDiskAndSetCache = async () => {
  const dataDir = path.join(__dirname, "..", "data");
  const files = fs.readdirSync(dataDir);
  cacheFileAndKeyNameToValidatedMcpServerConfig.clear();
  files.filter((file) => file.endsWith(".json")).map((file) => {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const fileWithoutExtension = file.replace(/\.[^/.]+$/, "");
    const mcpServer = defaultConfigSchema.parse(JSON.parse(fileContent));
    for (const server in mcpServer.mcpServers) {
      const serverData = mcpServer.mcpServers[server];
      cacheFileAndKeyNameToValidatedMcpServerConfig.set(`${fileWithoutExtension}/${server}`, serverData);
    }
  });
};

const getMcpServerListFromCacheOrFetch = async (_query: string/* TODO use in the future. */):
  Promise<Array<Record<string, z.infer<typeof mcpServerSchema>>>> => {
    if (cacheFileAndKeyNameToValidatedMcpServerConfig.size === 0) {
      await readFullMcpServerListFromDiskAndSetCache();
    }
    return Array.from(cacheFileAndKeyNameToValidatedMcpServerConfig.keys()).map((key) => {
      const value = cacheFileAndKeyNameToValidatedMcpServerConfig.get(key);
      if (!value) {
        throw new Error(`Cache value not found for key: ${key}`);
      }
      return { [key]: value };
    });
  };

const startedAt = new Date();
const serverInfo = {
  name: packageJson.name,
  version: packageJson.version,
  startedAt,
}

const getServer = () => {
  const server = new McpServer({
    name: serverInfo.name,
    version: serverInfo.version,
  }, { capabilities: { logging: {} } });

  server.tool(
    'find-mcp-server',
    'Find MCP server relevant to the query',
    {
      query: z.string().describe('Query to find MCP server relevant to'),
    },
    async ({ query }): Promise<CallToolResult> => {
      const results = await getMcpServerListFromCacheOrFetch(query);
      console.log(`results: ${JSON.stringify(results, null, 2)}`);
      return {
        content: [
          {
            type: 'text' as const,
            text: `Completed returning ${results.length} relevant MCP servers: ${JSON.stringify(results, null, 2)}`,
          }
        ],
      };
    }
  );

  // Helper function to update MCP configuration
  const updateMcpConfig = async (
    serverKey: string,
    providedEnv: Record<string, string> | undefined
  ) => {
    try {
      // Validate the server config using the provided schema
      const validatedServerConfig = cacheFileAndKeyNameToValidatedMcpServerConfig.get(serverKey);

      // check if all env vars required by mcpServer config are present
      if (validatedServerConfig?.env) {
        const missingEnvVars = [];
        for (const [key, _value] of Object.entries(validatedServerConfig.env)) {
          if (!providedEnv?.[key]) {
            missingEnvVars.push(key);
          }
        }
        if (missingEnvVars.length > 0) {  
          return {
            content: [
              {
                type: 'text' as const,
                text: `Environment variable ${missingEnvVars.join(', ')} is not set. Please provide it and try again.`,
              }
            ],
            isError: true,
          };
        }
      }

      // update config
      const userMcpJson = path.join(process.env.HOME || '', '.cursor', 'mcp.json');
      const userMcpJsonContent = fs.readFileSync(userMcpJson, 'utf8');
      const userMcpJsonData = JSON.parse(userMcpJsonContent);
      userMcpJsonData.mcpServers[serverKey] = validatedServerConfig;
      // override the env vars if provided
      if (providedEnv) {
        userMcpJsonData.mcpServers[serverKey].env = providedEnv;
      }

      fs.writeFileSync(userMcpJson, JSON.stringify(userMcpJsonData, null, 2));

      return {
        content: [
          {
            type: 'text' as const,
            text: `Successfully added remote MCP server to cursor`,
          }
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Failed to add remote MCP server to cursor: ${error instanceof Error ? error.message : String(error)}`,
          }
        ],
      };
    }
  }; 

  server.tool(
    'add-mcp-server-to-cursor',
    'Add MCP server to cursor mcp.json',
    {
      cacheKey: z.string().describe('Key to use for the MCP server in the cache'),
      env: z.record(z.string(), z.string()).optional().describe('Environment variables of the remote MCP server'),
    },
    async (params) => {
      const { cacheKey, env } = params;
      const cacheValue = cacheFileAndKeyNameToValidatedMcpServerConfig.get(cacheKey);
      if (!cacheValue) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `No MCP server found in cache with key: ${url}`,
            }
          ],
        };
      }

      return updateMcpConfig(
        cacheKey,
        env
      );
    }
  );

  server.tool(
    'list-current-mcp-servers',
    'Read current list of MCP servers from cursor mcp.json',
    {},
    async (): Promise<CallToolResult> => {
      try {
        const userMcpJson = path.join(process.env.HOME || '', '.cursor', 'mcp.json');
        
        if (!fs.existsSync(userMcpJson)) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'No mcp.json file found in cursor configuration directory',
              }
            ],
          };
        }

        const userMcpJsonContent = fs.readFileSync(userMcpJson, 'utf8');
        const userMcpJsonData = JSON.parse(userMcpJsonContent);
        const mcpServers = userMcpJsonData.mcpServers || {};
        const serverKeys = Object.keys(mcpServers);

        return {
          content: [
            {
              type: 'text' as const,
              text: `Found ${serverKeys.length} MCP servers in cursor configuration: ${JSON.stringify(mcpServers, null, 2)}`,
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to read MCP servers from cursor: ${error instanceof Error ? error.message : String(error)}`,
            }
          ],
          isError: true,
        };
      }
    }
  );

  server.tool(
    'remove-mcp-server-from-cursor',
    'Remove an MCP server from the cursor configuration',
    {
      serverKey: z.string().describe('Key of the MCP server to remove from cursor configuration'),
    },
    async (params): Promise<CallToolResult> => {
      try {
        const { serverKey } = params;
        const userMcpJson = path.join(process.env.HOME || '', '.cursor', 'mcp.json');
        
        if (!fs.existsSync(userMcpJson)) {
          return {
            content: [
              {
                type: 'text' as const,
                text: 'No mcp.json file found in cursor configuration directory',
              }
            ],
            isError: true,
          };
        }

        const userMcpJsonContent = fs.readFileSync(userMcpJson, 'utf8');
        const userMcpJsonData = JSON.parse(userMcpJsonContent);
        
        if (!userMcpJsonData.mcpServers || !userMcpJsonData.mcpServers[serverKey]) {
          return {
            content: [
              {
                type: 'text' as const,
                text: `MCP server with key '${serverKey}' not found in cursor configuration`,
              }
            ],
            isError: true,
          };
        }

        // Remove the server
        delete userMcpJsonData.mcpServers[serverKey];
        
        // Write back to file
        fs.writeFileSync(userMcpJson, JSON.stringify(userMcpJsonData, null, 2));

        return {
          content: [
            {
              type: 'text' as const,
              text: `Successfully removed MCP server '${serverKey}' from cursor configuration`,
            }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text' as const,
              text: `Failed to remove MCP server from cursor: ${error instanceof Error ? error.message : String(error)}`,
            }
          ],
          isError: true,
        };
      }
    }
  );

  return server;
};

const app = express();

// Configure CORS to allow requests from specific domains
const corsOptions = {
  origin: [
    'https://mcpsq.xyz',
    /^https:\/\/.*\.mcpsq\.xyz$/,  // Allow all subdomains of mcpsq.xyz
    'https://www-mcpsq-xyz.lovable.app/',
    'https://lovable.dev/projects/ee20f748-d567-430b-9013-41792913c324',
    'https://id-preview--ee20f748-d567-430b-9013-41792913c324.lovable.app',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());

// Store transports by session ID
const transports: Record<string, SSEServerTransport> = {};

app.get('/registry', async (req: Request, res: Response) => {
  const mcpServerList = await getMcpServerListFromCacheOrFetch('');
  res.status(200).send(mcpServerList);
});

app.get('/healthz', (req: Request, res: Response) => {
  res.status(200).send(serverInfo);
});

// SSE endpoint for establishing the stream
app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET request to /sse (establishing SSE stream)');

  try {
    // Create a new SSE transport for the client
    // The endpoint for POST messages is '/messages'
    const transport = new SSEServerTransport('/messages', res);

    // Store the transport by session ID
    const sessionId = transport.sessionId;
    transports[sessionId] = transport;

    // Set up onclose handler to clean up transport when closed
    transport.onclose = () => {
      console.log(`SSE transport closed for session ${sessionId}`);
      delete transports[sessionId];
    };

    // Connect the transport to the MCP server
    const server = getServer();
    await server.connect(transport);

    console.log(`Established SSE stream with session ID: ${sessionId}`);
  } catch (error) {
    console.error('Error establishing SSE stream:', error);
    if (!res.headersSent) {
      res.status(500).send('Error establishing SSE stream');
    }
  }
});

// Messages endpoint for receiving client JSON-RPC requests
app.post('/messages', async (req: Request, res: Response) => {
  console.log('Received POST request to /messages');

  // Extract session ID from URL query parameter
  // In the SSE protocol, this is added by the client based on the endpoint event
  const sessionId = req.query.sessionId as string | undefined;

  if (!sessionId) {
    console.error('No session ID provided in request URL');
    res.status(400).send('Missing sessionId parameter');
    return;
  }

  const transport = transports[sessionId];
  if (!transport) {
    console.error(`No active transport found for session ID: ${sessionId}`);
    res.status(404).send('Session not found');
    return;
  }

  try {
    // Handle the POST message with the transport
    await transport.handlePostMessage(req, res, req.body);
  } catch (error) {
    console.error('Error handling request:', error);
    if (!res.headersSent) {
      res.status(500).send('Error handling request');
    }
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 MCPSQ Server started successfully!`);
  console.log(`📡 MCP endpoint: http://localhost:${PORT}/mcp`);
  console.log(`🔧 Configure Cursor MCP: Add "mcpsq": {"url": "http://localhost:${PORT}/mcp"} to your mcp.json`);
  console.log(`📚 Documentation: https://mcpsq.xyz`);
  console.log(`⏹️  Press Ctrl+C to stop the server`);
});

// Handle server shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down server...');

  // Close all active transports to properly clean up resources
  for (const sessionId in transports) {
    try {
      console.log(`Closing transport for session ${sessionId}`);
      await transports[sessionId].close();
      delete transports[sessionId];
    } catch (error) {
      console.error(`Error closing transport for session ${sessionId}:`, error);
    }
  }
  console.log('Server shutdown complete');
  process.exit(0);
});