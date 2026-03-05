import { response } from "../helpers/utility";
import { Response } from "../interface";
import {
  createConversation,
  getConversationById,
  getUserConversations,
  countUserConversations,
  deleteConversation,
  deleteUserConversations,
  getUserConversationIds,
} from "../dao/conversation.dao";
import { deleteConversationMessages, deleteManyByConversationIds } from "../dao/message.dao";
import { clearUserMemory } from "../dao/userMemory.dao";
import { getTopicBySlug } from "../dao/topic.dao";
import { getPagingResponseDetails, preparePagingValues } from "../helpers/pagination";

export const _createConversation = async (userId: string, topic?: string): Promise<Response> => {
  let title = "New Conversation";
  let suggestedFirstMessage: string | undefined;
  let topicSlug: string | undefined;

  if (topic) {
    const topicDoc = await getTopicBySlug(topic);
    if (!topicDoc) return response({ error: true, message: "Topic not found" });
    title = topicDoc.label;
    suggestedFirstMessage = topicDoc.suggestedFirstMessage ?? undefined;
    topicSlug = topicDoc.slug ?? undefined;
  }

  const conversation = await createConversation({ userId, title, topic: topicSlug, tags: [] });
  return response({
    error: false,
    message: "Conversation started",
    data: { conversation, suggestedFirstMessage },
  });
};

export const _getConversations = async (userId: string, page: number, limit: number, search?: string): Promise<Response> => {
  const { skip } = preparePagingValues(page, limit);
  const [conversations, total] = await Promise.all([
    getUserConversations(userId, skip, limit, search),
    countUserConversations(userId, search),
  ]);
  return response({
    error: false,
    message: "Conversations retrieved",
    data: { items: conversations, pagination: getPagingResponseDetails(total, page, limit) },
  });
};

export const _getConversation = async (userId: string, conversationId: string): Promise<Response> => {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return response({ error: true, message: "Conversation not found" });
  if (conversation.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });
  return response({ error: false, message: "Conversation retrieved", data: conversation });
};

export const _deleteConversation = async (userId: string, conversationId: string): Promise<Response> => {
  const conversation = await getConversationById(conversationId);
  if (!conversation) return response({ error: true, message: "Conversation not found" });
  if (conversation.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });
  await deleteConversationMessages(conversationId);
  await deleteConversation(conversationId);
  return response({ error: false, message: "Conversation deleted" });
};

export const _deleteAllConversations = async (userId: string): Promise<Response> => {
  const conversationIds = await getUserConversationIds(userId);
  await deleteManyByConversationIds(conversationIds);
  await deleteUserConversations(userId);
  await clearUserMemory(userId);
  return response({ error: false, message: "All conversations deleted" });
};
