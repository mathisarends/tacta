import { AppSelect } from "./select/app-select.js";
import { TextInput } from "./text-input.js";
import { AppCheckbox } from "./checkbox.js";
import { SettingsRow } from "./settings/settings-row.js";
import { SettingsSection } from "./settings/settings-section.js";
import { PagePagination } from "./page-pagination.js";
import { PillTabs } from "./pill-tabs.js";
import { AppBreadcrumb } from "./breadcrumb/app-breadcrumb.js";
import { SaveIndicator } from "./save-indicator.js";
import { SearchBar } from "./search-bar/search-bar.js";
import { SearchFilters } from "./search-bar/search-filters.js";
import { AppModal } from "./app-modal.js";
import { SegmentedTabs } from "./segmented-tabs.js";
import { AppSkeleton } from "./loading/app-skeleton.js";
import { AppSpinner } from "./loading/app-spinner.js";

export function registerCoreElements(): void {
  if (!customElements.get("tacta-text-input")) {
    customElements.define("tacta-text-input", TextInput);
  }
  if (!customElements.get("tacta-checkbox")) {
    customElements.define("tacta-checkbox", AppCheckbox);
  }
  if (!customElements.get("tacta-select")) {
    customElements.define("tacta-select", AppSelect);
  }
  if (!customElements.get("tacta-settings-row")) {
    customElements.define("tacta-settings-row", SettingsRow);
  }
  if (!customElements.get("tacta-settings-section")) {
    customElements.define("tacta-settings-section", SettingsSection);
  }
  if (!customElements.get("tacta-page-pagination")) {
    customElements.define("tacta-page-pagination", PagePagination);
  }
  if (!customElements.get("tacta-pill-tabs")) {
    customElements.define("tacta-pill-tabs", PillTabs);
  }
  if (!customElements.get("tacta-breadcrumb")) {
    customElements.define("tacta-breadcrumb", AppBreadcrumb);
  }
  if (!customElements.get("tacta-save-indicator")) {
    customElements.define("tacta-save-indicator", SaveIndicator);
  }
  if (!customElements.get("tacta-search-bar")) {
    customElements.define("tacta-search-bar", SearchBar);
  }
  if (!customElements.get("tacta-search-filters")) {
    customElements.define("tacta-search-filters", SearchFilters);
  }
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
    "tacta-text-input": TextInput;
    "tacta-checkbox": AppCheckbox;
    "tacta-select": AppSelect;
    "tacta-settings-row": SettingsRow;
    "tacta-settings-section": SettingsSection;
    "tacta-page-pagination": PagePagination;
    "tacta-pill-tabs": PillTabs;
    "tacta-breadcrumb": AppBreadcrumb;
    "tacta-save-indicator": SaveIndicator;
    "tacta-search-bar": SearchBar;
    "tacta-search-filters": SearchFilters;
    "tacta-modal": AppModal;
    "tacta-segmented-tabs": SegmentedTabs;
    "tacta-skeleton": AppSkeleton;
    "tacta-spinner": AppSpinner;
  }
}
