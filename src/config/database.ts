import mongoose from "mongoose";
import { env } from "./env";
import { User } from "../database/models/user";

// One-time, idempotent fix for the legacy `email_1` index (unique + sparse).
// MongoDB cannot change an index's options in place, and Mongoose's autoIndex
// just fails with an options conflict, so the old index has to be dropped and
// rebuilt as the partial unique index declared on the User schema. Once the
// index is already partial this is a single listIndexes call and a no-op.
const migrateUserEmailIndex = async (): Promise<void> => {
  try {
    await User.createCollection();
    const indexes = await User.collection.indexes();
    const emailIndex = indexes.find((index) => index.name === "email_1");

    if (emailIndex && !emailIndex.partialFilterExpression) {
      await User.collection.dropIndex("email_1");
      console.log("[migration] Dropped legacy users.email_1 index");
    }

    // Guests created before the fix stored an explicit null — remove the field.
    const cleaned = await User.collection.updateMany({ email: null }, { $unset: { email: "" } });
    if (cleaned.modifiedCount > 0) {
      console.log(`[migration] Removed null email from ${cleaned.modifiedCount} guest user(s)`);
    }

    await User.createIndexes();
  } catch (error) {
    // Don't take the API down over an index problem — log loudly and carry on.
    console.error("[migration] users.email_1 index migration failed:", error);
  }
};

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.mongodbUri, { dbName: env.dbName || undefined });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
  await migrateUserEmailIndex();
};
