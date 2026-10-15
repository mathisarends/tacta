import { TactaElement as LitElement } from "@tacta/core/element";
import { html, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { imageColorPickerStyles } from "./image-color-picker.styles.js";
import { positionMenu } from "@tacta/core/menu-position";
import { tooltip } from "@tacta/core/tooltip";
import { icon } from "@tacta/core/icons";
import { annotationColors } from "./annotation-colors.js";
import { imageEditorText as text } from "./messages/index.js";

export class ImageColorPicker extends LitElement {
  @property() color = "";
  @property({ type: Boolean }) disabled = false;
  @state() private open = false;
  @state() private draft = "";
  private readonly reposition = (): void => {
    if (this.open && this.popup && this.trigger) {
      positionMenu(this.popup, this.trigger);
    }
  };

  private get trigger(): HTMLButtonElement | null {
    return this.renderRoot.querySelector(".trigger");
  }

  private get popup(): HTMLElement | null {
    return this.renderRoot.querySelector("[popover]");
  }

  private get valid(): boolean {
    return /^#[0-9a-f]{6}$/i.test(this.draft);
  }

  private get applyDisabled(): boolean {
    return this.disabled || !this.valid;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.reposition);
    window.addEventListener("scroll", this.reposition, true);
  }

  override disconnectedCallback(): void {
    this.close();
    window.removeEventListener("resize", this.reposition);
    window.removeEventListener("scroll", this.reposition, true);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("color")) {
      this.draft = this.color;
    }
    if (this.disabled) {
      this.close();
    }
  }

  private toggle(): void {
    if (this.disabled) {
      return;
    }
    if (this.open) {
      this.close();
      return;
    }
    this.popup?.showPopover();
    this.open = true;
    this.reposition();
  }

  private close(): void {
    if (this.popup?.matches(":popover-open")) {
      this.popup.hidePopover();
    }
    this.open = false;
  }

  private select(color: string): void {
    if (this.disabled) {
      return;
    }
    this.color = color;
    this.draft = color;
    this.dispatchEvent(
      new CustomEvent<string>("color-change", {
        detail: color,
        bubbles: true,
        composed: true,
      }),
    );
    this.close();
    this.trigger?.focus();
  }

  private apply(event: SubmitEvent): void {
    event.preventDefault();
    if (this.valid) {
      this.select(this.draft.toLowerCase());
    }
  }

  private onToggle(event: ToggleEvent): void {
    this.open = event.newState === "open";
  }

  static override styles = imageColorPickerStyles;

  private renderSwatch(name: (typeof annotationColors)[number]): TemplateResult<1> {
    const color = getComputedStyle(this)
      .getPropertyValue(`--tacta-image-editor-color-${name}`)
      .trim();
    return html`<button
      class="swatch"
      type="button"
      aria-label=${text.colorNames[name]}
      aria-pressed=${color.toLowerCase() === this.color.toLowerCase()}
      style="--tacta-swatch:${color}"
      ${tooltip(text.colorNames[name])}
      @click=${() => this.select(color)}
    ></button>`;
  }

  override render(): TemplateResult<1> {
    return html`<button
        class="icon-button trigger"
        type="button"
        aria-label=${text.color}
        aria-expanded=${this.open}
        aria-controls="color-palette"
        ${tooltip(text.color)}
        ?disabled=${this.disabled}
        @click=${this.toggle}
      >
        <span class="chip" style="--tacta-annotation-color:${this.color}"></span>
      </button>
      <div
        id="color-palette"
        popover="auto"
        role="dialog"
        aria-label=${text.colorPalette}
        @toggle=${this.onToggle}
      >
        <div class="heading">
          <span class="chip" style="--tacta-annotation-color:${this.color}"></span
          >${text.colorPalette}
        </div>
        <div class="swatches" role="group" aria-label=${text.colorPalette}>
          ${annotationColors.map((name) => this.renderSwatch(name))}
        </div>
        <form @submit=${this.apply}>
          <label
            >${text.customColor}<input
              .value=${live(this.draft)}
              maxlength="7"
              aria-invalid=${!this.valid}
              @input=${(event: Event) => (this.draft = (event.target as HTMLInputElement).value)}
          /></label>
          <button
            class="icon-button apply"
            aria-label=${text.applyColor}
            type="submit"
            ?disabled=${this.applyDisabled}
          >
            ${icon("check", 18)}
          </button>
        </form>
      </div>`;
  }
}
