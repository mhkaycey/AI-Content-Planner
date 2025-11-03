// import { Message } from "@mastra/core/a2a";
import { registerApiRoute } from "@mastra/core/server";
import { randomUUID } from "node:crypto";

export const a2aAgentRoute = registerApiRoute("/a2a/agent/:agentId", {
  method: "POST",
  handler: async (c) => {
    try {
      const mastra = c.get("mastra");

      const agentId = c.req.param("agentId");

      // Parse JSON-RPC 2.0 request

      const body = await c.req.json();
      const { jsonrpc, id: requestId, method, params } = body;

      // Validate JSON-RPC 2.0 format

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

      // Extract messages from params

      const { message, messages, contextId, taskId, metadata } = params || {};

      let messagesList = [];
      if (message) {
        messagesList = [message];
      } else if (messages && Array.isArray(messages)) {
        messagesList = messages;
      }

      // Convert A2A messages to Mastra format
      const mastraMessages = messagesList.map((msg) => ({
        role: msg.role,
        content:
          msg.parts
            ?.map((part: any) => {
              if (part.kind === "text") return part.text;
              if (part.kind === "data") return JSON.stringify(part.data);
              return "";
            })
            .join("\n") || "",
      }));

      // Execute agent

      const response = await agent.generate(mastraMessages);
      const agentText = response.text || "";

      const responseMessage = {
        messageId: randomUUID(),
        role: "agent",
        parts: [
          {
            kind: "text",
            text: agentText,
          },
        ],
        kind: "message",
      };

      // Convert Mastra response to A2A format and Build artifacts
      const artifacts = [
        {
          artifactId: randomUUID(),
          role: `${agentId}Response`,
          parts: [
            {
              kind: "text",
              text: agentText,
            },
          ],
        },
      ];

      //add tool results as artifacts

      if (response.toolResults && response.toolResults.length > 0) {
        artifacts.push({
          artifactId: randomUUID(),
          name: "ToolResults",
          //@ts-ignore
          parts: response.toolResults.map((result) => ({
            kind: "data",

            data: result,
          })),
        });

        // console.log("tool results", response.toolResults);
      }
      // Build conversation history
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
          task: {
            id: taskId ?? randomUUID(),
            contextId: contextId ?? randomUUID(),
            status: "completed",
            timestamp: new Date().toISOString(),
          },
          messages: [responseMessage],
          artifacts,
        },
        // result: {
        //   id: taskId || randomUUID(),
        //   contextId: contextId || randomUUID(),

        //   status: {
        //     status: "completed",
        //     timestamp: new Date().toISOString(),
        //     message: {
        //       messageId: randomUUID(),
        //       role: "agent",
        //       parts: [
        //         {
        //           kind: "text",
        //           text: agentText,
        //         },
        //       ],
        //       kind: "message",
        //     },
        //   },

        //   artifacts,
        //   history,

        //   //   metadata,
        //   kind: "task",
        // },
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
