import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";

export class CtaButton extends LitElement {
  @property() label = "";
  @property() type: "submit" | "button" = "submit";
  @property({ type: Boolean }) disabled = false;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override render(): TemplateResult<1> {
    return html`<button class="button primary cta" type=${this.type} ?disabled=${this.disabled}>
      <span>${this.label}</span>${icon("arrow")}
    </button>`;
  }
}

export const ctaButtonStyles = css`
  tacta-cta-button {
    display: block;
  }
  .cta {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    width: 100%;
  }
  .cta span {
    grid-column: 2;
  }
  .cta svg {
    grid-column: 3;
    justify-self: end;
  }
`;
