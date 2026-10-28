import { TactaElement as LitElement } from "@tacta/core/element";
import { html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import { pillTabsStyles } from "./pill-tabs.styles.js";

export interface PillTab {
  id: string;
  label: string;
}

export class PillTabs extends LitElement {
  @property({ attribute: false }) tabs: readonly PillTab[] = [];
  @property() label = "";
  @property() active = "";
  @property({ reflect: true }) variant: "pill" | "underline" = "pill";
  @property({ type: Boolean, reflect: true }) scrollable = false;
  @property({ type: Boolean, reflect: true }) compact = false;

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
    this.select(this.tabs[next]!.id);
    await this.updateComplete;
    if (!this.isConnected) {
      return;
    }
    this.renderRoot.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus();
  }

  static override styles = pillTabsStyles;

  override render(): TemplateResult<1> {
    return html`
      <div class="navigation" part="navigation">
        <label class="section-picker">
          <span>${this.label}</span>
          <select
            aria-label=${this.label}
            @change=${(event: Event) => this.select((event.target as HTMLSelectElement).value)}
          >
            ${this.tabs.map((tab) => html`<option value=${tab.id} ?selected=${this.selected === tab.id}>${tab.label}</option>`)}
          </select>
        </label>
        <div class="tabs" role="tablist" aria-label=${this.label}>
          ${this.tabs.map(
            (tab, index) => html`
              <button
                type="button"
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
      <div class="panels">
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
