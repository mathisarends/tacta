import { Terminal } from "@xterm/xterm";
import type { ISearchOptions } from "@xterm/addon-search";

export async function loadFontFamily(style: CSSStyleDeclaration): Promise<string> {
  const fontFamily = style.getPropertyValue("--tacta-font-mono").trim() || "monospace";
  try {
    await document.fonts.load(`${style.fontSize} ${fontFamily}`);
    return fontFamily;
  } catch {
    return "monospace";
  }
}

export function createTerminal(style: CSSStyleDeclaration, fontFamily: string): Terminal {
  return new Terminal({
    cursorBlink: true,
    fontFamily,
    fontSize: Number.parseFloat(style.fontSize),
    lineHeight: Number.parseFloat(style.lineHeight) / Number.parseFloat(style.fontSize) || 1,
    scrollback: 5000,
    screenReaderMode: true,
    // Unicode 11 widths are a proposed API.
    allowProposedApi: true,
    disableStdin: true,
    theme: {
      background: style.getPropertyValue("--tacta-color-background").trim(),
      foreground: style.getPropertyValue("--tacta-color-text").trim(),
      cursor: style.getPropertyValue("--tacta-color-accent").trim(),
      selectionBackground: style.getPropertyValue("--tacta-color-accent-soft").trim(),
    },
  });
}

// Decorations only accept #RRGGBB colors.
export function findOptions(style: CSSStyleDeclaration): ISearchOptions {
  const match = style.getPropertyValue("--tacta-color-selection").trim();
  const activeMatch = style.getPropertyValue("--tacta-color-accent").trim();
  return {
    decorations: {
      matchBackground: match,
      matchOverviewRuler: match,
      activeMatchBackground: match,
      activeMatchBorder: activeMatch,
      activeMatchColorOverviewRuler: activeMatch,
    },
  };
}
