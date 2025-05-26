import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import packageJson from "../package.json" with { type: "json" };

// Create server instance
const server = new McpServer({
  name: packageJson.name,
  version: packageJson.version,
});

server.tool(
  "hello-world",
  "Say hello to the world",
  {
    name: z.string().describe("Your name"),
  },
  async ({ name }) => {
    return {
        content: [
          {
            type: "text",
            text: `Hello, ${name}!`,
          },
        ],
      };
      
  },
);

server.tool(
  "version",
  "Get version of the server",
  ({  }) => {
    return {
        content: [
          {
            type: "text",
            text: `Version: ${packageJson.version}`,
          },
        ],
      };
      
  },
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log("Hello World MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
