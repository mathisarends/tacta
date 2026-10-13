import type { ReasoningEffort } from "./reasoning-effort.js";

export type ApprovalMode = "smart" | "manual" | "off";

export type ChatModelOption = {
  id: string;
  label: string;
  provider: string;
  reasoningEfforts: ReasoningEffort[];
  defaultReasoningEffort: ReasoningEffort | null;
};

export type QueuedMessage = {
  id: string;
  text: string;
  model: string;
  reasoning: string;
};

export type ComposerOptions = {
  model: string;
  reasoning: ReasoningEffort;
  access: "default" | "smart" | "supervised" | "full";
};

export const defaultComposerOptions: ComposerOptions = {
  model: "",
  reasoning: "",
  access: "default",
};

export type ComposerMessage = ComposerOptions & { text: string; attachments: File[] };

export function selectComposerModel(
  options: ComposerOptions,
  modelId: string,
  models: readonly ChatModelOption[],
): ComposerOptions {
  const model = models.find((item) => item.id === modelId);
  return { ...options, model: modelId, reasoning: model?.defaultReasoningEffort ?? "" };
}

export function approvalMode(access: ComposerOptions["access"]): ApprovalMode | undefined {
  switch (access) {
    case "smart":
      return "smart";
    case "supervised":
      return "manual";
    case "full":
      return "off";
    default:
      return undefined;
  }
}

export function approvalAccess(mode: ApprovalMode | null): ComposerOptions["access"] {
  switch (mode) {
    case "manual":
      return "supervised";
    case "off":
      return "full";
    case "smart":
      return "smart";
    default:
      return "default";
  }
}
