import { Schema, model } from "mongoose";

const topicSchema = new Schema({
  slug: { type: String, required: true, unique: true },
  label: { type: String, required: true },
  icon: { type: String },
  systemPromptAddition: { type: String, required: true },
  suggestedFirstMessage: { type: String },
  isDefault: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

topicSchema.index({ isDefault: 1, order: 1 });

export const Topic = model("Topic", topicSchema);
