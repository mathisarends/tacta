import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { resolveFormat, type PreviewFile, type PreviewKind } from "./formats.js";
import { previewText as text } from "./messages/index.js";
import { previewStyles } from "./preview.styles.js";
import "./image-preview.js";

const viewers: Partial<Record<PreviewKind, () => Promise<unknown>>> = {
  pdf: async () => {
    const { PdfPreview } = await import("./pdf-preview.js");
    if (!customElements.get("tacta-pdf-preview")) {
      customElements.define("tacta-pdf-preview", PdfPreview);
    }
  },
  word: async () => {
    const { WordPreview } = await import("./word-preview.js");
    if (!customElements.get("tacta-word-preview")) {
      customElements.define("tacta-word-preview", WordPreview);
    }
  },
  spreadsheet: async () => {
    const { SpreadsheetPreview } = await import("./spreadsheet-preview.js");
    if (!customElements.get("tacta-spreadsheet-preview")) {
      customElements.define("tacta-spreadsheet-preview", SpreadsheetPreview);
    }
  },
};

export class FilePreview extends LitElement {
  @property({ attribute: false }) file!: PreviewFile;
  @property() url = "";
  @property({ type: Boolean }) active = true;
  @state() private failed = false;
  @state() private loadingViewer = false;
  private request = 0;
  private observer?: IntersectionObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => !entry.isIntersecting)) {
        this.pause();
      }
    });
    this.observer.observe(this);
    if (this.hasUpdated) {
      void this.loadViewer();
    }
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("file")) {
      this.failed = false;
      void this.loadViewer();
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("active") && !this.active) {
      this.pause();
    }
  }

  override disconnectedCallback(): void {
    ++this.request;
    this.observer?.disconnect();
    this.pause();
    super.disconnectedCallback();
  }

  private async loadViewer(): Promise<void> {
    const request = ++this.request;
    const load = this.file ? viewers[resolveFormat(this.file).kind] : undefined;
    this.loadingViewer = Boolean(load);
    if (!load) {
      return;
    }
    try {
      await load();
      if (request === this.request && this.isConnected) {
        this.loadingViewer = false;
      }
    } catch {
      if (request === this.request && this.isConnected) {
        this.failed = true;
        this.loadingViewer = false;
      }
    }
  }

  private pause(): void {
    this.renderRoot.querySelector<HTMLMediaElement>("audio, video")?.pause();
  }

  private onMediaError(): void {
    this.failed = true;
  }

  static override styles = [
    ...previewStyles,
    css`
      pdf-preview,
      word-preview,
      spreadsheet-preview,
      tacta-image-preview {
        flex: 1;
        min-height: 0;
      }
      .video {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }
      video {
        max-width: 100%;
        max-height: 100%;
      }
      audio {
        width: min(100%, 440px);
      }
    `,
  ];

  private renderAudio(): TemplateResult<1> {
    return html`<div class="state">
      ${icon("headphones", 38)}<audio
        controls
        preload="metadata"
        aria-label=${text.audio}
        src=${this.url}
        @error=${this.onMediaError}
      ></audio>
    </div>`;
  }

  private renderVideo(): TemplateResult<1> {
    return html`<div class="viewport video">
      <video
        controls
        playsinline
        preload="metadata"
        aria-label=${text.video}
        src=${this.url}
        @error=${this.onMediaError}
      ></video>
    </div>`;
  }

  private renderFile(): TemplateResult<1> {
    switch (resolveFormat(this.file).kind) {
      case "pdf":
        return html`<tacta-pdf-preview .file=${this.file}></tacta-pdf-preview>`;
      case "word":
        return html`<tacta-word-preview .file=${this.file}></tacta-word-preview>`;
      case "spreadsheet":
        return html`<tacta-spreadsheet-preview .file=${this.file}></tacta-spreadsheet-preview>`;
      case "image":
        return html`<tacta-image-preview
          .url=${this.url}
          .label=${this.file.path}
          @preview-error=${this.onMediaError}
        ></tacta-image-preview>`;
      case "audio":
        return this.renderAudio();
      case "video":
        return this.renderVideo();
      default:
        return html`<div class="state">
          ${icon("file", 38)}
          <p>${text.unavailable}</p>
        </div>`;
    }
  }

  override render(): TemplateResult<1> {
    if (!this.file) {
      return html``;
    }
    if (this.failed) {
      return html`<div class="state" role="alert">
        ${icon("file", 32)}
        <p>${text.failed}</p>
      </div>`;
    }
    if (this.loadingViewer) {
      return html`<div class="state" role="status">${text.loading}</div>`;
    }
    return this.renderFile();
  }
}
