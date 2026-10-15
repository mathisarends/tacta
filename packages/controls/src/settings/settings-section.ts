import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export class SettingsSection extends LitElement {
  @property() heading = "";
  @property() description = "";

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      margin-top: 32px;
    }
    section {
      display: block;
    }
    header {
      padding: 0 0 8px;
    }
    h2 {
      margin: 0;
      font-size: var(--tacta-font-size-body, var(--tacta-text-base));
      font-weight: var(--tacta-font-weight-medium, 500);
      letter-spacing: var(--tacta-letter-spacing-ui, normal);
      line-height: var(--tacta-line-height-heading, 1.3);
      color: var(--tacta-color-muted, #a3a3a5);
    }
    header p {
      margin: 7px 0 0;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
      line-height: var(--tacta-line-height-caption, 1.5);
    }
    .card {
      display: flex;
      flex-direction: column;
      background: transparent;
    }
    .card ::slotted(*) {
      background: transparent;
    }
    .card ::slotted(:not(:first-child)) {
      border-top: 1px solid var(--tacta-color-border, #ffffff0d);
    }
  `;

  override render(): TemplateResult<1> {
    return html`<section aria-labelledby="heading">
      <header>
        <h2 id="heading" part="heading">${this.heading}</h2>
        ${this.description ? html`<p>${this.description}</p>` : nothing}
      </header>
      <div class="card"><slot></slot></div>
      <slot name="footer"></slot>
    </section>`;
  }
}
