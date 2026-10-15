import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { TactaElement } from "@tacta/core/element";
import { componentStyles } from "@tacta/core";
import type { PanelResizeEvent } from "./types.js";

export class TactaSplitPane extends TactaElement {
  @property({ type: Number }) value = 400;
  @property({ type: Number }) reserve = 480;
  @property({ type: Number, attribute: "min-width" }) minWidth = 280;
  @property({ type: Number }) step = 24;
  @property() label = "Resize panels";
  @property({ type: Boolean, reflect: true }) collapsed = false;

  private resize(event: PanelResizeEvent): void {
    this.value = event.detail;
  }

  static override styles = [
    componentStyles,
    css`
      :host {
        display: flex;
        min-width: 0;
        min-height: 0;
      }
      .stage {
        display: flex;
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }
      .main {
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: auto;
      }
      .panel {
        flex: 0 0 auto;
        min-width: 0;
        min-height: 0;
        overflow: auto;
      }
      [hidden] {
        display: none;
      }
      ::slotted(*) {
        min-width: 0;
        min-height: 0;
      }
    `,
  ];

  override render(): TemplateResult {
    return html`<div class="stage" part="stage">
      <div class="main" part="main"><slot></slot></div>
      <tacta-panel-splitter
        .value=${this.value}
        .reserve=${this.reserve}
        .minWidth=${this.minWidth}
        .step=${this.step}
        .label=${this.label}
        ?hidden=${this.collapsed}
        @panel-resize=${this.resize}
      ></tacta-panel-splitter>
      <div class="panel" part="panel" style=${`width:${this.value}px`} ?hidden=${this.collapsed}>
        <slot name="panel"></slot>
      </div>
    </div>`;
  }
}
