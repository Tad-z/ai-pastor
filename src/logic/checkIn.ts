import { response } from "../helpers/utility";
import { Response } from "../interface";
import { getCommitmentById, updateCommitment } from "../dao/commitment.dao";
import { createCheckIn, getCheckInByDate, getCheckInHistory, countCheckIns } from "../dao/checkIn.dao";
import { getTemplateByScenario, getRandomMessage } from "../dao/encouragementTemplate.dao";
import { getUserById } from "../dao/user.dao";
import { geminiFlash } from "../providers/ai/gemini";
import { sendPushNotification } from "../services/notification";
import { getTodayInTimezone, isMilestoneDay, MILESTONE_DAYS } from "../helpers/date";
import { getPagingResponseDetails, preparePagingValues } from "../helpers/pagination";

export const _submitCheckIn = async (
  userId: string,
  commitmentId: string,
  data: { status: "success" | "relapse"; note?: string; mood?: string }
): Promise<Response> => {
  const commitment = await getCommitmentById(commitmentId);
  if (!commitment) return response({ error: true, message: "Commitment not found" });
  if (commitment.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });
  if (commitment.status !== "active") return response({ error: true, message: "Commitment is not active" });

  const today = getTodayInTimezone(commitment.schedule?.timezone);
  const existing = await getCheckInByDate(commitmentId, today);
  if (existing) return response({ error: true, message: "Already checked in today" });

  let aiResponse = "";
  const commitmentUpdate: any = { "stats.totalCheckIns": (commitment.stats?.totalCheckIns || 0) + 1 };

  if (data.status === "success") {
    const newStreak = (commitment.streak?.current || 0) + 1;
    const longest = Math.max(newStreak, commitment.streak?.longest || 0);
    commitmentUpdate["streak.current"] = newStreak;
    commitmentUpdate["streak.longest"] = longest;
    commitmentUpdate["streak.lastCheckInDate"] = today;
    commitmentUpdate["stats.successfulDays"] = (commitment.stats?.successfulDays || 0) + 1;

    // Select encouragement
    let templates;
    if (newStreak <= 3) {
      templates = await getTemplateByScenario("early_success", undefined, commitment.category);
    } else if (MILESTONE_DAYS.includes(newStreak)) {
      templates = await getTemplateByScenario("milestone", newStreak, commitment.category);
    } else {
      templates = await getTemplateByScenario("daily_success", undefined, commitment.category);
    }

    aiResponse = getRandomMessage(templates) || "Well done! Keep going — God is with you.";

    // Send milestone push notification
    if (MILESTONE_DAYS.includes(newStreak)) {
      const user = await getUserById(userId);
      if (user?.notifications?.fcmToken) {
        await sendPushNotification(
          user.notifications.fcmToken,
          `${newStreak} day streak! 🎉`,
          `You've been strong for ${newStreak} days! Open AI Pastor to celebrate.`
        );
      }
    }
  } else {
    // Relapse
    commitmentUpdate["streak.current"] = 0;
    commitmentUpdate["stats.relapseDays"] = (commitment.stats?.relapseDays || 0) + 1;

    const result = await geminiFlash.generate(
      [{ role: "user", content: `Generate a brief, compassionate encouragement for someone who relapsed on their commitment to "${commitment.title}". Their streak was ${commitment.streak?.current || 0} days. Be pastoral, warm, and remind them that God's grace is bigger than their failure.` }],
      { systemPrompt: "You are a compassionate pastoral AI. Keep your response to 2-3 sentences." }
    );
    aiResponse = result.text;
  }

  const checkIn = await createCheckIn({
    commitmentId,
    userId,
    date: today,
    status: data.status,
    note: data.note,
    mood: data.mood,
    aiResponse,
  });

  await updateCommitment(commitmentId, commitmentUpdate);

  return response({ error: false, message: "Check-in submitted", data: { checkIn, encouragement: aiResponse } });
};

export const _getCheckInHistory = async (userId: string, commitmentId: string, page: number, limit: number): Promise<Response> => {
  const commitment = await getCommitmentById(commitmentId);
  if (!commitment) return response({ error: true, message: "Commitment not found" });
  if (commitment.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });

  const { skip } = preparePagingValues(page, limit);
  const [history, total] = await Promise.all([
    getCheckInHistory(commitmentId, skip, limit),
    countCheckIns(commitmentId),
  ]);

  return response({
    error: false,
    message: "Check-in history retrieved",
    data: { items: history, pagination: getPagingResponseDetails(total, page, limit) },
  });
};
