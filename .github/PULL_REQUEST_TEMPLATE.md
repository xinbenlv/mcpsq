## Pull Request

### Type of Change
Please select the type of change this PR introduces:

- [ ] Adding new MCP server
- [ ] Updating existing MCP server information
- [ ] Fixing data errors or bugs
- [ ] Documentation update
- [ ] Other (please describe):

### MCP Server Details (if applicable)
**Server Name:** [e.g., github, filesystem, etc.]
**Configuration File:** [e.g., data/github.json, data/new-server.json]
**Repository URL:** [GitHub repository URL]
**NPM Package:** [NPM package name if available]

### Description
A clear and concise description of the changes made.

### Configuration Changes
Please provide the configuration being added or modified:

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

### Data Validation Checklist
- [ ] JSON syntax is valid (tested with JSON validator)
- [ ] All required fields are present (`command`, `args`, `__manifest`)
- [ ] Repository URLs are accessible and correct
- [ ] NPM package exists and is installable (if applicable)
- [ ] Environment variables are properly documented
- [ ] Tags are relevant and follow existing conventions

### Testing
- [ ] Tested locally with `bun run src/index.ts`
- [ ] Verified the MCP server works as expected
- [ ] Confirmed data appears correctly on [mcpsq.xyz](https://mcpsq.xyz)
- [ ] No breaking changes to existing functionality

### Server Quality (for new servers)
- [ ] The MCP server is actively maintained
- [ ] The server has proper documentation
- [ ] The server follows MCP protocol standards
- [ ] Required dependencies are clearly documented

### Related Issues
Closes #[issue number] (if applicable)

### Additional Context
Add any other context, screenshots, or information about the changes.

### Environment (if reporting a fix)
- OS: [e.g., macOS, Windows, Linux]
- Node.js version: [e.g., 18.0.0]
- Bun version: [e.g., 1.0.0] 