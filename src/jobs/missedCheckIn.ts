import { getAllActiveCommitments, updateCommitment } from "../dao/commitment.dao";
import { getCheckInByDate, createCheckIn } from "../dao/checkIn.dao";
import { getTodayInTimezone, normalizeToMidnight } from "../helpers/date";

export const runMissedCheckInJob = async (): Promise<void> => {
  console.log("[missedCheckIn] Processing missed check-ins...");
  const commitments = await getAllActiveCommitments();
  let count = 0;

  for (const commitment of commitments) {
    const timezone = commitment.schedule?.timezone;
    const today = getTodayInTimezone(timezone);

    // Skip commitments that started today — user hasn't had a chance to check in yet
    const startDay = normalizeToMidnight(new Date(commitment.startDate), timezone);
    if (startDay.getTime() === today.getTime()) continue;

    const existing = await getCheckInByDate(commitment._id.toString(), today);
    if (!existing) {
      await createCheckIn({
        commitmentId: commitment._id,
        userId: commitment.userId,
        date: today,
        status: "skipped",
      });
      await updateCommitment(commitment._id.toString(), {
        $inc: { "stats.skippedDays": 1 },
      });
      count++;
    }
  }

  console.log(`[missedCheckIn] Marked ${count} missed check-ins`);
};
