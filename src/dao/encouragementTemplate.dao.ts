import { EncouragementTemplate } from "../database/models/encouragementTemplate";

export const getTemplateByScenario = async (scenario: string, milestoneDay?: number, category?: string) => {
  const query: any = { scenario };
  if (milestoneDay !== undefined) query.milestoneDay = milestoneDay;
  if (category) query.$or = [{ category }, { category: null }];
  return await EncouragementTemplate.find(query).exec();
};

export const getRandomMessage = (templates: any[]): string | null => {
  if (!templates.length) return null;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const messages = template.messages;
  return messages[Math.floor(Math.random() * messages.length)];
};
