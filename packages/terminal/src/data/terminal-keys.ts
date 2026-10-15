type KeyEvent = Pick<KeyboardEvent, "key" | "ctrlKey" | "altKey" | "metaKey" | "shiftKey">;

export function isWordDelete(event: KeyEvent): boolean {
  return event.ctrlKey && !event.altKey && !event.metaKey && event.key === "Backspace";
}

// xterm turns these into control characters; left to the browser, they raise the native
// copy and paste events that xterm's clipboard handlers listen for.
export function isClipboardShortcut(event: KeyEvent, hasSelection: boolean): boolean {
  if (event.altKey || event.metaKey) {
    return false;
  }
  const key = event.key.toLowerCase();
  if (event.ctrlKey && key === "v") {
    return true;
  }
  if (event.shiftKey && !event.ctrlKey && key === "insert") {
    return true;
  }
  const copy = event.ctrlKey && !event.shiftKey && (key === "c" || key === "insert");
  return copy && hasSelection;
}
