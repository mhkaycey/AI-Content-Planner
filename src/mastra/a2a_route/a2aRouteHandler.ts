import { Message } from "@mastra/core/a2a";
import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    try {
      const mastra = c.get("mastra");

      const agentId = c.req.param("agentId");

      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      if (jsonrpc !== "2.0" || !requestId) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId || null,
            error: {
              code: -32600,
              message:
                "Invalid Request: jsonrpc must be 2.0 and id is required",
            },
          },
          400
        );
      }

      const agent = mastra.getAgent(agentId);
      if (!agent) {
        return c.json(
          {
            jsonrpc: "2.0",
            id: requestId,
            error: {
              code: -32601,
              message: `Agent '${agentId}' not found`,
            },
          },
          400
        );
      }

      const { message, messages, contextId, taskId, metadata } = params || {};

      let messagesList = [];
      if (message) {
        messagesList = [message];
      } else if (messages && Array.isArray(messages)) {
        messagesList = messages;
      }

      // Convert A2A messages to Mastra format
      const mastraMessages = messagesList.map((msg: Message) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((part) => {
              if (part.kind === "text") return part.text;
              if (part.kind === "data") return JSON.stringify(part.data);
              return "";
            })
            .join("\n") || "",
      }));

      const response = await agent.generate(
        mastraMessages.map((msg) => `${msg.role}: ${msg.content}`)
      );
      const agentText = response.text || "";

      const artifacts = [
        {
          artifactId: randomUUID(),
          role: `${agentId}Response`,
          description: "Agent response",

          parts: [
            {
              kind: "text",
              text: agentText,
            },
          ],
        },
      ];

      if (response.toolResults && response.toolResults.length > 0) {
        artifacts.push({
          artifactId: randomUUID(),
          name: "ToolResults",
          //@ts-ignore
          parts: response.toolResults.map((result) => ({
            kind: "text",
            text: result,
          })),
        });
      }

      const history = [
        ...messagesList.map((msg) => ({
          kind: "message",
          role: msg.role,
          parts: msg.parts,
          messageId: msg.messageId || randomUUID(),
          taskId: msg.taskId || taskId || randomUUID(),
        })),
        {
          kind: "message",
          role: "agent",
          parts: [
            {
              kind: "text",
              text: agentText,
            },
          ],
          messageId: randomUUID(),
          taskId: taskId || randomUUID(),
        },
      ];

      return c.json({
        jsonrpc: "2.0",
        id: requestId,
        result: {
          id: taskId || randomUUID(),
          contextId: contextId || randomUUID(),

          status: {
            status: "completed",
            timestamp: new Date().toISOString(),
            message: {
              messageId: randomUUID(),
              role: "agent",
              parts: [
                {
                  kind: "text",
                  text: agentText,
                },
              ],
              kind: "message",
            },
          },

          artifacts,
          history,

          //   metadata,
          kind: "task",
        },
      });
    } catch (error) {
      return c.json(
        {
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32603,
            message: "Internal error",
            data: { details: error },
          },
        },
        500
      );
    }
  },
});
