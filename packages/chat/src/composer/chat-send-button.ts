import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";

export class ChatSendButton extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property() label = "";
  @property() hint = "";
  @property({ type: Boolean }) stop = false;
  @property({ type: Boolean }) busy = false;

  private requestSend(): void {
    this.dispatchEvent(new CustomEvent("send-request", { bubbles: true, composed: true }));
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      flex: none;
      width: 36px;
      height: 36px;
    }
    button {
      padding: 0;
      width: 36px;
      height: 36px;
      display: grid;
      place-items: center;
      border: 0;
      border-radius: var(--tacta-radius-round, 50%);
      color: var(--tacta-color-on-accent, #0b0b0b);
      background: var(--tacta-color-accent, #ffffff);
      cursor: pointer;
      transition:
        background var(--tacta-motion-duration-control, 160ms) ease,
        transform var(--tacta-motion-duration-control, 160ms) ease;
    }
    button svg {
      stroke-width: 2.4;
    }
    button:disabled {
      background: color-mix(
        in srgb,
        var(--tacta-color-accent, #ffffff) 78%,
        var(--tacta-color-composer, var(--tacta-color-surface, #252627))
      );
      color: color-mix(
        in srgb,
        var(--tacta-color-on-accent, #0b0b0b) 65%,
        var(--tacta-color-accent, #ffffff)
      );
      cursor: default;
      opacity: 1;
    }
    button:hover:not(:disabled) {
      background: var(--tacta-color-accent-hover, #e8e8e8);
      transform: translateY(-1px);
    }
    button:active:not(:disabled) {
      transform: scale(0.94);
    }
    button:focus-visible {
      outline: 2px solid var(--tacta-color-accent, #ffffff);
      outline-offset: 3px;
    }
    .spinner {
      width: 14px;
      height: 14px;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: var(--tacta-radius-round, 50%);
      animation: spin var(--tacta-motion-duration-spin, 850ms) linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      button:hover:not(:disabled),
      button:active:not(:disabled) {
        transform: none;
      }
    }
  `;

  private renderIcon(): TemplateResult<1> | TemplateResult<2> {
    if (this.busy) {
      return html`<span class="spinner" aria-hidden="true"></span>`;
    }
    if (this.stop) {
      return html`<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <rect x="3" y="3" width="10" height="10" rx="2" fill="currentColor" />
      </svg>`;
    }
    return icon("arrowUp", 20);
  }

  override render(): TemplateResult<1> {
    return html`<button
      type="button"
      ?disabled=${this.disabled || this.busy}
      aria-label=${this.label}
      aria-busy=${this.busy}
      ${tooltip(this.hint || this.label)}
      @click=${this.requestSend}
    >
      ${this.renderIcon()}
    </button>`;
  }
}
