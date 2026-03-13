import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { FeishuAuth } from "./auth";
import { z } from "zod";

// Initialize Feishu authentication
const auth = new FeishuAuth();

// Create MCP Server
const server = new McpServer(
  {
    name: "feishu-mcp-plugin",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register tools
server.registerTool(
  "create_document",
  {
    title: "Create Feishu Document",
    description: "Create a new Feishu document",
    inputSchema: z.object({
      title: z.string(),
      content: z.string().optional(),
      folderToken: z.string().optional(),
    }),
  },
  async ({ title, content, folderToken }) => {
    try {
      const client = await auth.getClient();
      // Note: Feishu document creation would require actual API call
      // This is a placeholder for the structure
      return {
        content: [{ type: "text" as const, text: `Document created: ${title}` }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "send_message",
  {
    title: "Send Feishu Message",
    description: "Send a message to a Feishu chat",
    inputSchema: z.object({
      chat_id: z.string(),
      content: z.string(),
      msg_type: z.string().default("text"),
    }),
  },
  async ({ chat_id, content, msg_type }) => {
    try {
      const client = await auth.getClient();
      // Note: Feishu message sending would require actual API call
      // This is a placeholder for the structure
      return {
        content: [{ type: "text" as const, text: `Message sent to ${chat_id}: ${content}` }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "create_calendar_event",
  {
    title: "Create Feishu Calendar Event",
    description: "Create a calendar event in Feishu",
    inputSchema: z.object({
      summary: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      description: z.string().optional(),
      calendar_id: z.string().optional(),
    }),
  },
  async ({ summary, start_time, end_time, description, calendar_id }) => {
    try {
      const client = await auth.getClient();
      // Note: Feishu calendar event creation would require actual API call
      // This is a placeholder for the structure
      return {
        content: [{ type: "text" as const, text: `Calendar event created: ${summary}` }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

server.registerTool(
  "search_documents",
  {
    title: "Search Feishu Documents",
    description: "Search Feishu documents",
    inputSchema: z.object({
      query: z.string(),
      search_scope: z.string().default("all"),
    }),
  },
  async ({ query, search_scope }) => {
    try {
      const client = await auth.getClient();
      // Note: Feishu search API may vary, this is a placeholder
      return {
        content: [{ type: "text" as const, text: `Search query: ${query} (Search functionality would be implemented here)` }],
      };
    } catch (error: any) {
      return {
        content: [{ type: "text" as const, text: `Error: ${error.message}` }],
        isError: true,
      };
    }
  }
);

// Start server
const main = async () => {
  try {
    await auth.initialize();
    
    // Connect to stdio transport for local usage
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error("Feishu MCP Plugin server started successfully");
  } catch (error: any) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

main();
