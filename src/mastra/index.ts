import { Mastra } from "@mastra/core/mastra";
import { PinoLogger } from "@mastra/loggers";
import { LibSQLStore } from "@mastra/libsql";
import { contentPlannerWorkflow } from "./workflows/contentPlannerWorkflow";
import { contentPlannerAgent } from "./agents/contentPlannerAgent";
import {
  toolCallAppropriatenessScorer,
  completenessScorer,
  relevanceScorer,
} from "./scores/contentPlannerScores";
import { a2aAgentRoute } from "./a2a_route/a2aRouteHandler";

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
    build: {
      openAPIDocs: true,
      swaggerUI: true,
    },
    apiRoutes: [a2aAgentRoute],
  },
});
