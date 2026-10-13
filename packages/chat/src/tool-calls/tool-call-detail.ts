import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { guard } from "lit/directives/guard.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { highlightJson } from "./json-highlight.js";

export class ToolCallDetail extends LitElement {
  @property() label = "";
  @property({ attribute: false }) value: string | null = null;
  @property() emptyText = "";

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
    }
    h4 {
      margin: 0 0 6px;
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
      font-weight: var(--tacta-font-weight-medium, 500);
    }
    pre {
      max-height: 280px;
      overflow: auto;
      margin: 0;
      padding: 10px 12px;
      border: 0;
      border-radius: var(--tacta-radius-inset, 6px);
      background: color-mix(in srgb, var(--tacta-color-surface, #252627) 45%, transparent);
      color: var(--tacta-color-text, #e6e6e6);
      font-family: var(
        --tacta-font-mono,
        "Geist Mono Variable",
        Consolas,
        "Liberation Mono",
        monospace
      );
      font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
      line-height: var(--tacta-line-height-reading, 1.65);
      white-space: pre-wrap;
      overflow-wrap: anywhere;
      scrollbar-width: none;
    }
    pre::-webkit-scrollbar {
      display: none;
    }
    pre:focus-visible {
      outline: 2px solid var(--tacta-color-border-strong, #ffffff1f);
      outline-offset: 2px;
    }
    .empty {
      margin: 0;
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    }
    .json-key {
      color: var(--tacta-color-json-key, #a9c5e9);
    }
    .json-string {
      color: var(--tacta-color-json-string, #b9cfaa);
    }
    .json-number {
      color: var(--tacta-color-json-number, #dcc49c);
    }
    .json-boolean {
      color: var(--tacta-color-json-boolean, #c4b2de);
    }
    .json-null {
      color: var(--tacta-color-muted, #a3a3a5);
    }
  `;

  private renderValue(): TemplateResult<1> {
    const value = this.value;
    if (!value) {
      return html`<p class="empty">${this.emptyText}</p>`;
    }
    return html`<pre tabindex="0" aria-label=${this.label}>
${guard([value], () => highlightJson(value))}</pre>`;
  }

  override render(): TemplateResult<1> {
    return html`<section>
      <h4>${this.label}</h4>
      ${this.renderValue()}
    </section>`;
  }
}
