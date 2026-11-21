import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    // Uniqueness is enforced by the partial index declared below (not here).
    email: { type: String },
    displayName: { type: String, default: "Friend" },
    profilePhoto: { type: String },
    authProvider: { type: String, enum: ["google", "apple", "anonymous"], required: true },
    isAnonymous: { type: Boolean, default: false },
    preferences: {
      aiTone: { type: String, enum: ["gentle", "direct", "reflective"], default: "gentle" },
      responseLength: { type: String, enum: ["short", "medium", "detailed"], default: "medium" },
      churchTradition: {
        type: String,
        enum: ["none", "anglican", "catholic", "baptist", "pentecostal", "methodist", "reformed"],
        default: "none",
      },
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

// Unique only across real (string) emails. Guests have no email, and a plain
// unique/sparse index still indexes an explicit `email: null`, so every guest
// after the first hit E11000. Keep the name `email_1` — the startup migration in
// config/database.ts looks it up by that name.
userSchema.index(
  { email: 1 },
  { name: "email_1", unique: true, partialFilterExpression: { email: { $type: "string" } } }
);
userSchema.index({ lastActiveAt: -1 });
userSchema.index({ isAnonymous: 1 });

export const User = model("User", userSchema);
