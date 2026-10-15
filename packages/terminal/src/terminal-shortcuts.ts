import type { Shortcut } from "@tacta/core/keyboard/shortcuts";

export const terminalShortcuts = {
  search: { key: "f", shift: true },
} as const satisfies Record<string, Shortcut>;
