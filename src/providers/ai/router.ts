import { AIConfig, AIMessage, AIResponse, ModelTier } from "./types";
import { geminiFlash, geminiPro } from "./gemini";

const SENSITIVE_KEYWORDS = [
  "suicide", "suicidal", "self-harm", "self harm", "kill myself", "end my life",
  "addiction", "relapse", "abuse", "depression", "grief", "divorce", "rape",
  "domestic violence", "trauma", "anxiety disorder", "eating disorder",
];

const DEPTH_KEYWORDS = ["explain", "deep dive", "theology", "doctrine", "meaning of", "why does God"];

export const classifyMessageTier = (
  content: string,
  conversationTurnCount: number
): ModelTier => {
  const lower = content.toLowerCase();

  if (SENSITIVE_KEYWORDS.some((kw) => lower.includes(kw))) return 2;
  if (conversationTurnCount > 10) return 2;
  if (DEPTH_KEYWORDS.some((kw) => lower.includes(kw))) return 2;

  return 1;
};

export const routeAIRequest = async (
  messages: AIMessage[],
  config: AIConfig,
  tier: ModelTier
): Promise<AIResponse> => {
  if (tier === 2) {
    return await geminiPro.generate(messages, config);
  }
  return await geminiFlash.generate(messages, config);
};
