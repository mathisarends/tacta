import { css, html, LitElement, type CSSResultGroup, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { componentStyles } from "@tacta/core";

/** Keep room for adjacent content; retain the minimum even in a narrow stage. */
export function clampPanelWidth(
  width: number,
  stageWidth: number,
  reserve: number,
  minWidth = 280,
): number {
  return Math.min(Math.max(width, minWidth), Math.max(minWidth, stageWidth - reserve));
}

/** Controlled resize handle for a panel immediately to its right. */
export class TactaPanelSplitter extends LitElement {
  @property({ type: Number }) value: number | null = null;
  @property({ type: Number }) reserve = 480;
  @property({ type: Number, attribute: "min-width" }) minWidth = 280;
  @property({ type: Number }) step = 24;
  @property() label = "Resize panel";

  private cancelResize?: () => void;
  private observer?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    this.observer = new ResizeObserver(() => this.requestUpdate());
    if (this.parentElement) {
      this.observer.observe(this.parentElement);
    }
  }

  override disconnectedCallback(): void {
    this.cancelResize?.();
    this.observer?.disconnect();
    super.disconnectedCallback();
  }

  private get stageWidth(): number {
    return this.parentElement?.getBoundingClientRect().width ?? 900;
  }

  private get width(): number {
    return this.value ?? this.nextElementSibling?.getBoundingClientRect().width ?? 400;
  }

  private clamp(width: number): number {
    return clampPanelWidth(width, this.stageWidth, this.reserve, this.minWidth);
  }

  private startResize(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    this.cancelResize?.();
    const handle = event.currentTarget as HTMLElement;
    handle.setPointerCapture(event.pointerId);
    const cleanup = (): void => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
      handle.removeEventListener("lostpointercapture", stop);
      this.cancelResize = undefined;
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
      this.emitResizeEnd();
    };
    const move = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== event.pointerId) {
        return;
      }
      const rect = this.parentElement?.getBoundingClientRect();
      if (rect) {
        this.change(Math.round(this.clamp(rect.right - moveEvent.clientX)));
      }
    };
    const stop = (stopEvent: PointerEvent): void => {
      if (stopEvent.pointerId === event.pointerId) {
        cleanup();
      }
    };
    this.cancelResize = cleanup;
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
    handle.addEventListener("lostpointercapture", stop);
  }

  private resizeWithKey(event: KeyboardEvent): void {
    let width: number;
    switch (event.key) {
      case "ArrowLeft":
        width = this.width + this.step;
        break;
      case "ArrowRight":
        width = this.width - this.step;
        break;
      case "Home":
        width = this.minWidth;
        break;
      case "End":
        width = this.stageWidth - this.reserve;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.change(this.clamp(width));
    this.emitResizeEnd();
  }

  private change(width: number): void {
    this.dispatchEvent(
      new CustomEvent<number>("panel-resize", { detail: width, bubbles: true, composed: true }),
    );
  }

  private emitResizeEnd(): void {
    this.dispatchEvent(
      new CustomEvent<void>("panel-resize-end", { bubbles: true, composed: true }),
    );
  }

  static override styles: CSSResultGroup = [
    componentStyles,
    css`
      :host {
        display: block;
        width: var(--tacta-panel-splitter-size, 7px);
        flex: 0 0 var(--tacta-panel-splitter-size, 7px);
      }
      .handle {
        height: 100%;
        position: relative;
        cursor: col-resize;
        touch-action: none;
        outline: none;
      }
      .handle::after {
        content: "";
        position: absolute;
        inset: var(--tacta-panel-splitter-inset, 16px 3px);
        border-radius: var(--tacta-radius-pill, 999px);
      }
      .handle:hover::after,
      .handle:focus-visible::after {
        background: var(--tacta-color-muted, #667085);
      }
      .handle:focus-visible {
        outline: 2px solid var(--tacta-color-focus, #2563eb);
        outline-offset: -2px;
      }
    `,
  ];

  override render(): TemplateResult {
    return html`<div
      class="handle"
      part="handle"
      role="separator"
      tabindex="0"
      aria-orientation="vertical"
      aria-label=${this.label}
      aria-valuemin=${this.minWidth}
      aria-valuemax=${Math.max(this.minWidth, this.stageWidth - this.reserve)}
      aria-valuenow=${this.clamp(this.width)}
      @pointerdown=${this.startResize}
      @keydown=${this.resizeWithKey}
    ></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tacta-panel-splitter": TactaPanelSplitter;
  }
}
