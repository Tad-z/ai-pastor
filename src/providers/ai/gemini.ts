import { GoogleGenerativeAI, Part } from "@google/generative-ai";
import { env } from "../../config/env";
import { AIConfig, AIMessage, AIProvider, AIResponse } from "./types";

const fetchImageAsBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
  const res = await fetch(url);
  const buffer = Buffer.from(await res.arrayBuffer());
  const mimeType = res.headers.get("content-type") || "image/jpeg";
  return { base64: buffer.toString("base64"), mimeType };
};

const buildParts = async (message: AIMessage): Promise<Part[]> => {
  const parts: Part[] = [{ text: message.content }];
  if (message.media && message.media.mimeType.startsWith("image/")) {
    const { base64, mimeType } = await fetchImageAsBase64(message.media.url);
    parts.push({ inlineData: { data: base64, mimeType } });
  }
  return parts;
};

const genAI = new GoogleGenerativeAI(env.geminiApiKey);
const AI_TIMEOUT_MS = 30_000;

const withTimeout = <T>(promise: Promise<T>, ms: number): Promise<T> =>
  Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("AI response timed out. Please try again.")), ms)
    ),
  ]);

const createGeminiProvider = (modelName: string): AIProvider => ({
  async generate(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
    const start = Date.now();
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: config.systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const lastParts = await buildParts(lastMessage);
    const chat = model.startChat({ history });
    const result = await withTimeout(chat.sendMessage(lastParts), AI_TIMEOUT_MS);
    const responseText = result.response.text();
    const usage = result.response.usageMetadata;

    return {
      text: responseText,
      inputTokens: usage?.promptTokenCount || 0,
      outputTokens: usage?.candidatesTokenCount || 0,
      latencyMs: Date.now() - start,
      model: modelName,
      provider: "gemini",
    };
  },
});

export const geminiFlash = createGeminiProvider("gemini-2.5-flash");
export const geminiPro = createGeminiProvider("gemini-2.5-pro");
