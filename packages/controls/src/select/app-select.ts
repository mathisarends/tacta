import { TactaElement as LitElement } from "@tacta/core/element";
import { html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { appSelectStyles } from "./app-select.styles.js";

export type SelectOption = { value: string; label: string };

export class AppSelect extends LitElement {
  @property({ attribute: false }) options: SelectOption[] = [];
  @property() value = "";
  @property() label = "";
  @property({ reflect: true }) placement: "top" | "bottom" = "top";
  @property({ type: Boolean }) disabled = false;
  @state() private open = false;
  @state() private activeIndex = 0;
  private search = "";
  private lastSearchAt = 0;

  private readonly onOutsidePointer = (event: PointerEvent): void => {
    if (!event.composedPath().includes(this)) {
      this.open = false;
    }
  };

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("pointerdown", this.onOutsidePointer);
  }

  override disconnectedCallback(): void {
    document.removeEventListener("pointerdown", this.onOutsidePointer);
    super.disconnectedCallback();
  }

  protected override updated(): void {
    if (this.open && this.disabled) {
      this.open = false;
    }
    if (this.open) {
      const menu = this.renderRoot.querySelector<HTMLElement>(".menu");
      const option = this.renderRoot.querySelector<HTMLElement>(`#option-${this.activeIndex}`);
      if (menu && option) {
        if (option.offsetTop < menu.scrollTop) {
          menu.scrollTop = option.offsetTop;
        } else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight) {
          menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
        }
      }
    }
  }

  private show(): void {
    if (this.disabled || !this.options.length) {
      return;
    }
    this.activeIndex = Math.max(
      0,
      this.options.findIndex((option) => option.value === this.value),
    );
    this.open = true;
  }

  private toggle(): void {
    if (this.open) {
      this.open = false;
      return;
    }
    this.show();
  }

  private choose(index: number): void {
    const option = this.options[index];
    if (!option || this.disabled) {
      return;
    }
    this.value = option.value;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent<string>("value-change", {
        detail: option.value,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.ctrlKey || event.metaKey || this.disabled || !this.options.length) {
      return;
    }
    if (event.key === "Tab") {
      this.open = false;
      return;
    }
    if (event.key === "Escape") {
      if (this.open) {
        event.stopPropagation();
        event.preventDefault();
        this.open = false;
      }
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (this.open) {
        this.choose(this.activeIndex);
      } else {
        this.show();
      }
      return;
    }
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const wasOpen = this.open;
      if (!wasOpen) {
        this.show();
      }
      if (event.key === "Home") {
        this.activeIndex = 0;
      } else if (event.key === "End") {
        this.activeIndex = this.options.length - 1;
      } else if (wasOpen) {
        this.activeIndex = Math.max(
          0,
          Math.min(
            this.options.length - 1,
            this.activeIndex + (event.key === "ArrowDown" ? 1 : -1),
          ),
        );
      }
      return;
    }
    if (event.key.length === 1 && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      this.search =
        (now - this.lastSearchAt < 700 ? this.search : "") + event.key.toLocaleLowerCase();
      this.lastSearchAt = now;
      if (!this.open) {
        this.show();
      }
      const index = this.options.findIndex((option) =>
        option.label.toLocaleLowerCase().startsWith(this.search),
      );
      if (index >= 0) {
        this.activeIndex = index;
      }
    }
  }

  static override styles = appSelectStyles;

  private renderOption(option: SelectOption, index: number): TemplateResult<1> {
    return html`<div
      id="option-${index}"
      class="option ${index === this.activeIndex ? "active" : ""}"
      role="option"
      aria-selected=${option.value === this.value}
      @pointerdown=${(event: PointerEvent) => event.preventDefault()}
      @pointermove=${() => (this.activeIndex = index)}
      @click=${() => this.choose(index)}
    >
      <span>${option.label}</span
      ><span class="check">${option.value === this.value ? icon("check", 15) : nothing}</span>
    </div>`;
  }

  private renderMenu(): TemplateResult<1> | typeof nothing {
    if (!this.open) {
      return nothing;
    }
    return html`<div class="menu" id="options" role="listbox" aria-label=${this.label}>
      ${this.options.map((option, index) => this.renderOption(option, index))}
    </div>`;
  }

  override render(): TemplateResult<1> {
    const selected = this.options.find((option) => option.value === this.value);
    return html`<button
        class="trigger"
        type="button"
        role="combobox"
        aria-label=${this.label}
        aria-haspopup="listbox"
        aria-expanded=${this.open}
        aria-controls="options"
        aria-activedescendant=${this.open ? `option-${this.activeIndex}` : nothing}
        ?disabled=${this.disabled || !this.options.length}
        @click=${this.toggle}
        @keydown=${this.onKeyDown}
        @blur=${() => (this.open = false)}
      >
        <span class="label">${selected?.label ?? this.label}</span
        ><span class="chevron">${icon("chevronDown", 14)}</span>
      </button>
      ${this.renderMenu()}`;
  }
}
