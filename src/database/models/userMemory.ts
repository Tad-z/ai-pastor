import { Schema, model, Types } from "mongoose";

const userMemorySchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },
  memories: [
    {
      fact: { type: String, required: true },
      source: { type: String, enum: ["conversation", "explicit"], required: true },
      conversationId: { type: Types.ObjectId, ref: "Conversation" },
      extractedAt: { type: Date, default: Date.now },
      confidence: { type: Number, min: 0, max: 1, default: 0.8 },
    },
  ],
  lastUpdated: { type: Date, default: Date.now },
});

export const UserMemory = model("UserMemory", userMemorySchema);
