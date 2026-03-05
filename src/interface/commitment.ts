import { Types } from "mongoose";

export interface ICommitment {
  _id: string;
  userId: Types.ObjectId;
  title: string;
  description?: string;
  category: string;
  status: "active" | "paused" | "completed" | "abandoned";
  streak: {
    current: number;
    longest: number;
    lastCheckInDate: Date;
  };
  schedule: {
    frequency: "daily" | "weekly";
    reminderTime?: string;
    timezone: string;
  };
  originConversationId?: Types.ObjectId;
  stats: {
    totalCheckIns: number;
    successfulDays: number;
    relapseDays: number;
    skippedDays: number;
  };
  startDate: Date;
  createdAt: Date;
}
