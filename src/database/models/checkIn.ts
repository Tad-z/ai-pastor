import { Schema, model, Types } from "mongoose";

const checkInSchema = new Schema(
  {
    commitmentId: { type: Types.ObjectId, ref: "Commitment", required: true },
    userId: { type: Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["success", "relapse", "skipped"], required: true },
    note: { type: String },
    mood: { type: String, enum: ["great", "good", "okay", "struggling", "low"] },
    aiResponse: { type: String },
  },
  { timestamps: true }
);

checkInSchema.index({ commitmentId: 1, date: 1 }, { unique: true });
checkInSchema.index({ userId: 1, date: 1 });

export const CheckIn = model("CheckIn", checkInSchema);
