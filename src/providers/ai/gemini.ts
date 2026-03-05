import { GoogleGenerativeAI } from "@google/generative-ai";
import { env } from "../../config/env";
import { AIConfig, AIMessage, AIProvider, AIResponse } from "./types";

const genAI = new GoogleGenerativeAI(env.geminiApiKey);

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
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
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
