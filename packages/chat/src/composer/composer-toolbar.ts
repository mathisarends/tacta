import { modelProvider, providerIcon } from "./model-provider.js";
import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import {
  defaultComposerOptions,
  type ApprovalMode,
  type ChatModelOption,
  type ComposerOptions,
} from "./options.js";
import { chatUiText } from "../messages/index.js";
import "../voice-input/index.js";
import "./composer-settings.js";
import "./chat-send-button.js";

export class ComposerToolbar extends LitElement {
  @property({ attribute: false }) providerInfo = modelProvider;
  @property({ attribute: false }) renderProviderIcon = providerIcon;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) running = false;
  @property({ type: Boolean }) stopping = false;
  @property({ type: Boolean }) stopDisabled = false;
  @property({ type: Boolean }) sendDisabled = false;
  @property({ type: Boolean }) hasText = false;
  @property({ type: Boolean }) dictating = false;
  @property() context = "";
  @property() defaultApprovalMode: ApprovalMode = "smart";
  @property({ attribute: false }) models: ChatModelOption[] = [];
  @property({ attribute: false }) options: ComposerOptions = { ...defaultComposerOptions };

  private get showStop(): boolean {
    return this.running && (!this.hasText || this.stopping);
  }

  private get sendLabel(): string {
    if (!this.showStop) {
      return chatUiText.send;
    }
    return this.stopping ? chatUiText.stopping : chatUiText.stop;
  }

  private get sendButtonDisabled(): boolean {
    if (this.showStop) {
      return this.stopDisabled || this.stopping;
    }
    return this.sendDisabled;
  }

  private get sendHint(): string {
    return this.running && !this.showStop ? chatUiText.queueHint : "";
  }

  private onSendRequest(event: Event): void {
    event.stopPropagation();
    const name = this.showStop ? "stop-run" : "submit-request";
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    .bar {
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    tacta-composer-settings {
      min-width: 0;
      margin-right: auto;
    }
    .actions {
      display: flex;
      flex: none;
      min-width: 0;
      align-items: center;
      justify-content: flex-end;
      gap: 6px;
    }
    tacta-voice-input {
      min-width: 0;
    }
    @container (max-width: 640px) {
      tacta-composer-settings {
        order: 1;
        flex: 1 0 100%;
        margin-right: 0;
      }
      .actions {
        order: 2;
        margin-left: auto;
      }
    }
  `;

  private renderSendButton(): TemplateResult<1> | typeof nothing {
    if (this.dictating) {
      return nothing;
    }
    return html`<tacta-chat-send-button
      .stop=${this.showStop}
      .busy=${this.showStop && this.stopping}
      .disabled=${this.sendButtonDisabled}
      .label=${this.sendLabel}
      .hint=${this.sendHint}
      @send-request=${this.onSendRequest}
    ></tacta-chat-send-button>`;
  }

  override render(): TemplateResult<1> {
    return html`<div part="bar" class="bar">
      <tacta-composer-settings
        .providerInfo=${this.providerInfo}
        .renderProviderIcon=${this.renderProviderIcon}
        .models=${this.models}
        .defaultApprovalMode=${this.defaultApprovalMode}
        .options=${this.options}
        .disabled=${this.disabled}
      ></tacta-composer-settings>
      <div part="actions" class="actions">
        <tacta-voice-input .disabled=${this.disabled} .context=${this.context}></tacta-voice-input>
        ${this.renderSendButton()}
      </div>
    </div>`;
  }
}
