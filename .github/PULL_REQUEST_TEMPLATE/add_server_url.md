## Add Single MCP Server (URL/NPM Package)

### MCP Server Information
**Server Name:** [e.g., github, filesystem, etc.]
**NPM Package:** [e.g., @modelcontextprotocol/server-github]
**Repository URL:** [GitHub repository URL]
**Description:** [Brief description of what this MCP server does]

### Configuration to Add
Please provide the exact configuration that will be added to the data file:

```json
{
  "mcpServers": {
    "[server-key]": {
      "command": "npx",
      "args": [
        "-y",
        "[npm-package-name]"
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

### Data File Location
- [ ] Adding to existing file: `data/[filename].json`
- [ ] Creating new file: `data/[new-filename].json`

### Validation Checklist
- [ ] NPM package exists and is installable (`npm info [package-name]`)
- [ ] JSON syntax is valid (tested with JSON validator)
- [ ] All required fields are present (`command`, `args`, `__manifest`)
- [ ] Repository URL is accessible and correct
- [ ] Environment variables are properly documented
- [ ] Tags are relevant and follow existing conventions

### Testing
- [ ] Tested NPM package installation locally
- [ ] Verified the MCP server works with the provided configuration
- [ ] Tested locally with `bun run src/index.ts`
- [ ] Confirmed data appears correctly on [mcpsq.xyz](https://mcpsq.xyz)

### Server Quality
- [ ] The MCP server is actively maintained
- [ ] The server has proper documentation
- [ ] The server follows MCP protocol standards
- [ ] Required dependencies are clearly documented
- [ ] Package has reasonable download statistics

### Related Issues
Closes #[issue number] (if applicable)

### Additional Context
Add any other context, screenshots, or information about this MCP server. 