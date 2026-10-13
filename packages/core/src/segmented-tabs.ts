import { html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { isRovingKey, rovingIndex } from "./keyboard/roving.js";
import { segmentedTabsStyles } from "./segmented-tabs.styles.js";

export interface SegmentedTab {
  id: string;
  label: string;
}

export class SegmentedTabs extends LitElement {
  @property({ attribute: false }) tabs: readonly SegmentedTab[] = [];
  @property() label = "";
  @property() active = "";
  @property({ type: Boolean, reflect: true }) scrollable = false;

  private get selected(): string {
    return this.tabs.find((tab) => tab.id === this.active)?.id ?? this.tabs[0]?.id ?? "";
  }

  private select(id: string): void {
    if (id === this.selected) {
      return;
    }
    this.active = id;
    this.dispatchEvent(
      new CustomEvent<string>("tab-change", { detail: id, bubbles: true, composed: true }),
    );
  }

  private async navigate(event: KeyboardEvent, index: number): Promise<void> {
    if (!this.tabs.length || !isRovingKey(event.key, "horizontal")) {
      return;
    }
    const next = rovingIndex(event.key, index, this.tabs.length, "horizontal");
    event.preventDefault();
    const tab = this.tabs[next];
    if (!tab) {
      return;
    }
    this.select(tab.id);
    await this.updateComplete;
    if (!this.isConnected) {
      return;
    }
    this.renderRoot.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  }

  static override styles = segmentedTabsStyles;

  override render(): TemplateResult<1> {
    return html`
      <div part="navigation" class="navigation">
        <div part="tabs" class="tabs" role="tablist" aria-label=${this.label}>
          ${this.tabs.map(
            (tab, index) => html`
              <button
                id=${`tab-${tab.id}`}
                role="tab"
                aria-controls=${`panel-${tab.id}`}
                aria-selected=${this.selected === tab.id}
                tabindex=${this.selected === tab.id ? 0 : -1}
                @click=${() => this.select(tab.id)}
                @keydown=${(event: KeyboardEvent) => this.navigate(event, index)}
              >
                ${tab.label}
              </button>
            `,
          )}
        </div>
      </div>
      <div part="panels" class="panels">
        ${this.tabs.map(
          (tab) => html`
            <div
              id=${`panel-${tab.id}`}
              role="tabpanel"
              aria-labelledby=${`tab-${tab.id}`}
              tabindex="0"
              ?hidden=${this.selected !== tab.id}
            >
              <slot name=${tab.id}></slot>
            </div>
          `,
        )}
      </div>
    `;
  }
}
