// Importer les ressources nécessaires au développement du serveur MCP
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

//  Créatrion du serveur 
const server = new McpServer({
  name: 'Basic MCP Server',
  version: '1.0.0',
});

// Creation d'un outil / tool
server.tool(
    'reverse-word',  // Nom (ID) de l'outil
    'Tool to ping the MCP server',  // Description de l'outil (pour permettre à l'agent de le comprendre ce que fait l'outil)
    {
        word: z.string().describe('The word to be reversed'),  // Schéma des paramètres d'entrée
    },  // Schéma des paramètres d'entrée
    // Fonction à exécuter lorsque l'outil est appelé
    async({ word }) => {
        const reversedWord = word.split('').reverse().join('');
        return {
            content: [
                {
                    type: 'text',
                    text: `The word ${word} reversed is equal to ${reversedWord}`
                }
            ]
        };
    }
);

// Initialiser la communicatrion
const transport = new StdioServerTransport();
server.connect(transport);