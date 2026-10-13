import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import type { QueuedMessage } from "./options.js";
import { chatUiText } from "../messages/index.js";

export class QueuedMessages extends LitElement {
  @property({ attribute: false }) messages: QueuedMessage[] = [];
  @property({ type: Boolean }) running = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) steerDisabled = false;

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    .queue {
      display: grid;
      padding: 8px 12px 28px;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-panel, 20px) var(--tacta-radius-panel, 20px) 0 0;
      background: var(--tacta-color-panel-hover, #2d2e2f);
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem));
    }
    .queue-list {
      display: grid;
      max-height: 180px;
      overflow-y: auto;
    }
    .queued {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 5px;
    }
    .queued .queued-text {
      flex: 1;
      min-width: 0;
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      color: var(--tacta-color-text, #e6e6e6);
    }
    .queued .icon-button {
      border-radius: var(--tacta-radius-round, 50%);
    }
    .queue-button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      flex: none;
      min-height: 36px;
      padding: 6px 10px;
      border-radius: var(--tacta-radius-element, 8px);
      color: var(--tacta-color-muted, #a3a3a5);
      font: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500))
        var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))
        var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
      background: transparent;
      border: 0;
      cursor: pointer;
      white-space: nowrap;
    }
    .queue-button:hover:not(:disabled) {
      background: var(--tacta-color-panel-hover, #2d2e2f);
      color: var(--tacta-color-text, #e6e6e6);
    }
    .queue-button:disabled {
      opacity: 0.45;
      cursor: default;
    }
  `;

  override render(): TemplateResult<1> | typeof nothing {
    if (!this.messages.length) {
      return nothing;
    }
    return html`<div part="queue" class="queue">
      <div part="queue-list" class="queue-list" role="list" aria-label=${chatUiText.queued}>
        ${repeat(
          this.messages,
          (message) => message.id,
          (message) =>
            html`<div part="queued" class="queued" role="listitem">
              ${icon("queued", 16)}
              <span class="queued-text">${message.text}</span>
              <button
                part="queue-button"
                class="queue-button"
                type="button"
                aria-label=${this.running ? chatUiText.steer : chatUiText.send}
                ${tooltip(this.running ? chatUiText.steerHint : chatUiText.send)}
                ?disabled=${this.disabled || (this.running && this.steerDisabled)}
                @click=${() => this.dispatchEvent(new CustomEvent(this.running ? "steer-queued" : "send-queued", { detail: message.id, bubbles: true, composed: true }))}
              >
                ${icon(this.running ? "steer" : "arrowUp", 16)}
                ${this.running ? chatUiText.steerAction : chatUiText.send}
              </button>
              <button
                part="icon-button"
                class="icon-button"
                type="button"
                aria-label=${chatUiText.removeQueued}
                ${tooltip(chatUiText.removeQueued)}
                ?disabled=${this.disabled}
                @click=${() => this.dispatchEvent(new CustomEvent("remove-queued", { detail: message.id, bubbles: true, composed: true }))}
              >
                ${icon("trash", 16)}
              </button>
            </div>`,
        )}
      </div>
    </div>`;
  }
}
