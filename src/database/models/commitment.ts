import { Schema, model, Types } from "mongoose";

const commitmentSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true },
    status: { type: String, enum: ["active", "paused", "completed", "abandoned"], default: "active" },
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastCheckInDate: { type: Date, default: null },
    },
    schedule: {
      frequency: { type: String, enum: ["daily", "weekly"], default: "daily" },
      reminderTime: { type: String },
      timezone: { type: String, default: "Africa/Lagos" },
    },
    originConversationId: { type: Types.ObjectId, ref: "Conversation" },
    stats: {
      totalCheckIns: { type: Number, default: 0 },
      successfulDays: { type: Number, default: 0 },
      relapseDays: { type: Number, default: 0 },
      skippedDays: { type: Number, default: 0 },
    },
    startDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

commitmentSchema.index({ userId: 1, status: 1 });
commitmentSchema.index({ "schedule.reminderTime": 1, status: 1 });

export const Commitment = model("Commitment", commitmentSchema);
