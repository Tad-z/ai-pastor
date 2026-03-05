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
  },
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || "",
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "",
  },
  geminiApiKey: process.env.GEMINI_API_KEY || "",
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
    apiKey: process.env.CLOUDINARY_API_KEY || "",
    apiSecret: process.env.CLOUDINARY_API_SECRET || "",
  },
};
