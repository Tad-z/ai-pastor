import { Schema, model, Types } from "mongoose";

const feedbackSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    appVersion: { type: String, required: true },
    platform: { type: String, enum: ["ios", "android"], required: true },
  },
  { timestamps: true }
);

export const Feedback = model("Feedback", feedbackSchema);
