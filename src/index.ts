import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import express, { Request, Response } from 'express';
import fs from "node:fs";
import path from "node:path";
import { z } from 'zod';

const getServer = () => {
  const server = new McpServer({
    name: 'mcpsq',
    version: '1.0.0',
  }, { capabilities: { logging: {} } });

  server.tool(
    'find-mcp-for',
    'Find MCP server relevant to the query',
    {
      query: z.string().describe('Query to find MCP server relevant to'),
    },
    async ({ query }, { sendNotification }): Promise<CallToolResult> => {
      // Send the initial notification
      await sendNotification({
        method: "notifications/message",
        params: {
          level: "info",
          data: `Starting querying MCP server relevant to the query: ${query}`
        }
      });

      const results = [{
        name: "github",
        url: "https://github.com/mcp-server/github",
        description: "GitHub MCP server",
      }, {
        name: "google-maps",
        url: "https://google-maps.com/mcp-server/google-maps",
        description: "Google Maps MCP server",
      },
      {
        name: "weather",
        url: "https://weather.com/mcp-server/weather",
        description: "Weather MCP server",
      }, {
        name: "news",
        url: "https://news.com/mcp-server/news",
        description: "News MCP server",
      }, {
        name: "namefi",
        url: "https://namefi.com/mcp-server/namefi",
        description: "Namefi MCP server",
      }]

      await Promise.all(results.map(server => sendNotification({
        method: "notifications/message",
        params: {
          level: "info",
          data: `Relevant MCP servers: ${server.name}`
        }
      })));

      return {
        content: [
          {
            type: 'text',
            text: `Completed returning ${results.length} relevant MCP servers: ${JSON.stringify(results, null, 2)}`,
          }
        ],
      };
    }
  );

  server.tool(
    'add-mcp-server-to-cursor',
    'Add remote MCP server to cursor',
    {
      name: z.string().describe('Name of the remote MCP server'),
      url: z.string().describe('URL of the remote MCP server'),
      apiKey: z.string().optional().describe('API key of the remote MCP server'),
    },
    async ({ name, url, apiKey }) => {
      // Update the /user/mcp.json file
      try {
      const userMcpJson = path.join(process.env.HOME || '', '.cursor', 'mcp.json');
      const userMcpJsonContent = fs.readFileSync(userMcpJson, 'utf8');
      const userMcpJsonData = JSON.parse(userMcpJsonContent);
      userMcpJsonData.mcpServers[name] = {
        url: url,
        env: {
          API_KEY: apiKey || undefined
        }
      };
      fs.writeFileSync(userMcpJson, JSON.stringify(userMcpJsonData, null, 2));

      return {
        content: [
          {
            type: 'text',
            text: `Successfully added remote MCP server to cursor: ${JSON.stringify(userMcpJsonData, null, 2)}`,
          }
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Failed to add remote MCP server ${name} (${url}) to cursor: ${error instanceof Error ? error.message : String(error)}`,
            }
          ],
        };
      }
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