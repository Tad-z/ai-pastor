import { Schema, model, Types } from "mongoose";

const conversationSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    topic: { type: String },
    tags: [{ type: String }],
    summary: { type: String },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, tags: 1 });
conversationSchema.index({ title: "text" });

export const Conversation = model("Conversation", conversationSchema);
