import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "./styles/workspace.js";
import { icon } from "./icons.js";
import { tooltip } from "./tooltip.js";
import { uiText } from "./messages/index.js";

export class AppModal extends LitElement {
  @property({ type: Boolean }) open = false;
  @property() heading = "";
  @property({ type: Boolean }) dismissible = true;
  private backdropPointerDown = false;

  protected override updated(): void {
    const dialog = this.renderRoot.querySelector("dialog");
    if (this.open && !dialog?.open) {
      dialog?.showModal();
      this.querySelector<HTMLElement>("[autofocus]")?.focus();
      return;
    }
    if (!this.open && dialog?.open) {
      dialog.close();
    }
  }

  private dismiss(): void {
    if (!this.dismissible) {
      return;
    }
    this.open = false;
    this.dispatchEvent(new CustomEvent("modal-close", { bubbles: true, composed: true }));
  }

  private onCancel(event: Event): void {
    event.preventDefault();
    this.dismiss();
  }

  private onClose(): void {
    if (this.open && !this.renderRoot.querySelector("dialog")?.open) {
      this.dismiss();
    }
  }

  private onPointerDown(event: PointerEvent): void {
    this.backdropPointerDown = this.isBackdrop(event);
  }

  private onClick(event: PointerEvent): void {
    if (this.backdropPointerDown && this.isBackdrop(event)) {
      this.dismiss();
    }
    this.backdropPointerDown = false;
  }

  private isBackdrop(event: PointerEvent): boolean {
    if (event.target !== event.currentTarget) {
      return false;
    }
    const bounds = (event.currentTarget as HTMLDialogElement).getBoundingClientRect();
    return (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: contents;
    }
    dialog {
      --modal-offset: max(16px, 14vh);
      width: min(440px, calc(100vw - 32px));
      max-height: calc(100dvh - var(--modal-offset) - 16px);
      margin: var(--modal-offset) auto auto;
      padding: 20px 20px 18px;
      overflow: auto;
      border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-text, #e6e6e6);
      box-shadow: var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background, #181818) 65%, transparent)
      );
    }
    dialog[open] {
      animation: modal-in var(--tacta-motion-duration-control, 160ms) ease-out;
    }
    dialog::backdrop {
      background: var(--tacta-color-modal-backdrop, rgb(0 0 0 / 55%));
    }
    @keyframes modal-in {
      from {
        opacity: 0;
        transform: translateY(-6px) scale(0.98);
      }
    }
    header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 4px;
    }
    h2 {
      flex: 1;
      margin: 0;
      font-size: var(--tacta-font-size-panel-title, var(--tacta-text-2xl, 1.125rem));
      font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold, 600));
      line-height: var(--tacta-line-height-control, 1.4);
    }
    @media (max-width: 480px) {
      dialog {
        padding: 16px;
      }
    }
  `;

  override render(): TemplateResult<1> {
    return html`<dialog
      aria-labelledby="modal-heading"
      @cancel=${this.onCancel}
      @close=${this.onClose}
      @pointerdown=${this.onPointerDown}
      @click=${this.onClick}
    >
      <header>
        <h2 id="modal-heading">${this.heading}</h2>
        <button
          type="button"
          class="icon-button"
          aria-label=${uiText.close}
          ?disabled=${!this.dismissible}
          ${tooltip(uiText.close)}
          @click=${this.dismiss}
        >
          ${icon("close", 18)}
        </button>
      </header>
      <slot></slot>
    </dialog>`;
  }
}
