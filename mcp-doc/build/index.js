import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const server = new Server({
    name: "Doc MCP-server",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
        resources: {},
    },
});
// Liste des outils disponibles
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "search-mdn-docs",
                description: "A tool to search technical documentation on MDN (Mozilla Developer Network).",
                inputSchema: {
                    type: "object",
                    properties: {
                        searchTerm: {
                            type: "string",
                            description: "The search term to look for in the MDN documentation",
                        },
                    },
                    required: ["searchTerm"],
                },
            },
            {
                name: "get-code-snippets",
                description: "Tool to get common code snippets and templates for various programming languages",
                inputSchema: {
                    type: "object",
                    properties: {
                        language: {
                            type: "string",
                            enum: ["javascript", "typescript", "python", "sql"],
                            description: "Programming language for the code snippets",
                        },
                    },
                    required: ["language"],
                },
            },
        ],
    };
});
// Liste des ressources disponibles
server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
        resources: [
            {
                uri: "code-conventions://conventions",
                name: "Code Conventions",
                description: "Project coding conventions and standards",
                mimeType: "application/json",
            },
            {
                uri: "doc://project-documentation",
                name: "Project Documentation",
                description: "Technical documentation of the project",
                mimeType: "text/markdown",
            },
        ],
    };
});
// Gestion de la lecture des ressources
server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const uri = request.params.uri;
    if (uri === "code-conventions://conventions") {
        const conventions = {
            javascript: {
                indentation: "2 spaces",
                quotes: "single",
                semicolons: true,
                naming: "camelCase for variables, PascalCase for classes",
            },
            git: {
                commitFormat: "type(scope): description",
                branchNaming: "feature/description, fix/description",
            },
            files: {
                maxLineLength: 100,
                encoding: "UTF-8",
            },
        };
        return {
            contents: [
                {
                    uri,
                    mimeType: "application/json",
                    text: JSON.stringify(conventions, null, 2),
                },
            ],
        };
    }
    if (uri === "doc://project-documentation") {
        try {
            // __dirname sera build/ après compilation, donc on remonte d'un niveau pour atteindre mcp-doc/
            const docPath = join(__dirname, "documentation.md");
            console.error(`[DEBUG] Attempting to read from: ${docPath}`);
            console.error(`[DEBUG] __dirname is: ${__dirname}`);
            const docContent = await readFile(docPath, "utf-8");
            console.error(`[DEBUG] Successfully read ${docContent.length} characters`);
            return {
                contents: [
                    {
                        uri,
                        mimeType: "text/markdown",
                        text: docContent,
                    },
                ],
            };
        }
        catch (error) {
            const docPath = join(__dirname, "documentation.md");
            console.error(`[ERROR] Failed to read from: ${docPath}`);
            console.error(`[ERROR] Error details:`, error);
            throw new Error(`Failed to read documentation from ${docPath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    throw new Error(`Unknown resource: ${uri}`);
});
// Gestion des appels d'outils
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "search-mdn-docs") {
        const searchTerm = String(request.params.arguments?.searchTerm);
        if (!searchTerm || searchTerm === "undefined" || searchTerm.trim() === "") {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error: The 'searchTerm' parameter is required.`,
                    },
                ],
                isError: true,
            };
        }
        try {
            const response = await fetch(`https://developer.mozilla.org/api/v1/search?q=${encodeURIComponent(searchTerm)}&locale=en-US`);
            if (!response.ok) {
                throw new Error(`Failed to fetch MDN docs for search term: ${searchTerm}`);
            }
            const data = await response.json();
            if (!data.documents || data.documents.length === 0) {
                return {
                    content: [
                        {
                            type: "text",
                            text: `No results found for: ${searchTerm}`,
                        },
                    ],
                };
            }
            const results = data.documents.slice(0, 10).map((doc) => {
                return `### ${doc.title}\n**URL:** ${doc.mdn_url}\n**Summary:** ${doc.summary}\n`;
            }).join('\n---\n');
            return {
                content: [
                    {
                        type: "text",
                        text: `# Search results for "${searchTerm}":\n\n${results}`,
                    },
                ],
            };
        }
        catch (error) {
            return {
                content: [
                    {
                        type: "text",
                        text: `Error searching MDN docs: ${error.message}`,
                    },
                ],
                isError: true,
            };
        }
    }
    if (request.params.name === "get-code-snippets") {
        const language = String(request.params.arguments?.language);
        if (!language ||
            !["javascript", "typescript", "python", "sql"].includes(language)) {
            return {
                content: [
                    {
                        type: "text",
                        text: "Error: The 'language' parameter must be one of: javascript, typescript, python, sql",
                    },
                ],
                isError: true,
            };
        }
        const snippets = {
            javascript: {
                asyncFunction: "async function example() {\n  try {\n    const result = await someAsyncOperation();\n    return result;\n  } catch (error) {\n    console.error(error);\n  }\n}",
                expressRoute: "app.get('/route', (req, res) => {\n  res.json({ message: 'success' });\n});",
            },
            typescript: {
                interface: "interface User {\n  id: number;\n  name: string;\n  email: string;\n}",
                genericFunction: "function identity<T>(arg: T): T {\n  return arg;\n}",
            },
            sql: {
                select: "SELECT column1, column2 FROM table WHERE condition;",
                insert: "INSERT INTO table (column1, column2) VALUES (?, ?);",
            },
            python: {
                function: "def example():\n    try:\n        result = some_async_operation()\n        return result\n    except Exception as error:\n        print(error)",
                list_comprehension: "[x for x in range(10) if x % 2 == 0]",
            },
        };
        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(snippets[language] || {}, null, 2),
                },
            ],
        };
    }
    throw new Error(`Unknown tool: ${request.params.name}`);
});
// Initialiser la communication
const transport = new StdioServerTransport();
server.connect(transport);
