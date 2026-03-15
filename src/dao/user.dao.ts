import { User } from "../database/models/user";

export const createUser = async (data: any) => {
  const user = new User(data);
  return await user.save();
};

export const getUserByFirebaseUid = async (firebaseUid: string) => {
  return await User.findOne({ firebaseUid }).exec();
};

export const getUserById = async (id: string) => {
  return await User.findById(id).exec();
};

export const updateUser = async (id: string, data: any) => {
  return await User.findByIdAndUpdate(id, data, { returnDocument: "after" }).exec();
};

export const deleteUser = async (id: string) => {
  return await User.findByIdAndDelete(id).exec();
};

export const incrementDailyUsage = async (id: string, tokens: number) => {
  return await User.findByIdAndUpdate(
    id,
    {
      $inc: {
        "usage.dailyMessageCount": 1,
        "usage.dailyTokensUsed": tokens,
        "usage.totalMessagesAllTime": 1,
      },
      $set: { lastActiveAt: new Date() },
    },
    { returnDocument: "after" }
  ).exec();
};

export const resetAllDailyUsage = async () => {
  return await User.updateMany(
    {},
    {
      $set: {
        "usage.dailyMessageCount": 0,
        "usage.dailyTokensUsed": 0,
        "usage.lastResetAt": new Date(),
      },
    }
  ).exec();
};

export const getUsersWithDailyVerseEnabled = async () => {
  return await User.find({
    "notifications.dailyVerse": true,
    "notifications.fcmToken": { $exists: true, $ne: null },
  }).exec();
};
