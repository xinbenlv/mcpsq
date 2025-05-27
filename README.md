# MCP^2(MCPSQ)

[![CI/CD](https://github.com/xinbenlv/mcpsq/actions/workflows/ci.yml/badge.svg)](https://github.com/xinbenlv/mcpsq/actions/workflows/ci.yml)

MCP^2(MCPSQ) is a simple MCP server to discover and manage MCP servers. See our website [mcpsq.xyz](https://mcpsq.xyz) for more information.

## Usage

```bash
npm start
```

## Local Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Cursor](https://cursor.com/) editor

### Installation

1. Clone the repository:
```bash
git clone https://github.com/xinbenlv/mcpsq.git
cd mcpsq
```

2. Install dependencies:
```bash
npm install
```

### Running the Server

Start the MCP server locally:

```bash
# Production mode
npm start

# Development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build
```

The server will start on `http://localhost:3000` and provide:
- SSE endpoint at `GET /mcp`
- Message handling at `POST /messages`

### Configuring Cursor MCP Integration

To use this MCP server with Cursor, add the following configuration to your Cursor MCP settings:

#### Option 1: Global Configuration
Create or edit `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "mcpsq": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

#### Option 2: Project-specific Configuration
Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "mcpsq": {
      "url": "http://localhost:3000/mcp"
    }
  }
}
```

### Available MCP Tools

Once configured, the following tools will be available in Cursor:

- **`find-mcp-server`**: Search for MCP servers relevant to your query
- **`add-mcp-server-to-cursor`**: Add an MCP server to your Cursor configuration
- **`list-current-mcp-servers`**: List all currently configured MCP servers
- **`remove-mcp-server-from-cursor`**: Remove an MCP server from your configuration

### Testing the Integration

1. Start the MCPSQ server locally
2. Configure Cursor with the MCP settings above
3. Restart Cursor or reload the MCP configuration
4. In Cursor chat, try asking: "Find MCP servers for database management"
5. The MCPSQ tools should appear in the available tools list

### Development Scripts

```bash
# Start the server in production mode
npm start

# Start the server in development mode with auto-reload
npm run dev

# Build TypeScript to JavaScript
npm run build

# Clean build directory
npm run clean

# Validate data files
npm run validate:data

# Type checking without emitting files
npm run typecheck
```

### Development Workflow

1. **Development**: Use `npm run dev` for development with automatic restart on file changes
2. **Type Checking**: Run `npm run typecheck` to check for TypeScript errors without building
3. **Building**: Use `npm run build` to compile TypeScript to JavaScript (automatically cleans first)
4. **Production**: Use `npm start` to run the compiled TypeScript directly with tsx

### Troubleshooting

- **Server not starting**: Check if port 3000 is available
- **Cursor not connecting**: Verify the MCP configuration file path and JSON syntax
- **Tools not appearing**: Check Cursor's MCP logs in the output panel
- **TypeScript errors**: Run `npm run typecheck` to see detailed error messages

## Data

The data is stored in the `data` directory.

## Contributing

Contributions are welcome! Please feel free to submit a pull request that updates the data in the [`data` directory](data).

## ROADMAP
- [x] handle env vars needed 
- [ ] publish to npmjs.com 

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.