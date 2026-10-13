import { css, html, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { chatUiText } from "./messages/index.js";
import { uiText } from "@tacta/core/messages";

export class ImageViewer extends LitElement {
  @property() src = "";
  @property() filename = "";
  @state() private zoom = 1;
  @state() private width = 0;
  @state() private height = 0;
  private fitZoom = 1;
  private readonly resizeObserver = new ResizeObserver(() => this.fit());

  private get dialog(): HTMLDialogElement | null {
    return this.renderRoot.querySelector("dialog");
  }

  private get viewport(): HTMLElement | null {
    return this.renderRoot.querySelector(".viewport");
  }

  private get canZoomOut(): boolean {
    return this.zoom > Math.min(this.fitZoom, 0.1);
  }

  private get canZoomIn(): boolean {
    return this.zoom < 4;
  }

  private get imageSize(): string {
    const width = Math.round(this.width * this.zoom);
    const height = Math.round(this.height * this.zoom);
    return `--image-width:${width}px;--image-height:${height}px`;
  }

  override disconnectedCallback(): void {
    this.close();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("src")) {
      this.close();
      this.width = 0;
      this.height = 0;
      this.zoom = 1;
    }
  }

  async open(): Promise<void> {
    await this.updateComplete;
    if (!this.isConnected || this.dialog?.open) {
      return;
    }
    this.dialog?.showModal();
    this.fit();
    if (this.dialog) {
      this.resizeObserver.observe(this.dialog, { box: "border-box" });
    }
  }

  private close(): void {
    this.resizeObserver.disconnect();
    this.dialog?.close();
  }

  private fit(): void {
    const viewport = this.viewport;
    if (!viewport || !this.dialog?.open || !this.width || !this.height) {
      return;
    }
    this.fitZoom = Math.min(
      1,
      viewport.clientWidth / this.width,
      viewport.clientHeight / this.height,
    );
    this.setZoom(this.fitZoom);
  }

  private setZoom(zoom: number): void {
    this.zoom = Math.max(Math.min(this.fitZoom, 0.1), Math.min(4, zoom));
    void this.updateComplete.then(() => {
      const viewport = this.viewport;
      if (viewport) {
        viewport.scrollTo(
          (viewport.scrollWidth - viewport.clientWidth) / 2,
          (viewport.scrollHeight - viewport.clientHeight) / 2,
        );
      }
    });
  }

  private zoomIn(): void {
    this.setZoom(this.zoom * 1.25);
  }

  private zoomOut(): void {
    this.setZoom(this.zoom / 1.25);
  }

  private onDialogClose(): void {
    this.resizeObserver.disconnect();
  }

  private onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  private onImageLoad(event: Event): void {
    const image = event.target as HTMLImageElement;
    this.width = image.naturalWidth;
    this.height = image.naturalHeight;
    this.fit();
  }

  private onKeyDown(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      this.zoomIn();
    }
    if (event.key === "-") {
      event.preventDefault();
      this.zoomOut();
    }
    if (event.key === "0") {
      event.preventDefault();
      this.fit();
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: contents;
    }
    dialog {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      max-width: none;
      max-height: none;
      margin: 0;
      padding: 0 24px;
      border: 0;
      background: transparent;
      color: var(--tacta-color-viewer-text, #f5f5f5);
      overflow: hidden;
    }
    dialog[open] {
      display: flex;
      flex-direction: column;
    }
    dialog::backdrop {
      background: var(--tacta-color-viewer-backdrop, rgb(0 0 0 / 88%));
      backdrop-filter: blur(8px);
    }
    header {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 12px;
      min-height: 72px;
      flex: none;
    }
    .icon-button,
    .zoom-value {
      height: 42px;
      border: 0;
      border-radius: var(--tacta-radius-round, 50%);
      background: var(--tacta-color-viewer-control, #272727);
      color: var(--tacta-color-viewer-text, #f5f5f5);
      text-decoration: none;
    }
    .icon-button {
      width: 42px;
    }
    .icon-button:hover:not(:disabled),
    .zoom-value:hover {
      background: var(--tacta-color-viewer-control-hover, #3a3a3a);
      color: var(--tacta-color-viewer-text-hover, #ffffff);
    }
    .viewport {
      flex: 1;
      min-height: 0;
      overflow: auto;
      overscroll-behavior: contain;
    }
    .canvas {
      display: grid;
      place-items: center;
      width: var(--image-width);
      height: var(--image-height);
      min-width: 100%;
      min-height: 100%;
    }
    img {
      display: block;
      width: var(--image-width);
      height: var(--image-height);
      max-width: none;
      border-radius: var(--tacta-radius-element, 8px);
      user-select: none;
    }
    footer {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80px;
      flex: none;
    }
    .zoom-controls {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 4px;
      border-radius: var(--tacta-radius-pill, 999px);
      background: var(--tacta-color-viewer-toolbar, #202020);
    }
    .zoom-value {
      min-width: 64px;
      border-radius: var(--tacta-radius-element, 8px);
      background: transparent;
      font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
      font-variant-numeric: tabular-nums;
    }
    @media (max-width: 480px) {
      dialog {
        padding-inline: 12px;
      }
    }
  `;

  override render(): TemplateResult<1> {
    return html`<dialog
      aria-label=${chatUiText.attachment.preview({ name: this.filename })}
      @keydown=${this.onKeyDown}
      @close=${this.onDialogClose}
      @click=${this.onBackdropClick}
    >
      <header>
        <a
          class="icon-button"
          href=${this.src}
          download=${this.filename}
          aria-label=${chatUiText.attachment.download}
          ${tooltip(chatUiText.attachment.download)}
          >${icon("download", 18)}</a
        >
        <button
          part="icon-button"
          class="icon-button"
          type="button"
          autofocus
          aria-label=${uiText.close}
          ${tooltip(uiText.close)}
          @click=${this.close}
        >
          ${icon("close", 20)}
        </button>
      </header>
      <div part="viewport" class="viewport">
        <div part="canvas" class="canvas" style=${this.imageSize} @click=${this.onBackdropClick}>
          <img src=${this.src} alt=${this.filename} draggable="false" @load=${this.onImageLoad} />
        </div>
      </div>
      <footer>
        <div
          part="zoom-controls"
          class="zoom-controls"
          role="group"
          aria-label=${chatUiText.image.zoom}
        >
          <button
            part="icon-button"
            class="icon-button"
            type="button"
            aria-label=${chatUiText.image.zoomOut}
            ${tooltip(chatUiText.image.zoomOut)}
            ?disabled=${!this.canZoomOut}
            @click=${this.zoomOut}
          >
            ${icon("minus", 18)}
          </button>
          <button
            part="zoom-value"
            class="zoom-value"
            type="button"
            aria-label=${chatUiText.image.fit}
            ${tooltip(chatUiText.image.fit)}
            @click=${this.fit}
          >
            ${Math.round(this.zoom * 100)}%
          </button>
          <button
            part="icon-button"
            class="icon-button"
            type="button"
            aria-label=${chatUiText.image.zoomIn}
            ${tooltip(chatUiText.image.zoomIn)}
            ?disabled=${!this.canZoomIn}
            @click=${this.zoomIn}
          >
            ${icon("plus", 18)}
          </button>
        </div>
      </footer>
    </dialog>`;
  }
}
