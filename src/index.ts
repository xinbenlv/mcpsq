import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from 'express';
import fs from "node:fs";
import path from "node:path";
import { z } from 'zod';
import { commandBasedMcpServerSchema, defaultConfigSchema, mcpServerSchema, urlBasedMcpServerSchema } from "./config-schema";
import { url } from "node:inspector";

const cache = new Map<string, z.infer<typeof mcpServerSchema>>();
const readFullMcpServerListFromDiskAndSetCache = async () => {
  const dataDir = path.join(__dirname, "..", "data");
  const files = fs.readdirSync(dataDir);
  cache.clear();
  files.filter((file) => file.endsWith(".json")).map((file) => {
    const filePath = path.join(dataDir, file);
    const fileContent = fs.readFileSync(filePath, "utf8");
    const fileWithoutExtension = file.replace(/\.[^/.]+$/, "");
    const mcpServer = defaultConfigSchema.parse(JSON.parse(fileContent));
    for (const server in mcpServer.mcpServers) {
      const serverData = mcpServer.mcpServers[server];
      cache.set(`${fileWithoutExtension}/${server}`, serverData);
    }
  });
};

const getMcpServerListFromCacheOrFetch = async (query: string):
  Promise<Array<z.infer<typeof mcpServerSchema>>> => {
  await readFullMcpServerListFromDiskAndSetCache();
  return Array.from(cache.values());
};

const getServer = () => {
  const server = new McpServer({
    name: 'mcpsq',
    version: '1.0.0',
  }, { capabilities: { logging: {} } });

  server.tool(
    'find-mcp-server',
    'Find MCP server relevant to the query',
    {
      query: z.string().describe('Query to find MCP server relevant to'),
    },
    async ({ query }): Promise<CallToolResult> => {
      const results = await getMcpServerListFromCacheOrFetch(query);

      return {
        content: [
          {
            type: 'text',
            text: `Completed returning ${results.length} relevant MCP servers`,
            data: results,
          }
        ],
      };
    }
  );

  // Helper function to update MCP configuration
  const updateMcpConfig = async (
    serverKey: string,
    serverConfig: any,
    schema: z.ZodSchema<any>,
    successMessage: string,
    errorPrefix: string
  ) => {
    try {
      // Validate the server config using the provided schema
      const validatedServerConfig = schema.parse(serverConfig);
      const userMcpJson = path.join(process.env.HOME || '', '.cursor', 'mcp.json');
      const userMcpJsonContent = fs.readFileSync(userMcpJson, 'utf8');
      const userMcpJsonData = JSON.parse(userMcpJsonContent);
      userMcpJsonData.mcpServers[serverKey] = validatedServerConfig;
      fs.writeFileSync(userMcpJson, JSON.stringify(userMcpJsonData, null, 2));

      return {
        content: [
          {
            type: 'text' as const,
            text: `${successMessage}: ${JSON.stringify(userMcpJsonData, null, 2)}`,
          }
        ],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `${errorPrefix}: ${error instanceof Error ? error.message : String(error)}`,
          }
        ],
      };
    }
  };

  server.tool(
    'add-command-based-mcp-server-to-cursor',
    'Add the command-based remote MCP server to cursor',
    commandBasedMcpServerSchema.shape as z.ZodRawShape,
    async (params) => {
      const { command, args, env } = params;
      return updateMcpConfig(
        command,
        { command, args, env },
        commandBasedMcpServerSchema,
        'Successfully added command-based MCP server to cursor',
        'Failed to add command-based MCP server to cursor'
      );
    }
  );  

  server.tool(
    'add-url-based-mcp-server-to-cursor',
    'Add the url-based remote MCP server to cursor',
    urlBasedMcpServerSchema.shape as z.ZodRawShape,
    async (params) => {
      const { url, env } = params;
      return updateMcpConfig(
        url,
        { url, env },
        urlBasedMcpServerSchema,
        'Successfully added remote MCP server to cursor',
        `Failed to add remote MCP server (${url}) to cursor`
      );
    }
  );
  return server;
};

const app = express();
app.use(express.json());

// Store transports by session ID
const transports: Record<string, SSEServerTransport> = {};

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
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Simple SSE Server (deprecated protocol version 2024-11-05) listening on port ${PORT}`);
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