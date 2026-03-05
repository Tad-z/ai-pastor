export interface ITopic {
  _id: string;
  slug: string;
  label: string;
  icon?: string;
  systemPromptAddition: string;
  suggestedFirstMessage?: string;
  isDefault: boolean;
  order: number;
}
