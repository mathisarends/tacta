import type { Shortcut } from "@tacta/core/keyboard/shortcuts";

export const imageShortcuts = {
  undo: { key: "z", allowInRawKeys: true },
  redo: { key: "z", shift: true, allowInRawKeys: true },
} as const satisfies Record<string, Shortcut>;
