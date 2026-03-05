export interface IEncouragementTemplate {
  _id: string;
  scenario: "early_success" | "milestone" | "daily_success" | "first_checkin" | "return_after_absence";
  milestoneDay?: number;
  category?: string;
  messages: string[];
  scriptureRef?: string;
}
