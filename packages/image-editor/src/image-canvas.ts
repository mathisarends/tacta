import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { keyed } from "lit/directives/keyed.js";
import type { ImageTextInput } from "./image-text-input.js";
import "./image-text-input.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { Annotation, ImageTool, ImageTextResult, Point } from "./annotation-types.js";
import { paintAnnotations } from "./annotations.js";
import { imageEditorText as text } from "./messages/index.js";

export class ImageCanvas extends LitElement {
  @property() src = "";
  @property() label = "";
  @property() tool: ImageTool = "draw";
  @property() color = "";
  @property({ type: Number }) size = 4;
  @property({ type: Number }) zoom = 1;
  @property({ attribute: false }) annotations: readonly Annotation[] = [];
  @state() private width = 0;
  @state() private height = 0;
  @state() private fittedWidth = 0;
  @state() private failed = false;
  @state() private textDraft?: Omit<Extract<Annotation, { type: "text" }>, "text">;
  private stroke?: Extract<Annotation, { points: Point[] }>;
  private pointer?: number;
  private readonly resize = new ResizeObserver(() => this.fit());

  private get canvas(): HTMLCanvasElement | null {
    return this.renderRoot.querySelector("canvas");
  }

  private get textInput(): ImageTextInput | null {
    return this.renderRoot.querySelector("tacta-image-text-input");
  }

  private get image(): HTMLImageElement | null {
    return this.renderRoot.querySelector("img");
  }

