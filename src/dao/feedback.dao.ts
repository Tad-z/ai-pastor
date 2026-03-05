import { Feedback } from "../database/models/feedback";

export const createFeedback = async (data: any) => {
  const feedback = new Feedback(data);
  return await feedback.save();
};

export const deleteUserFeedback = async (userId: string): Promise<any> => {
  return await Feedback.deleteMany({ userId }).exec();
};
