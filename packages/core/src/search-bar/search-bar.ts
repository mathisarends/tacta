import { TactaElement as LitElement } from "@tacta/core/element";
import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { icon } from "../icons.js";
import { tooltip } from "../tooltip.js";
import { opensInPlace } from "../link-click.js";
import { searchBarStyles } from "./search-bar.styles.js";
import type { SearchConversation, SearchFilter, SearchItem, SearchRequest } from "./types.js";
import { searchText } from "./messages/index.js";
import { uiText } from "../messages/index.js";
import { containFocus } from "../focus-containment.js";
import "./search-filters.js";

export class SearchBar extends LitElement {
  @property({ attribute: false }) conversations: SearchConversation[] = [];
  @property({ attribute: false }) actions: SearchItem[] = [];
  @property({ attribute: false }) items: SearchItem[] = [];
  @property({ type: Boolean }) loading = false;
  @property({ type: Boolean }) failed = false;
  @property({ type: Boolean }) hasMore = false;
  @property() current = "";
  @state() private query = "";
  @state() private filter: SearchFilter = "all";
  @state() private selection = "";
  private returnFocus?: HTMLElement;

  override connectedCallback(): void {
    super.connectedCallback();
    let active = document.activeElement;
    while (active?.shadowRoot?.activeElement) {
      active = active.shadowRoot.activeElement;
    }
    this.returnFocus = active instanceof HTMLElement ? active : undefined;
    void this.updateComplete.then(() => {
      if (!this.isConnected) {
        return;
      }
      const dialog = this.renderRoot.querySelector("dialog");
      if (!dialog?.open) {
        dialog?.showModal();
      }
      this.renderRoot.querySelector("input")?.focus();
    });
  }

  override disconnectedCallback(): void {
    this.renderRoot.querySelector("dialog")?.close();
    if (this.returnFocus?.isConnected) {
      this.returnFocus.focus();
    }
    super.disconnectedCallback();
  }

  private get results(): SearchItem[] {
    const remoteIds = new Set(
      this.items.filter((item) => item.group === "conversations").map((item) => item.id),
    );
    const conversations: SearchItem[] = this.conversations
      .filter((item) => !remoteIds.has(item.id))
      .map((item) => ({
        label: item.title,
        action: "conversation",
        href: item.href,
        group: "conversations" as const,
        id: item.id,
      }));
    const term = this.query.trim().toLocaleLowerCase();
    const local = [...this.actions, ...conversations].filter((item) =>
      `${item.label} ${item.description ?? ""} ${item.keywords ?? ""}`
        .toLocaleLowerCase()
        .includes(term),
    );
    return [...local, ...this.items]
      .filter((item) => this.filter === "all" || item.group === this.filter)
      .sort((left, right) => this.groupOrder(left) - this.groupOrder(right));
  }

