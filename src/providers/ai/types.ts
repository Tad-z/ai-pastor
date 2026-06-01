export interface AIMediaAttachment {
  url: string;
  mimeType: string;
}

export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
  media?: AIMediaAttachment;
}

export interface AIConfig {
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
  // Gemini 2.5 reasoning budget. Set to 0 to disable "thinking" tokens, which
  // otherwise consume maxTokens before any answer is produced (truncates short replies).
  thinkingBudget?: number;
}

export interface AIResponse {
  text: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  model: string;
  provider: string;
}

export interface AIProvider {
  generate(messages: AIMessage[], config: AIConfig): Promise<AIResponse>;
}

export type ModelTier = 0 | 1 | 2;
