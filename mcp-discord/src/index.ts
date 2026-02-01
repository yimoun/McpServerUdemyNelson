import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1467585606363119684/XicXxAL2D5RolewFD7uug6zVsR5Hb-QnRn3D87T_qp5mIOBEW1MRZoX_ha9jE40h4IEO";

const server = new Server(
  {
    name: "Discord MCP-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Liste des outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "send-discord-message",
        description: "A tool to send a message on Discord.",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description:
                "The message to send on Discord",
            },
          },
          required: ["message"],
        },
      },
    ],
  };
});

// Gestion des appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "send-discord-message") {
    const message = String(request.params.arguments?.message);

    // Validation côté serveur : vérifier que message est bien fournie
    if (!message || message === "undefined" || message.trim() === "") {
      return {
        content: [
          {
            type: "text",
            text: `Error: The 'message' parameter is required.`,
          },
        ],
        isError: true,
      };
    }

    try {
         // Envoyer le message à Discord via le webhook
        const response = await fetch(DISCORD_WEBHOOK_URL, {
             method: "POST",
             headers: {
                "Content-Type": "application/json",
         },
            body: JSON.stringify({
                content: message,
            }),
        });

        if(!response.ok) {
            throw new Error(`Failed to send message to Discord: ${response.statusText}`);
        }

        return {
            content: [
                {
                    type: "text",
                    text: `Message sent to Discord successfully.`,
                },
            ],
            isError: false,
        };
    } catch (error:unknown) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error sending message to Discord: ${(error as Error).message}`,
                },
            ],
            isError: true,
        };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

// Initialiser la communication
const transport = new StdioServerTransport();
server.connect(transport);
