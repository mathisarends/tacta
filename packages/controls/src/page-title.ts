import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export class PageTitle extends LitElement {
  @property() label = "";

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
      color: var(--tacta-color-text, #e6e6e6);
      font: var(--tacta-font-weight-semibold, 600)
        var(--tacta-font-size-header-title, var(--tacta-text-xl)) /
        var(--tacta-line-height-control, 1.4) var(--tacta-font-family, system-ui, sans-serif);
    }
    span {
      display: block;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<span title=${this.label}>${this.label}</span>`;
  }
}
