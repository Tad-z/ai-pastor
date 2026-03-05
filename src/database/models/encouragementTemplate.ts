import { Schema, model } from "mongoose";

const encouragementTemplateSchema = new Schema({
  scenario: {
    type: String,
    enum: ["early_success", "milestone", "daily_success", "first_checkin", "return_after_absence"],
    required: true,
  },
  milestoneDay: { type: Number },
  category: { type: String },
  messages: [{ type: String, required: true }],
  scriptureRef: { type: String },
});

export const EncouragementTemplate = model("EncouragementTemplate", encouragementTemplateSchema);
