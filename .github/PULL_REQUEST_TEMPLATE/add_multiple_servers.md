## Add Multiple MCP Servers

### Overview
**Number of servers:** [e.g., 3 servers]
**Category/Theme:** [e.g., AI tools, Development utilities, Data processing, etc.]
**Description:** [Brief description of the collection being added]

### MCP Servers List
Please list all servers being added:

1. **[Server 1 Name]** - [Brief description]
2. **[Server 2 Name]** - [Brief description]
3. **[Server 3 Name]** - [Brief description]

### Configuration to Add
Please provide the complete configuration for all servers:

```json
{
  "mcpServers": {
    "[server-1-key]": {
      "command": "[command]",
      "args": ["[args]"],
      "env": {
        "[ENV_VAR]": "[description]"
      },
      "__manifest": {
        "name": "[server 1 name]",
        "description": "[server 1 description]",
        "repository": "[repository URL]",
        "tags": ["[tag1]", "[tag2]"]
      },
      "__docker": {
        "command": "docker",
        "args": [
          "run", "-i", "--rm",
          "[additional-docker-args]",
          "[docker-image-name]"
        ]
      },
      "__pip": {
        "command": "python",
        "args": ["-m", "[pip-module-name]"]
      }
    },
    "[server-2-key]": {
      "command": "[command]",
      "args": ["[args]"],
      "env": {
        "[ENV_VAR]": "[description]"
      },
      "__manifest": {
        "name": "[server 2 name]",
        "description": "[server 2 description]",
        "repository": "[repository URL]",
        "tags": ["[tag1]", "[tag2]"]
      },
      "__docker": {
        "command": "docker",
        "args": [
          "run", "-i", "--rm",
          "[additional-docker-args]",
          "[docker-image-name]"
        ]
      },
      "__pip": {
        "command": "python",
        "args": ["-m", "[pip-module-name]"]
      }
    }
  }
}
```

### Data File Strategy
- [ ] Adding all to existing file: `data/[filename].json`
- [ ] Creating new themed file: `data/[new-filename].json`
- [ ] Splitting across multiple files (explain strategy below)

**File organization strategy:** [Explain how you're organizing these servers]

### Validation Checklist (All Servers)
- [ ] All JSON syntax is valid (tested with JSON validator)
- [ ] All required fields are present for each server (`command`, `args`, `__manifest`)
- [ ] All repository URLs are accessible and correct
- [ ] All NPM packages exist and are installable (if applicable)
- [ ] All Docker images exist and are accessible (if applicable)
- [ ] All pip packages exist and are installable (if applicable)
- [ ] All environment variables are properly documented
- [ ] Tags are consistent and follow existing conventions
- [ ] No duplicate server keys across the collection

### Testing (All Servers)
- [ ] Tested all servers individually
- [ ] Verified no conflicts between servers
- [ ] All servers work with their provided configurations
- [ ] Tested locally with `npm run dev`
- [ ] Confirmed all data appears correctly on [mcpsq.xyz](https://mcpsq.xyz)
- [ ] No breaking changes to existing functionality

### Server Quality (All Servers)
- [ ] All MCP servers are actively maintained
- [ ] All servers have proper documentation
- [ ] All servers follow MCP protocol standards
- [ ] Dependencies are clearly documented for each server
- [ ] Installation requirements are documented

### Individual Server Details

#### Server 1: [Name]
- **Repository:** [URL]
- **Type:** [ ] NPM Package [ ] Custom Command [ ] Docker [ ] Pip Package
- **Docker Image:** [docker-image-name or N/A]
- **Docker Args:** [additional docker arguments or N/A]
- **Pip Module:** [pip-module-name or N/A]
- **Special Requirements:** [Any special notes]

#### Server 2: [Name]
- **Repository:** [URL]
- **Type:** [ ] NPM Package [ ] Custom Command [ ] Docker [ ] Pip Package
- **Docker Image:** [docker-image-name or N/A]
- **Docker Args:** [additional docker arguments or N/A]
- **Pip Module:** [pip-module-name or N/A]
- **Special Requirements:** [Any special notes]

#### Server 3: [Name]
- **Repository:** [URL]
- **Type:** [ ] NPM Package [ ] Custom Command [ ] Docker [ ] Pip Package
- **Docker Image:** [docker-image-name or N/A]
- **Docker Args:** [additional docker arguments or N/A]
- **Pip Module:** [pip-module-name or N/A]
- **Special Requirements:** [Any special notes]

### Rationale for Bulk Addition
**Why add these together:** [Explain why these servers are being added as a group]
**Common theme/use case:** [Describe the common use case or theme]

### Related Issues
Closes #[issue number] (if applicable)

### Additional Context
Add any other context, screenshots, or information about this collection of MCP servers. 