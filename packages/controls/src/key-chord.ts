import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export class KeyChord extends LitElement {
  @property({ attribute: false }) keys: readonly string[] = [];
  @property() separator = "+";

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      white-space: nowrap;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      line-height: var(--tacta-line-height-control, 1.4);
    }
    kbd {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      min-width: 26px;
      min-height: 26px;
      padding: 3px 7px;
      border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      border-bottom-width: 2px;
      border-radius: var(--tacta-radius-subtle, 5px);
      background: var(--tacta-color-surface, #252627);
      font: inherit;
    }
    .separator {
      font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
    }
  `;

  override render(): TemplateResult<1> {
    return html`${this.keys.map((key, index) => html`${index > 0 && this.separator ? html`<span class="separator">${this.separator}</span>` : nothing}<kbd>${key}</kbd>`)}`;
  }
}
