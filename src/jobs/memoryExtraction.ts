import { User } from "../database/models/user";
import { getRecentMessages } from "../dao/message.dao";
import { getUserConversationIds } from "../dao/conversation.dao";
import { extractMemoriesFromMessages } from "../services/memory";

export const runMemoryExtraction = async (): Promise<void> => {
  console.log("[memoryExtraction] Starting memory extraction...");

  const users = await User.find({ "dataControls.personalizeWithMemories": true }).exec();

  for (const user of users) {
    try {
      const conversationIds = await getUserConversationIds(user._id.toString());
      if (!conversationIds.length) continue;

      // Collect messages from the 3 most recent conversations (already sorted by updatedAt desc)
      const recentIds = conversationIds.slice(0, 3);
      const allMessages: Array<{ role: string; content: string }> = [];
      for (const conversationId of recentIds) {
        const messages = await getRecentMessages(conversationId, 30);
        allMessages.push(...messages.map((m: any) => ({ role: m.role, content: m.content })));
      }

      if (allMessages.length < 5) continue;

      await extractMemoriesFromMessages(user._id.toString(), allMessages);
    } catch (error) {
      console.error(`[memoryExtraction] Error for user ${user._id}:`, error);
    }
  }

  console.log("[memoryExtraction] Complete");
};
