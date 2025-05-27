---
name: MCP Server Request
about: Request a new MCP server to be added to the collection
title: '[REQUEST] Add [Server Name] MCP Server'
labels: ['enhancement', 'mcp-server']
assignees: ''

---

## MCP Server Request

### Server Information
**Name:** [Server Name]
**Description:** [Brief description of what this MCP server does]
**Repository URL:** [GitHub repository URL]
**NPM Package:** [NPM package name if available]

### Configuration Example
Please provide the configuration that should be added to the data directory:

```json
{
  "mcpServers": {
    "[server-key]": {
      "command": "[command to run]",
      "args": [
        "[arg1]",
        "[arg2]"
      ],
      "env": {
        "[ENV_VAR]": "[description or placeholder value]"
      },
      "__manifest": {
        "name": "[server name]",
        "description": "[server description]",
        "repository": "[repository URL]",
        "tags": ["[tag1]", "[tag2]", "[tag3]"]
      }
    }
  }
}
```

### Example (based on existing github.json):
```json
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-github"
      ],
      "env": {
        "GITHUB_TOKEN": "<Your GitHub token here>"
      },
      "__manifest": {
        "name": "github",
        "description": "GitHub MCP Server (Official)",
        "repository": "https://github.com/github/github-mcp-server",
        "tags": [
          "github",
          "mcp",
          "modelcontextprotocol",
          "omcp"
        ]
      }
    }
  }
}
```

### Additional Information
- [ ] I have tested this MCP server locally
- [ ] The server is actively maintained
- [ ] The server has proper documentation
- [ ] Required environment variables are documented

### Use Case
Describe how this MCP server would be useful and what functionality it provides.

### Dependencies
List any special dependencies or requirements for this MCP server. 