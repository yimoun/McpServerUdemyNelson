import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "BDD MCP-server",
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
        name: "get-categories",
        description:
          "A tool to get a list of categories of the blog from the database",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get-articles-by-category",
        description:
          "A tool to get articles by category name from the database",
        inputSchema: {
          type: "object",
          properties: {
            categoryName: {
              type: "string",
              description: "The name of the category to fetch articles for",
            },
          },
          required: ["categoryName"],
        },
      },
      {
        name: "get-recent-errors",
        description:
          "Tool to fetch recent error logs from the server for debugging purposes",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "get-database-schema",
        description: "Tool to get database schema information",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
      {
        name: "create-user",
        description: "Tool to create a new user in the database",
        inputSchema: {
          type: "object",
          properties: {
            nom: {
              type: "string",
              description: "The name of the user",
            },
            email: {
              type: "string",
              description: "The email of the user",
            },
          },
          required: ["nom", "email"],
        },
      },
      {
        name: "get-users",
        description: "Tool to get a list of all users from the database",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Gestion des appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === "get-users") {
    try {
      const response = await fetch(`http://localhost:3000/utilisateurs`);

      const data = await response.json();
      if (data.message === "success") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.data, null, 2),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching users: ${data.message}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching users: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "get-categories") {
    try {
      const response = await fetch(`http://localhost:3000/categories`);

      const data = await response.json();
      if (data.message === "success") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.data, null, 2),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching categories: ${data.message}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching categories: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "get-articles-by-category") {
    const categoryName = String(request.params.arguments?.categoryName);

    if (!categoryName || categoryName.trim() === "") {
      return {
        content: [
          {
            type: "text",
            text: `Error: The 'categoryName' parameter is required.`,
          },
        ],
        isError: true,
      };
    }

    try {
      const response = await fetch(
        `http://localhost:3000/categories/nom/${encodeURIComponent(categoryName)}/articles`,
      );

      const data = await response.json();
      if (data.message === "success") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.data, null, 2),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching articles: ${data.message}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching articles: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "get-recent-errors") {
    try {
      const response = await fetch(`http://localhost:3000/logs/errors`);

      const data = await response.json();
      if (data.message === "success") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.data, null, 2),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching recent errors: ${data.message}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching recent errors: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "get-database-schema") {
    try {
      //TODO: Creer cette route
      const response = await fetch(`http://localhost:3000/schema`);

      const data = await response.json();
      if (data.message === "success") {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(data.data, null, 2),
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error fetching database schema: ${data.message}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error fetching database schema: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  if (request.params.name === "create-user") {
    const nom = String(request.params.arguments?.nom);
    const email = String(request.params.arguments?.email);

    if (!nom || nom === "undefined" || nom.trim() === "") {
      return {
        content: [
          {
            type: "text",
            text: "Error: nom is required",
          },
        ],
        isError: true,
      };
    }

    if (!email || email === "undefined" || email.trim() === "") {
      return {
        content: [
          {
            type: "text",
            text: "Error: email is required",
          },
        ],
        isError: true,
      };
    }

    try {
      const response = await fetch(`http://localhost:3000/utilisateurs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nom, email }),
      });

      const data = await response.json();
      if (data.message === "success") {
        return {
          content: [
            {
              type: "text",
              text: `User created successfully:\n${JSON.stringify(data.data, null, 2)}`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: "text",
              text: `Error creating user: ${data.error || data.message}`,
            },
          ],
          isError: true,
        };
      }
    } catch (error: unknown) {
      return {
        content: [
          {
            type: "text",
            text: `Error creating user: ${(error as Error).message}`,
          },
        ],
        isError: true,
      };
    }
  }

  return {
    content: [
      {
        type: "text",
        text: `Unknown tool: ${request.params.name}`,
      },
    ],
    isError: true,
  };
});
// Initialiser la communication
const transport = new StdioServerTransport();
server.connect(transport);
