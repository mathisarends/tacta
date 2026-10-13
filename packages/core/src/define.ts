import { AppModal } from "./app-modal.js";
import { SegmentedTabs } from "./segmented-tabs.js";
import { AppSkeleton } from "./loading/app-skeleton.js";
import { AppSpinner } from "./loading/app-spinner.js";

export function registerCoreElements(): void {
  if (!customElements.get("tacta-modal")) {
    customElements.define("tacta-modal", AppModal);
  }
  if (!customElements.get("tacta-segmented-tabs")) {
    customElements.define("tacta-segmented-tabs", SegmentedTabs);
  }
  if (!customElements.get("tacta-skeleton")) {
    customElements.define("tacta-skeleton", AppSkeleton);
  }
  if (!customElements.get("tacta-spinner")) {
    customElements.define("tacta-spinner", AppSpinner);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tacta-modal": AppModal;
    "tacta-segmented-tabs": SegmentedTabs;
    "tacta-skeleton": AppSkeleton;
    "tacta-spinner": AppSpinner;
  }
}
