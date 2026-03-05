import { Types } from "mongoose";

export interface IMessage {
  _id: string;
  conversationId: Types.ObjectId;
  userId: Types.ObjectId;
  role: "user" | "assistant" | "system";
  content: string;
  media?: {
    type: "image" | "file";
    url: string;
    mimeType: string;
    fileName: string;
  };
  aiMetadata?: {
    model: string;
    inputTokens: number;
    outputTokens: number;
    latencyMs: number;
    provider: string;
  };
  scriptureReferences?: Array<{
    book: string;
    chapter: number;
    verse: string;
    text: string;
  }>;
  reactions?: {
    liked: boolean;
    disliked: boolean;
    saved: boolean;
    shared: boolean;
  };
  commitmentPrompt?: {
    commitmentId?: Types.ObjectId;
    type: "check_in" | "follow_up" | "progress_tracking";
    responseOptions: string[];
  };
  createdAt: Date;
}
