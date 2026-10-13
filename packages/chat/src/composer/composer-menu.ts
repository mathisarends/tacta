import { html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import { positionMenu } from "@tacta/core/menu-position";
import { icon, type IconName } from "@tacta/core/icons";
import { chatUiText } from "../messages/index.js";
import { composerMenuStyles } from "./composer-menu.styles.js";

export type ComposerMenuGroup = {
  key: string;
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
    description?: string;
    badge?: string;
    icon?: IconName;
  }[];
};

export type ComposerMenuAction = { id: string; label: string; description?: string };

export type ComposerSettingChange = { key: string; value: string };

export class ComposerMenu extends LitElement {
  @property() label = "";
  @property() heading = "";
  @property() symbol: IconName | undefined;
  @property({ type: Boolean }) disabled = false;
  @property({ attribute: false }) groups: ComposerMenuGroup[] = [];
  @property({ attribute: false }) actions: ComposerMenuAction[] = [];

  @state() private open = false;

  private readonly close = (): void => {
    this.menu?.hidePopover();
  };

  private get menu(): HTMLElement | null {
    return this.renderRoot.querySelector(".menu");
  }

  private get trigger(): HTMLButtonElement | null {
    return this.renderRoot.querySelector(".trigger");
  }

  private get accessibleLabel(): string {
    return chatUiText.composer.menuLabel({ heading: this.heading, label: this.label });
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.close);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.close);
    super.disconnectedCallback();
  }

  protected override updated(): void {
    if (this.disabled) {
      this.close();
    }
  }

  private positionMenu(): void {
    const menu = this.menu;
    const trigger = this.trigger;
    if (!menu || !trigger) {
      return;
    }
    positionMenu(menu, trigger);
    if (menu.contains(this.shadowRoot?.activeElement ?? null)) {
      return;
    }
    const selected = menu.querySelector<HTMLButtonElement>('[aria-checked="true"]');
    const first = menu.querySelector<HTMLButtonElement>(".option");
    (selected ?? first)?.focus();
  }

  private choose(key: string, value: string): void {
    if (this.disabled) {
      return;
    }
    this.close();
    this.trigger?.focus();
    this.dispatchEvent(
      new CustomEvent<ComposerSettingChange>("setting-change", {
        detail: { key, value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private runAction(id: string): void {
    if (this.disabled) {
      return;
    }
    this.close();
    this.trigger?.focus();
    this.dispatchEvent(
      new CustomEvent<string>("menu-action", {
        detail: id,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onTriggerKeyDown(event: KeyboardEvent): void {
    if (this.disabled || (event.key !== "ArrowDown" && event.key !== "ArrowUp")) {
      return;
    }
    event.preventDefault();
    if (!this.open) {
      this.trigger?.click();
      this.positionMenu();
    }
  }

  private onBeforeToggle(event: ToggleEvent): void {
    this.open = event.newState === "open";
  }

  private onToggle(event: ToggleEvent): void {
    if (event.newState === "open") {
      this.positionMenu();
    }
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.close();
      this.trigger?.focus();
      return;
    }
    if (event.key === "Tab") {
      this.close();
      this.trigger?.focus();
      return;
    }
    if (!isRovingKey(event.key, "vertical")) {
      return;
    }
    const items = [...this.renderRoot.querySelectorAll<HTMLButtonElement>(".option")];
    if (!items.length) {
      return;
    }
    event.preventDefault();
    const current = items.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
    const next = rovingIndex(event.key, current, items.length, "vertical");
    items[next]?.focus();
  }

  static override styles = composerMenuStyles;

  private renderOption(
    group: ComposerMenuGroup,
    option: ComposerMenuGroup["options"][number],
  ): TemplateResult<1> {
    return html`<button
      part="option"
      class="option menu-option"
      type="button"
      role="menuitemradio"
      tabindex="-1"
      aria-checked=${group.value === option.value}
      @click=${() => this.choose(group.key, option.value)}
    >
      <span class="copy">
        <span class="name">
          ${option.icon ? icon(option.icon, 15) : nothing}${option.label}
          ${option.badge ? html`<span class="badge">${option.badge}</span>` : nothing}
        </span>
        ${option.description ? html`<span class="description">${option.description}</span>` : nothing}
      </span>
      <span class="check">${group.value === option.value ? icon("check", 14) : nothing}</span>
    </button>`;
  }

  private renderGroup(group: ComposerMenuGroup, index: number): TemplateResult<1> {
    return html`<div part="group" class="group" role="group" aria-labelledby=${`heading-${index}`}>
      <div part="heading" class="heading" id=${`heading-${index}`}>${group.label}</div>
      ${group.options.map((option) => this.renderOption(group, option))}
    </div>`;
  }

  private renderAction(action: ComposerMenuAction): TemplateResult<1> {
    return html`<div part="group" class="group">
      <button
        part="option"
        class="option menu-option"
        type="button"
        role="menuitem"
        tabindex="-1"
        @click=${() => this.runAction(action.id)}
      >
        <span class="copy">
          <span class="name">${action.label}</span>
          ${action.description ? html`<span class="description">${action.description}</span>` : nothing}
        </span>
      </button>
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`<button
        part="trigger"
        class="trigger"
        type="button"
        ?disabled=${this.disabled}
        aria-label=${this.accessibleLabel}
        aria-haspopup="menu"
        aria-expanded=${this.open}
        aria-controls="menu"
        popovertarget="menu"
        @keydown=${this.onTriggerKeyDown}
      >
        ${this.symbol ? icon(this.symbol, 16) : nothing}<span>${this.label}</span>${icon("chevronDown", 12)}
      </button>
      <div
        id="menu"
        class="menu"
        popover="auto"
        role="menu"
        aria-label=${this.heading}
        @beforetoggle=${this.onBeforeToggle}
        @toggle=${this.onToggle}
        @keydown=${this.onKeyDown}
      >
        ${this.groups.map((group, index) => this.renderGroup(group, index))}
        ${this.actions.map((action) => this.renderAction(action))}
      </div>`;
  }
}
