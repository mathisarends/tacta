import { css, html } from "lit";
import { property, state } from "lit/decorators.js";
import { TactaElement } from "./element.js";
import { workspaceStyles } from "./styles/workspace.js";

export class AppCheckbox extends TactaElement {
  static formAssociated = true;
  @property() label = "";
  @property({ reflect: true }) name = "";
  @property() value = "on";
  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean }) indeterminate = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) required = false;
  @state() private formDisabled = false;
  private readonly internals = this.attachInternals();
  private initialChecked = false;

  protected override firstUpdated(): void {
    this.initialChecked = this.checked;
  }
  protected override updated(): void {
    const input = this.renderRoot.querySelector("input")!;
    this.internals.setFormValue(
      this.checked ? this.value : null,
      this.checked ? "checked" : "unchecked",
    );
    this.internals.setValidity(input.validity, input.validationMessage, input);
  }
  formDisabledCallback(disabled: boolean): void {
    this.formDisabled = disabled;
  }
  formResetCallback(): void {
    this.checked = this.initialChecked;
    this.indeterminate = false;
  }
  formStateRestoreCallback(value: string | File | FormData | null): void {
    this.checked = value === "checked";
  }
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }
  override focus(options?: FocusOptions): void {
    this.renderRoot.querySelector("input")?.focus(options);
  }

  private change(event: Event): void {
    this.checked = (event.target as HTMLInputElement).checked;
    this.indeterminate = false;
    this.dispatchEvent(
      new CustomEvent<boolean>("checked-change", {
        detail: this.checked,
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    label {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 36px;
      cursor: pointer;
    }
    input {
      width: 18px;
      height: 18px;
      flex: none;
    }
    :host(:disabled) {
      opacity: 0.5;
    }
  `;
  override render() {
    return html`<label part="label"
      ><input
        part="input"
        type="checkbox"
        .checked=${this.checked}
        .indeterminate=${this.indeterminate}
        ?required=${this.required}
        ?disabled=${this.disabled || this.formDisabled}
        @change=${this.change}
      /><span>${this.label}</span></label
    >`;
  }
}
