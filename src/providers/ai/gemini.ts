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

// Gemini blocks any candidate that reproduces training data too closely
// (finishReason RECITATION) and the SDK turns that into a thrown error rather
// than an empty response. Verbatim Scripture quotation trips this regularly —
// it is the single most common failure mode for this app. The block is
// sampling-dependent, so re-rolling at a higher temperature usually clears it.
// There is no API setting that disables the recitation filter; safetySettings
// only govern HARM_CATEGORY_* and have no effect here.
const RECITATION_RETRY_TEMPERATURE = 1.0;

const isRecitationBlock = (err: any): boolean =>
  typeof err?.message === "string" && err.message.includes("RECITATION");

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
    const generationConfig: {
      maxOutputTokens?: number;
      temperature?: number;
      thinkingConfig?: { thinkingBudget: number };
    } = {};
    if (typeof config.maxTokens === "number") generationConfig.maxOutputTokens = config.maxTokens;
    if (typeof config.temperature === "number") generationConfig.temperature = config.temperature;
    if (typeof config.thinkingBudget === "number") generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const lastMessage = messages[messages.length - 1];
    const lastParts = await buildParts(lastMessage);

    const send = async (temperatureOverride?: number) => {
      const attemptConfig = { ...generationConfig };
      if (typeof temperatureOverride === "number") attemptConfig.temperature = temperatureOverride;

      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: config.systemPrompt,
        ...(Object.keys(attemptConfig).length ? { generationConfig: attemptConfig } : {}),
      });

      const chat = model.startChat({ history });
      const result = await withTimeout(chat.sendMessage(lastParts), AI_TIMEOUT_MS);
      // .text() throws when the candidate was blocked — keep it inside the retry.
      return { text: result.response.text(), usage: result.response.usageMetadata };
    };

    let attempt;
    try {
      attempt = await send();
    } catch (err) {
      if (!isRecitationBlock(err)) throw err;
      console.warn(`[gemini] ${modelName} blocked by RECITATION — retrying at temperature ${RECITATION_RETRY_TEMPERATURE}`);
      attempt = await send(RECITATION_RETRY_TEMPERATURE);
    }

    const responseText = attempt.text;
    const usage = attempt.usage;

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

// Free-tier request caps are metered per-project-PER-MODEL, so a model that is
// out of quota says nothing about the next one in the chain. Rather than hand the
// user a fallback apology while three other models sit unused, walk the chain.
// Each failure is classified into what it warrants:
//   advance — this model is spent or gone; move to the next one
//   retry   — a passing blip on this model; try it once more before moving on
//   abort   — wrong for every model (bad key, malformed request); fail immediately
type FailureAction = "advance" | "retry" | "abort";

const TRANSIENT_RETRY_DELAY_MS = 500;

const classifyFailure = (err: any): FailureAction => {
  const message: string = err?.message || "";

  // Quota exhausted (429) or the model was withdrawn (404) — no amount of
  // retrying brings either back, but the next model in the chain is unaffected.
  if (/429|RESOURCE_EXHAUSTED|quota/i.test(message)) return "advance";
  if (/\[404 |NOT_FOUND/i.test(message)) return "advance";

  // Capacity blips and our own timeout: worth one more attempt on this model,
  // then the next model — which may not be under the same load.
  if (/\[503 |\[500 |UNAVAILABLE|INTERNAL|high demand/i.test(message)) return "retry";
  if (/timed out/i.test(message)) return "advance";

  // A recitation block that survived the temperature re-roll above is a property
  // of this model's training data — a different model may not trip it at all.
  if (isRecitationBlock(err)) return "advance";

  // Anything else (invalid key, malformed request, safety block) fails the same
  // way on every model. Burning the whole chain to rediscover that just delays
  // the error by four round trips.
  return "abort";
};

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// Provider errors carry the whole quota JSON payload on later lines — the first
// line is the part worth putting in a log.
const firstLine = (err: any): string => String(err?.message || err).split(/\r?\n/)[0];

/**
 * Composes a chain of models into a single provider that presents the same
 * interface as one model. Callers are unaware a fallback happened; the model
 * that actually answered is reported in AIResponse.model, which message logic
 * persists to aiMetadata.model — so the chain's behaviour is visible per message.
 */
const createFallbackProvider = (modelNames: string[]): AIProvider => {
  const models = modelNames.filter((m, i) => m && modelNames.indexOf(m) === i);
  const providers = models.map((name) => ({ name, provider: createGeminiProvider(name) }));

  return {
    async generate(messages: AIMessage[], config: AIConfig): Promise<AIResponse> {
      let lastError: any;

      for (let i = 0; i < providers.length; i++) {
        const { name, provider } = providers[i];
        const isLast = i === providers.length - 1;

        for (let attempt = 0; attempt < 2; attempt++) {
          try {
            const result = await provider.generate(messages, config);
            if (i > 0) console.warn(`[gemini] served by fallback model ${name} (position ${i} in chain)`);
            return result;
          } catch (err: any) {
            lastError = err;
            const action = attempt === 0 ? classifyFailure(err) : "advance";
            if (action === "abort") throw err;
            if (action === "retry") {
              console.warn(`[gemini] ${name} returned a transient error — retrying once:`, firstLine(err));
              await delay(TRANSIENT_RETRY_DELAY_MS);
              continue;
            }
            if (!isLast) {
              console.warn(`[gemini] ${name} unavailable, falling back:`, firstLine(err));
            }
            break;
          }
        }
      }

      // Every model in the chain is spent. Surface the last failure so the quota
      // branch in logic/message.ts still recognises it and answers pastorally.
      console.error(`[gemini] entire fallback chain exhausted (${models.join(" -> ")})`);
      throw lastError;
    },
  };
};

export const geminiFlash = createFallbackProvider([env.geminiModelTier1, ...env.geminiFallbackModels]);
export const geminiPro = createFallbackProvider([env.geminiModelTier2, ...env.geminiFallbackModels]);
