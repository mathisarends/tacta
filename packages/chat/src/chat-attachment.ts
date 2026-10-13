import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import type { ChatAttachment as Attachment } from "./types.js";
import type { ImageViewer } from "./image-viewer.js";
import { chatUiText } from "./messages/index.js";
import { formatAttachmentSize } from "./presenter.js";
import "./image-viewer.js";

export class ChatAttachment extends LitElement {
  @property({ attribute: false }) file!: Attachment;
  @property({ type: Boolean }) removable = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) uploading = false;
  @state() private previewFailed = false;
  private previewFile?: Attachment;
  private url = "";

  private get showsImage(): boolean {
    return this.file.type.startsWith("image/") && !this.previewFailed;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.requestUpdate();
  }

  protected override willUpdate(): void {
    if (this.file !== this.previewFile) {
      this.releaseUrl();
      this.previewFile = this.file;
      this.previewFailed = false;
      this.url = this.file instanceof File ? URL.createObjectURL(this.file) : this.file.url;
    }
  }

  override disconnectedCallback(): void {
    this.releaseUrl();
    super.disconnectedCallback();
  }

  private releaseUrl(): void {
    if (this.url && this.previewFile instanceof File) {
      URL.revokeObjectURL(this.url);
    }
    this.url = "";
    this.previewFile = undefined;
  }

  private onRemoveClick(): void {
    if (this.disabled) {
      return;
    }
    this.dispatchEvent(new CustomEvent("remove-attachment", { bubbles: true, composed: true }));
  }

  private onThumbnailClick(): void {
    void this.renderRoot.querySelector<ImageViewer>("tacta-image-viewer")?.open();
  }

  private onPreviewError(): void {
    this.previewFailed = true;
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
      max-width: 100%;
    }
    .attachment {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 230px;
      max-width: 100%;
      padding: 8px;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-attachment, 14px);
      background: var(--tacta-color-surface, #252627);
    }
    a {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
      flex: 1;
      color: var(--tacta-color-text, #e6e6e6);
      text-decoration: none;
    }
    .preview {
      display: grid;
      place-items: center;
      flex: 0 0 42px;
      height: 42px;
      overflow: hidden;
      border-radius: var(--tacta-radius-element, 8px);
      background: var(--tacta-color-composer, var(--tacta-color-surface, #252627));
      color: var(--tacta-color-muted, #a3a3a5);
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .info {
      min-width: 0;
    }
    .name {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
      font-weight: var(--tacta-font-weight-emphasis, var(--tacta-font-weight-semibold, 600));
    }
    .size {
      display: block;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs, 0.6875rem));
    }
    .icon-button {
      width: 26px;
      height: 26px;
    }
    .image-attachment {
      position: relative;
      width: 148px;
      max-width: 100%;
    }
    .upload-status {
      display: grid;
      place-items: center;
      flex: none;
      width: 28px;
      height: 28px;
      border-radius: var(--tacta-radius-round, 50%);
      background: var(--tacta-color-composer, var(--tacta-color-surface, #252627));
      color: var(--tacta-color-text, #e6e6e6);
      pointer-events: none;
    }
    .image-attachment .upload-status {
      position: absolute;
      color: var(--tacta-color-on-media, #ffffff);
      inset: 0;
      width: 100%;
      height: 100%;
      border-radius: var(--tacta-radius-thumbnail, 18px);
      background: var(--tacta-color-media-scrim, rgb(0 0 0 / 40%));
    }
    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid var(--tacta-color-on-media-track, rgb(255 255 255 / 35%));
      border-top-color: currentColor;
      border-radius: var(--tacta-radius-round, 50%);
      animation: spin var(--tacta-motion-duration-spin, 850ms) linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .thumbnail {
      display: block;
      width: 100%;
      aspect-ratio: 1;
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-thumbnail, 18px);
      background: var(--tacta-color-surface, #252627);
      cursor: zoom-in;
    }
    .thumbnail img {
      display: block;
      transition: opacity var(--tacta-motion-duration-control, 160ms);
    }
    .thumbnail:hover img {
      opacity: 0.85;
    }
    .image-attachment .remove {
      position: absolute;
      top: 6px;
      right: 6px;
      border-radius: var(--tacta-radius-round, 50%);
      background: var(--tacta-color-media-scrim-strong, rgb(0 0 0 / 75%));
      color: var(--tacta-color-on-media, #ffffff);
      opacity: 0;
      transition: opacity var(--tacta-motion-duration-control, 160ms);
    }
    .image-attachment:hover .remove,
    .image-attachment:focus-within .remove {
      opacity: 1;
    }
    @media (hover: none) {
      .image-attachment .remove {
        opacity: 1;
      }
    }
    @media (max-width: 480px) {
      .image-attachment {
        width: 120px;
      }
    }
  `;

  private renderUploadStatus(): TemplateResult<1> | typeof nothing {
    if (!this.uploading) {
      return nothing;
    }
    const label = chatUiText.attachment.uploading;
    return html`<span class="upload-status" role="status" aria-label=${label} title=${label}>
      <span class="spinner" aria-hidden="true"></span>
    </span>`;
  }

  private renderRemoveButton(): TemplateResult<1> | typeof nothing {
    if (!this.removable) {
      return nothing;
    }
    const label = chatUiText.attachment.remove({ name: this.file.name });
    return html`<button
      part="icon-button"
      class="icon-button remove"
      type="button"
      ?disabled=${this.disabled}
      aria-label=${label}
      ${tooltip(label)}
      @click=${this.onRemoveClick}
    >
      ${icon("close", 14)}
    </button>`;
  }

  private renderImage(): TemplateResult<1> {
    const label = chatUiText.attachment.preview({ name: this.file.name });
    return html`<div part="image-attachment" class="image-attachment">
        <button
          part="thumbnail"
          class="thumbnail"
          type="button"
          aria-label=${label}
          ${tooltip(label)}
          @click=${this.onThumbnailClick}
        >
          <img src=${this.url} alt="" @error=${this.onPreviewError} />
        </button>
        ${this.renderUploadStatus()} ${this.renderRemoveButton()}
      </div>
      <tacta-image-viewer .src=${this.url} .filename=${this.file.name}></tacta-image-viewer>`;
  }

  override render(): TemplateResult<1> {
    if (this.showsImage) {
      return this.renderImage();
    }
    return html`<div part="attachment" class="attachment">
      <a href=${this.url} download=${this.file.name} title=${this.file.name}>
        <span class="preview"> ${icon("file", 22)} </span>
        <span class="info"
          ><span class="name">${this.file.name}</span
          ><span class="size">${formatAttachmentSize(this.file.size)}</span></span
        >
      </a>
      ${this.renderUploadStatus()} ${this.renderRemoveButton()}
    </div>`;
  }
}
