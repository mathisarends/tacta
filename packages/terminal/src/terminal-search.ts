import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { terminalText } from "./messages/index.js";

export type FindRequest = { term: string; previous: boolean; incremental: boolean };
export type FindResults = { index: number; count: number };

export class TerminalSearch extends LitElement {
  @property({ attribute: false }) results: FindResults | null = null;
  @query("input", true) private input!: HTMLInputElement;

  private get resultLabel(): string {
    if (!this.results || !this.input?.value) {
      return "";
    }
    if (this.results.count === 0) {
      return terminalText.noResults;
    }
    if (this.results.index < 0) {
      return terminalText.resultCount({ count: this.results.count });
    }
    return terminalText.result({ index: this.results.index + 1, count: this.results.count });
  }

  async show(term: string): Promise<void> {
    await this.updateComplete;
    if (term) {
      this.input.value = term;
      this.find(false, true);
    }
    this.input.focus();
    this.input.select();
  }

  private find(previous: boolean, incremental = false): void {
    const detail: FindRequest = { term: this.input.value, previous, incremental };
    this.dispatchEvent(new CustomEvent("find", { detail, bubbles: true, composed: true }));
  }

  private close(): void {
    this.dispatchEvent(new CustomEvent("close-find", { bubbles: true, composed: true }));
  }

  private keydown(event: KeyboardEvent): void {
    if (event.key === "Enter") {
      event.preventDefault();
      this.find(event.shiftKey);
    } else if (event.key === "Escape") {
      event.preventDefault();
      this.close();
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    .search {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px;
      border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-surface, #252627);
      box-shadow: var(
        --tacta-shadow-control,
        0 3px 12px color-mix(in srgb, var(--tacta-color-background) 40%, transparent)
      );
    }
    .field {
      display: flex;
      flex: 1;
      align-items: center;
      gap: 7px;
      min-width: 0;
      padding: 0 6px;
      color: var(--tacta-color-muted, #a3a3a5);
    }
    input {
      flex: 1;
      min-width: 0;
      padding: 4px 0;
      border: 0;
      background: none;
      color: var(--tacta-color-text, #e6e6e6);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    }
    input:focus-visible {
      outline: none;
      box-shadow: none;
    }
    .results {
      flex-shrink: 0;
      min-width: 0;
      padding: 0 6px;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .icon-button {
      width: 28px;
      height: 28px;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<div class="search" role="search">
      <label class="field">
        ${icon("search", 13)}
        <input
          type="text"
          aria-label=${terminalText.search}
          placeholder=${terminalText.search}
          spellcheck="false"
          autocomplete="off"
          @input=${() => this.find(false, true)}
          @keydown=${this.keydown}
        />
      </label>
      <span class="results" role="status">${this.resultLabel}</span>
      <button
        class="icon-button"
        aria-label=${terminalText.previousMatch}
        aria-keyshortcuts="Shift+Enter"
        @click=${() => this.find(true)}
      >
        ${icon("arrowUp", 14)}
      </button>
      <button
        class="icon-button"
        aria-label=${terminalText.nextMatch}
        aria-keyshortcuts="Enter"
        @click=${() => this.find(false)}
      >
        ${icon("arrowDown", 14)}
      </button>
      <button
        class="icon-button"
        aria-label=${terminalText.closeSearch}
        aria-keyshortcuts="Escape"
        @click=${this.close}
      >
        ${icon("close", 14)}
      </button>
    </div>`;
  }
}
