import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { SearchFilter } from "./types.js";
import { searchText } from "./messages/index.js";

const filters: readonly SearchFilter[] = ["all", "conversations", "files", "actions"];

export class SearchFilters extends LitElement {
  @property() active: SearchFilter = "all";

  private select(filter: SearchFilter): void {
    this.active = filter;
    this.dispatchEvent(
      new CustomEvent<SearchFilter>("filter-change", {
        detail: filter,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async navigate(event: KeyboardEvent, index: number): Promise<void> {
    if (!isRovingKey(event.key, "horizontal")) {
      return;
    }
    event.preventDefault();
    const next = rovingIndex(event.key, index, filters.length, "horizontal");
    this.select(filters[next]!);
    await this.updateComplete;
    if (this.isConnected) {
      this.renderRoot.querySelectorAll<HTMLButtonElement>("button")[next]?.focus();
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
    }
    .filters {
      display: flex;
      gap: 4px;
      overflow-x: auto;
      padding: 0 16px 12px;
    }
    button {
      flex: 0 0 auto;
      min-height: var(--tacta-touch-target, 36px);
      padding: 6px 12px;
      border: 0;
      border-radius: var(--tacta-radius-menu-item, 7px);
      color: var(--tacta-color-muted, #667085);
      background: transparent;
      font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
      font-weight: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500));
    }
    button:hover,
    button[aria-pressed="true"] {
      color: var(--tacta-color-text, #202124);
      background: var(--tacta-color-accent-soft, #ffffff14);
    }
  `;

  override render(): TemplateResult<1> {
    return html`<div class="filters" role="group" aria-label=${searchText.filters}>
      ${filters.map(
        (filter, index) =>
          html`<button
            type="button"
            aria-pressed=${this.active === filter}
            tabindex=${this.active === filter ? 0 : -1}
            @click=${() => this.select(filter)}
            @keydown=${(event: KeyboardEvent) => this.navigate(event, index)}
          >
            ${searchText[filter]}
          </button>`,
      )}
    </div>`;
  }
}
