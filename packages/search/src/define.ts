import { SearchBar } from "./search-bar.js";
export function registerSearchElements(): void {
  if (!customElements.get("tacta-search-bar")) {
    customElements.define("tacta-search-bar", SearchBar);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-search-bar": SearchBar;
  }
}
