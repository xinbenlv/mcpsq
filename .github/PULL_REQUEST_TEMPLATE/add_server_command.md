## Add Single MCP Server (Custom Command)

### MCP Server Information
**Server Name:** [e.g., custom-server, local-tool, etc.]
**Command/Executable:** [e.g., python, node, ./custom-script, etc.]
**Repository URL:** [GitHub repository URL]
**Description:** [Brief description of what this MCP server does]

### Configuration to Add
Please provide the exact configuration that will be added to the data file:

```json
{
  "mcpServers": {
    "[server-key]": {
      "command": "[command-to-run]",
      "args": [
        "[arg1]",
        "[arg2]",
        "[path/to/script]"
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

### Installation Requirements
**Prerequisites:** [e.g., Python 3.8+, Node.js 18+, specific system dependencies]
**Installation Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Data File Location
- [ ] Adding to existing file: `data/[filename].json`
- [ ] Creating new file: `data/[new-filename].json`

### Validation Checklist
- [ ] Command/executable is available on target systems
- [ ] JSON syntax is valid (tested with JSON validator)
- [ ] All required fields are present (`command`, `args`, `__manifest`)
- [ ] Repository URL is accessible and correct
- [ ] Installation instructions are clear and complete
- [ ] Environment variables are properly documented
- [ ] Tags are relevant and follow existing conventions

### Testing
- [ ] Tested command execution locally
- [ ] Verified all dependencies are available
- [ ] Verified the MCP server works with the provided configuration
- [ ] Tested locally with `npm run dev`
- [ ] Confirmed data appears correctly on [mcpsq.xyz](https://mcpsq.xyz)
- [ ] Tested on multiple platforms (if applicable)

### Server Quality
- [ ] The MCP server is actively maintained
- [ ] The server has proper documentation
- [ ] The server follows MCP protocol standards
- [ ] Installation requirements are clearly documented
- [ ] Cross-platform compatibility is documented

### Platform Compatibility
- [ ] macOS
- [ ] Windows
- [ ] Linux
- [ ] Other: [specify]

### Related Issues
Closes #[issue number] (if applicable)

### Additional Context
Add any other context, screenshots, installation notes, or information about this MCP server. 