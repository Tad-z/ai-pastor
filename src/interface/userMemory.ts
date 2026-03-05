import { Types } from "mongoose";

export interface IUserMemory {
  _id: string;
  userId: Types.ObjectId;
  memories: Array<{
    fact: string;
    source: "conversation" | "explicit";
    conversationId?: Types.ObjectId;
    extractedAt: Date;
    confidence: number;
  }>;
  lastUpdated: Date;
}
