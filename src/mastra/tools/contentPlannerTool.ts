import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const contentPlannerTool = createTool({
  id: "generate-content-plan",
  description:
    "Generate a summary and multi-platform content plan based on a topic or niche.",
  inputSchema: z.object({
    topic: z.string().describe("The main topic or niche for the content plan"),
  }),
  outputSchema: z.object({
    summary: z.string().describe("A short summary explaining the topic"),
    titleSuggestions: z
      .array(z.string())
      .describe("Suggested content titles related to the topic"),
    keyPoints: z.array(z.string()).describe("Key talking points or subtopics"),
    schedule: z.string().describe("Recommended posting schedule & frequency"),
    platformPosts: z
      .record(z.string(), z.string())
      .describe("Platform-specific content ideas, keyed by platform name"),
  }),
  execute: async ({ context }) => {
    const { topic } = context;

    // ---- AI-like simulated logic (can later be replaced with Gemini or OpenAI LLM call) ----
    const summary = `“${topic}” is a high-potential content theme that resonates with audiences seeking value, insights, and growth. This topic can be adapted for multiple platforms and formats to drive engagement, awareness, and authority.`;

    const titleSuggestions = [
      `${topic}: What You Must Know in 2025`,
      `The Rise of ${topic} — Trends, Insights & Strategy`,
      `${topic} for Beginners: Start Here`,
      `How ${topic} Is Changing Everything`,
      `Top 5 Things People Get Wrong About ${topic}`,
    ];

    const keyPoints = [
      `Introduction to ${topic}`,
      `Why ${topic} is relevant today`,
      `Major trends and misconceptions`,
      `Common mistakes and how to avoid them`,
      `Actionable strategies or tips`,
      `Real-life examples or case studies`,
    ];

    const schedule = `Recommended posting schedule for “${topic}”:
- **3x weekly** (Mon, Wed, Fri)
- Best times: **10 AM - 1 PM**, depending on platform
- Mix formats: Value posts, storytelling, tutorials, and engagement hooks`;

    const platformPosts = {
      Instagram: `Create a carousel titled "5 Things to Know About ${topic}" with simple visuals and clear swipe-worthy tips.`,
      TikTok: `30-45 sec storytelling or POV video: “I wish I knew this about ${topic} earlier…”`,
      YouTube: `6-8 minute educational breakdown: “${topic} Explained Simply — Examples & How to Start”`,
      LinkedIn: `Authority post: How ${topic} is transforming industries — include a stat, lesson, and CTA for discussion.`,
      X: `Hot take: ${topic} isn’t about the future — it’s the present. Those who ignore it will fall behind. Agree or disagree?`,
      Blog: `In-depth guide: “The Ultimate Beginner’s Guide to ${topic} in 2025” covering trends, tools, mistakes, and action steps.`,
      Threads: `Conversation starter: “What’s one misconception you had about ${topic} before you learned more?”`,
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
