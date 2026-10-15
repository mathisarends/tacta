import { registerCoreElements } from "@tacta/core/define";
import { TextInput } from "./text-input.js";
import { PasswordInput } from "./password-input.js";
import { CtaButton } from "./cta-button.js";
import { SocialLoginButton } from "./social-login-button.js";
import { LocaleSwitch } from "./locale-switch.js";
import { PageTitle } from "./page-title.js";
import { KeyChord } from "./key-chord.js";
import { PillTabs } from "./pill-tabs.js";
import { SaveIndicator } from "./save-indicator.js";
import { AppSelect } from "./select/app-select.js";
import { AppCheckbox } from "./checkbox/app-checkbox.js";
import { SettingsRow } from "./settings/settings-row.js";
import { SettingsSection } from "./settings/settings-section.js";
import { AppBreadcrumb } from "./breadcrumb/app-breadcrumb.js";
export function registerControlsElements(): void {
  registerCoreElements();
  if (!customElements.get("tacta-text-input")) {
    customElements.define("tacta-text-input", TextInput);
  }
  if (!customElements.get("tacta-password-input")) {
    customElements.define("tacta-password-input", PasswordInput);
  }
  if (!customElements.get("tacta-cta-button")) {
    customElements.define("tacta-cta-button", CtaButton);
  }
  if (!customElements.get("tacta-social-login-button")) {
    customElements.define("tacta-social-login-button", SocialLoginButton);
  }
  if (!customElements.get("tacta-locale-switch")) {
    customElements.define("tacta-locale-switch", LocaleSwitch);
  }
  if (!customElements.get("tacta-page-title")) {
    customElements.define("tacta-page-title", PageTitle);
  }
  if (!customElements.get("tacta-key-chord")) {
    customElements.define("tacta-key-chord", KeyChord);
  }
  if (!customElements.get("tacta-pill-tabs")) {
    customElements.define("tacta-pill-tabs", PillTabs);
  }
  if (!customElements.get("tacta-save-indicator")) {
    customElements.define("tacta-save-indicator", SaveIndicator);
  }
  if (!customElements.get("tacta-app-select")) {
    customElements.define("tacta-app-select", AppSelect);
  }
  if (!customElements.get("tacta-app-checkbox")) {
    customElements.define("tacta-app-checkbox", AppCheckbox);
  }
  if (!customElements.get("tacta-settings-row")) {
    customElements.define("tacta-settings-row", SettingsRow);
  }
  if (!customElements.get("tacta-settings-section")) {
    customElements.define("tacta-settings-section", SettingsSection);
  }
  if (!customElements.get("tacta-app-breadcrumb")) {
    customElements.define("tacta-app-breadcrumb", AppBreadcrumb);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-text-input": TextInput;
    "tacta-password-input": PasswordInput;
    "tacta-cta-button": CtaButton;
    "tacta-social-login-button": SocialLoginButton;
    "tacta-locale-switch": LocaleSwitch;
    "tacta-page-title": PageTitle;
    "tacta-key-chord": KeyChord;
    "tacta-pill-tabs": PillTabs;
    "tacta-save-indicator": SaveIndicator;
    "tacta-app-select": AppSelect;
    "tacta-app-checkbox": AppCheckbox;
    "tacta-settings-row": SettingsRow;
    "tacta-settings-section": SettingsSection;
    "tacta-app-breadcrumb": AppBreadcrumb;
  }
}
