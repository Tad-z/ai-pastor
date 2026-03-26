import { response } from "../helpers/utility";
import { Response } from "../interface";
import { getConversationById, incrementConversationMessageCount, updateConversation } from "../dao/conversation.dao";
import { createMessage, getRecentMessages, getConversationMessages, countConversationMessages, getMessageById, updateMessageReactions } from "../dao/message.dao";
import { getUserMemory } from "../dao/userMemory.dao";
import { getTopicBySlug } from "../dao/topic.dao";
import { getUserById, incrementDailyUsage } from "../dao/user.dao";
import { runSafetyCheck } from "../services/safety";
import { classifyMessageTier, routeAIRequest } from "../providers/ai/router";
import { parseScriptureReferences } from "../helpers/scripture";
import { getPagingResponseDetails, preparePagingValues } from "../helpers/pagination";
import {
  BASE_SYSTEM_PROMPT,
  TONE_INSTRUCTIONS,
  LENGTH_INSTRUCTIONS,
  EMOJI_INSTRUCTIONS,
} from "../providers/ai/prompts";

/**
 * Assembles the full system prompt per the order defined in system-prompt.md:
 * 1. Safety overrides  (highest priority — always first)
 * 2. Base system prompt
 * 3. Tone instruction
 * 4. Length instruction
 * 5. Emoji instruction
 * 6. User memories     (only if personalizeWithMemories is true and memories exist)
 * 7. Topic context     (only if the conversation has a topic)
 */
const buildSystemPrompt = (
  user: any,
  topic: any,
  memories: string[],
  safetyOverrides: string[]
): string => {
  const tone: string = user?.preferences?.aiTone || "gentle";
  const length: string = user?.preferences?.responseLength || "detailed";
  const useEmojis: boolean = user?.preferences?.useEmojis !== false;
  const personalizeWithMemories: boolean = user?.dataControls?.personalizeWithMemories !== false;

  const sections: string[] = [];

  // 1. Safety overrides — first so the model sees them before anything else
  sections.push(...safetyOverrides);

  // 2. Base system prompt
  sections.push(BASE_SYSTEM_PROMPT);

  // 3. Tone
  sections.push(TONE_INSTRUCTIONS[tone] ?? TONE_INSTRUCTIONS.gentle);

  // 4. Length
  sections.push(LENGTH_INSTRUCTIONS[length] ?? LENGTH_INSTRUCTIONS.detailed);

  // 5. Emoji
  sections.push(useEmojis ? EMOJI_INSTRUCTIONS.on : EMOJI_INSTRUCTIONS.off);

  // 6. User memories — only when the user has opted in and facts exist
  if (personalizeWithMemories && memories.length > 0) {
    const facts = memories.map((f) => `- ${f}`).join("\n");
    sections.push(`WHAT YOU KNOW ABOUT THIS PERSON:\n${facts}\n\nUse this context to be more personal and relevant, but don't reference these facts unless naturally relevant to the conversation.`);
  }

  // 7. Topic context — only when the conversation was started from a topic chip
  if (topic?.systemPromptAddition) {
    sections.push(`TOPIC CONTEXT: ${topic.systemPromptAddition}`);
  }

  return sections.join("\n\n");
};

export const _sendMessage = async (userId: string, conversationId: string, content: string, media?: { url: string; type: string; mimeType: string; fileName?: string }): Promise<Response> => {
  if (!content || content.trim().length === 0) {
    return response({ error: true, message: "Message content is required" });
  }

  const conversation = await getConversationById(conversationId);
  if (!conversation) return response({ error: true, message: "Conversation not found" });
  if (conversation.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });

  console.log("[sendMessage] media received:", media ? JSON.stringify(media) : "none");

  const safety = runSafetyCheck(content);
  const userMessageData: any = { conversationId, userId, role: "user", content };
  if (media) {
    userMessageData.media = { type: media.type, url: media.url, mimeType: media.mimeType, fileName: media.fileName };
  }
  await createMessage(userMessageData);

  const [user, memoryDoc, recentMessages, topic] = await Promise.all([
    getUserById(userId),
    getUserMemory(userId),
    getRecentMessages(conversationId, 20),
    conversation.topic ? getTopicBySlug(conversation.topic) : Promise.resolve(null),
  ]);

  const memories: string[] = (memoryDoc as any)?.memories?.map((m: any) => m.fact) || [];
  const systemPrompt = buildSystemPrompt(user, topic, memories, safety.safetyOverrides);

  const aiMessages = recentMessages.map((m: any) => ({
    role: m.role as "user" | "assistant" | "system",
    content: m.content,
    ...(m.media?.url && m.media.mimeType?.startsWith("image/") ? { media: { url: m.media.url, mimeType: m.media.mimeType } } : {}),
  }));

  const tier = classifyMessageTier(content, conversation.messageCount);
  const aiResult = await routeAIRequest(aiMessages, { systemPrompt }, tier);
  const scriptureReferences = parseScriptureReferences(aiResult.text);

  const aiMessage = await createMessage({
    conversationId,
    userId,
    role: "assistant",
    content: aiResult.text,
    aiMetadata: {
      model: aiResult.model,
      inputTokens: aiResult.inputTokens,
      outputTokens: aiResult.outputTokens,
      latencyMs: aiResult.latencyMs,
      provider: aiResult.provider,
    },
    scriptureReferences,
  });

  const totalTokens = aiResult.inputTokens + aiResult.outputTokens;
  await Promise.all([
    incrementDailyUsage(userId, totalTokens),
    incrementConversationMessageCount(conversationId),
  ]);

  if (conversation.messageCount === 0) {
    const title = content.slice(0, 60) + (content.length > 60 ? "..." : "");
    await updateConversation(conversationId, { title });
  }

  return response({ error: false, message: "Message sent", data: aiMessage });
};

export const _getMessages = async (userId: string, conversationId: string, page: number, limit: number): Promise<Response> => {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return response({ error: true, message: "Conversation not found" });
  if (conversation.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });

  const { skip } = preparePagingValues(page, limit);
  const [messages, total] = await Promise.all([
    getConversationMessages(conversationId, skip, limit),
    countConversationMessages(conversationId),
  ]);

  return response({
    error: false,
    message: "Messages retrieved",
    data: { items: messages.reverse(), pagination: getPagingResponseDetails(total, page, limit) },
  });
};

export const _reactToMessage = async (userId: string, messageId: string, reactions: any): Promise<Response> => {
  const message = await getMessageById(messageId);
  if (!message) return response({ error: true, message: "Message not found" });
  if (message.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });

  const updated = await updateMessageReactions(messageId, { ...message.reactions, ...reactions });
  return response({ error: false, message: "Reaction saved", data: updated });
};
