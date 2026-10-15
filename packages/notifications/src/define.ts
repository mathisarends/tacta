import { ToastRegion } from "./toast-region.js";
export function registerNotificationsElements(): void {
  if (!customElements.get("tacta-toast-region")) {
    customElements.define("tacta-toast-region", ToastRegion);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-toast-region": ToastRegion;
  }
}
