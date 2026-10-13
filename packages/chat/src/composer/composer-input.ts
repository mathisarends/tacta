import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { chatUiText } from "../messages/index.js";

export class ComposerInput extends LitElement {
  @property() value = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;

  private get textarea(): HTMLTextAreaElement | null {
    return this.renderRoot.querySelector("textarea");
  }

  protected override updated(): void {
    const textarea = this.textarea;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    }
  }

  override focus(options?: FocusOptions): void {
    this.textarea?.focus(options);
  }

  insertText(text: string): boolean {
    const textarea = this.textarea;
    if (!textarea || textarea.disabled || textarea.readOnly || !textarea.getClientRects().length) {
      return false;
    }
    textarea.focus();
    textarea.setRangeText(text, textarea.selectionStart, textarea.selectionEnd, "end");
    this.edit(textarea.value);
    return true;
  }

  private edit(value: string): void {
    this.value = value;
    this.dispatchEvent(
      new CustomEvent("draft-change", { detail: value, bubbles: true, composed: true }),
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
      event.preventDefault();
      this.dispatchEvent(new CustomEvent("submit-request", { bubbles: true, composed: true }));
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    textarea {
      display: block;
      width: 100%;
      min-height: 68px;
      max-height: 180px;
      padding: 0 5px;
      resize: none;
      overflow-y: auto;
      border: 0;
      background: transparent;
      color: var(--tacta-color-text, #e6e6e6);
      font: var(--tacta-font-weight-body, var(--tacta-font-weight-regular, 400))
        var(--tacta-font-size-chat, var(--tacta-text-xl, 1rem)) / var(--tacta-line-height-body, 1.6)
        var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
      outline: none;
    }
    textarea::placeholder {
      color: var(--tacta-color-muted, #a3a3a5);
    }
    textarea:focus-visible {
      outline: none;
      box-shadow: none;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<textarea
      ?disabled=${this.disabled}
      ?readonly=${this.readOnly}
      aria-label=${chatUiText.composer.placeholder}
      placeholder=${chatUiText.composer.placeholder}
      .value=${live(this.value)}
      @input=${(event: InputEvent) => this.edit((event.target as HTMLTextAreaElement).value)}
      @keydown=${this.onKeyDown}
    ></textarea>`;
  }
}
