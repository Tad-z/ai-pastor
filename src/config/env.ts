import dotenv from "dotenv";
dotenv.config();

export const env = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongodbUri: process.env.MONGODB_URI || "",
  dbName: process.env.DB_NAME || "",
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
    username: process.env.REDIS_USERNAME || "",
    password: process.env.REDIS_PASSWORD || "",
    // Upstash and most managed Redis require TLS. Set REDIS_TLS=true to enable.
    tls: process.env.REDIS_TLS === "true",
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  },
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  // Tier 1 = everyday messages, tier 2 = sensitive/depth (see providers/ai/router.ts).
  // Both default to Flash because gemini-2.5-pro has NO free tier — on an unbilled
  // key every tier-2 request is rejected. Set GEMINI_MODEL_TIER2=gemini-2.5-pro
  // once billing is enabled to restore the stronger model for sensitive messages.
  geminiModelTier1: process.env.GEMINI_MODEL_TIER1 || "gemini-2.5-flash",
  geminiModelTier2: process.env.GEMINI_MODEL_TIER2 || "gemini-2.5-flash",
  // Ordered fallback chain, tried in sequence when the model before it is out of
  // free-tier quota (429) or unavailable (404/503). Free-tier caps are metered
  // per-project-PER-MODEL, so each extra model here adds a fresh daily allowance
  // instead of drawing on the same exhausted pool. Comma-separated; set
  // GEMINI_FALLBACK_MODELS to reorder, or to an empty string to disable fallback.
  geminiFallbackModels: (
    process.env.GEMINI_FALLBACK_MODELS ??
    "gemini-3.5-flash,gemini-3.6-flash,gemini-3-flash-preview,gemini-3.1-flash-lite"
  )
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};
