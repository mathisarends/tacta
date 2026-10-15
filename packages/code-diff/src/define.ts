import { CodeDiff } from "./code-diff.js";
export function registerCodeDiffElements(): void {
  if (!customElements.get("tacta-code-diff")) {
    customElements.define("tacta-code-diff", CodeDiff);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-code-diff": CodeDiff;
  }
}
