import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import "./empty-file.js";

export class SourceDocument extends LitElement {
  @property() value = "";
  @property() path = "document.md";
  @property({ type: Boolean }) wrap = true;
  @property({ type: Boolean }) folding = false;

  override connectedCallback(): void {
    super.connectedCallback();
    void import("./markdown-editor.js");
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
    }
  `;

  override render(): TemplateResult<1> {
    if (this.value.length === 0) {
      return html`<tacta-empty-file></tacta-empty-file>`;
    }
    return html`<tacta-markdown-editor
      .value=${this.value}
      .label=${this.path}
      .readOnly=${true}
      .source=${true}
      .wrap=${this.wrap}
      .folding=${this.folding}
    ></tacta-markdown-editor>`;
  }
}
