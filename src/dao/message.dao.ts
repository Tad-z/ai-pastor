import { Message } from "../database/models/message";

export const createMessage = async (data: any) => {
  const message = new Message(data);
  return await message.save();
};

export const getMessageById = async (id: string) => {
  return await Message.findById(id).exec();
};

export const getRecentMessages = async (conversationId: string, limit = 20) => {
  return await Message.find({ conversationId }).sort({ createdAt: 1 }).limit(limit).exec();
};

export const getConversationMessages = async (conversationId: string, skip: number, limit: number) => {
  return await Message.find({ conversationId }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec();
};

export const countConversationMessages = async (conversationId: string) => {
  return await Message.countDocuments({ conversationId }).exec();
};

export const updateMessageReactions = async (id: string, reactions: any) => {
  return await Message.findByIdAndUpdate(id, { $set: { reactions } }, { returnDocument: "after" }).exec();
};

export const deleteConversationMessages = async (conversationId: string): Promise<any> => {
  return await Message.deleteMany({ conversationId }).exec();
};

export const deleteUserMessages = async (userId: string): Promise<any> => {
  return await Message.deleteMany({ userId }).exec();
};

export const deleteManyByConversationIds = async (conversationIds: string[]): Promise<any> => {
  return await Message.deleteMany({ conversationId: { $in: conversationIds } }).exec();
};
