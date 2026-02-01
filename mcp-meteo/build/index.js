import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
const server = new Server({
    name: "weather MCP-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
// Liste des outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "get-city-weather",
                description: "A tool to get the weather of the specified city.",
                inputSchema: {
                    type: "object",
                    properties: {
                        city: {
                            type: "string",
                            description: "The name of the city for which you want to know the current weather",
                        },
                    },
                    required: ["city"],
                },
            },
        ],
    };
});
// Gestion des appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "get-city-weather") {
        const city = String(request.params.arguments?.city);
        // Récupérer les coordonnées GPS de la ville
        const cityCoordinates = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`);
        const jsonData = await cityCoordinates.json();
        // Gestion des erreurs (ville non trouvée)
        if (!jsonData.results || jsonData.results.length === 0) {
            return {
                content: [
                    {
                        type: "text",
                        text: `City not found!`,
                    },
                ],
            };
        }
        // Si on a bien trouvé la ville
        const { latitude, longitude } = jsonData.results[0];
        const weatherData = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code&hourly=temperature_2m,precipitation&forecast_days=1`);
        const weatherJson = await weatherData.json();
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(weatherJson, null, 2),
                },
            ],
        };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
});
// Initialiser la communication
const transport = new StdioServerTransport();
server.connect(transport);
