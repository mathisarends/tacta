import { TactaElement as LitElement } from "@tacta/core/element";
import { html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { format } from "@tacta/core/i18n";
import { icon } from "./icons.js";
import { uiText } from "./messages/index.js";
import { pagePaginationStyles } from "./page-pagination.styles.js";

export class PagePagination extends LitElement {
  @property({ type: Number }) page = 1;
  @property({ type: Number, attribute: "page-count" }) pageCount = 1;
  @property({ type: Boolean }) disabled = false;
  @property() label = "";

  private get previousDisabled(): boolean {
    return this.disabled || this.page <= 1;
  }

  private get nextDisabled(): boolean {
    return this.disabled || this.page >= this.pageCount;
  }

  private select(page: number): void {
    if (this.disabled || page < 1 || page > this.pageCount || page === this.page) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<number>("page-change", { detail: page, bubbles: true, composed: true }),
    );
  }

  static override styles = pagePaginationStyles;

  override render(): TemplateResult<1> {
    const text = uiText.pagination;
    const pageNumber = text.pageNumber({
      current: format.number(this.page),
      total: format.number(this.pageCount),
    });
    return html`<nav aria-label=${this.label || text.label}>
      <button
        type="button"
        class="button previous"
        ?disabled=${this.previousDisabled}
        @click=${() => this.select(this.page - 1)}
      >
        ${icon("back", 16)} ${text.previous}
      </button>
      <span class="page-number" role="status">${pageNumber}</span>
      <button
        type="button"
        class="button next"
        ?disabled=${this.nextDisabled}
        @click=${() => this.select(this.page + 1)}
      >
        ${text.next} ${icon("arrow", 16)}
      </button>
    </nav>`;
  }
}
