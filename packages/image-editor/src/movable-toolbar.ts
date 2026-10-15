import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { imageEditorText as text } from "./messages/index.js";

export class MovableToolbar extends LitElement {
  @state() private x = 0;
  @state() private y = 0;
  private drag?: { pointer: number; x: number; y: number };
  private readonly resize = new ResizeObserver(() => this.move(this.x, this.y));

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.parentElement) {
      this.resize.observe(this.parentElement);
    }
    this.resize.observe(this);
  }

  override disconnectedCallback(): void {
    this.resize.disconnect();
    this.drag = undefined;
    super.disconnectedCallback();
  }

  private move(x: number, y: number): void {
    const parent = this.parentElement;
    if (!parent) {
      return;
    }
    const horizontal = Math.max(0, (parent.clientWidth - this.offsetWidth) / 2);
    const vertical = Math.max(0, parent.clientHeight - this.offsetHeight);
    this.x = Math.max(-horizontal, Math.min(horizontal, x));
    this.y = Math.max(-vertical, Math.min(0, y));
    this.style.setProperty("--tacta-toolbar-x", `${this.x}px`);
    this.style.setProperty("--tacta-toolbar-y", `${this.y}px`);
  }

  private start(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    this.drag = { pointer: event.pointerId, x: event.clientX - this.x, y: event.clientY - this.y };
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  private dragTo(event: PointerEvent): void {
    if (this.drag?.pointer === event.pointerId) {
      this.move(event.clientX - this.drag.x, event.clientY - this.drag.y);
    }
  }

  private end(): void {
    this.drag = undefined;
  }

  private onKey(event: KeyboardEvent): void {
    const steps: Record<string, [number, number]> = {
      ArrowLeft: [-16, 0],
      ArrowRight: [16, 0],
      ArrowUp: [0, -16],
      ArrowDown: [0, 16],
    };
    const step = steps[event.key];
    if (event.key === "Home") {
      this.move(0, 0);
    } else if (step) {
      this.move(this.x + step[0], this.y + step[1]);
    } else {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      align-items: center;
      width: max-content;
      max-width: 100%;
      padding: var(--tacta-image-editor-gap, 6px) var(--tacta-image-editor-toolbar-padding, 10px);
      gap: var(--tacta-image-editor-handle-gap, 10px);
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-pill, 999px);
      background: var(--tacta-color-surface, #252627);
      box-shadow: var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background) 65%, transparent)
      );
      transform: translate(var(--tacta-toolbar-x, 0px), var(--tacta-toolbar-y, 0px));
      pointer-events: auto;
    }
    .handle {
      width: var(--tacta-image-editor-handle-width, 26px);
      height: var(--tacta-image-editor-control, 34px);
      cursor: grab;
      touch-action: none;
      flex: none;
    }
    .handle:active {
      cursor: grabbing;
    }
    .contents {
      min-width: 0;
      overflow-x: auto;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<button
        class="icon-button handle"
        aria-label=${text.move}
        @pointerdown=${this.start}
        @pointermove=${this.dragTo}
        @pointerup=${this.end}
        @pointercancel=${this.end}
        @lostpointercapture=${this.end}
        @keydown=${this.onKey}
      >
        ${icon("grip", 16)}
      </button>
      <div class="contents" role="group" aria-label=${text.tools}><slot></slot></div>`;
  }
}
