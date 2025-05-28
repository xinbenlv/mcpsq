# AWESOME MCP Servers Data


## Data Convention
1. *filename*: The file name should be the github handle the publisher of the MCP server, such as [github](github.com/github) and [modelcontextprotocol](https://github.com/modelcontextprotocol)

2. the data content should follow the schema defined in [config-schema.ts](../src/config-schema.ts)

3. you can use [this example link to creat a PR](https://github.com/xinbenlv/mcpsq/new/main?filename=data/your-github-handle.json&value=%7B%0A%20%20%22mcpServers%22%3A%20%7B%0A%20%20%20%20%22repo-name%22%3A%20%7B%0A%20%20%20%20%20%20%22url%22%3A%20%22https%3A%2F%2Fyour-remote-mcp-url.example.com%22%2C%0A%20%20%20%20%20%20%22env%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22YOUR_ENV_SECRET_NAME%22%3A%20%22%3CYour%20env%20secret%20value%3E%22%0A%20%20%20%20%20%20%7D%2C%0A%20%20%20%20%20%20%22__manifest%22%3A%20%7B%0A%20%20%20%20%20%20%20%20%22name%22%3A%20%22name%22%2C%0A%20%20%20%20%20%20%20%20%22description%22%3A%20%22%3Cdesription%3E%22%2C%0A%20%20%20%20%20%20%20%20%22repository%22%3A%20%22%3Cgithub%20repo%20link%3E%22%2C%0A%20%20%20%20%20%20%20%20%22tags%22%3A%20%5B%0A%20%20%20%20%20%20%20%20%20%20%22tag1%22%2C%0A%20%20%20%20%20%20%20%20%20%20%22tag2%22%0A%20%20%20%20%20%20%20%20%5D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D)
