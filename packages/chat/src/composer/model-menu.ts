import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { ChatModelOption } from "./options.js";
import { icon } from "@tacta/core/icons";
import { positionMenu } from "@tacta/core/menu-position";
import { chatUiText } from "../messages/index.js";
import { modelProvider, providerIcon, type ModelProvider } from "./model-provider.js";
import { modelMenuStyles } from "./model-menu.styles.js";
import "./provider-rail.js";

const navigationKeys = ["ArrowDown", "ArrowUp", "Home", "End"];

function nextIndex(key: string, current: number, length: number): number {
  if (key === "Home") {
    return 0;
  }
  if (key === "End") {
    return length - 1;
  }
  const step = key === "ArrowDown" ? 1 : -1;
  if (current < 0) {
    return step > 0 ? 0 : length - 1;
  }
  return (current + step + length) % length;
}

export class ModelMenu extends LitElement {
  @property({ attribute: false }) providerInfo = modelProvider;
  @property({ attribute: false }) renderProviderIcon = providerIcon;
  @property({ attribute: false }) models: ChatModelOption[] = [];
  @property() value = "";
  @property({ type: Boolean }) disabled = false;
  @state() private open = false;
  @state() private provider = "";
  @state() private query = "";

  private readonly close = (): void => {
    this.menu?.hidePopover();
  };

  private get menu(): HTMLElement | null {
    return this.renderRoot.querySelector(".menu");
  }

  private get trigger(): HTMLButtonElement | null {
    return this.renderRoot.querySelector(".trigger");
  }

  private get providers(): ModelProvider[] {
    return [
      ...new Map(
        this.models.map((model) => {
          const provider = this.providerInfo(model.provider);
          return [provider.id, provider] as const;
        }),
      ).values(),
    ];
  }

  private get selected(): ChatModelOption | undefined {
    return this.models.find((model) => model.id === this.value);
  }

  private get visibleModels(): ChatModelOption[] {
    const query = this.query.trim().toLocaleLowerCase();
    return this.models.filter((model) => {
      const provider = this.providerInfo(model.provider);
      if (this.provider && provider.id !== this.provider) {
        return false;
      }
      return [model.label, model.id, provider.label, provider.name]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query);
    });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.close);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.close);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("models") && !this.providers.some((item) => item.id === this.provider)) {
      this.provider = "";
    }
  }

  protected override updated(): void {
    if (this.disabled || !this.models.length) {
      this.close();
    }
  }

  private choose(value: string): void {
    if (this.disabled) {
      return;
    }
    this.close();
    this.trigger?.focus();
    this.dispatchEvent(
      new CustomEvent("setting-change", {
        detail: { key: "model", value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private async onToggle(event: ToggleEvent): Promise<void> {
    this.open = event.newState === "open";
    if (!this.open) {
      return;
    }
    this.query = "";
    const selected = this.selected;
    this.provider = selected ? this.providerInfo(selected.provider).id : "";
    await this.updateComplete;
    if (this.menu && this.trigger && this.open) {
      positionMenu(this.menu, this.trigger);
      this.renderRoot.querySelector<HTMLInputElement>("input")?.focus();
    }
  }

  private onTriggerKeyDown(event: KeyboardEvent): void {
    if (!["ArrowDown", "ArrowUp"].includes(event.key)) {
      return;
    }
    event.preventDefault();
    if (!this.open) {
      this.trigger?.click();
    }
  }

  private onMenuFocusOut(event: FocusEvent): void {
    if (event.relatedTarget instanceof Node && !this.menu?.contains(event.relatedTarget)) {
      this.close();
    }
  }

  private onProviderSelect(event: CustomEvent<string>): void {
    event.stopPropagation();
    this.provider = event.detail;
  }

  private onSearchInput(event: InputEvent): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      this.trigger?.focus();
      return;
    }
    if (event.defaultPrevented) {
      return;
    }
    const target = event.target as HTMLElement;
    const inSearch = target.tagName === "INPUT";
    if (inSearch && !["ArrowDown", "ArrowUp"].includes(event.key)) {
      return;
    }
    if (!navigationKeys.includes(event.key)) {
      return;
    }
    event.preventDefault();
    const items = [...this.renderRoot.querySelectorAll<HTMLButtonElement>(".model")];
    if (!items.length) {
      return;
    }
    const current = items.indexOf(target as HTMLButtonElement);
    items[nextIndex(event.key, current, items.length)]?.focus();
  }

  static override styles = modelMenuStyles;

  private renderTrigger(): TemplateResult<1> {
    const selected = this.selected;
    const label = selected?.label ?? chatUiText.model;
    return html`<button
      part="trigger"
      class="trigger"
      type="button"
      ?disabled=${this.disabled || !this.models.length}
      aria-label=${chatUiText.modelLabel({ model: label })}
      aria-haspopup="dialog"
      aria-expanded=${this.open}
      aria-controls="tacta-model-menu"
      popovertarget="tacta-model-menu"
      @keydown=${this.onTriggerKeyDown}
    >
      ${selected ? this.renderProviderIcon(selected.provider, 18) : icon("bot", 18)}
      <span>${label}</span>${icon("chevronDown", 12)}
    </button>`;
  }

  private renderModel(model: ChatModelOption): TemplateResult<1> {
    const chosen = this.value === model.id;
    return html`<button
      part="model"
      class="model menu-option"
      type="button"
      aria-pressed=${chosen}
      @click=${() => this.choose(model.id)}
    >
      <span class="copy"
        ><span class="name">${model.label}</span>
        <span class="description"
          >${this.renderProviderIcon(model.provider, 14)}${this.providerInfo(model.provider).name}</span
        >
      </span>
      <span class="check">${chosen ? icon("check", 16) : nothing}</span>
    </button>`;
  }

  private renderModels(): TemplateResult<1> {
    const models = this.visibleModels;
    const text = chatUiText.composer;
    return html`<div part="model-list" class="model-list" role="group" aria-label=${text.models}>
      ${repeat(
        models,
        (model) => model.id,
        (model) => this.renderModel(model),
      )}
      ${models.length ? nothing : html`<p class="empty" role="status">${text.noModels}</p>`}
    </div>`;
  }

  override render(): TemplateResult<1> {
    const text = chatUiText.composer;
    return html`${this.renderTrigger()}
      <div
        id="tacta-model-menu"
        class="menu"
        popover="auto"
        role="dialog"
        aria-label=${text.models}
        @toggle=${this.onToggle}
        @keydown=${this.onKeyDown}
        @focusout=${this.onMenuFocusOut}
      >
        <tacta-provider-rail
          .providers=${this.providers}
          .value=${this.provider}
          @provider-select=${this.onProviderSelect}
        ></tacta-provider-rail>
        <div part="content" class="content">
          <label class="search">
            ${icon("search", 18)}
            <input
              type="search"
              aria-label=${text.searchModels}
              placeholder=${text.searchModels}
              .value=${this.query}
              @input=${this.onSearchInput}
            />
          </label>
          ${this.renderModels()}
        </div>
      </div>`;
  }
}
