import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export class SettingsRow extends LitElement {
  @property() heading = "";
  @property() description = "";
  @property({ type: Boolean, reflect: true }) inline = false;

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      padding: 20px 0;
    }
    @media (max-width: 650px) {
      :host {
        padding: 18px 0;
      }
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px 24px;
    }
    .main {
      display: flex;
      flex: 1 1 280px;
      align-items: center;
      gap: 14px;
      min-width: 0;
    }
    .text {
      flex: 1;
      min-width: 0;
    }
    .heading {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 4px 10px;
      font-weight: var(--tacta-font-weight-medium, 500);
      line-height: var(--tacta-line-height-caption, 1.5);
    }
    p {
      margin: 5px 0 0;
      color: var(--tacta-color-muted, #667085);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
      line-height: var(--tacta-line-height-caption, 1.5);
      overflow-wrap: anywhere;
    }
    .control {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      margin-left: auto;
    }
    slot:not([name])::slotted(*) {
      display: block;
      margin-top: 14px;
    }
    @media (max-width: 650px) {
      .row {
        flex-direction: column;
        align-items: stretch;
      }
      .main {
        flex-basis: auto;
        align-items: flex-start;
      }
      .control {
        margin-left: 0;
        justify-content: flex-start;
      }
      :host([inline]) .row {
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
      }
      :host([inline]) .main {
        flex: 1;
        min-width: 0;
      }
      :host([inline]) .control {
        flex: none;
      }
    }
  `;

  override render(): TemplateResult<1> {
    return html`<div class="row">
        <div class="main">
          <slot name="icon"></slot>
          <div class="text">
            <div class="heading">
              <slot name="heading"><span>${this.heading}</span></slot
              ><slot name="badge"></slot>
            </div>
            ${this.description ? html`<p>${this.description}</p>` : nothing}
          </div>
        </div>
        <div class="control"><slot name="control"></slot></div>
      </div>
      <slot></slot>`;
  }
}
