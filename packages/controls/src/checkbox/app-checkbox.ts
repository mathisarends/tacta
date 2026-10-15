import { TactaElement as LitElement } from "@tacta/core/element";
import { html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";

export class AppCheckbox extends LitElement {
  @property() label = "";
  @property() name = "";
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) checked = false;

  protected override createRenderRoot(): HTMLElement {
    return this;
  }

  override render(): TemplateResult<1> {
    return html`<label class="checkbox"
      ><input
        type="checkbox"
        name=${this.name}
        ?required=${this.required}
        ?disabled=${this.disabled}
        .checked=${this.checked}
        @change=${(event: Event) => (this.checked = (event.target as HTMLInputElement).checked)}
      /><span>${this.label}</span></label
    >`;
  }
}
