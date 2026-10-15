import { TactaElement as LitElement } from "@tacta/core/element";
import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { opensInPlace } from "@tacta/core/link-click";
import { searchBarStyles } from "./search-bar.styles.js";
import type { SearchConversation, SearchItem } from "./types.js";
import { searchText } from "./messages/index.js";
import { uiText } from "@tacta/core/messages";

export class SearchBar extends LitElement {
  @property({ attribute: false }) conversations: SearchConversation[] = [];
  @property({ attribute: false }) actions: SearchItem[] = [];
  @property() current = "";
  @state() private query = "";
  @state() private selected = 0;

  private get results(): SearchItem[] {
    const conversations = this.conversations.map((item) => ({
      label: item.title,
      action: "conversation",
      href: item.href,
      group: "conversations" as const,
      id: item.id,
    }));
    const term = this.query.trim().toLocaleLowerCase();
    return [...this.actions, ...conversations].filter((item) =>
      item.label.toLocaleLowerCase().includes(term),
    );
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("current") && !this.query) {
      this.selected = Math.max(
        this.results.findIndex((item) => item.href === this.current),
        0,
      );
    }
  }

  protected override firstUpdated(): void {
    this.renderRoot.querySelector("input")?.focus();
    this.renderRoot.querySelector(".item.selected")?.scrollIntoView({ block: "nearest" });
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
    this.selected = 0;
  }

  private onResultClick(event: MouseEvent, item: SearchItem): void {
    if (!opensInPlace(event)) {
      return;
    }
    event.preventDefault();
    this.choose(item);
  }

  private onKeyDown(event: KeyboardEvent): void {
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
        this.selected = (this.selected + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
      }
    }
    if (event.key === "Enter" && this.results[this.selected]) {
      this.choose(this.results[this.selected]!);
    }
  }

  private groupTitle(group: SearchItem["group"]): string {
    if (group === "actions") {
      return searchText.actions;
    }
    return searchText.chats;
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

  private renderResult(item: SearchItem, index: number, previous?: SearchItem): TemplateResult<1> {
    return html`
      ${this.renderGroupTitle(item, previous)}
      <a
        class="item ${this.selected === index ? "selected" : ""}"
        href=${item.href}
        @mouseenter=${() => (this.selected = index)}
        @click=${(event: MouseEvent) => this.onResultClick(event, item)}
      >
        <span class="item-icon"> ${icon(item.icon ?? "message", 17)} </span>
        <span class="item-label">${item.label}</span>
        ${this.renderShortcut(item)}
      </a>
    `;
  }

  private renderResults(): TemplateResult<1> | TemplateResult<1>[] {
    const results = this.results;
    if (!results.length) {
      return html`<div class="empty">${icon("search", 24)}<span>${searchText.empty}</span></div>`;
    }
    return results.map((item, index) => this.renderResult(item, index, results[index - 1]));
  }

  override render(): TemplateResult<1> {
    return html`<div
      class="dialog"
      role="dialog"
      aria-modal="true"
      aria-label=${searchText.search}
      @keydown=${this.onKeyDown}
    >
      <div class="input-row">
        ${icon("search", 18)}<input
          placeholder=${searchText.placeholder}
          aria-label=${searchText.search}
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
      <div class="results">${this.renderResults()}</div>
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
    </div>`;
  }
}
