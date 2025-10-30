import { createStep, createWorkflow } from "@mastra/core/workflows";
import { z } from "zod";

const contentPlanSchema = z.object({
  topic: z.string().describe("The main topic or theme for the content"),
  audience: z.string().describe("The target audience for the content"),
  platform: z.string().describe("The platform for content distribution"),
  goals: z.string().describe("The goals of the content"),
  titleSuggestions: z
    .array(z.string())
    .optional()
    .describe("Suggested titles for the content"),
  keyPoints: z
    .array(z.string())
    .optional()
    .describe("Key points or sections to cover"),
  schedule: z.string().optional().describe("Suggested posting schedule"),
});

const gatherContentInput = createStep({
  id: "gather-content-input",
  description: "Gathers and validates input for the content plan",
  inputSchema: z.object({
    topic: z.string().describe("The main topic or theme for the content"),
    audience: z
      .string()
      .optional()
      .describe("The target audience for the content"),
    platform: z
      .string()
      .optional()
      .describe(
        "The platform for content distribution (e.g., blog, Twitter, LinkedIn)"
      ),
    goals: z
      .string()
      .optional()
      .describe(
        "The goals of the content (e.g., engagement, education, conversion)"
      ),
  }),
  outputSchema: contentPlanSchema,
  execute: async ({ inputData }) => {
    if (!inputData) {
      throw new Error("Input data not found");
    }

    const {
      topic,
      audience = "general audience",
      platform = "blog",
      goals = "engagement",
    } = inputData;

    if (!topic) {
      throw new Error("Topic is required");
    }

    return {
      topic,
      audience,
      platform,
      goals,
    };
  },
});

const generateContentPlan = createStep({
  id: "generate-content-plan",
  description: "Generates a structured content plan based on input",
  inputSchema: contentPlanSchema,
  outputSchema: z.object({
    contentPlan: z.string().describe("Formatted content plan"),
  }),
  execute: async ({ inputData, mastra }) => {
    const { topic, audience, platform, goals } = inputData;

    if (!inputData) {
      throw new Error("Input data not found");
    }

    const agent = mastra?.getAgent("contentPlannerAgent");
    if (!agent) {
      throw new Error("Content Planner Agent not found");
    }

    const prompt = `Based on the following input, generate a structured content plan:
      {
        "topic": "${topic}",
        "audience": "${audience}",
        "platform": "${platform}",
        "goals": "${goals}"
      }

      Structure your response exactly as follows:

      📅 CONTENT PLAN
      ═══════════════════════════

      📋 OVERVIEW
      • Topic: ${topic}
      • Audience: ${audience}
      • Platform: ${platform}
      • Goals: ${goals}

      📝 TITLE SUGGESTIONS
      • [Title 1]
      • [Title 2]
      • [Title 3]

      🔑 KEY POINTS
      • [Key point or section 1]
      • [Key point or section 2]
      • [Key point or section 3]
      • [Key point or section 4]

      🕒 POSTING SCHEDULE
      • [Suggested posting time and frequency, tailored to platform]

      💡 TIPS FOR SUCCESS
      • [Tip 1 specific to audience or platform]
      • [Tip 2 specific to goals]
      • [Tip 3 for optimization, e.g., SEO, hashtags, or engagement]

      Guidelines:
      - Suggest 3 specific, catchy titles tailored to the audience and platform.
      - Provide 3-5 key points or sections to cover in the content.
      - Tailor the schedule to the platform (e.g., daily for Twitter, weekly for blogs).
      - Include 2-3 actionable tips for optimizing content performance.
      - Keep descriptions concise but informative.
      - Use the exact formatting with emoji and section headers as shown.
    `;

    let contentPlanText = "";

    const response = await agent.stream([
      {
        role: "user",
        content: prompt,
      },
    ]);

    for await (const chunk of response.textStream) {
      process.stdout.write(chunk);
      contentPlanText += chunk;
    }

    return {
      contentPlan: contentPlanText,
    };
  },
});

const contentPlannerWorkflow = createWorkflow({
  id: "content-planner-workflow",
  inputSchema: z.object({
    topic: z.string().describe("The main topic or theme for the content"),
    audience: z
      .string()
      .optional()
      .describe("The target audience for the content"),
    platform: z
      .string()
      .optional()
      .describe("The platform for content distribution"),
    goals: z.string().optional().describe("The goals of the content"),
  }),
  outputSchema: z.object({
    contentPlan: z.string().describe("Formatted content plan"),
  }),
})
  .then(gatherContentInput)
  .then(generateContentPlan);

contentPlannerWorkflow.commit();

export { contentPlannerWorkflow };
