import type { IconName } from "@tacta/core/icons";
import type { ApprovalMode, ComposerOptions } from "./composer/options.js";
import { chatUiText } from "./messages/index.js";

type ApprovalOption = {
  value: Exclude<ComposerOptions["access"], "default">;
  mode: ApprovalMode;
  label: string;
  description: string;
  icon: IconName;
};

export function approvalOptions(): ApprovalOption[] {
  return [
    {
      value: "smart",
      mode: "smart",
      label: chatUiText.composer.smart,
      description: chatUiText.composer.smartDescription,
      icon: "shield",
    },
    {
      value: "supervised",
      mode: "manual",
      label: chatUiText.composer.supervised,
      description: chatUiText.composer.supervisedDescription,
      icon: "lock",
    },
    {
      value: "full",
      mode: "off",
      label: chatUiText.composer.full,
      description: chatUiText.composer.fullDescription,
      icon: "unlock",
    },
  ];
}
