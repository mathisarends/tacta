import { css, html, nothing, type PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { TactaElement } from "./element.js";
import { workspaceStyles } from "./styles/workspace.js";

/** A form-associated text field. Validation and submission use the native form API. */
export class TextInput extends TactaElement {
  static formAssociated = true;
  @property() label = "";
  @property({ reflect: true }) name = "";
  @property() value = "";
  @property() type: "text" | "email" | "password" | "search" | "tel" | "url" = "text";
  @property() placeholder = "";
  @property() hint = "";
  @property() autocomplete = "off";
  @property() pattern?: string;
  @property({ type: Boolean, reflect: true }) required = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) readonly = false;
  @state() private formDisabled = false;
  @state() private showError = false;
  @state() private validationMessage = "";
  private readonly internals = this.attachInternals();
  private initialValue = "";

  protected override firstUpdated(): void {
    this.initialValue = this.value;
    this.addEventListener("invalid", () => {
      this.showError = true;
    });
  }

  protected override updated(_changed: PropertyValues): void {
    const input = this.renderRoot.querySelector("input")!;
    this.internals.setFormValue(this.value);
    this.internals.setValidity(input.validity, input.validationMessage, input);
    this.validationMessage = input.validationMessage;
  }

  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }
  formResetCallback(): void {
    this.value = this.initialValue;
    this.showError = false;
  }
  formStateRestoreCallback(value: string | File | FormData | null): void {
    if (typeof value === "string") {
      this.value = value;
    }
  }
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }
  reportValidity(): boolean {
    this.showError = true;
    return this.internals.reportValidity();
  }
  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector("input")?.focus(options);
  }

  private input(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.dispatchEvent(
      new CustomEvent<string>("value-change", {
        detail: this.value,
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: grid;
      gap: 8px;
    }
    label {
      font-size: var(--tacta-font-size-label, 0.8125rem);
    }
    input {
      width: 100%;
      min-height: 42px;
      padding: 10px 12px;
      border: 1px solid var(--tacta-color-border, #c3c7cf);
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-background, white);
      color: var(--tacta-color-text, #202124);
      font: inherit;
    }
    input:disabled {
      opacity: 0.5;
    }
    p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--tacta-color-muted, #667085);
    }
    .error {
      color: var(--tacta-color-error, #b42318);
    }
  `;

  override render() {
    const error = this.showError && this.validationMessage;
    return html`<label for="input" part="label">${this.label}</label>
      <input
        id="input"
        part="input"
        type=${this.type}
        .value=${live(this.value)}
        placeholder=${this.placeholder}
        autocomplete=${this.autocomplete}
        pattern=${this.pattern ?? nothing}
        ?required=${this.required}
        ?disabled=${this.disabled || this.formDisabled}
        ?readonly=${this.readonly}
        aria-invalid=${error ? "true" : "false"}
        aria-describedby=${error || this.hint ? "hint" : nothing}
        @input=${this.input}
        @blur=${() => {
          this.showError = true;
        }}
      />
      ${error || this.hint ? html`<p id="hint" part="hint" class=${error ? "error" : ""}>${error || this.hint}</p>` : nothing}`;
  }
}
