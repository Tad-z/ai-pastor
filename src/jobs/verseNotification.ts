import { _getDailyVerse } from "../logic/dailyVerse";
import { getUsersWithDailyVerseEnabled } from "../dao/user.dao";
import { sendBulkPushNotifications } from "../services/notification";
import { cacheDailyVerse } from "../services/cache";
import { getVerseByDate } from "../dao/dailyVerse.dao";

export const refreshVerseCache = async (): Promise<void> => {
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const verse = await getVerseByDate(today);
  if (verse) {
    await cacheDailyVerse(dateStr, verse);
    console.log("[verseCache] Daily verse cached for", dateStr);
  }
};

export const sendDailyVerseNotifications = async (): Promise<void> => {
  const verseResult = await _getDailyVerse();
  if (verseResult.error || !verseResult.data) {
    console.error("[verseNotification] No verse available today");
    return;
  }

  const verse = verseResult.data;
  const users = await getUsersWithDailyVerseEnabled();
  const tokens = users.map((u: any) => u.notifications.fcmToken).filter(Boolean);

  if (!tokens.length) return;

  await sendBulkPushNotifications(
    tokens,
    `Today's Verse — ${verse.book} ${verse.chapter}:${verse.verseRange}`,
    verse.text.slice(0, 100) + (verse.text.length > 100 ? "..." : "")
  );
  console.log(`[verseNotification] Sent to ${tokens.length} users`);
};
