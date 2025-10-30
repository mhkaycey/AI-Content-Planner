import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { LibSQLStore } from "@mastra/libsql";
import { contentPlannerTool } from "../tools/contentPlannerTool.js";

export const contentPlannerAgent = new Agent({
  name: "Content Planner Agent",
  instructions: `
    You are an AI Content Strategist. 
    When the user provides a topic, generate:
    - A short, clear summary of the topic.
    - 2–3 engaging title ideas.
    - 4–5 key points or subtopics.
    - A suggested posting schedule.
    - Platform-specific post examples for LinkedIn, X (Twitter), Instagram, YouTube, Blog, and TikTok.

    Keep your tone professional but approachable.
    Avoid repetition. Keep everything under 200 words.
    Use the contentPlannerTool to perform these tasks.
  `,
  model: "google/gemini-2.0-flash",
  tools: { contentPlannerTool },

  memory: new Memory({
    storage: new LibSQLStore({
      url: "file:../mastra.db",
    }),
  }),
});
