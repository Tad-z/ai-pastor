import { CRISIS_OVERRIDE, ABUSE_OVERRIDE } from "../providers/ai/prompts";

export interface SafetyResult {
  isCrisis: boolean;
  isAbuse: boolean;
  safetyOverrides: string[];
}

const CRISIS_KEYWORDS = [
  "suicide", "suicidal", "kill myself", "end my life", "don't want to live",
  "want to die", "self-harm", "self harm", "cutting myself", "hurt myself",
  "i want to die", "no reason to live", "take my life",
];

const ABUSE_KEYWORDS = [
  "he hits me", "she hits me", "beats me", "abusing me", "being abused",
  "domestic violence", "sexual assault", "rape", "molested", "trafficking",
  "he beat me", "she beat me", "he hurt me", "she hurt me",
];

export const runSafetyCheck = (content: string): SafetyResult => {
  const lower = content.toLowerCase();
  const isCrisis = CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
  const isAbuse = ABUSE_KEYWORDS.some((kw) => lower.includes(kw));

  const safetyOverrides: string[] = [];
  if (isCrisis) safetyOverrides.push(CRISIS_OVERRIDE);
  if (isAbuse) safetyOverrides.push(ABUSE_OVERRIDE);

  return { isCrisis, isAbuse, safetyOverrides };
};
