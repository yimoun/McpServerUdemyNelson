import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListResourcesRequestSchema, ListResourceTemplatesRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";

const server = new Server({
    name: "simple-server",
    version: "1.0.0",
}, {
    // capacités du serveur: indique qu'il gère les ressources 
    capabilities: {
        resources: {}
    }
});

// Gérer les requêtes de la liste des ressources
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            // Définition d'une ressource de journalisation
            {
                uri: "file:///logs/app.log",
                name: "Logs server",
                mimeType: "text/plain"
            }
        ]
    };
});


// Gérer les requêtes de lecture de ressource et prend paramètre l'URI de la ressource à lire
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === "file:///logs/app.log") {
        // Simuler la lecture du contenu du journal
        const logContent = "0 problems found on server.";
        return {
            contents: [
                {
                    uri,
                    mimeType: "text/plain",
                    text: logContent
                }
            ]
        };
    } 
    throw new Error("Resource not found");
});

// Initialiser la communication
const transport = new StdioServerTransport();
server.connect(transport);
