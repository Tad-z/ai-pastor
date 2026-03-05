import { Types } from "mongoose";

export interface IConversation {
  _id: string;
  userId: Types.ObjectId;
  title: string;
  topic?: string;
  tags: string[];
  summary?: string;
  messageCount: number;
  lastMessageAt: Date;
  isArchived: boolean;
  createdAt: Date;
}