  private get selected(): number {
    return Math.max(
      this.results.findIndex((item) => this.resultKey(item) === this.selection),
      0,
    );
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("current") && !this.query) {
      this.select(
        Math.max(
          this.results.findIndex((item) => item.href === this.current),
          0,
        ),
      );
    }
  }

  protected override firstUpdated(): void {
    this.renderRoot.querySelector("dialog")?.showModal();
    this.renderRoot.querySelector("input")?.focus();
    this.renderRoot.querySelector(".item.selected")?.scrollIntoView({ block: "nearest" });
    this.search();
  }

  protected override updated(): void {
    this.renderRoot.querySelector(".item.selected")?.scrollIntoView({ block: "nearest" });
  }

  private groupOrder(item: SearchItem): number {
    return ["actions", "conversations", "files"].indexOf(item.group);
  }

  private resultKey(item: SearchItem): string {
    if (item.key) {
      return JSON.stringify([item.group, item.key]);
    }
    const filename = item.group === "files" ? item.label : undefined;
    return JSON.stringify([item.group, item.action, item.id, item.href, filename]);
  }

  private select(index: number): void {
    const item = this.results[index];
    this.selection = item ? this.resultKey(item) : "";
  }

  private search(): void {
    this.dispatchEvent(
      new CustomEvent<SearchRequest>("search-change", {
        detail: { query: this.query, filter: this.filter },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private changeFilter(event: CustomEvent<SearchFilter>): void {
    this.filter = event.detail;
    this.selection = "";
    this.search();
  }

  private choose(item: SearchItem): void {
    this.dispatchEvent(
      new CustomEvent<SearchItem>("search-action", { detail: item, bubbles: true, composed: true }),
    );
  }

  private close(): void {
    this.dispatchEvent(new CustomEvent("close-search", { bubbles: true, composed: true }));
  }

  private onInput(event: InputEvent): void {
    this.query = (event.target as HTMLInputElement).value;
    this.selection = "";
    this.search();
  }

  private onResultClick(event: MouseEvent, item: SearchItem): void {
    if (!opensInPlace(event)) {
      return;
    }
    event.preventDefault();
    this.choose(item);
  }

  private onResultPointer(event: PointerEvent, index: number): void {
    if (event.pointerType !== "touch" && event.buttons === 0) {
      this.select(index);
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.isComposing) {
      return;
    }
    containFocus(event, this.renderRoot as ShadowRoot);
    if (event.key === "Escape") {
      event.stopPropagation();
      this.close();
      return;
    }
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const count = this.results.length;
      if (count) {
        this.select((this.selected + (event.key === "ArrowDown" ? 1 : -1) + count) % count);
      }
    }
    if (event.key === "Enter" && this.results[this.selected]) {
      event.preventDefault();
      this.choose(this.results[this.selected]!);
    }
  }

  private groupTitle(group: SearchItem["group"]): string {
    return searchText[group];
  }

  static override styles = searchBarStyles;

  private renderGroupTitle(
    item: SearchItem,
    previous?: SearchItem,
  ): TemplateResult<1> | typeof nothing {
    if (item.group === previous?.group) {
      return nothing;
    }
    return html`<p class="group-title">${this.groupTitle(item.group)}</p>`;
  }

  private renderShortcut(item: SearchItem): TemplateResult<1> | typeof nothing {
    if (!item.hint) {
      return nothing;
    }
    return html`<span class="shortcut"
      >${item.hint.split("+").map((key) => html`<kbd>${key}</kbd>`)}</span
    >`;
  }

  private renderResult(
    item: SearchItem,
    index: number,
    selected: boolean,
    previous?: SearchItem,
  ): TemplateResult<1> {
    const content = html`<span class="item-icon">${icon(item.icon ?? "message", 17)}</span>
      <span class="item-label"
        ><span>${item.label}</span>${this.renderDescription(item, index)}</span
      >
      ${this.renderShortcut(item)}`;
    if (!item.href) {
      return html`${this.renderGroupTitle(item, previous)}<button
          type="button"
          class="item ${selected ? "selected" : ""}"
          aria-label=${item.label}
          aria-describedby=${item.description ? `result-description-${index}` : nothing}
          @pointerenter=${(event: PointerEvent) => this.onResultPointer(event, index)}
          @click=${() => this.choose(item)}
        >
          ${content}
        </button>`;
    }
    return html`
      ${this.renderGroupTitle(item, previous)}
      <a
        class="item ${selected ? "selected" : ""}"
        href=${item.href}
        aria-label=${item.label}
        aria-describedby=${item.description ? `result-description-${index}` : nothing}
        @pointerenter=${(event: PointerEvent) => this.onResultPointer(event, index)}
        @click=${(event: MouseEvent) => this.onResultClick(event, item)}
      >
        ${content}
      </a>
    `;
  }

  private renderDescription(item: SearchItem, index: number): TemplateResult<1> | typeof nothing {
    if (!item.description) {
      return nothing;
    }
    return html`<span class="item-description" id=${`result-description-${index}`}
      >${item.description}</span
    >`;
  }

  private renderStatus(): TemplateResult<1> | typeof nothing {
    if (this.loading) {
      return html`<p class="search-status" role="status">${searchText.loading}</p>`;
    }
    if (this.failed) {
      return html`<div class="search-status">
        <p role="alert">${searchText.loadError}</p>
        <button class="status-button" @click=${this.search}>${searchText.retry}</button>
      </div>`;
    }
    if (this.hasMore) {
      return html`<button
        class="status-button"
        @click=${() => this.dispatchEvent(new CustomEvent("search-more", { bubbles: true, composed: true }))}
      >
        ${searchText.loadMore}
      </button>`;
    }
    return nothing;
  }

  private renderResults(): TemplateResult<1> | TemplateResult<1>[] | typeof nothing {
    const results = this.results;
    if (!results.length) {
      if (this.loading || this.failed) {
        return nothing;
      }
      return html`<div class="empty">${icon("search", 24)}<span>${searchText.empty}</span></div>`;
    }
    const selected = this.selected;
    return results.map((item, index) =>
      this.renderResult(item, index, selected === index, results[index - 1]),
    );
  }

  override render(): TemplateResult<1> {
    return html`<dialog
      class="overlay"
      aria-label=${searchText.search}
      @cancel=${(event: Event) => {
        event.preventDefault();
        this.close();
      }}
    >
      <div class="dialog" aria-label=${searchText.search} @keydown=${this.onKeyDown}>
        <div class="input-row">
          ${icon("search", 18)}<input
            placeholder=${searchText.placeholder}
            aria-label=${searchText.search}
            maxlength="80"
            autocomplete="off"
            .value=${this.query}
            @input=${this.onInput}
          />
          <button
            class="close-button"
            ${tooltip(uiText.close)}
            aria-label=${uiText.close}
            @click=${this.close}
          >
            ${icon("close", 16)}
          </button>
        </div>
        <tacta-search-filters
          .active=${this.filter}
          @filter-change=${this.changeFilter}
        ></tacta-search-filters>
        <div class="results" aria-busy=${this.loading}>
          ${this.renderResults()}${this.renderStatus()}
        </div>
        <footer>
          <span class="footer-hint"
            ><span class="shortcut"><kbd>↑</kbd><kbd>↓</kbd></span
            >${searchText.navigate}</span
          >
          <span class="footer-hint"><kbd>↵</kbd>${searchText.select}</span>
          <span class="footer-hint close-hint"
            ><kbd>${searchText.escapeKey}</kbd>${uiText.close}</span
          >
        </footer>
      </div>
    </dialog>`;
  }
}
