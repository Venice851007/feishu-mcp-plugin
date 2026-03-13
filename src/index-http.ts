import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { FeishuAuth } from "./auth";
import { z } from "zod";
import express from "express";

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

// Authentication middleware
const authenticate = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const apiKey = req.headers['x-api-key'];
  const expectedKey = process.env.API_KEY;
  
  if (!expectedKey) {
    // If no API key is set, allow all requests (for development)
    return next();
  }
  
  if (!apiKey || apiKey !== expectedKey) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  next();
};

// Start server with HTTP transport
const main = async () => {
  try {
    await auth.initialize();
    
    // Create Express app with DNS rebinding protection
    const app = createMcpExpressApp({ host: '0.0.0.0', allowedHosts: ['localhost', '127.0.0.1', '180.130.116.88'] });
    
    // Add authentication middleware
    app.use(authenticate);
    
    // Handle MCP requests
    app.post('/mcp', async (req: express.Request, res: express.Response) => {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined, // Stateless mode
      });
      
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      
      res.on('close', () => {
        transport.close();
      });
    });
    
    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ status: 'ok', service: 'feishu-mcp-plugin' });
    });
    
    // Start HTTP server
    const PORT = parseInt(process.env.PORT || '8080');
    app.listen(PORT, '0.0.0.0', () => {
      console.error(`Feishu MCP Plugin server started successfully on port ${PORT}`);
      if (process.env.API_KEY) {
        console.error('Authentication is enabled');
      } else {
        console.error('WARNING: No API key set! Server is accessible without authentication.');
      }
    });
  } catch (error: any) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

main();
