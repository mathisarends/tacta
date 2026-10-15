import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { matchesShortcut } from "@tacta/core/keyboard/shortcuts";
import { imageShortcuts } from "./image-shortcuts.js";
import "./image-editor-actions.js";
import type { Annotation, ImageTool } from "./annotation-types.js";
import { annotatedFilename } from "./annotations.js";
import type { ImageCanvas } from "./image-canvas.js";
import { imageEditorText as text } from "./messages/index.js";
import "./image-canvas.js";
import "./image-tools.js";
import "./movable-toolbar.js";

export class ImageEditor extends LitElement {
  @property() src = "";
  @property() filename = "";
  @property({ type: Boolean }) attachable = false;
  @state() private tool: ImageTool = "draw";
  @state() private color = "";
  @state() private size = 4;
  @state() private zoom = 1;
  @state() private annotations: Annotation[] = [];
  @state() private undone: Annotation[] = [];
  @state() private ready = false;
  @state() private busy = false;
  @state() private error = "";
  private downloadUrl = "";

  private get canvas(): ImageCanvas | null {
    return this.renderRoot.querySelector("tacta-image-canvas");
  }

  private get disabled(): boolean {
    return !this.ready || this.busy;
  }

  private get canUndo(): boolean {
    return !this.disabled && this.annotations.length > 0;
  }

  private get canRedo(): boolean {
    return !this.disabled && this.undone.length > 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (!this.color) {
      this.color = getComputedStyle(this).getPropertyValue("--tacta-image-editor-ink").trim();
    }
  }

  override disconnectedCallback(): void {
    this.releaseDownload();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("src")) {
      this.annotations = [];
      this.undone = [];
      this.ready = false;
      this.error = "";
      this.zoom = 1;
      this.releaseDownload();
    }
  }

  private add(event: CustomEvent<Annotation>): void {
    event.stopPropagation();
    this.annotations = [...this.annotations, event.detail];
    this.undone = [];
  }

  private undo(): void {
    if (!this.canUndo) {
      return;
    }
    this.undone = [...this.undone, this.annotations.at(-1)!];
    this.annotations = this.annotations.slice(0, -1);
  }

  private redo(): void {
    if (!this.canRedo) {
      return;
    }
    this.annotations = [...this.annotations, this.undone.at(-1)!];
    this.undone = this.undone.slice(0, -1);
  }

  private onKey(event: KeyboardEvent): void {
    if (
      event
        .composedPath()
        .some(
          (target) => target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement,
        )
    ) {
      return;
    }
    if (matchesShortcut(event, imageShortcuts.undo)) {
      event.preventDefault();
      event.stopPropagation();
      this.undo();
    } else if (matchesShortcut(event, imageShortcuts.redo)) {
      event.preventDefault();
      event.stopPropagation();
      this.redo();
    }
  }

  private releaseDownload(): void {
    if (this.downloadUrl) {
      URL.revokeObjectURL(this.downloadUrl);
      this.downloadUrl = "";
    }
  }

  private async exportImage(attach: boolean): Promise<void> {
    if (this.disabled || !this.canvas) {
      return;
    }
    const src = this.src;
    this.busy = true;
    this.error = "";
    try {
      const blob = await this.canvas.exportBlob();
      if (!this.isConnected || this.src !== src) {
        return;
      }
      const filename = annotatedFilename(this.filename);
      if (attach) {
        this.dispatchEvent(
          new CustomEvent<File>("image-attach", {
            detail: new File([blob], filename, { type: "image/png" }),
            bubbles: true,
            composed: true,
          }),
        );
      } else {
        this.releaseDownload();
        this.downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = this.downloadUrl;
        link.download = filename;
        link.click();
      }
    } catch {
      if (this.isConnected && this.src === src) {
        this.error = text.exportError;
      }
    } finally {
      if (this.isConnected) {
        this.busy = false;
      }
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      min-width: 0;
      background: var(--tacta-color-image-editor-background, #121212);
    }
    .stage {
      position: relative;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .viewport {
      position: absolute;
      inset: var(--tacta-image-editor-inset, 20px);
      bottom: var(--tacta-image-editor-footer, 76px);
      overflow: auto;
    }
    .toolbar-space {
      position: absolute;
      inset: var(--tacta-image-editor-gap, 6px);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      pointer-events: none;
    }
    .hint {
      margin: 0;
      padding: var(--tacta-image-editor-gap, 6px);
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    }
    .error {
      color: var(--tacta-color-text, #e6e6e6);
    }
  `;

  private renderError(): TemplateResult<1> | typeof nothing {
    if (!this.error) {
      return nothing;
    }
    return html`<p class="hint error" role="alert">${this.error}</p>`;
  }

  override render(): TemplateResult<1> {
    return html`<tacta-image-editor-actions
        .zoom=${this.zoom}
        .disabled=${this.disabled}
        .attachable=${this.attachable}
        @zoom-change=${(event: CustomEvent<number>) => (this.zoom = event.detail)}
        @image-export=${(event: CustomEvent<boolean>) => void this.exportImage(event.detail)}
      ></tacta-image-editor-actions>
      ${this.renderError()}
      <div class="stage" data-raw-keys @keydown=${this.onKey}>
        <div class="viewport">
          <tacta-image-canvas
            .src=${this.src}
            .label=${this.filename}
            .tool=${this.tool}
            .color=${this.color}
            .size=${this.size}
            .zoom=${this.zoom}
            .annotations=${this.annotations}
            @annotation-add=${this.add}
            @image-ready=${(event: CustomEvent<boolean>) => (this.ready = event.detail)}
          ></tacta-image-canvas>
        </div>
        <div class="toolbar-space">
          <tacta-movable-toolbar
            ><tacta-image-tools
              .tool=${this.tool}
              .color=${this.color}
              .size=${this.size}
              .disabled=${this.disabled}
              .canUndo=${this.canUndo}
              .canRedo=${this.canRedo}
              @tool-change=${(event: CustomEvent<ImageTool>) => (this.tool = event.detail)}
              @color-change=${(event: CustomEvent<string>) => (this.color = event.detail)}
              @size-change=${(event: CustomEvent<number>) => (this.size = event.detail)}
              @history-undo=${this.undo}
              @history-redo=${this.redo}
            ></tacta-image-tools
          ></tacta-movable-toolbar>
        </div>
      </div>
      <p class="hint">${text.hint}</p>`;
  }
}
