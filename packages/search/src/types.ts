import type { IconName } from "@tacta/core/icons";

export type SearchItem = {
  label: string;
  action: string;
  href: string;
  group: "actions" | "conversations";
  id?: string;
  hint?: string;
  icon?: IconName;
};

export type SearchConversation = { id: string; title: string; href: string };
