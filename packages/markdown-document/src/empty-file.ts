import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import {} from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { markdownDocumentText } from "./messages/index.js";
import { icon } from "@tacta/core/icons";

export class EmptyFile extends LitElement {
  static override styles = css`
    ${workspaceStyles}
    :host {
      display: grid;
      place-items: center;
      min-height: clamp(240px, 45vh, 480px);
      padding: 24px;
      text-align: center;
    }
    .symbol {
      display: inline-grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      border-radius: var(--tacta-radius-card, 16px);
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-muted, #a3a3a5);
      margin-bottom: 18px;
    }
    h3 {
      margin: 0;
      color: var(--tacta-color-text, #e6e6e6);
      font-size: var(--tacta-font-size-section-title, var(--tacta-font-size-body));
      font-weight: var(--tacta-font-weight-title, var(--tacta-font-weight-strong));
    }
    p {
      margin: 8px 0 0;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
      line-height: var(--tacta-line-height-body, 1.6);
    }
  `;

  override render(): TemplateResult<1> {
    const text = markdownDocumentText;
    return html`<div role="status">
      <span class="symbol" aria-hidden="true">${icon("file", 24)}</span>
      <h3>${text.emptyFile}</h3>
      <p>${text.emptyFileBody}</p>
    </div>`;
  }
}
