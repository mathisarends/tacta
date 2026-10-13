import { keyboardText } from "./messages/index.js";

export const ShortcutPlatform = {
  Mac: "mac",
  Other: "other",
} as const;
export type ShortcutPlatform = (typeof ShortcutPlatform)[keyof typeof ShortcutPlatform];
export type Shortcut = { key: string; shift?: boolean; allowInRawKeys?: boolean };

export function shortcutPlatform(platform = navigator.platform): ShortcutPlatform {
  if (/Mac|iPhone|iPad|iPod/i.test(platform)) {
    return ShortcutPlatform.Mac;
  }
  return ShortcutPlatform.Other;
}

type ShortcutEvent = Pick<
  KeyboardEvent,
  "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey" | "isComposing" | "defaultPrevented"
>;

export function matchesShortcut(
  event: ShortcutEvent,
  shortcut: Shortcut,
  platform = shortcutPlatform(),
): boolean {
  if (event.defaultPrevented || event.isComposing || event.altKey) {
    return false;
  }
  if (platform === ShortcutPlatform.Mac && (!event.metaKey || event.ctrlKey)) {
    return false;
  }
  if (platform === ShortcutPlatform.Other && (!event.ctrlKey || event.metaKey)) {
    return false;
  }
  return event.shiftKey === !!shortcut.shift && event.key.toLowerCase() === shortcut.key;
}

export function shortcutLabel(
  shortcut: Shortcut | undefined,
  platform = shortcutPlatform(),
): string {
  if (!shortcut) {
    return "";
  }
  let label = `${keyboardText.control}+`;
  if (platform === ShortcutPlatform.Mac) {
    label = "⌘";
  }
  if (shortcut.shift && platform === ShortcutPlatform.Mac) {
    label += "⇧";
  } else if (shortcut.shift) {
    label += `${keyboardText.shift}+`;
  }
  return `${label}${shortcut.key.toUpperCase()}`;
}

export function shortcutAria(
  shortcut: Shortcut | undefined,
  platform = shortcutPlatform(),
): string {
  if (!shortcut) {
    return "";
  }
  let label = "Control+";
  if (platform === ShortcutPlatform.Mac) {
    label = "Meta+";
  }
  if (shortcut.shift) {
    label += "Shift+";
  }
  return `${label}${shortcut.key.toUpperCase()}`;
}
