import { html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import { icon } from "@tacta/core/icons";
import { panelText } from "./messages/index.js";
import { surfacePickerStyles } from "./surface-picker.styles.js";
import {
  surfaceForKey,
  surfaceIcons,
  surfaceKey,
  defaultSurfaceDefinitions,
  type Surface,
  type SurfaceDefinition,
} from "./surfaces.js";

export type PickerClose = { restoreFocus: boolean };

export class SurfacePicker extends LitElement {
  @property({ type: Boolean, reflect: true }) menu = false;
  @property({ attribute: false }) opened: string[] = [];
  @property({ attribute: false }) surfaces: readonly SurfaceDefinition[] =
    defaultSurfaceDefinitions;

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
    const surface = surfaceForKey(event.key, this.surfaces);
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

  private renderOption(definition: SurfaceDefinition): TemplateResult<1> {
    const surface = definition.id;
    const labels = panelText.surfaces as Record<string, string>;
    return html`<button
      part="surface-option"
      class="surface-option menu-option"
      role=${this.menu ? "menuitem" : "button"}
      tabindex=${this.menu ? "-1" : "0"}
      @click=${() => this.open(surface)}
    >
      ${icon(definition.icon ?? surfaceIcons[surface] ?? "file", 16)}<span
        >${definition.label ?? labels[surface] ?? surface}</span
      >
      ${this.renderCheck(surface)}
      <kbd>${surfaceKey(surface, this.surfaces)}</kbd>
    </button>`;
  }

  override render(): TemplateResult<1> {
    const options = this.surfaces.map((surface) => this.renderOption(surface));
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
