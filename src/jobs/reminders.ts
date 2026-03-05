import { getActiveCommitmentsWithReminderTime } from "../dao/commitment.dao";
import { getCheckInByDate } from "../dao/checkIn.dao";
import { sendPushNotification } from "../services/notification";
import { getCurrentTimeHHMM, getTodayInTimezone } from "../helpers/date";

export const runCommitmentReminders = async (): Promise<void> => {
  const currentTime = getCurrentTimeHHMM("Africa/Lagos");
  const commitments = await getActiveCommitmentsWithReminderTime(currentTime);

  for (const commitment of commitments) {
    const user = (commitment as any).userId;
    if (!user?.notifications?.commitmentReminders) continue;
    if (!user?.notifications?.fcmToken) continue;

    const today = getTodayInTimezone(commitment.schedule?.timezone);
    const alreadyCheckedIn = await getCheckInByDate(commitment._id.toString(), today);
    if (alreadyCheckedIn) continue;

    const streak = commitment.streak?.current || 0;
    const title = "Time to check in";
    const body = streak > 0
      ? `Great job. Each strong day builds momentum. (${streak} day streak!)`
      : "It's okay. Progress isn't perfection. Let's try again today.";

    await sendPushNotification(user.notifications.fcmToken, title, body);
  }
};
