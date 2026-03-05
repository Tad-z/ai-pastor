import { UserMemory } from "../database/models/userMemory";

export const getUserMemory = async (userId: string) => {
  return await UserMemory.findOne({ userId }).exec();
};

export const upsertUserMemory = async (userId: string, memories: any[]) => {
  return await UserMemory.findOneAndUpdate(
    { userId },
    { $push: { memories: { $each: memories } }, $set: { lastUpdated: new Date() } },
    { upsert: true, new: true }
  ).exec();
};

export const clearUserMemory = async (userId: string) => {
  return await UserMemory.findOneAndUpdate(
    { userId },
    { $set: { memories: [], lastUpdated: new Date() } },
    { new: true }
  ).exec();
};

export const deleteUserMemory = async (userId: string): Promise<any> => {
  return await UserMemory.deleteOne({ userId }).exec();
};
