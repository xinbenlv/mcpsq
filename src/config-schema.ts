// Zod schema for the config file for Cursor and Claude

import z from "zod";

export const commandBasedMcpServerSchema = z.object({
  command: z.string(),
  args: z.array(z.string()),
  env: z.record(z.string(), z.string()).optional(),
}).strict();

export const urlBasedMcpServerSchema = z.object({
  url: z.string().describe('URL of the remote MCP server'),
  env: z.record(z.string(), z.string()).optional().describe('Environment variables of the remote MCP server'),
}).strict();

export const manifestSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  repository: z.string().optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  version: z.string().optional(),
  tags: z.array(z.string()).optional(),
}).strict();

export const dockerConfigSchema = z.object({
  command: z.string(),
  args: z.array(z.string()),
}).strict();

export const pipConfigSchema = z.object({
  command: z.string(),
  args: z.array(z.string()),
}).strict();

// Complete MCP server schema that combines all possible fields
export const mcpServerSchema = z.object({
  // Core configuration (either command-based or url-based)
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  url: z.string().optional(),
  env: z.record(z.string(), z.string()).optional(),
  
  // Optional metadata and alternative configurations
  __manifest: manifestSchema.optional(),
  __docker: dockerConfigSchema.optional(),
  __pip: pipConfigSchema.optional(),
}).strict()
.refine((data) => {
  // Ensure either command+args OR url is provided (but not both)
  const hasCommand = data.command !== undefined && data.args !== undefined;
  const hasUrl = data.url !== undefined;
  return hasCommand !== hasUrl; // XOR: exactly one should be true
}, {
  message: "Server must have either (command + args) OR url, but not both"
});

export const defaultConfigSchema = z.object({
  mcpServers: z.record(z.string(), mcpServerSchema),
}).strict();

export const cursorConfigSchema = defaultConfigSchema;
export const claudeConfigSchema = defaultConfigSchema;