import type { IconName } from "../icons.js";

export type SearchItem = {
  key?: string;
  label: string;
  action: string;
  href?: string;
  group: "actions" | "conversations" | "files";
  id?: string;
  hint?: string;
  icon?: IconName;
  description?: string;
  keywords?: string;
};

export type SearchConversation = { id: string; title: string; href: string };

export type SearchFilter = "all" | SearchItem["group"];

export type SearchRequest = { query: string; filter: SearchFilter };
