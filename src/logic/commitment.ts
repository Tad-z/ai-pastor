import { response } from "../helpers/utility";
import { Response } from "../interface";
import {
  createCommitment,
  getCommitmentById,
  getUserCommitments,
  updateCommitment,
  deleteCommitment,
} from "../dao/commitment.dao";
import { deleteCommitmentCheckIns } from "../dao/checkIn.dao";

export const _createCommitment = async (
  userId: string,
  data: { title: string; category: string; description?: string; reminderTime?: string; timezone?: string; originConversationId?: string }
): Promise<Response> => {
  if (!data.title) return response({ error: true, message: "Title is required" });
  if (!data.category) return response({ error: true, message: "Category is required" });

  const commitment = await createCommitment({
    userId,
    title: data.title,
    description: data.description,
    category: data.category,
    status: "active",
    streak: { current: 0, longest: 0, lastCheckInDate: null },
    schedule: {
      frequency: "daily",
      reminderTime: data.reminderTime || "09:00",
      timezone: data.timezone || "Africa/Lagos",
    },
    originConversationId: data.originConversationId,
    stats: { totalCheckIns: 0, successfulDays: 0, relapseDays: 0, skippedDays: 0 },
    startDate: new Date(),
  });

  return response({ error: false, message: "Commitment created", data: commitment });
};

export const _getCommitments = async (userId: string, status?: string): Promise<Response> => {
  const commitments = await getUserCommitments(userId, status);
  return response({ error: false, message: "Commitments retrieved", data: commitments });
};

export const _getCommitment = async (userId: string, commitmentId: string): Promise<Response> => {
  const commitment = await getCommitmentById(commitmentId);
  if (!commitment) return response({ error: true, message: "Commitment not found" });
  if (commitment.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });
  return response({ error: false, message: "Commitment retrieved", data: commitment });
};

const VALID_STATUSES = ["active", "paused", "completed", "abandoned"] as const;

export const _updateCommitment = async (userId: string, commitmentId: string, data: any): Promise<Response> => {
  const commitment = await getCommitmentById(commitmentId);
  if (!commitment) return response({ error: true, message: "Commitment not found" });
  if (commitment.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });

  if (data.status !== undefined && !(VALID_STATUSES as readonly string[]).includes(data.status)) {
    return response({ error: true, message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}` });
  }

  const allowed = ["status", "schedule.reminderTime", "schedule.timezone", "description", "title"];
  const update: any = {};
  for (const key of Object.keys(data)) {
    if (allowed.includes(key)) update[key] = data[key];
  }

  const updated = await updateCommitment(commitmentId, update);
  return response({ error: false, message: "Commitment updated", data: updated });
};

export const _deleteCommitment = async (userId: string, commitmentId: string): Promise<Response> => {
  const commitment = await getCommitmentById(commitmentId);
  if (!commitment) return response({ error: true, message: "Commitment not found" });
  if (commitment.userId.toString() !== userId) return response({ error: true, message: "Unauthorized" });
  await deleteCommitmentCheckIns(commitmentId);
  await deleteCommitment(commitmentId);
  return response({ error: false, message: "Commitment deleted" });
};
