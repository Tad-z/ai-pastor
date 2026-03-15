import { Commitment } from "../database/models/commitment";

export const createCommitment = async (data: any) => {
  const commitment = new Commitment(data);
  return await commitment.save();
};

export const getCommitmentById = async (id: string) => {
  return await Commitment.findById(id).exec();
};

export const getUserCommitments = async (userId: string, status?: string) => {
  const query: any = { userId };
  if (status) query.status = status;
  return await Commitment.find(query).sort({ createdAt: -1 }).exec();
};

export const updateCommitment = async (id: string, data: any) => {
  return await Commitment.findByIdAndUpdate(id, data, { returnDocument: "after" }).exec();
};

export const deleteCommitment = async (id: string) => {
  return await Commitment.findByIdAndDelete(id).exec();
};

export const deleteUserCommitments = async (userId: string): Promise<any> => {
  return await Commitment.deleteMany({ userId }).exec();
};

export const getActiveCommitmentsWithReminderTime = async (time: string) => {
  return await Commitment.find({
    status: "active",
    "schedule.reminderTime": time,
  })
    .populate("userId")
    .exec();
};

export const getAllActiveCommitments = async () => {
  return await Commitment.find({ status: "active" }).exec();
};
