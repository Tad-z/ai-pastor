export interface AIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIConfig {
  systemPrompt: string;
  temperature?: number;
  maxTokens?: number;
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
