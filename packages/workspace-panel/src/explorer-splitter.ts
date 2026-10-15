import { css, html, LitElement, type CSSResultGroup, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { componentStyles } from "@tacta/core";
import type { ExplorerResizeDetail } from "./types.js";

/** Controlled handle for an explorer immediately to its right, capped at half the parent. */
export class TactaExplorerSplitter extends LitElement {
  @property({ type: Number }) value: number | null = null;
  @property({ type: Number, attribute: "min-width" }) minWidth = 185;
  @property({ type: Number, attribute: "collapse-threshold" }) collapseThreshold = 140;
  @property({ type: Number }) step = 24;
  @property() label = "Resize explorer";

  private cancelResize?: () => void;
  private observer?: ResizeObserver;

  protected get accessibleLabel(): string {
    return this.label;
  }

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

  private get limit(): number {
    const handleWidth = this.getBoundingClientRect().width || 5;
    return Math.max(
      this.minWidth,
      Math.floor(((this.parentElement?.clientWidth ?? 375) - handleWidth) / 2),
    );
  }

  private get explorerWidth(): number {
    return this.nextElementSibling?.getBoundingClientRect().width ?? this.value ?? this.limit;
  }

  private change(width: number, resizing = false, collapse = false): void {
    this.dispatchEvent(
      new CustomEvent<ExplorerResizeDetail>("explorer-resize", {
        detail: { width, resizing, collapse },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private startResize(event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    this.cancelResize?.();
    const handle = event.currentTarget as HTMLElement;
    const startX = event.clientX;
    const startWidth = this.explorerWidth;
    const previousWidth = this.value ?? startWidth;
    let width = startWidth;
    handle.setPointerCapture(event.pointerId);
    this.change(previousWidth, true);

    const cleanup = (): void => {
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", stop);
      handle.removeEventListener("pointercancel", stop);
      handle.removeEventListener("lostpointercapture", stop);
      this.cancelResize = undefined;
      if (handle.hasPointerCapture(event.pointerId)) {
        handle.releasePointerCapture(event.pointerId);
      }
    };
    const move = (moveEvent: PointerEvent): void => {
      if (moveEvent.pointerId !== event.pointerId) {
        return;
      }
      width = Math.max(0, Math.min(this.limit, startWidth + startX - moveEvent.clientX));
      this.change(width, true);
    };
    const stop = (stopEvent: PointerEvent): void => {
      if (stopEvent.pointerId !== event.pointerId) {
        return;
      }
      cleanup();
      if (stopEvent.type !== "pointerup") {
        this.change(previousWidth);
        return;
      }
      if (width < this.collapseThreshold) {
        this.change(previousWidth, false, true);
        return;
      }
      this.change(Math.max(this.minWidth, width));
    };
    this.cancelResize = () => {
      cleanup();
      this.change(previousWidth);
    };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
    handle.addEventListener("lostpointercapture", stop);
  }

  private resizeWithKey(event: KeyboardEvent): void {
    let width: number;
    switch (event.key) {
      case "ArrowLeft":
        width = this.explorerWidth + this.step;
        break;
      case "ArrowRight":
        width = this.explorerWidth - this.step;
        break;
      case "Home":
        width = this.minWidth;
        break;
      case "End":
        width = this.limit;
        break;
      default:
        return;
    }
    event.preventDefault();
    this.change(Math.max(this.minWidth, Math.min(this.limit, width)));
  }

  static override styles: CSSResultGroup = [
    componentStyles,
    css`
      :host {
        display: block;
        width: var(--tacta-explorer-splitter-size, 5px);
        flex: 0 0 var(--tacta-explorer-splitter-size, 5px);
      }
      .handle {
        height: 100%;
        cursor: col-resize;
        touch-action: none;
      }
      .handle:hover,
      .handle:focus-visible,
      :host([resizing]) .handle {
        background: var(--tacta-color-border-strong, #c3c7cf);
      }
      .handle:focus-visible {
        outline: 2px solid var(--tacta-color-focus, #2563eb);
        outline-offset: 2px;
      }
    `,
  ];

  override render(): TemplateResult {
    return html`<div
      class="handle"
      part="handle"
      role="separator"
      tabindex="0"
      aria-label=${this.accessibleLabel}
      aria-orientation="vertical"
      aria-valuemin=${this.minWidth}
      aria-valuemax=${this.limit}
      aria-valuenow=${Math.max(this.minWidth, Math.min(this.limit, this.value ?? this.explorerWidth))}
      @pointerdown=${this.startResize}
      @keydown=${this.resizeWithKey}
      @dblclick=${() => this.change(this.limit)}
    ></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "tacta-explorer-splitter": TactaExplorerSplitter;
  }
}