  private get ready(): boolean {
    return this.width > 0 && !this.failed;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.parentElement) {
      this.resize.observe(this.parentElement);
    }
  }

  override disconnectedCallback(): void {
    this.textDraft = undefined;
    this.resize.disconnect();
    this.cancel();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("src")) {
      this.textDraft = undefined;
      this.width = 0;
      this.height = 0;
      this.failed = false;
      this.cancel();
    }
    if (changed.has("tool")) {
      this.finishText();
      this.cancel();
    }
  }

  protected override updated(): void {
    this.paint();
  }

  async exportBlob(): Promise<Blob> {
    const image = this.image;
    const layer = this.canvas;
    if (!this.ready || !image || !layer) {
      throw new Error("Image unavailable");
    }
    const existing = this.annotations;
    const pending = this.finishText();
    const annotations = pending ? [...existing, pending] : existing;
    const output = document.createElement("canvas");
    output.width = this.width;
    output.height = this.height;
    const context = output.getContext("2d");
    if (!context) {
      throw new Error("Canvas unavailable");
    }
    context.drawImage(image, 0, 0);
    const annotationLayer = document.createElement("canvas");
    annotationLayer.width = this.width;
    annotationLayer.height = this.height;
    const annotationContext = annotationLayer.getContext("2d");
    if (!annotationContext) {
      throw new Error("Canvas unavailable");
    }
    paintAnnotations(annotationContext, annotations);
    context.drawImage(annotationLayer, 0, 0);
    return new Promise((resolve, reject) =>
      output.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("PNG export failed"));
        }
      }, "image/png"),
    );
  }

  private fit(): void {
    const parent = this.parentElement;
    if (parent && this.width) {
      this.fittedWidth = Math.max(
        1,
        Math.min(parent.clientWidth, (parent.clientHeight * this.width) / this.height, this.width),
      );
    }
  }

  private loaded(event: Event): void {
    const image = event.currentTarget as HTMLImageElement;
    this.width = image.naturalWidth;
    this.height = image.naturalHeight;
    this.fit();
    this.dispatchEvent(
      new CustomEvent<boolean>("image-ready", { detail: true, bubbles: true, composed: true }),
    );
  }

  private error(): void {
    this.failed = true;
    this.dispatchEvent(
      new CustomEvent<boolean>("image-ready", { detail: false, bubbles: true, composed: true }),
    );
  }

  private point(event: PointerEvent): Point {
    const bounds = this.canvas!.getBoundingClientRect();
    return {
      x: Math.max(
        0,
        Math.min(this.width, ((event.clientX - bounds.left) * this.width) / bounds.width),
      ),
      y: Math.max(
        0,
        Math.min(this.height, ((event.clientY - bounds.top) * this.height) / bounds.height),
      ),
    };
  }

  private start(event: PointerEvent): void {
    if (!this.ready || event.button !== 0 || this.pointer !== undefined) {
      return;
    }
    event.preventDefault();
    this.canvas?.focus();
    const point = this.point(event);
    const scale = this.width / this.canvas!.getBoundingClientRect().width;
    if (this.tool === "text") {
      this.finishText();
      this.textDraft = {
        type: "text",
        point,
        color: this.color,
        size: Math.max(16, this.size * 4) * scale,
      };
      return;
    }
    this.pointer = event.pointerId;
    this.canvas!.setPointerCapture(event.pointerId);
    const size = this.tool === "erase" ? this.size * 4 : this.size;
    this.stroke = { type: this.tool, points: [point], color: this.color, size: size * scale };
    this.paint();
  }

  private finishText(value = this.textInput?.value): Annotation | undefined {
    const draft = this.textDraft;
    this.textDraft = undefined;
    if (!draft || !value?.trim()) {
      return;
    }
    const annotation: Annotation = { ...draft, text: value.trim() };
    this.commit(annotation);
    return annotation;
  }

  private onTextFinish(event: CustomEvent<ImageTextResult>): void {
    event.stopPropagation();
    this.finishText(event.detail.text ?? "");
    if (event.detail.focusCanvas) {
      this.canvas?.focus();
    }
  }

  private move(event: PointerEvent): void {
    if (this.pointer !== event.pointerId || !this.stroke) {
      return;
    }
    this.stroke.points.push(this.point(event));
    this.paint();
  }

  private finish(event: PointerEvent): void {
    if (this.pointer !== event.pointerId || !this.stroke) {
      return;
    }
    const stroke = this.stroke;
    this.stroke = undefined;
    this.pointer = undefined;
    this.commit(stroke);
  }

  private cancel(): void {
    this.stroke = undefined;
    this.pointer = undefined;
    this.paint();
  }

  private commit(annotation: Annotation): void {
    this.dispatchEvent(
      new CustomEvent<Annotation>("annotation-add", {
        detail: annotation,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private paint(): void {
    const context = this.canvas?.getContext("2d");
    if (context) {
      const annotations = this.stroke ? [...this.annotations, this.stroke] : this.annotations;
      paintAnnotations(context, annotations);
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      min-width: 100%;
      min-height: 100%;
      width: max-content;
      align-items: center;
      justify-content: center;
    }
    .paper {
      position: relative;
      flex: none;
      width: var(--tacta-canvas-width);
    }
    img {
      display: block;
      width: 100%;
      height: auto;
      user-select: none;
    }
    canvas {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      touch-action: none;
      cursor: crosshair;
    }
    .text-input {
      position: absolute;
      left: var(--tacta-annotation-x);
      top: var(--tacta-annotation-y);
      width: min(
        var(--tacta-image-editor-text-width, 280px),
        calc(100% - var(--tacta-annotation-x))
      );
      max-height: calc(100% - var(--tacta-annotation-y));
      overflow: auto;
    }
    .status {
      color: var(--tacta-color-muted, #a3a3a5);
      padding: var(--tacta-image-editor-inset, 20px);
    }
    [hidden] {
      display: none;
    }
  `;

  private renderStatus(): TemplateResult<1> | typeof nothing {
    if (this.ready) {
      return nothing;
    }
    if (this.failed) {
      return html`<p class="status" role="alert">${text.loadError}</p>`;
    }
    return html`<p class="status" role="status">${text.loading}</p>`;
  }

  private renderTextInput(): TemplateResult<1> | typeof nothing {
    const draft = this.textDraft;
    if (!draft) {
      return nothing;
    }
    const x = (draft.point.x / this.width) * 100;
    const y = (draft.point.y / this.height) * 100;
    const size = (draft.size * this.fittedWidth * this.zoom) / this.width;
    return html`${keyed(
      draft,
      html`<tacta-image-text-input
        class="text-input"
        style="--tacta-annotation-x:${x}%;--annotation-y:${y}%;--annotation-size:${size}px;--annotation-color:${draft.color}"
        @text-finish=${this.onTextFinish}
      ></tacta-image-text-input>`,
    )}`;
  }

  override render(): TemplateResult<1> {
    return html`${this.renderStatus()}
      <div
        class="paper"
        ?hidden=${!this.ready}
        style="--tacta-canvas-width:${this.fittedWidth * this.zoom}px"
      >
        <img
          src=${this.src}
          alt=${this.label}
          crossorigin="anonymous"
          draggable="false"
          @load=${this.loaded}
          @error=${this.error}
        />
        <canvas
          width=${this.width}
          height=${this.height}
          tabindex="0"
          aria-label=${text.editor}
          @pointerdown=${this.start}
          @pointermove=${this.move}
          @pointerup=${this.finish}
          @pointercancel=${this.cancel}
          @lostpointercapture=${this.cancel}
        ></canvas>
        ${this.renderTextInput()}
      </div>`;
  }
}
