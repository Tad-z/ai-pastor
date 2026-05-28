import { DailyVerse } from "../database/models/dailyVerse";

export const getVerseByDate = async (date: Date) => {
  const start = new Date(date);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setUTCHours(23, 59, 59, 999);
  return await DailyVerse.findOne({ date: { $gte: start, $lte: end } }).exec();
};
