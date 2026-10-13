export type ReasoningEffort = string;

export const knownReasoningEfforts = [
  "none",
  "minimal",
  "low",
  "medium",
  "high",
  "xhigh",
  "max",
] as const;
export type KnownReasoningEffort = (typeof knownReasoningEfforts)[number];

export function isKnownReasoningEffort(effort: ReasoningEffort): effort is KnownReasoningEffort {
  return knownReasoningEfforts.some((known) => known === effort);
}
