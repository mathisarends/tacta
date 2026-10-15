import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import type { ModalSize } from "./modal-types.js";
import { uiText } from "@tacta/core/messages";

export class SettingsDialog extends LitElement {
  @property({ type: Boolean }) open = false;
  @property() heading = "";
  @property({ type: Boolean }) dismissible = true;
  @property({ type: Boolean }) busy = false;
  @property({ reflect: true }) size: ModalSize = "default";
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

  private get closeDisabled(): boolean {
    return !this.dismissible || this.busy;
  }

  private dismiss(): void {
    if (this.closeDisabled) {
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
    :host([size="wide"]) {
      --tacta-modal-width: 600px;
    }
    dialog {
      --tacta-modal-offset: max(16px, 14vh);
      width: min(var(--tacta-modal-width, 440px), calc(100vw - 32px));
      max-height: calc(100dvh - var(--tacta-modal-offset) - 16px);
      margin: var(--tacta-modal-offset) auto auto;
      padding: 20px 20px 18px;
      overflow: auto;
      border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-text, #e6e6e6);
      box-shadow: var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background) 65%, transparent)
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
      font-size: var(--tacta-font-size-panel-title, var(--tacta-text-2xl));
      font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold));
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
      aria-busy=${this.busy}
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
          ?disabled=${this.closeDisabled}
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
