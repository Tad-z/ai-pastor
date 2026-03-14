import { admin } from "../config/firebase";
import { response } from "../helpers/utility";
import { Response } from "../interface";
import { createUser, getUserByFirebaseUid, updateUser, deleteUser } from "../dao/user.dao";
import { deleteUserConversations, getUserConversationIds } from "../dao/conversation.dao";
import { deleteManyByConversationIds } from "../dao/message.dao";
import { deleteUserCheckIns } from "../dao/checkIn.dao";
import { deleteUserCommitments } from "../dao/commitment.dao";
import { deleteUserMemory } from "../dao/userMemory.dao";
import { deleteUserFeedback } from "../dao/feedback.dao";

export const _register = async (firebaseUid: string, decodedToken: any): Promise<Response> => {
  const existing = await getUserByFirebaseUid(firebaseUid);
  if (existing) {
    return response({ error: false, message: "Login successful", data: existing });
  }

  const provider = decodedToken.firebase?.sign_in_provider;
  const isAnonymous = provider === "anonymous";

  const userData = {
    firebaseUid,
    authProvider: isAnonymous ? "anonymous" : provider === "apple.com" ? "apple" : "google",
    isAnonymous,
    email: isAnonymous ? null : decodedToken.email,
    displayName: isAnonymous ? "Friend" : decodedToken.name || decodedToken.email?.split("@")[0] || "Friend",
    profilePhoto: isAnonymous ? null : decodedToken.picture,
  };

  const user = await createUser(userData);
  return response({ error: false, message: "Account created successfully", data: user });
};

export const _linkAccount = async (userId: string, decodedToken: any): Promise<Response> => {
  const provider = decodedToken.firebase?.sign_in_provider;
  const updated = await updateUser(userId, {
    authProvider: provider === "apple.com" ? "apple" : "google",
    isAnonymous: false,
    email: decodedToken.email,
    displayName: decodedToken.name || decodedToken.email?.split("@")[0],
    profilePhoto: decodedToken.picture,
  });
  return response({ error: false, message: "Account linked successfully", data: updated });
};

export const _deleteAccount = async (userId: string, firebaseUid: string): Promise<Response> => {
  const conversationIds = await getUserConversationIds(userId);
  await deleteManyByConversationIds(conversationIds);
  await deleteUserConversations(userId);
  await deleteUserCheckIns(userId);
  await deleteUserCommitments(userId);
  await deleteUserMemory(userId);
  await deleteUserFeedback(userId);
  await deleteUser(userId);
  await admin.auth().deleteUser(firebaseUid);
  return response({ error: false, message: "Account deleted successfully" });
};
