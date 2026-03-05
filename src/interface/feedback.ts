import { Types } from "mongoose";

export interface IFeedback {
  _id: string;
  userId: Types.ObjectId;
  content: string;
  appVersion: string;
  platform: "ios" | "android";
  createdAt: Date;
}
