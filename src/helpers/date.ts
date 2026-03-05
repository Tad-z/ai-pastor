export const normalizeToMidnight = (date: Date, timezone = "Africa/Lagos"): Date => {
  const dateStr = date.toLocaleDateString("en-CA", { timeZone: timezone });
  return new Date(`${dateStr}T00:00:00.000Z`);
};

export const getTodayInTimezone = (timezone = "Africa/Lagos"): Date => {
  return normalizeToMidnight(new Date(), timezone);
};

export const getCurrentTimeHHMM = (timezone = "Africa/Lagos"): string => {
  return new Date().toLocaleTimeString("en-NG", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const MILESTONE_DAYS = [7, 14, 30, 60, 90];

export const isMilestoneDay = (streak: number): boolean => MILESTONE_DAYS.includes(streak);
