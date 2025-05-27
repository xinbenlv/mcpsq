// Zod schema for the config file for Cursor and Claude

import z from "zod";

export const commandBasedMcpServerSchema = z.object({
  command: z.string(),
  args: z.array(z.string()),
  env: z.record(z.string(), z.string()).optional(),
});

export const urlBasedMcpServerSchema = z.object({
  url: z.string(),
  env: z.record(z.string(), z.string()).optional(),
});

export const manifestBasedMcpServerSchema = z.object({
  __manifest: z.object({
    name: z.string(),
    description: z.string().optional(),
    repository: z.string().optional(),
    author: z.string().optional(),
    license: z.string().optional(),
    version: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

export const defaultConfigSchema = z.object({
  mcpServers: z.record(z.string(), z.union([
    urlBasedMcpServerSchema,
    commandBasedMcpServerSchema,
    manifestBasedMcpServerSchema,
  ])),
});

export const cursorConfigSchema = defaultConfigSchema;
export const claudeConfigSchema = defaultConfigSchema;