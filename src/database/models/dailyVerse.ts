import { Schema, model } from "mongoose";

const dailyVerseSchema = new Schema({
  date: { type: Date, required: true, unique: true },
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verseRange: { type: String, required: true },
  text: { type: String, required: true },
  translation: { type: String, required: true, default: "NIV" },
  theme: { type: String },
});

export const DailyVerse = model("DailyVerse", dailyVerseSchema);
