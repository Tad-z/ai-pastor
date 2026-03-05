import { Schema, model, Types } from "mongoose";

const messageSchema = new Schema(
  {
    conversationId: { type: Types.ObjectId, ref: "Conversation", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    role: { type: String, enum: ["user", "assistant", "system"], required: true },
    content: { type: String, required: true },
    media: {
      type: { type: String, enum: ["image", "file"] },
      url: String,
      mimeType: String,
      fileName: String,
    },
    aiMetadata: {
      model: String,
      inputTokens: Number,
      outputTokens: Number,
      latencyMs: Number,
      provider: String,
    },
    scriptureReferences: [
      {
        book: String,
        chapter: Number,
        verse: String,
        text: String,
      },
    ],
    reactions: {
      liked: { type: Boolean, default: false },
      disliked: { type: Boolean, default: false },
      saved: { type: Boolean, default: false },
      shared: { type: Boolean, default: false },
    },
    commitmentPrompt: {
      commitmentId: { type: Types.ObjectId, ref: "Commitment" },
      type: { type: String, enum: ["check_in", "follow_up", "progress_tracking"] },
      responseOptions: [String],
    },
  },
  { timestamps: true }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ userId: 1, createdAt: -1 });

export const Message = model("Message", messageSchema);
