import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, unsafeCSS, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import type { PDFDocumentLoadingTask, PDFDocumentProxy, RenderTask, TextLayer } from "pdfjs-dist";
import { pdfStyles } from "./pdf-styles.js";
import { icon } from "@tacta/core/icons";
import { fileBytes, type PreviewFile } from "./formats.js";
import { previewText as text } from "./messages/index.js";
import { previewStyles } from "./preview.styles.js";

export class PdfPreview extends LitElement {
  @property({ attribute: false }) file!: PreviewFile;
  @state() private loading = true;
  @state() private failed = false;
  @state() private page = 1;
  @state() private pages = 0;
  @state() private zoom = 1;
  private pdf?: PDFDocumentProxy;
  private task?: PDFDocumentLoadingTask;
  private rendering?: RenderTask;
  private textLayer?: TextLayer;
  private request = 0;
  private drawing = 0;
  private observer?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new ResizeObserver(() => {
      void this.draw();
    });
    this.observer.observe(this);
    if (this.hasUpdated) {
      void this.load();
    }
  }

  override disconnectedCallback(): void {
    ++this.request;
    ++this.drawing;
    this.observer?.disconnect();
    this.rendering?.cancel();
    this.textLayer?.cancel();
    void this.task?.destroy();
    this.pdf = undefined;
    super.disconnectedCallback();
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("file")) {
      void this.load();
      return;
    }
    if (changed.has("page") || changed.has("zoom")) {
      void this.draw();
    }
  }

  private async load(): Promise<void> {
    const request = ++this.request;
    ++this.drawing;
    this.rendering?.cancel();
    this.textLayer?.cancel();
    await this.task?.destroy();
    this.pdf = undefined;
    this.loading = true;
    this.failed = false;
    this.page = 1;
    this.pages = 0;
    this.zoom = 1;
    try {
      const pdfjs = await import("pdfjs-dist");
      const { default: worker } = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
      if (request !== this.request || !this.isConnected) {
        return;
      }
      pdfjs.GlobalWorkerOptions.workerSrc = worker;
      const task = pdfjs.getDocument({ data: fileBytes(this.file) });
      this.task = task;
      const pdf = await task.promise;
      if (request !== this.request || !this.isConnected) {
        return;
      }
      this.pdf = pdf;
      this.pages = pdf.numPages;
      this.loading = false;
      await this.updateComplete;
      await this.draw();
    } catch {
      if (request === this.request && this.isConnected) {
        this.failed = true;
        this.loading = false;
      }
    }
  }

  private async draw(): Promise<void> {
    const pdf = this.pdf;
    const viewport = this.renderRoot.querySelector<HTMLElement>(".viewport");
    if (!pdf || !viewport || viewport.clientWidth === 0 || this.loading || this.failed) {
      return;
    }
    const drawing = ++this.drawing;
    this.rendering?.cancel();
    this.textLayer?.cancel();
    try {
      const page = await pdf.getPage(this.page);
      if (drawing !== this.drawing || !this.isConnected) {
        return;
      }
      const base = page.getViewport({ scale: 1 });
      const scale =
        Math.min(1.5, Math.max(0.15, (viewport.clientWidth - 40) / base.width)) * this.zoom;
      const dimensions = page.getViewport({ scale });
      // A fresh canvas isolates cancelled renders and bounds work to one page.
      const canvas = document.createElement("canvas");
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.ceil(dimensions.width * ratio);
      canvas.height = Math.ceil(dimensions.height * ratio);
      canvas.style.width = `${dimensions.width}px`;
      canvas.style.height = `${dimensions.height}px`;
      canvas.setAttribute("aria-hidden", "true");
      const paper = this.renderRoot.querySelector<HTMLElement>(".page")!;
      paper.style.width = `${dimensions.width}px`;
      paper.style.height = `${dimensions.height}px`;
      paper.style.setProperty("--total-scale-factor", String(scale));
      paper.replaceChildren(canvas);
      this.rendering = page.render({
        canvas,
        viewport: dimensions,
        transform: [ratio, 0, 0, ratio, 0, 0],
      });
      await this.rendering.promise;
      if (drawing !== this.drawing || !this.isConnected) {
        return;
      }
      const { TextLayer } = await import("pdfjs-dist");
      const layer = document.createElement("div");
      layer.className = "textLayer";
      paper.append(layer);
      this.textLayer = new TextLayer({
        textContentSource: await page.getTextContent(),
        container: layer,
        viewport: dimensions,
      });
      await this.textLayer.render();
    } catch (error) {
      if (
        drawing === this.drawing &&
        this.isConnected &&
        (error as Error).name !== "RenderingCancelledException"
      ) {
        this.failed = true;
      }
    }
  }

  private goTo(value: number): void {
    if (Number.isFinite(value)) {
      this.page = Math.min(this.pages, Math.max(1, Math.trunc(value)));
    }
  }

  static override styles = [
    ...previewStyles,
    unsafeCSS(pdfStyles),
    css`
      .page {
        position: relative;
        margin: 20px auto;
        background: var(--tacta-preview-paper);
        box-shadow: var(
          --tacta-shadow-panel,
          0 12px 40px color-mix(in srgb, var(--tacta-color-background) 65%, transparent)
        );
        color: var(--tacta-preview-ink);
        overflow: hidden;
      }
      label {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
        color: var(--tacta-color-muted, #a3a3a5);
      }
      input {
        width: 44px;
        padding: 5px;
        background: var(--tacta-color-surface, #252627);
        color: var(--tacta-color-text, #e6e6e6);
        border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
        border-radius: var(--tacta-radius-subtle, 5px);
        text-align: center;
      }
      .controls .meta {
        margin-left: 0;
      }
      .divider {
        height: 18px;
        border-left: 1px solid var(--tacta-color-border-strong, #ffffff1f);
        margin: 0 4px;
      }
      .fit {
        padding: 4px 9px;
        background: transparent;
        font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      }
    `,
  ];

  private renderFailure(): TemplateResult<1> | typeof nothing {
    if (!this.failed) {
      return nothing;
    }
    return html`<div class="state" role="alert">
      ${icon("file", 30)}
      <p>${text.failed}</p>
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html` <div class="controls">
        <button
          class="icon-button"
          aria-label=${text.previous}
          ?disabled=${this.page <= 1 || this.loading}
          @click=${() => this.goTo(this.page - 1)}
        >
          ${icon("arrowUp", 15)}
        </button>
        <label
          >${text.page}
          <input
            aria-label=${text.page}
            type="number"
            min="1"
            max=${this.pages}
            .value=${String(this.page)}
            ?disabled=${this.loading}
            @change=${(event: Event) => this.goTo(Number((event.target as HTMLInputElement).value))}
        /></label>
        <span class="meta">${text.ofPages({ pages: this.pages })}</span>
        <button
          class="icon-button"
          aria-label=${text.next}
          ?disabled=${this.page >= this.pages || this.loading}
          @click=${() => this.goTo(this.page + 1)}
        >
          ${icon("arrowDown", 15)}
        </button>
        <span class="divider"></span>
        <button
          class="icon-button"
          aria-label=${text.zoomOut}
          ?disabled=${this.zoom <= 0.5 || this.loading}
          @click=${() => (this.zoom = Math.max(0.5, this.zoom - 0.25))}
        >
          ${icon("minus", 15)}
        </button>
        <button class="button fit" @click=${() => (this.zoom = 1)} ?disabled=${this.loading}>
          ${text.fit}
        </button>
        <button
          class="icon-button"
          aria-label=${text.zoomIn}
          ?disabled=${this.zoom >= 2 || this.loading}
          @click=${() => (this.zoom = Math.min(2, this.zoom + 0.25))}
        >
          ${icon("plus", 15)}
        </button>
      </div>
      ${this.loading ? html`<div class="state" role="status">${text.loading}</div>` : nothing}
      ${this.renderFailure()}
      <div
        class="viewport paper"
        ?hidden=${this.loading || this.failed}
        tabindex="0"
        aria-label=${this.file.path}
      >
        <div
          class="page"
          role="document"
          aria-label=${text.pageOf({ page: this.page, pages: this.pages })}
        ></div>
      </div>`;
  }
}
