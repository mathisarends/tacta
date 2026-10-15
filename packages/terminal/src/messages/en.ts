import { format, plural } from "@tacta/core/i18n";
import type { de } from "./de.js";

export const en: typeof de = {
  title: "Terminal",
  connecting: "Connecting …",
  connected: "Connected",
  disconnected: "Disconnected",
  ended: "Shell ended",
  reconnect: "Reconnect",
  unavailable: "The Terminal is unavailable. Try connecting again.",
  denied: "Your account has no assigned runtime instance yet.",
  limit: "Close another terminal first.",
  exit: ({ code }: { code: number }) => `Shell ended · Exit ${code}`,
  search: "Search terminal",
  previousMatch: "Previous match",
  nextMatch: "Next match",
  closeSearch: "Close search",
  noResults: "No results",
  result: ({ index, count }: { index: number; count: number }) => `${index} of ${count}`,
  resultCount: ({ count }: { count: number }) =>
    `${format.number(count)} ${plural(count, { one: "match", other: "matches" })}`,
};
