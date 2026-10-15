import { html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import { icon } from "@tacta/core/icons";
import { panelText } from "./messages/index.js";
import { surfacePickerStyles } from "./surface-picker.styles.js";
import { surfaceForKey, surfaceIcons, surfaceKey, surfaces, type Surface } from "./surfaces.js";

export type PickerClose = { restoreFocus: boolean };

export class SurfacePicker extends LitElement {
  @property({ type: Boolean, reflect: true }) menu = false;
  @property({ attribute: false }) opened: string[] = [];

  private get options(): HTMLButtonElement[] {
    return [...this.renderRoot.querySelectorAll<HTMLButtonElement>(".surface-option")];
  }

  constructor() {
    super();
    this.addEventListener("keydown", (event) => this.onKeyDown(event));
  }

  focusRegion(): void {
    this.renderRoot.querySelector<HTMLElement>(".picker")?.focus();
  }

  focusFirst(): void {
    this.options[0]?.focus();
  }

  private open(surface: Surface): void {
    this.dispatchEvent(
      new CustomEvent<Surface>("surface-open", {
        detail: surface,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private close(restoreFocus: boolean): void {
    this.dispatchEvent(
      new CustomEvent<PickerClose>("picker-close", {
        detail: { restoreFocus },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Escape") {
      this.close(true);
      event.stopPropagation();
      return;
    }
    if (isRovingKey(event.key, "vertical")) {
      event.preventDefault();
      const options = this.options;
      const current = options.indexOf(this.shadowRoot?.activeElement as HTMLButtonElement);
      options[rovingIndex(event.key, current, options.length, "vertical")]?.focus();
      return;
    }
    if (event.key === "Tab") {
      this.close(false);
    }
    if (event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    const surface = surfaceForKey(event.key);
    if (surface) {
      event.preventDefault();
      this.open(surface);
    }
  }

  static override styles = surfacePickerStyles;

  private renderCheck(surface: Surface): TemplateResult<2> | typeof nothing {
    if (!this.opened.includes(surface)) {
      return nothing;
    }
    return icon("check", 13);
  }

  private renderOption(surface: Surface): TemplateResult<1> {
    return html`<button
      part="surface-option"
      class="surface-option menu-option"
      role=${this.menu ? "menuitem" : "button"}
      tabindex=${this.menu ? "-1" : "0"}
      @click=${() => this.open(surface)}
    >
      ${icon(surfaceIcons[surface], 16)}<span>${panelText.surfaces[surface]}</span>
      ${this.renderCheck(surface)}
      <kbd>${surfaceKey(surface)}</kbd>
    </button>`;
  }

  override render(): TemplateResult<1> {
    const options = surfaces.map((surface) => this.renderOption(surface));
    if (this.menu) {
      return html`${options}`;
    }
    return html`<div
      part="picker"
      class="picker"
      tabindex="-1"
      role="region"
      aria-labelledby="surface-picker-title"
    >
      <div part="picker-menu" class="picker-menu">
        <h3 id="surface-picker-title">${panelText.openSurface}</h3>
        ${options}
      </div>
    </div>`;
  }
}
