import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Waiting Room MCP App Server (React)",
    version: "1.0.0",
  });

  // Two-part registration: tool + resource, tied together by the resource URI.
  const resourceUri = "ui://waiting-room/mcp-app.html";

  let currentGameContext: string | undefined = undefined;

  // Register a tool with UI metadata. When the host calls this tool, it reads
  // `_meta.ui.resourceUri` to know which resource to fetch and render as an
  // interactive UI.
  registerAppTool(server,
    "waiting-room",
    {
      title: "Waiting Room",
      description: "Keep the user occupied while the AI is working. Use this when you think the user will wait a lot for a full response so it do something meanwhile",
      inputSchema: {
        type: "object",
        properties: {
          game: {
            type: "string",
            description: "Optional game to show the user (e.g. 'clicker').",
          },
        },
      } as any, // sdk type doesn't perfectly match JSON Schema definition unfortunately
      _meta: { ui: { resourceUri } }, // Links this tool to its UI resource
    },
    async (args: Record<string, unknown>): Promise<CallToolResult> => {
      currentGameContext = args.game as string | undefined;
      return { content: [{ type: "text", text: `Opened waiting room. Requested game: ${args.game || 'none'}` }] };
    },
  );

  // Register a tool that the React UI can call on startup to find out what game to play.
  // This tool won't have the _meta.ui flag so it doesn't open the UI itself.
  server.tool(
    "get-current-game",
    "Returns the game requested by the user for the active waiting room session.",
    {},
    async () => {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ game: currentGameContext }),
          },
        ],
      };
    }
  );

  // Register the resource, which returns the bundled HTML/JavaScript for the UI.
  registerAppResource(server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, "mcp-app.html"), "utf-8");
      return {
        contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );

  return server;
}
