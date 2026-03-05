import { CheckIn } from "../database/models/checkIn";

export const createCheckIn = async (data: any) => {
  const checkIn = new CheckIn(data);
  return await checkIn.save();
};

export const getCheckInByDate = async (commitmentId: string, date: Date) => {
  return await CheckIn.findOne({ commitmentId, date }).exec();
};

export const getCheckInHistory = async (commitmentId: string, skip: number, limit: number) => {
  return await CheckIn.find({ commitmentId }).sort({ date: -1 }).skip(skip).limit(limit).exec();
};

export const countCheckIns = async (commitmentId: string) => {
  return await CheckIn.countDocuments({ commitmentId }).exec();
};

export const deleteCommitmentCheckIns = async (commitmentId: string): Promise<any> => {
  return await CheckIn.deleteMany({ commitmentId }).exec();
};

export const deleteUserCheckIns = async (userId: string): Promise<any> => {
  return await CheckIn.deleteMany({ userId }).exec();
};
