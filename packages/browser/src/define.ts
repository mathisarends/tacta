import { BrowserAddressBar } from "./browser-address-bar.js";
import { BrowserNavigation } from "./browser-navigation.js";
import { RemoteBrowser } from "./remote-browser.js";
import { BrowserPanel } from "./browser-panel.js";
export function registerBrowserElements(): void {
  if (!customElements.get("tacta-browser-address-bar")) {
    customElements.define("tacta-browser-address-bar", BrowserAddressBar);
  }
  if (!customElements.get("tacta-browser-navigation")) {
    customElements.define("tacta-browser-navigation", BrowserNavigation);
  }
  if (!customElements.get("tacta-remote-browser")) {
    customElements.define("tacta-remote-browser", RemoteBrowser);
  }
  if (!customElements.get("tacta-browser-panel")) {
    customElements.define("tacta-browser-panel", BrowserPanel);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-browser-address-bar": BrowserAddressBar;
    "tacta-browser-navigation": BrowserNavigation;
    "tacta-remote-browser": RemoteBrowser;
    "tacta-browser-panel": BrowserPanel;
  }
}
