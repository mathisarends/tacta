import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon, type IconName } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { toastStore, type ToastStore, type ToastItem, type ToastKind } from "./toast-store.js";
import { uiText } from "@tacta/core/messages";

const kindIcon: Record<ToastKind, IconName> = {
  info: "info",
  success: "approved",
  warning: "warning",
  error: "rejected",
};

export class ToastRegion extends LitElement {
  @property({ attribute: false }) store: ToastStore = toastStore;
  @state() private items = this.store.items;
  private unsubscribe?: () => void;

  override connectedCallback(): void {
    super.connectedCallback();
    this.items = this.store.items;
    this.unsubscribe = this.store.subscribe(() => (this.items = this.store.items));
  }

  override disconnectedCallback(): void {
    this.unsubscribe?.();
    super.disconnectedCallback();
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has("store")) {
      this.unsubscribe?.();
      this.items = this.store.items;
      this.unsubscribe = this.store.subscribe(() => (this.items = this.store.items));
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      position: fixed;
      inset: 24px 24px auto auto;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 10px;
      width: min(380px, calc(100vw - 32px));
      pointer-events: none;
    }
    .toast {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: start;
      gap: 12px;
      padding: 14px;
      border: 0;
      border-radius: var(--tacta-radius-panel, 20px);
      background: var(--tacta-color-surface, #252627);
      box-shadow: var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background) 65%, transparent)
      );
      color: var(--tacta-color-text, #e6e6e6);
      font-size: var(--tacta-font-size-body, var(--tacta-text-base));
      line-height: var(--tacta-line-height-body, 1.6);
      pointer-events: auto;
      animation: enter var(--tacta-motion-duration-control, 160ms) ease-out;
    }
    .toast > svg {
      margin-top: 2px;
    }
    .success > svg {
      color: var(--tacta-color-positive, #b5df69);
    }
    .warning > svg {
      color: var(--tacta-color-warning, #e5c07b);
    }
    .error > svg {
      color: var(--tacta-color-error, #f0aaa1);
    }
    .info > svg {
      color: var(--tacta-color-muted, #a3a3a5);
    }
    p {
      margin: 0;
    }
    .message {
      font-weight: var(--tacta-font-weight-medium, 500);
    }
    .description {
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    }
    button {
      display: grid;
      place-items: center;
      padding: 2px;
      border: 0;
      background: none;
      color: var(--tacta-color-muted, #a3a3a5);
      cursor: pointer;
    }
    button:hover,
    button:focus-visible {
      color: var(--tacta-color-text, #e6e6e6);
    }
    @keyframes enter {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
    }
  `;

  private renderItem(item: ToastItem): TemplateResult<1> {
    return html`<div
      class="toast ${item.kind}"
      role=${item.kind === "error" ? "alert" : "status"}
      @mouseenter=${() => this.store.pause()}
      @mouseleave=${() => this.store.resume()}
      @focusin=${() => this.store.pause()}
      @focusout=${() => this.store.resume()}
    >
      ${icon(kindIcon[item.kind])}
      <div>
        <p class="message">${item.message}</p>
        ${item.description ? html`<p class="description">${item.description}</p>` : nothing}
      </div>
      <button
        type="button"
        aria-label=${uiText.close}
        ${tooltip(uiText.close)}
        @click=${() => this.store.dismiss(item.id)}
      >
        ${icon("close", 16)}
      </button>
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`${this.items.map((item) => this.renderItem(item))}`;
  }
}
