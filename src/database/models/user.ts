import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, unique: true, sparse: true },
    displayName: { type: String, default: "Friend" },
    profilePhoto: { type: String },
    authProvider: { type: String, enum: ["google", "apple", "anonymous"], required: true },
    isAnonymous: { type: Boolean, default: false },
    preferences: {
      aiTone: { type: String, enum: ["gentle", "direct", "reflective"], default: "gentle" },
      responseLength: { type: String, enum: ["short", "detailed"], default: "detailed" },
      useEmojis: { type: Boolean, default: true },
      autoCorrectSpelling: { type: Boolean, default: false },
      autocompleteSuggestions: { type: Boolean, default: true },
      commitmentTracking: { type: Boolean, default: true },
      followUpSuggestions: { type: Boolean, default: true },
      dailySpiritualPrompts: { type: Boolean, default: true },
    },
    notifications: {
      commitmentReminders: { type: Boolean, default: true },
      dailyVerse: { type: Boolean, default: true },
      prayerEncouragement: { type: Boolean, default: true },
      appUpdates: { type: Boolean, default: true },
      fcmToken: { type: String },
    },
    dataControls: {
      improveModel: { type: Boolean, default: false },
      personalizeWithMemories: { type: Boolean, default: true },
    },
    usage: {
      dailyMessageCount: { type: Number, default: 0 },
      dailyTokensUsed: { type: Number, default: 0 },
      lastResetAt: { type: Date, default: Date.now },
      totalMessagesAllTime: { type: Number, default: 0 },
    },
    subscription: {
      plan: { type: String, enum: ["free", "weekly", "monthly", "annual"], default: "free" },
      status: { type: String, enum: ["active", "expired", "cancelled"], default: "active" },
      expiresAt: { type: Date },
    },
    lastActiveAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

userSchema.index({ lastActiveAt: -1 });
userSchema.index({ isAnonymous: 1 });

export const User = model("User", userSchema);
