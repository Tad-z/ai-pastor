import { response } from "../helpers/utility";
import { Response } from "../interface";
import { getVerseByDate } from "../dao/dailyVerse.dao";
import { getCachedDailyVerse, cacheDailyVerse } from "../services/cache";

const toDateStr = (date: Date) => date.toISOString().split("T")[0];

export const _getDailyVerse = async (date?: Date): Promise<Response> => {
  const target = date || new Date();
  const dateStr = toDateStr(target);

  const cached = await getCachedDailyVerse(dateStr);
  if (cached) return response({ error: false, message: "Daily verse retrieved", data: cached });

  const verse = await getVerseByDate(target);
  if (!verse) return response({ error: true, message: "No verse found for this date" });

  await cacheDailyVerse(dateStr, verse);
  return response({ error: false, message: "Daily verse retrieved", data: verse });
};
