import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { uiText } from "@tacta/core/messages";
import { tooltip } from "../tooltip.js";

export type BreadcrumbItem = { label: string; href?: string };

export class AppBreadcrumb extends LitElement {
  @property({ attribute: false }) items: BreadcrumbItem[] = [];
  @property() label = "";
  @property({ type: Boolean }) compact = true;

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
    }
    ol {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      margin: 0;
      padding: 0;
      list-style: none;
      font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    }
    li {
      display: flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      color: var(--tacta-color-muted, #667085);
    }
    li:last-child {
      color: var(--tacta-color-text, #202124);
      font-weight: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400));
    }
    .separator {
      color: var(--tacta-color-muted, #667085);
      font-weight: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400));
    }
    .label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    a {
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
    @media (max-width: 1050px) {
      .compact li:not(:last-child),
      .compact .separator {
        display: none;
      }
    }
  `;

  private renderLabel(item: BreadcrumbItem, current: boolean): TemplateResult<1> {
    if (item.href && !current) {
      return html`<a class="label" href=${item.href} ${tooltip(item.label)}>${item.label}</a>`;
    }
    return html`<span
      class="label"
      ${tooltip(item.label)}
      aria-current=${current ? "page" : nothing}
      >${item.label}</span
    >`;
  }

  private renderItem(item: BreadcrumbItem, index: number): TemplateResult<1> {
    const current = index === this.items.length - 1;
    return html`<li>
      ${index ? html`<span class="separator" aria-hidden="true">/</span>` : nothing}
      ${this.renderLabel(item, current)}
    </li>`;
  }

  override render(): TemplateResult<1> {
    return html`<nav aria-label=${this.label || uiText.breadcrumb}>
      <ol class=${this.compact ? "compact" : ""}>
        ${this.items.map((item, index) => this.renderItem(item, index))}
      </ol>
    </nav>`;
  }
}
