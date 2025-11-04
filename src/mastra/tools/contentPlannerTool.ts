import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

export const contentPlannerTool = createTool({
  id: "contentPlannerTool",
  description:
    "Generate a comprehensive, multi-platform content plan based on a topic or niche. Returns strategic summaries, title suggestions, key talking points, posting schedules, and platform-specific content ideas for Instagram, TikTok, YouTube, LinkedIn, X, Blog, and Threads.",
  inputSchema: z.object({
    topic: z
      .string()
      .describe("The main topic, niche, or content theme for the content plan"),
    targetAudience: z
      .string()
      .optional()
      .describe("Optional: Description of the target audience"),
    contentGoal: z
      .string()
      .optional()
      .describe(
        "Optional: Primary goal (e.g., awareness, engagement, conversions, authority)"
      ),
  }),
  outputSchema: z.object({
    summary: z
      .string()
      .describe(
        "A strategic overview explaining the topic's value and potential"
      ),
    titleSuggestions: z
      .array(z.string())
      .describe("5 engaging, platform-agnostic content title ideas"),
    keyPoints: z
      .array(z.string())
      .describe("6-8 key talking points, subtopics, or content angles"),
    schedule: z
      .string()
      .describe(
        "Recommended posting frequency, best times, and content mix strategy"
      ),
    platformPosts: z
      .record(z.string(), z.string())
      .describe(
        "Platform-specific content ideas optimized for each platform's format and audience"
      ),
  }),

  execute: async ({ context }) => {
    const { topic, targetAudience, contentGoal } = context;

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing GOOGLE_GENERATIVE_AI_API_KEY in environment variables"
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    // Build dynamic prompt based on available context
    let contextInfo = "";
    if (targetAudience) {
      contextInfo += `\nTarget Audience: ${targetAudience}`;
    }
    if (contentGoal) {
      contextInfo += `\nContent Goal: ${contentGoal}`;
    }

    const prompt = `You are an expert content strategist specializing in multi-platform content planning. Generate a comprehensive, actionable content plan for the following topic:

**Topic**: "${topic}"${contextInfo}

Return ONLY a valid JSON object with NO markdown formatting, NO code blocks, NO explanations - just raw JSON with this exact structure:

{
  "summary": "A compelling 2-3 sentence overview explaining why this topic is valuable, timely, and engaging for the target audience. Focus on the strategic opportunity.",
  "titleSuggestions": [
    "5 unique, attention-grabbing title ideas that work across platforms",
    "Make them specific, benefit-driven, and emotionally resonant",
    "Include variety: how-to, listicles, contrarian takes, beginner guides, and trend pieces"
  ],
  "keyPoints": [
    "6-8 key talking points, subtopics, or content angles",
    "Each should be specific enough to build a full piece of content around",
    "Include: fundamentals, common mistakes, trends, actionable strategies, examples, and misconceptions"
  ],
  "schedule": "Provide a detailed posting schedule including: frequency (e.g., 3x/week), best days/times based on platform research, content format mix (educational, engagement, storytelling), and consistency tips",
  "platformPosts": {
    "Instagram": "Specific content idea optimized for Instagram (Reels, carousels, Stories). Include format, hook, and engagement strategy.",
    "TikTok": "Specific content idea for TikTok. Focus on short-form storytelling, hooks in first 3 seconds, POV content, or trend integration.",
    "YouTube": "Specific content idea for YouTube. Include video format, ideal length (6-15 min), SEO-friendly title structure, and value proposition.",
    "LinkedIn": "Specific content idea for LinkedIn. Focus on professional insights, thought leadership, data-driven observations, or industry commentary.",
    "X": "Specific content idea for X (Twitter). Create a hot take, thread concept, or conversation starter that drives engagement and replies.",
    "Blog": "Specific content idea for a long-form blog post. Include structure, SEO focus, and comprehensive value (2000+ words).",
    "Threads": "Specific content idea for Threads. Focus on conversational tone, community building, questions, or relatable observations."
  }
}

CRITICAL REQUIREMENTS:
- All content must be actionable and specific to 2025 trends
- Tailor each platform idea to that platform's unique algorithm, format, and user behavior
- Be creative and unexpected - avoid generic advice
- Ensure JSON is valid and parsable
- Do not wrap response in markdown code blocks`;

    try {
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Clean the response text
      let cleanedText = text.trim();

      // Remove markdown code blocks if present
      cleanedText = cleanedText.replace(/```json\s*/g, "");
      cleanedText = cleanedText.replace(/```\s*/g, "");

      // Extract JSON object
      const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.error("Raw Gemini response:", text);
        throw new Error("Failed to extract valid JSON from Gemini response");
      }

      let data;
      try {
        data = JSON.parse(jsonMatch[0]);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError);
        console.error("Attempted to parse:", jsonMatch[0]);
        throw new Error(
          "Invalid JSON structure returned by Gemini. Please try again."
        );
      }

      // Validate the response structure
      if (
        !data.summary ||
        !Array.isArray(data.titleSuggestions) ||
        !Array.isArray(data.keyPoints) ||
        !data.schedule ||
        !data.platformPosts
      ) {
        throw new Error(
          "Gemini response missing required fields. Please try again."
        );
      }

      return {
        summary: data.summary,
        titleSuggestions: data.titleSuggestions,
        keyPoints: data.keyPoints,
        schedule: data.schedule,
        platformPosts: data.platformPosts,
      };
    } catch (error) {
      console.error("Content Planner Tool Error:", error);

      // Return a more helpful error message
      throw new Error(
        `Failed to generate content plan: ${error instanceof Error ? error.message : "Unknown error"}. Please try again with a different topic or check your API configuration.`
      );
    }
  },
});
