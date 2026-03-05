import { resetAllDailyUsage } from "../dao/user.dao";

export const runDailyReset = async (): Promise<void> => {
  console.log("[dailyReset] Resetting daily message counts...");
  const result = await resetAllDailyUsage();
  console.log(`[dailyReset] Reset complete. Modified: ${result.modifiedCount}`);
};
