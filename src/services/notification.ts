import { admin } from "../config/firebase";

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  try {
    await admin.messaging().send({
      token: fcmToken,
      notification: { title, body },
      data,
    });
  } catch (error) {
    console.error("Failed to send push notification:", error);
  }
};

export const sendBulkPushNotifications = async (
  tokens: string[],
  title: string,
  body: string
): Promise<void> => {
  if (!tokens.length) return;
  try {
    const messages = tokens.map((token) => ({
      token,
      notification: { title, body },
    }));
    await admin.messaging().sendEach(messages);
  } catch (error) {
    console.error("Failed to send bulk push notifications:", error);
  }
};
