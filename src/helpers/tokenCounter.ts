// Rough token estimation: ~4 chars per token for English text
export const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const estimateMessagesTokens = (
  messages: Array<{ role: string; content: string }>
): number => {
  return messages.reduce((total, msg) => total + estimateTokens(msg.content) + 4, 0);
};

export const FREE_PLAN_DAILY_LIMIT = 20;
