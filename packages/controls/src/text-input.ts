import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { live } from "lit/directives/live.js";
import { icon, type IconName } from "@tacta/core/icons";
import { uiText } from "@tacta/core/messages";

export type InputType = "text" | "email" | "password" | "search" | "tel" | "url";
export type Autocomplete =
  "off" | "name" | "email" | "username" | "current-password" | "new-password";

export class TextInput extends LitElement {
  @property() label = "";
  @property() name = "";
  @property() value = "";
  @property() icon?: IconName;
  @property() type: InputType = "text";
  @property() autocomplete?: Autocomplete;
  @property() placeholder = "";
  @property() pattern?: string;
  @property() patternMessage = "";
  @property() hint = "";
  @property({ type: Boolean }) required = false;
  @property({ type: Number }) minlength?: number;
  @property({ type: Number }) maxlength?: number;
  @property({ type: Boolean, attribute: "no-autocorrect" }) noAutocorrect = false;
  @state() private errorVisible = false;
  @query(".input", true) private input!: HTMLInputElement;
  protected readonly blankIsMissing: boolean = true;

  private get error(): string {
    return this.errorVisible ? this.validationMessage() : "";
  }

  private get describedBy(): string | undefined {
    if (this.error) {
      return `${this.name}-error`;
    }
    return this.hint ? `${this.name}-hint` : undefined;
  }

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  protected override updated(changed: PropertyValues<this>): void {
    const constraints = ["value", "type", "required", "minlength", "maxlength", "pattern"] as const;
    if (!constraints.some((name) => changed.has(name))) {
      return;
    }
    this.syncValidity();
    if (this.errorVisible) {
      this.errorVisible = !this.input.validity.valid;
    }
  }

  private validationMessage(): string {
    const { validity, value } = this.input;
    if (validity.valueMissing || (this.required && this.blankIsMissing && !value.trim())) {
      return uiText.validation.required;
    }
    if (validity.typeMismatch && this.type === "email") {
      return uiText.validation.email;
    }
    if (this.minlength && value.length < this.minlength) {
      return uiText.validation.tooShort({
        min: this.minlength,
        length: value.length,
      });
    }
    if (validity.patternMismatch) {
      return this.patternMessage || uiText.validation.invalid;
    }
    return validity.typeMismatch ? uiText.validation.invalid : "";
  }

  private syncValidity(): void {
    this.input.setCustomValidity("");
    this.input.setCustomValidity(this.validationMessage());
  }

  private showValidity(): void {
    this.syncValidity();
    this.errorVisible = !this.input.validity.valid;
  }

  private blurred(): void {
    if (this.input.value || this.errorVisible) {
      this.showValidity();
    }
  }

  private changed(): void {
    this.value = this.input.value;
    this.dispatchEvent(
      new CustomEvent<string>("value-change", {
        detail: this.value,
        bubbles: true,
        composed: true,
      }),
    );
    this.syncValidity();
    if (this.errorVisible) {
      this.errorVisible = !this.input.validity.valid;
    }
  }

  protected renderLabel(): TemplateResult<1> {
    return html`<label for=${this.name}>${this.label}</label>`;
  }

  protected renderInput(type: InputType = this.type): TemplateResult<1> {
    return html`<input
      class="input"
      id=${this.name}
      name=${this.name}
      type=${type}
      .value=${live(this.value)}
      autocomplete=${ifDefined(this.autocomplete)}
      autocapitalize=${ifDefined(this.noAutocorrect ? "none" : undefined)}
      spellcheck=${ifDefined(this.noAutocorrect ? "false" : undefined)}
      placeholder=${this.placeholder}
      pattern=${ifDefined(this.pattern)}
      ?required=${this.required}
      minlength=${ifDefined(this.minlength)}
      maxlength=${ifDefined(this.maxlength)}
      aria-describedby=${ifDefined(this.describedBy)}
      aria-invalid=${ifDefined(this.error ? "true" : undefined)}
      @blur=${this.blurred}
      @invalid=${this.showValidity}
      @input=${this.changed}
    />`;
  }

  protected renderTrailing(): TemplateResult<1> | typeof nothing {
    return nothing;
  }

  private renderIcon(): TemplateResult<1> | typeof nothing {
    if (!this.icon) {
      return nothing;
    }
    return html`<span class="field-icon">${icon(this.icon, 16)}</span>`;
  }

  private renderMessage(): TemplateResult<1> | typeof nothing {
    const error = this.error;
    if (error) {
      return html`<p id="${this.name}-error" class="hint error">${error}</p>`;
    }
    return this.hint ? html`<p id="${this.name}-hint" class="hint">${this.hint}</p>` : nothing;
  }

  override render(): TemplateResult<1> {
    return html`${this.renderLabel()}
      <div class="field ${this.icon ? "has-icon" : ""}">
        ${this.renderInput()}${this.renderIcon()}${this.renderTrailing()}
      </div>
      ${this.renderMessage()}`;
  }
}

export const textInputStyles = css`
  text-input,
  tacta-password-input {
    display: grid;
    gap: 8px;
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
  }
  .field {
    position: relative;
  }
  .input {
    width: 100%;
    height: var(--tacta-input-height, 48px);
    padding: 0 14px;
    border: 1px solid var(--tacta-color-border, #ffffff0d);
    border-radius: var(--tacta-radius-control, 12px);
    background: var(--tacta-color-sidebar, #1e1f20);
    color: var(--tacta-color-text, #e6e6e6);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    transition:
      border-color var(--tacta-motion-duration-control, 160ms),
      background var(--tacta-motion-duration-control, 160ms);
  }
  .has-icon .input {
    padding-left: 42px;
  }
  .field-icon {
    position: absolute;
    top: 50%;
    left: 15px;
    display: grid;
    color: var(--tacta-color-muted, #a3a3a5);
    transform: translateY(-50%);
    pointer-events: none;
    transition: color var(--tacta-motion-duration-control, 160ms);
  }
  .input:hover {
    border-color: var(--tacta-color-muted, #a3a3a5);
  }
  .input:focus {
    outline: none;
    border-color: var(--tacta-color-accent, #ffffff);
    box-shadow: 0 0 0 3px var(--tacta-color-accent-soft, #ffffff14);
    background: var(--tacta-color-surface, #252627);
  }
  .input:focus ~ .field-icon {
    color: var(--tacta-color-accent, #ffffff);
  }
  .input::placeholder {
    color: var(--tacta-color-muted, #a3a3a5);
    opacity: 0.7;
  }
  .input:user-invalid,
  .input[aria-invalid="true"] {
    border-color: var(--tacta-color-error, #f0aaa1);
  }
  .hint {
    margin: 0;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
    line-height: var(--tacta-line-height-relaxed, 1.7);
  }
  .hint.error {
    color: var(--tacta-color-error, #f0aaa1);
  }
`;
