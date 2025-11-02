import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { contentPlannerAgent } from "./agents/contentPlannerAgent";
import { a2aAgentRoute } from "./routes/a2a-agent-route";

export const mastra = new Mastra({
  agents: { contentPlannerAgent },

  storage: new LibSQLStore({
    url: ":memory:",
  }),
  observability: {
    default: { enabled: true },
  },
  logger: new PinoLogger({
    name: "Mastra",
    level: "debug",
  }),

  server: {
    apiRoutes: [a2aAgentRoute],
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
  },
});
