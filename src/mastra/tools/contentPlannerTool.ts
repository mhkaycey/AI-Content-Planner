import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const contentPlannerTool = createTool({
  id: "generate-content-plan",
  description:
    "Generate a summary and multi-platform content plan based on a topic",
  inputSchema: z.object({
    topic: z.string().describe("The main topic or theme for the content plan"),
  }),
  outputSchema: z.object({
    summary: z.string().describe("A short summary explaining the topic"),
    titleSuggestions: z
      .array(z.string())
      .describe("Suggested titles for the topic"),
    keyPoints: z.array(z.string()).describe("Key talking points or subtopics"),
    schedule: z.string().describe("Recommended posting schedule"),
    platformPosts: z
      .record(z.string(), z.string())
      .describe("Platform-specific post examples, keyed by platform name"),
  }),
  execute: async ({ context }) => {
    const { topic } = context;

    // --- AI-like simulated logic (can be replaced with Gemini LLM call) ---
    const summary = `“${topic}” explores how modern innovations and strategies are shaping industries, behaviors, and opportunities. This topic highlights trends, challenges, and actionable insights to stay relevant in today’s fast-changing landscape.`;

    const titleSuggestions = [
      `${topic}: What You Need to Know in 2025`,
      `The Future of ${topic} — Key Trends and Strategies`,
      `A Beginner’s Guide to ${topic}`,
    ];

    const keyPoints = [
      `Overview of ${topic}`,
      `Why ${topic} matters in today's context`,
      `Main challenges and opportunities within ${topic}`,
      `Examples or case studies related to ${topic}`,
      `Practical takeaways or next steps`,
    ];

    const schedule = `Post related to "${topic}" every Tuesday and Friday at 10 AM to maintain consistent audience engagement.`;

    const platformPosts = {
      LinkedIn: `A professional thought-leadership post discussing how ${topic} is transforming the industry — include data or case studies.`,
      Twitter: `Quick insight: ${topic} is reshaping how we think about innovation and sustainability. Stay ahead or fall behind. #${topic.replace(/\s+/g, "")}`,
      Instagram: `Visual carousel showing “Before and After” of ${topic} trends, with simple captions and aesthetic design.`,
      YouTube: `5-minute explainer video on “The Rise of ${topic}” with visuals and expert insights.`,
      Blog: `In-depth article titled “How ${topic} is Redefining the Future” — include analysis, examples, and predictions.`,
      TikTok: `Short clip summarizing the main idea of ${topic} with engaging visuals and captions.`,
    };

    return {
      summary,
      titleSuggestions,
      keyPoints,
      schedule,
      platformPosts,
    };
  },
});
