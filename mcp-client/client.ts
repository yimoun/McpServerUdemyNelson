import readline from "readline/promises";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

dotenv.config();

const LM_API_URL = "http://127.0.0.1:1234/v1/chat/completions";
const LM_MODEL = "qwen/qwen3-14b"; // Remplacer par votre modèle

class MCPClient {
  private mcp: Client;
  private transport: StdioClientTransport | null = null;
  private tools: any[] = [];

  constructor() {
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string) {
    const isJs = serverScriptPath.endsWith(".js");
    const isPy = serverScriptPath.endsWith(".py");
    if (!isJs && !isPy) throw new Error("Server script must be a .js or .py file");
    const command = isPy
      ? process.platform === "win32" ? "python" : "python3"
      : process.execPath;
    this.transport = new StdioClientTransport({ command, args: [serverScriptPath] });
    await this.mcp.connect(this.transport);
    const toolsResult = await this.mcp.listTools();
    this.tools = toolsResult.tools.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.inputSchema,
      }
    }));
    console.log("Connected to server with tools:", this.tools.map(t => t.function.name));
  }

  async processQuery(query: string) {
    const messages: any[] = [{ role: "user", content: query + " /no_think" }];
    const payload = {
      model: LM_MODEL,
      messages,
      tools: this.tools,
      max_tokens: 1000,
      stream: false,
    };
    const response = await fetch(LM_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error("LM Studio API error");
    const data = await response.json();
    const msg = data.choices?.[0]?.message;
    const toolCalls = msg?.tool_calls || [];
    // Si tool_calls, on gère l'appel d'outil puis on relance la requête
    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function?.name;
        // Les arguments sont une string JSON, il faut parser
        let toolArgs = toolCall.function?.arguments;
        try { toolArgs = JSON.parse(toolArgs); } catch {}
        const toolCallId = toolCall.id;
        const result = await this.mcp.callTool({ name: toolName, arguments: toolArgs });
        messages.push({
          role: "tool",
          tool_call_id: toolCallId,
          name: toolName,
          content: result.content as string
        });
      }
      // Nouvelle requête avec la réponse de l'outil
      const followupPayload = {
        model: LM_MODEL,
        messages,
        max_tokens: 1000,
        stream: false,
      };
      const followupResp = await fetch(LM_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followupPayload),
      });
      const followupData = await followupResp.json();
      const followupContent = followupData.choices?.[0]?.message?.content;
      return followupContent || "[No response from model]";
    }
    // Sinon, on affiche la réponse directe
    return msg?.content || "[No response from model]";
  }

  async chatLoop() {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    try {
      console.log("\nMCP Client Started!");
      console.log("Type your queries or 'quit' to exit.");
      while (true) {
        const message = await rl.question("\nQuery: ");
        if (message.toLowerCase() === "quit") break;
        const response = await this.processQuery(message);
        console.log("\n" + response);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.log("Usage: node client.js <path_to_server_script>");
    return;
  }
  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
    process.exit(0);
  }
}

main();