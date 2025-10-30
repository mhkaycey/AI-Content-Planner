import { z } from "zod";
import { createToolCallAccuracyScorerCode } from "@mastra/evals/scorers/code";
import { createCompletenessScorer } from "@mastra/evals/scorers/code";
import { createScorer } from "@mastra/core/scores";

export const toolCallAppropriatenessScorer = createToolCallAccuracyScorerCode({
  expectedTool: "contentPlannerTool",
  strictMode: false,
});

export const completenessScorer = createCompletenessScorer();

// Custom LLM-judged scorer: evaluates if the content plan is relevant to the audience and platform
export const relevanceScorer = createScorer({
  name: "Content Relevance",
  description:
    "Checks that the content plan is appropriately tailored to the specified audience and platform",
  type: "agent",
  judge: {
    model: "google/gemini-2.0-flash",
    instructions:
      "You are an expert evaluator of content plans. " +
      "Determine whether the assistant’s content plan is relevant to the user-specified audience and platform. " +
      "Consider whether titles, key points, and schedule align with the audience’s interests and platform norms. " +
      "Return only the structured JSON matching the provided schema.",
  },
})
  .preprocess(({ run }) => {
    const userText = (run.input?.inputMessages?.[0]?.content as string) || "";
    const assistantText = (run.output?.[0]?.content as string) || "";
    return { userText, assistantText };
  })
  .analyze({
    description:
      "Extract audience, platform, and evaluate content plan relevance",
    outputSchema: z.object({
      audienceMatch: z
        .boolean()
        .describe("Whether the content plan suits the audience"),
      platformMatch: z
        .boolean()
        .describe("Whether the content plan suits the platform"),
      confidence: z
        .number()
        .min(0)
        .max(1)
        .default(1)
        .describe("Confidence in the evaluation"),
      explanation: z
        .string()
        .default("")
        .describe("Explanation of the evaluation"),
    }),
    createPrompt: ({ results }) => `
      You are evaluating if a content planner assistant created a plan relevant to the specified audience and platform.
      User input:
      """
      ${results.preprocessStepResult.userText}
      """
      Assistant response:
      """
      ${results.preprocessStepResult.assistantText}
      """
      Tasks:
      1) Identify the audience and platform specified in the user input.
      2) Check if the assistant’s content plan (titles, key points, schedule) aligns with the audience’s interests and platform norms (e.g., LinkedIn for professional content, Twitter for concise posts).
      3) Return JSON with fields:
      {
        "audienceMatch": boolean, // True if the plan suits the audience
        "platformMatch": boolean, // True if the plan suits the platform
        "confidence": number, // 0-1
        "explanation": string // Why the plan does or does not match
      }
    `,
  })
  .generateScore(({ results }) => {
    const r = (results as any)?.analyzeStepResult || {};
    if (!r.audienceMatch && !r.platformMatch) return 0; // Neither matches
    if (r.audienceMatch && r.platformMatch)
      return Math.max(0, Math.min(1, 0.7 + 0.3 * (r.confidence ?? 1))); // Both match
    return 0.5 * (r.confidence ?? 1); // One matches
  })
  .generateReason(({ results, score }) => {
    const r = (results as any)?.analyzeStepResult || {};
    return `Relevance scoring: audienceMatch=${r.audienceMatch ?? false}, platformMatch=${r.platformMatch ?? false}, confidence=${r.confidence ?? 0}. Score=${score}. ${r.explanation ?? ""}`;
  });

export const scorers = {
  toolCallAppropriatenessScorer,
  completenessScorer,
  relevanceScorer,
};
