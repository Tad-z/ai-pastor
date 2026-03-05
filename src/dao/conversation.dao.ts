import { Conversation } from "../database/models/conversation";

export const createConversation = async (data: any) => {
  const conversation = new Conversation(data);
  return await conversation.save();
};

export const getConversationById = async (id: string) => {
  return await Conversation.findById(id).exec();
};

export const getUserConversations = async (userId: string, skip: number, limit: number, search?: string) => {
  const query: any = { userId, isArchived: false };
  if (search) query.$text = { $search: search };
  return await Conversation.find(query).sort({ updatedAt: -1 }).skip(skip).limit(limit).exec();
};

export const countUserConversations = async (userId: string, search?: string) => {
  const query: any = { userId, isArchived: false };
  if (search) query.$text = { $search: search };
  return await Conversation.countDocuments(query).exec();
};

export const updateConversation = async (id: string, data: any) => {
  return await Conversation.findByIdAndUpdate(id, data, { new: true }).exec();
};

export const incrementConversationMessageCount = async (id: string) => {
  return await Conversation.findByIdAndUpdate(
    id,
    { $inc: { messageCount: 1 }, $set: { lastMessageAt: new Date() } },
    { new: true }
  ).exec();
};

export const deleteConversation = async (id: string) => {
  return await Conversation.findByIdAndDelete(id).exec();
};

export const deleteUserConversations = async (userId: string): Promise<any> => {
  return await Conversation.deleteMany({ userId }).exec();
};

export const getUserConversationIds = async (userId: string): Promise<string[]> => {
  const conversations = await Conversation.find({ userId }, "_id").sort({ updatedAt: -1 }).exec();
  return conversations.map((c) => c._id.toString());
};
