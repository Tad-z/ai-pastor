export interface IUser {
  _id: string;
  firebaseUid: string;
  email?: string;
  displayName: string;
  profilePhoto?: string;
  authProvider: "google" | "apple" | "anonymous";
  isAnonymous: boolean;
  preferences: {
    aiTone: "gentle" | "direct" | "reflective";
    responseLength: "short" | "detailed";
    useEmojis: boolean;
    autoCorrectSpelling: boolean;
    autocompleteSuggestions: boolean;
    commitmentTracking: boolean;
    followUpSuggestions: boolean;
    dailySpiritualPrompts: boolean;
  };
  notifications: {
    commitmentReminders: boolean;
    dailyVerse: boolean;
    prayerEncouragement: boolean;
    appUpdates: boolean;
    fcmToken?: string;
  };
  dataControls: {
    improveModel: boolean;
    personalizeWithMemories: boolean;
  };
  usage: {
    dailyMessageCount: number;
    dailyTokensUsed: number;
    lastResetAt: Date;
    totalMessagesAllTime: number;
  };
  subscription: {
    plan: "free" | "weekly" | "monthly" | "annual";
    status: "active" | "expired" | "cancelled";
    expiresAt?: Date;
  };
  createdAt: Date;
  lastActiveAt: Date;
}
