import { Types } from "mongoose";

export interface ICheckIn {
  _id: string;
  commitmentId: Types.ObjectId;
  userId: Types.ObjectId;
  date: Date;
  status: "success" | "relapse" | "skipped";
  note?: string;
  mood?: "great" | "good" | "okay" | "struggling" | "low";
  aiResponse?: string;
  createdAt: Date;
}
