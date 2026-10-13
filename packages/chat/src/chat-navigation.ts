import type { Message } from "./index.js";
import type { ChatNavigationEntry } from "./navigation-types.js";

export function chatNavigationEntries(messages: readonly Message[]): ChatNavigationEntry[] {
  const entries: ChatNavigationEntry[] = [];
  for (const message of messages) {
    const text =
      message.text.trim() || message.attachments?.map((file) => file.name).join(", ") || "";
    const previous = entries.at(-1);
    if (message.role === "human" || !previous) {
      entries.push({ id: message.id, title: text, preview: "" });
      continue;
    }
    if (text) {
      previous.preview = `${previous.preview} ${text}`.trim().slice(0, 400);
    }
  }
  return entries;
}
