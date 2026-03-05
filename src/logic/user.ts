import { response } from "../helpers/utility";
import { Response } from "../interface";
import { updateUser } from "../dao/user.dao";
import { FREE_PLAN_DAILY_LIMIT } from "../helpers/tokenCounter";

export const _getProfile = async (user: any): Promise<Response> => {
  return response({ error: false, message: "Profile retrieved", data: user });
};

export const _updateProfile = async (userId: string, data: { displayName?: string; profilePhoto?: string }): Promise<Response> => {
  const updated = await updateUser(userId, data);
  return response({ error: false, message: "Profile updated", data: updated });
};

export const _updatePreferences = async (userId: string, preferences: any): Promise<Response> => {
  const prefUpdate: any = {};
  for (const key of Object.keys(preferences)) {
    prefUpdate[`preferences.${key}`] = preferences[key];
  }
  const updated = await updateUser(userId, prefUpdate);
  return response({ error: false, message: "Preferences updated", data: updated });
};

export const _updateNotifications = async (userId: string, notifications: any): Promise<Response> => {
  const notifUpdate: any = {};
  for (const key of Object.keys(notifications)) {
    notifUpdate[`notifications.${key}`] = notifications[key];
  }
  const updated = await updateUser(userId, notifUpdate);
  return response({ error: false, message: "Notification settings updated", data: updated });
};

export const _updateDataControls = async (userId: string, dataControls: any): Promise<Response> => {
  const update: any = {};
  for (const key of Object.keys(dataControls)) {
    update[`dataControls.${key}`] = dataControls[key];
  }
  const updated = await updateUser(userId, update);
  return response({ error: false, message: "Data controls updated", data: updated });
};

export const _getUsage = async (user: any): Promise<Response> => {
  const limit = FREE_PLAN_DAILY_LIMIT;
  const resetAt = new Date();
  resetAt.setDate(resetAt.getDate() + 1);
  resetAt.setHours(0, 0, 0, 0);

  return response({
    error: false,
    message: "Usage retrieved",
    data: {
      dailyMessageCount: user.usage.dailyMessageCount,
      remaining: Math.max(0, limit - user.usage.dailyMessageCount),
      limit,
      resetAt: resetAt.toISOString(),
    },
  });
};
