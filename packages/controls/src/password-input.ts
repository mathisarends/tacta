import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { TextInput, textInputStyles } from "./text-input.js";
import { uiText } from "@tacta/core/messages";

export class PasswordInput extends TextInput {
  @property({ attribute: false }) action: TemplateResult | typeof nothing = nothing;
  @state() private visible = false;
  protected override readonly blankIsMissing: boolean = false;

  private get toggleLabel(): string {
    if (this.visible) {
      return uiText.hidePassword;
    }
    return uiText.showPassword;
  }

  protected override renderLabel(): TemplateResult<1> {
    return html`<div class="label-row">${super.renderLabel()}${this.action}</div>`;
  }

  protected override renderInput(): TemplateResult<1> {
    return super.renderInput(this.visible ? "text" : "password");
  }

  protected override renderTrailing(): TemplateResult<1> {
    return html`<button
      class="password-toggle"
      type="button"
      aria-label=${this.toggleLabel}
      ${tooltip(this.toggleLabel)}
      aria-pressed=${this.visible}
      @click=${() => (this.visible = !this.visible)}
    >
      ${icon(this.visible ? "eyeOff" : "eye", 17)}
    </button>`;
  }
}

export const passwordInputStyles = [
  textInputStyles,
  css`
    tacta-password-input .input {
      padding-right: 48px;
    }
    .password-toggle {
      position: absolute;
      top: 50%;
      right: 4px;
      width: 40px;
      height: calc(var(--tacta-input-height, 48px) - 6px);
      display: grid;
      place-items: center;
      border: 0;
      border-radius: var(--tacta-radius-inset, 6px);
      background: transparent;
      color: var(--tacta-color-muted, #a3a3a5);
      transform: translateY(-50%);
    }
    .password-toggle:hover {
      color: var(--tacta-color-accent, #ffffff);
    }
    .label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .label-row .text-button {
      font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
      color: var(--tacta-color-muted, #a3a3a5);
    }
  `,
];
