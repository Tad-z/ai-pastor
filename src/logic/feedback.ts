import { response } from "../helpers/utility";
import { Response } from "../interface";
import { createFeedback } from "../dao/feedback.dao";

export const _submitFeedback = async (
  userId: string,
  data: { content: string; appVersion: string; platform: string }
): Promise<Response> => {
  if (!data.content) return response({ error: true, message: "Feedback content is required" });
  if (!data.appVersion) return response({ error: true, message: "App version is required" });
  if (!data.platform) return response({ error: true, message: "Platform is required" });

  const feedback = await createFeedback({ userId, ...data });
  return response({ error: false, message: "Feedback submitted. Thank you!", data: feedback });
};
