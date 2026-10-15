import { RemoteTerminal } from "./remote-terminal.js";
import { TerminalSearch } from "./terminal-search.js";
export function registerTerminalElements(): void {
  if (!customElements.get("tacta-remote-terminal")) {
    customElements.define("tacta-remote-terminal", RemoteTerminal);
  }
  if (!customElements.get("tacta-terminal-search")) {
    customElements.define("tacta-terminal-search", TerminalSearch);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-remote-terminal": RemoteTerminal;
    "tacta-terminal-search": TerminalSearch;
  }
}
