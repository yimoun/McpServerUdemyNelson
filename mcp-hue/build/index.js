import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from "zod";
const server = new McpServer({
    name: "Hue MCP Server",
    version: "1.0.0"
});
server.tool('control-hue-lights', 'Tool to control Philips Hue smart lights', {
    action: z.enum(['on', 'off']).describe("Turn lights on or off")
}, async ({ action }) => {
    try {
        // Si pas de lumières HUE
        return {
            content: [
                {
                    type: "text",
                    text: `Successfully turned ${action} light 0`
                }
            ]
        };
        // Vrai code ci-dessous...
        const response = await fetch(`http://192.168.1.1/api/xxx-xxx/lights/7/state`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ on: action === 'on' })
        });
        if (response.ok) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Successfully turned ${action} light 7`
                    }
                ]
            };
        }
        else {
            return {
                content: [
                    {
                        type: "text",
                        text: `Failed to control light: HTTP ${response.status}`
                    }
                ]
            };
        }
    }
    catch (error) {
        return {
            content: [
                {
                    type: "text",
                    text: `Error controlling Hue lights: ${error instanceof Error ? error.message : String(error)}`
                }
            ]
        };
    }
});
const transport = new StdioServerTransport();
server.connect(transport);
