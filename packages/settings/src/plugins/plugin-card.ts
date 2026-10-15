import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import type { PluginInfo } from "../types.js";
import { icon } from "@tacta/core/icons";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { SaveIndicatorState } from "@tacta/controls/save-indicator";
import "@tacta/controls/save-indicator";
import "@tacta/controls/settings/settings-row";
import { pluginsText as text } from "./messages/index.js";

export type PluginToggle = { id: string; enabled: boolean };

export class PluginCard extends LitElement {
  @property({ attribute: false }) plugin!: PluginInfo;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) saving = false;
  @property({ type: Boolean }) saved = false;
  @property() error = "";

  private get pluginIcon(): "globe" | "puzzle" {
    return this.plugin.id === "cdp" ? "globe" : "puzzle";
  }

  private get saveState(): SaveIndicatorState {
    if (this.error) {
      return "error";
    }
    if (this.saving) {
      return "saving";
    }
    return this.saved ? "saved" : "idle";
  }

  private get actionLabel(): string {
    const name = this.plugin.name;
    return this.plugin.enabled ? text.disableLabel({ name }) : text.enableLabel({ name });
  }

  private toggle(): void {
    if (this.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<PluginToggle>("plugin-toggle", {
        detail: { id: this.plugin.id, enabled: !this.plugin.enabled },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    .mark {
      display: grid;
      place-items: center;
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .skills,
    .status {
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      font-weight: var(--tacta-font-weight-body, var(--tacta-font-weight-regular));
    }
    .button {
      min-height: 36px;
      padding: 6px 14px;
    }
    .error {
      margin: 0;
      color: var(--tacta-color-error, #f0aaa1);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    }
  `;

  private renderError(): TemplateResult<1> | typeof nothing {
    if (!this.error) {
      return nothing;
    }
    return html`<p class="error" role="alert">${this.error}</p>`;
  }

  override render(): TemplateResult<1> {
    return html`<settings-row
      heading=${this.plugin.name}
      description=${this.plugin.description}
      aria-busy=${this.saving}
    >
      <span slot="icon" class="mark">${icon(this.pluginIcon, 18)}</span>
      <span slot="badge" class="skills"
        >${text.skillCount({ count: this.plugin.skills.length })}</span
      >
      <span slot="control" class="status"
        >${this.plugin.enabled ? text.active : text.inactive}</span
      >
      <save-indicator
        slot="control"
        .state=${this.saveState}
        .savingLabel=${text.saving}
        .savedLabel=${text.saved}
      ></save-indicator>
      <button
        slot="control"
        class=${this.plugin.enabled ? "button activation" : "button primary activation"}
        aria-label=${this.actionLabel}
        ?disabled=${this.disabled}
        @click=${this.toggle}
      >
        ${this.plugin.enabled ? text.disable : text.enable}
      </button>
      ${this.renderError()}
    </settings-row>`;
  }
}
