import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { chatUiText } from "../messages/index.js";

export class ComposerDropzone extends LitElement {
  @property({ type: Boolean }) disabled = false;
  @property() context = "";
  @state() private dragDepth = 0;

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("context") || this.disabled) {
      this.dragDepth = 0;
    }
  }

  private acceptFiles(files: File[]): void {
    if (!this.disabled && files.length) {
      this.dispatchEvent(
        new CustomEvent("files-selected", { detail: files, bubbles: true, composed: true }),
      );
    }
  }

  private onPaste(event: ClipboardEvent): void {
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length) {
      event.preventDefault();
      this.acceptFiles(files);
    }
  }

  private onDragEnter(event: DragEvent): void {
    if (event.dataTransfer?.types.includes("Files") && !this.disabled) {
      event.preventDefault();
      this.dragDepth++;
    }
  }

  private onDragLeave(): void {
    this.dragDepth = Math.max(0, this.dragDepth - 1);
  }

  private onDragOver(event: DragEvent): void {
    if (event.dataTransfer?.types.includes("Files")) {
      event.preventDefault();
      event.dataTransfer.dropEffect = this.disabled ? "none" : "copy";
    }
  }

  private onDrop(event: DragEvent): void {
    this.dragDepth = 0;
    if (event.dataTransfer?.types.includes("Files")) {
      event.preventDefault();
      this.acceptFiles(Array.from(event.dataTransfer.files));
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    .surface {
      position: relative;
      border-radius: var(--tacta-radius-dropzone, 24px);
      background: var(--tacta-color-composer, var(--tacta-color-surface, #252627));
      padding: 18px 14px 12px;
    }
    .drop-hint {
      position: absolute;
      inset: 0;
      z-index: 2;
      display: grid;
      place-items: center;
      border: 2px dashed var(--tacta-color-accent, #ffffff);
      border-radius: inherit;
      background: var(--tacta-color-composer, var(--tacta-color-surface, #252627));
      color: var(--tacta-color-text, #e6e6e6);
      pointer-events: none;
    }
    @container (max-width: 480px) {
      .surface {
        padding: 14px 10px 10px;
        border-radius: var(--tacta-radius-panel, 20px);
      }
    }
  `;

  private renderDropHint(): TemplateResult<1> | typeof nothing {
    if (!this.dragDepth || this.disabled) {
      return nothing;
    }
    return html`<div part="drop-hint" class="drop-hint">${chatUiText.dropFiles}</div>`;
  }

  override render(): TemplateResult<1> {
    return html`<div
      part="surface"
      class="surface"
      @paste=${this.onPaste}
      @dragenter=${this.onDragEnter}
      @dragleave=${this.onDragLeave}
      @dragover=${this.onDragOver}
      @drop=${this.onDrop}
    >
      <slot></slot>
      ${this.renderDropHint()}
    </div>`;
  }
}
