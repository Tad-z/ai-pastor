import cron from "node-cron";
import { runDailyReset } from "./dailyReset";
import { runCommitmentReminders } from "./reminders";
import { refreshVerseCache, sendDailyVerseNotifications } from "./verseNotification";
import { runMissedCheckInJob } from "./missedCheckIn";
import { runMemoryExtraction } from "./memoryExtraction";

export const startJobs = (): void => {
  // Daily usage reset at 00:00 WAT (UTC+1)
  cron.schedule("0 23 * * *", runDailyReset, { timezone: "UTC" });

  // Commitment reminders — every minute
  cron.schedule("* * * * *", runCommitmentReminders);

  // Verse cache refresh at 05:55 WAT (04:55 UTC)
  cron.schedule("55 4 * * *", refreshVerseCache, { timezone: "UTC" });

  // Daily verse notification at 06:00 WAT (05:00 UTC)
  cron.schedule("0 5 * * *", sendDailyVerseNotifications, { timezone: "UTC" });

  // Mark missed check-ins at 23:59 WAT (22:59 UTC)
  cron.schedule("59 22 * * *", runMissedCheckInJob, { timezone: "UTC" });

  // Memory extraction every 6 hours
  cron.schedule("0 */6 * * *", runMemoryExtraction);

  console.log("Background jobs started");
};
