import { registerCoreElements } from "@tacta/core/define";
import { registerControlsElements } from "@tacta/controls/define";
import { registerSidebarElements } from "@tacta/sidebar/define";
import { PromptTemplateCard } from "./account/prompt-template-card.js";
import { PromptTemplateEditor } from "./account/prompt-template-editor.js";
import { AgentApprovalSettings } from "./account/agent-approval-settings.js";
import { ProfileCard } from "./account/profile-card.js";
import { ProfileCardSkeleton } from "./account/profile-card-skeleton.js";
import { PluginCard } from "./plugins/plugin-card.js";
import { SettingsDialog } from "./dialog/app-modal.js";
export function registerSettingsElements(): void {
  registerCoreElements();
  registerControlsElements();
  registerSidebarElements();
  if (!customElements.get("tacta-prompt-template-card")) {
    customElements.define("tacta-prompt-template-card", PromptTemplateCard);
  }
  if (!customElements.get("tacta-prompt-template-editor")) {
    customElements.define("tacta-prompt-template-editor", PromptTemplateEditor);
  }
  if (!customElements.get("tacta-agent-approval-settings")) {
    customElements.define("tacta-agent-approval-settings", AgentApprovalSettings);
  }
  if (!customElements.get("tacta-profile-card")) {
    customElements.define("tacta-profile-card", ProfileCard);
  }
  if (!customElements.get("tacta-profile-card-skeleton")) {
    customElements.define("tacta-profile-card-skeleton", ProfileCardSkeleton);
  }
  if (!customElements.get("tacta-plugin-card")) {
    customElements.define("tacta-plugin-card", PluginCard);
  }
  if (!customElements.get("tacta-settings-dialog")) {
    customElements.define("tacta-settings-dialog", SettingsDialog);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-prompt-template-card": PromptTemplateCard;
    "tacta-prompt-template-editor": PromptTemplateEditor;
    "tacta-agent-approval-settings": AgentApprovalSettings;
    "tacta-profile-card": ProfileCard;
    "tacta-profile-card-skeleton": ProfileCardSkeleton;
    "tacta-plugin-card": PluginCard;
    "tacta-settings-dialog": SettingsDialog;
  }
}
