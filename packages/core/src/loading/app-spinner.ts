import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { controls } from "../styles/controls.js";

export class AppSpinner extends LitElement {
  @property() label = "";

  static override styles = css`
    ${controls}
    :host {
      display: inline-flex;
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .ring {
      display: block;
      width: 22px;
      height: 22px;
      border: 2px solid color-mix(in srgb, currentColor 20%, transparent);
      border-top-color: currentColor;
      border-radius: var(--tacta-radius-round, 50%);
      animation: spin var(--tacta-motion-duration-spin, 850ms) linear infinite;
    }
    .label {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `;

  override render(): TemplateResult<1> {
    return html`<span role="status"
      ><span class="label">${this.label}</span><span class="ring" aria-hidden="true"></span
    ></span>`;
  }
}
