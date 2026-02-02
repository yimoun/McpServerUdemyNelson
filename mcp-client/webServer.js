import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import bodyParser from "body-parser";

dotenv.config();

const LM_API_URL = "http://127.0.0.1:1234/v1/chat/completions";
const LM_MODEL = "qwen/qwen3-14b";
const SERVER_SCRIPT = process.env.MCP_SERVER_SCRIPT;

const app = express();
app.use(cors());
app.use(bodyParser.json());

let mcpClient = null;
let tools = [];

async function initMCP() {
  if (mcpClient) return;
  mcpClient = new Client({ name: "mcp-web", version: "1.0.0" });
  const isPy = SERVER_SCRIPT.endsWith(".py");
  const command = isPy
    ? process.platform === "win32" ? "python" : "python3"
    : process.execPath;
  const transport = new StdioClientTransport({ command, args: [SERVER_SCRIPT] });
  await mcpClient.connect(transport);
  const toolsResult = await mcpClient.listTools();
  tools = toolsResult.tools.map(tool => ({
    type: "function",
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
    }
  }));
  console.log("MCP client initialized with tools:", tools);
}

app.post("/chat", async (req, res) => {
  try {
    await initMCP();
    const query = req.body.query + " /no_think";
    const messages = [{ role: "user", content: query }];
    const payload = {
      model: LM_MODEL,
      messages,
      tools,
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
    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function?.name;
        let toolArgs = toolCall.function?.arguments;
        try { toolArgs = JSON.parse(toolArgs); } catch {}
        const toolCallId = toolCall.id;
        const result = await mcpClient.callTool({ name: toolName, arguments: toolArgs });
        messages.push({
          role: "tool",
          tool_call_id: toolCallId,
          name: toolName,
          content: result.content
        });
      }
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
      return res.json({ response: followupContent || "[No response from model]" });
    }
    return res.json({ response: msg?.content || "[No response from model]" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`MCP Web server running at http://localhost:${PORT}`);
});