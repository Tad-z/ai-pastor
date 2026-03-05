import { geminiFlash } from "../providers/ai/gemini";
import { getUserMemory, upsertUserMemory } from "../dao/userMemory.dao";

export const extractMemoriesFromMessages = async (
  userId: string,
  messages: Array<{ role: string; content: string }>
): Promise<void> => {
  try {
    const existingMemory = await getUserMemory(userId);
    const existingFacts = existingMemory?.memories.map((m: any) => m.fact) || [];

    const conversationText = messages
      .map((m) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `Based on this conversation, extract key personal facts about the user that would be helpful in future pastoral conversations. Return ONLY a JSON array of objects with "fact" and "confidence" (0-1) fields. Only include new facts not in the existing list. If no new facts, return empty array [].

Existing facts: ${existingFacts.join("; ")}

Conversation:
${conversationText}`;

    const result = await geminiFlash.generate(
      [{ role: "user", content: prompt }],
      { systemPrompt: "You are a helpful assistant that extracts personal facts from conversations." }
    );

    const jsonMatch = result.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return;

    const newFacts: Array<{ fact: string; confidence: number }> = JSON.parse(jsonMatch[0]);
    if (!newFacts.length) return;

    const memories = newFacts.map((f) => ({
      fact: f.fact,
      source: "conversation" as const,
      extractedAt: new Date(),
      confidence: f.confidence,
    }));

    await upsertUserMemory(userId, memories);
  } catch (error) {
    console.error("Memory extraction error:", error);
  }
};
