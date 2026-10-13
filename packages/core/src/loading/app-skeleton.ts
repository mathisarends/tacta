import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { customElement } from "lit/decorators.js";
import { controls } from "../styles/controls.js";

export class AppSkeleton extends LitElement {
  static override styles = css`
    ${controls}
    :host {
      display: block;
      width: 100%;
      height: 1em;
      border-radius: var(--tacta-radius-inset, 6px);
    }
    span {
      display: block;
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background: var(--skeleton-background, var(--tacta-color-panel-hover, #2d2e2f));
      animation: pulse var(--tacta-motion-duration-pulse, 1.6s) ease-in-out infinite;
    }
    @keyframes pulse {
      50% {
        opacity: 0.45;
      }
    }
  `;

  override render(): TemplateResult<1> {
    return html`<span aria-hidden="true"></span>`;
  }
}
