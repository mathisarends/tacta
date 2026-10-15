import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, svg, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { controls } from "@tacta/core/styles/controls";

const logos = {
  google: svg`<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path class="google-red" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path class="google-blue" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path class="google-yellow" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path class="google-green" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>`,
};

export type SocialProvider = keyof typeof logos;

export class SocialLoginButton extends LitElement {
  @property() provider: SocialProvider = "google";
  @property() label = "";
  @property({ type: Boolean }) disabled = false;

  static override styles = [
    controls,
    css`
      :host {
        display: block;
      }
      .button {
        position: relative;
        width: 100%;
        min-height: var(--tacta-button-height, 48px);
        padding-block: 0;
        border: 0;
        background: var(--tacta-color-surface, #252627);
        color: var(--tacta-color-muted, #a3a3a5);
        font-size: var(--tacta-font-size-body, var(--tacta-text-base));
        font-weight: var(--tacta-font-weight-medium, 500);
      }
      .button:hover:not(:disabled) {
        color: var(--tacta-color-text, #e6e6e6);
      }
      svg {
        position: absolute;
        left: 24px;
      }
      .google-red {
        fill: var(--tacta-color-brand-google-red, #ea4335);
      }
      .google-blue {
        fill: var(--tacta-color-brand-google-blue, #4285f4);
      }
      .google-yellow {
        fill: var(--tacta-color-brand-google-yellow, #fbbc05);
      }
      .google-green {
        fill: var(--tacta-color-brand-google-green, #34a853);
      }
    `,
  ];

  override render(): TemplateResult<1> {
    return html`<button class="button" type="button" ?disabled=${this.disabled}>
      ${logos[this.provider]}${this.label}
    </button>`;
  }
}
