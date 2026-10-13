import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { chatUiText } from "../messages/index.js";
import type { ChatAttachment } from "../chat-attachment.js";
import "../chat-attachment.js";

export class ComposerAttachments extends LitElement {
  @property({ attribute: false }) files: File[] = [];
  @property({ attribute: false }) uploading: File[] = [];
  @property({ type: Boolean }) disabled = false;

  private onRemoveAttachment(event: Event): void {
    event.stopPropagation();
    if (this.disabled) {
      return;
    }
    const file = (event.currentTarget as ChatAttachment).file;
    this.dispatchEvent(
      new CustomEvent("remove-file", { detail: file, bubbles: true, composed: true }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    .attachments {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 8px;
      max-height: 180px;
      overflow-y: auto;
      padding: 3px;
      margin-bottom: 20px;
    }
  `;

  override render(): TemplateResult<1> | typeof nothing {
    if (!this.files.length) {
      return nothing;
    }
    return html`<div
      part="attachments"
      class="attachments"
      role="list"
      aria-label=${chatUiText.attachments}
    >
      ${repeat(
        this.files,
        (file) => file,
        (file) =>
          html`<tacta-chat-attachment
            role="listitem"
            .file=${file}
            .uploading=${this.uploading.includes(file)}
            removable
            .disabled=${this.disabled}
            @remove-attachment=${this.onRemoveAttachment}
          ></tacta-chat-attachment>`,
      )}
    </div>`;
  }
}
