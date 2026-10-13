import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { chatUiText } from "../messages/index.js";
import { providerIcon, type ModelProvider } from "./model-provider.js";

export class ProviderRail extends LitElement {
  @property({ attribute: false }) providers: ModelProvider[] = [];
  @property() value = "";

  private select(id: string): void {
    this.dispatchEvent(
      new CustomEvent<string>("provider-select", { detail: id, bubbles: true, composed: true }),
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (!isRovingKey(event.key, "vertical")) {
      return;
    }
    event.preventDefault();
    const items = [...this.renderRoot.querySelectorAll<HTMLButtonElement>(".provider")];
    const current = items.indexOf(event.target as HTMLButtonElement);
    items[rovingIndex(event.key, current, items.length, "vertical")]?.focus();
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      flex: 0 0 54px;
      box-sizing: border-box;
      border-right: 1px solid var(--tacta-color-border, #ffffff0d);
      overflow-y: auto;
    }
    .providers {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 8px 5px;
    }
    .provider {
      position: relative;
      display: grid;
      place-items: center;
      flex: 0 0 42px;
      width: 42px;
      padding: 0;
      border: 0;
      border-radius: var(--tacta-radius-menu-item, 7px);
      color: var(--tacta-color-muted, #a3a3a5);
      background: transparent;
      cursor: pointer;
    }
    .provider:hover,
    .provider[aria-pressed="true"] {
      color: var(--tacta-color-text, #e6e6e6);
      background: var(--tacta-color-panel-hover, #2d2e2f);
    }
    .provider[aria-pressed="true"]::after {
      content: "";
      position: absolute;
      left: -5px;
      top: 11px;
      bottom: 11px;
      width: 3px;
      border-radius: 0 var(--tacta-radius-indicator, 2px) var(--tacta-radius-indicator, 2px) 0;
      background: var(--tacta-color-accent, #ffffff);
    }
    .all {
      margin-bottom: 7px;
    }
  `;

  private renderProvider(provider: ModelProvider): TemplateResult<1> {
    return html`<button
      part="provider"
      class="provider"
      type="button"
      aria-pressed=${this.value === provider.id}
      aria-label=${provider.label}
      ${tooltip(provider.label)}
      @click=${() => this.select(provider.id)}
    >
      ${providerIcon(provider.id, 24)}
    </button>`;
  }

  override render(): TemplateResult<1> {
    const text = chatUiText.composer;
    return html`<div
      part="providers"
      class="providers"
      role="group"
      aria-label=${text.providers}
      @keydown=${this.onKeyDown}
    >
      <button
        part="provider"
        class="provider all"
        type="button"
        aria-pressed=${!this.value}
        aria-label=${text.allProviders}
        ${tooltip(text.allProviders)}
        @click=${() => this.select("")}
      >
        ${icon("layers", 22)}
      </button>
      ${repeat(
        this.providers,
        (provider) => provider.id,
        (provider) => this.renderProvider(provider),
      )}
    </div>`;
  }
}
