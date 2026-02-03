import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

// Configuration de sécurité
const EXPECTED_API_KEY = "abc123";

// Récupération de la clé API depuis les arguments de ligne de commande
const apiKey = process.argv
  .find((arg) => arg.startsWith("--api-key="))
  ?.split("=")[1];

// Validation de la clé API
function validateApiKey(): boolean {
  // TODO: Chercher si la clé api existe en BDD et si elle est valide
  
  return apiKey === EXPECTED_API_KEY;
}

// Fonction utilitaire pour vérifier l'authentification
function requireAuth<T extends any[]>(originalHandler: (...args: T) => any) {
  return (...args: T) => {
    if (!validateApiKey()) {
      throw new Error(
        `Unauthorized: Invalid or missing API key. Please provide --api-key=${EXPECTED_API_KEY}`,
      );
    }
    return originalHandler(...args);
  };
}

const server = new Server(
  {
    name: "simple-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// Gérer les requêtes de la liste des outils
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "reverse-word",
        description: "Inverse un mot ou une phrase (outil public)",
        inputSchema: {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "Le texte à inverser",
            },
          },
          required: ["text"],
        },
      },
      {
        name: "get-weather",
        description:
          "Obtient la météo d'une ville (outil PREMIUM - nécessite API key)",
        inputSchema: {
          type: "object",
          properties: {
            city: {
              type: "string",
              description: "Le nom de la ville",
            },
          },
          required: ["city"],
        },
      },
    ],
  };
});

// Gérer les appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "reverse-word") {
    // Outil PUBLIC - pas d'authentification requise
    if (!args) {
      throw new Error("Missing arguments");
    }
    const text = args.text as string;
    const reversed = text.split("").reverse().join("");
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              original: text,
              reversed: reversed,
              type: "PUBLIC",
            },
            null,
            2,
          ),
        },
      ],
    };
  }

  if (name === "get-weather") {
    // Outil PREMIUM - authentification requise
    if (!args) {
      throw new Error("Missing arguments");
    }
    return requireAuth(async () => {
      const city = args.city as string;
      // Simulation de données météo
      const weatherData = {
        city: city,
        temperature: Math.floor(Math.random() * 30) + 5,
        condition: ["Ensoleillé", "Nuageux", "Pluvieux", "Neigeux"][
          Math.floor(Math.random() * 4)
        ],
        humidity: Math.floor(Math.random() * 60) + 40,
        type: "PREMIUM",
      };
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(weatherData, null, 2),
          },
        ],
      };
    })();
  }

  throw new Error(`Unknown tool: ${name}`);
});

// Initialiser la communication
const transport = new StdioServerTransport();
server.connect(transport);
