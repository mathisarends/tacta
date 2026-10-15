import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { controls } from "@tacta/core/styles/controls";
import { locales, type Locale } from "@tacta/core/i18n";
import { icon } from "@tacta/core/icons";
import { uiText } from "@tacta/core/messages";

export class LocaleSwitch extends LitElement {
  @property({ type: Boolean, reflect: true }) expanded = false;
  @property({ type: Boolean }) disabled = false;
  @property() locale: Locale = "en";

  private choose(locale: Locale): void {
    if (this.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<Locale>("locale-change", {
        detail: locale,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private localeLabel(locale: Locale): string {
    if (this.expanded) {
      return uiText.languageNames[locale];
    }
    return locale.toUpperCase();
  }

  static override styles = css`
    ${controls}
    :host {
      display: inline-flex;
    }
    .switch {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--tacta-color-muted, #a3a3a5);
    }
    svg {
      margin-right: 8px;
      width: 16px;
    }
    button {
      font: inherit;
      font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
      letter-spacing: var(--tacta-letter-spacing-caps, 0.05em);
      color: var(--tacta-color-muted, #a3a3a5);
      background: transparent;
      border: 0;
      border-radius: var(--tacta-radius-pill, 999px);
      min-width: 36px;
      min-height: 34px;
      cursor: pointer;
    }
    button[aria-pressed="true"] {
      color: var(--tacta-color-text, #e6e6e6);
      background: var(--tacta-color-surface, #252627);
    }
    button:hover {
      color: var(--tacta-color-accent, #ffffff);
    }
    button:focus-visible {
      outline: 2px solid var(--tacta-color-accent, #ffffff);
      outline-offset: 3px;
    }
    :host([expanded]) .switch {
      padding: 4px;
      gap: 4px;
      border-radius: var(--tacta-radius-pill, 999px);
      background: var(--tacta-color-sidebar, #1e1f20);
    }
    :host([expanded]) button {
      min-height: 34px;
      padding: 6px 12px;
      border-radius: var(--tacta-radius-pill, 999px);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
      letter-spacing: var(--tacta-letter-spacing-ui, normal);
    }
  `;

  override render(): TemplateResult<1> {
    return html`<div class="switch" role="group" aria-label=${uiText.language}>
      ${this.expanded ? nothing : icon("globe")}${locales.map(
        (locale: Locale) => html`
          <button
            type="button"
            lang=${locale}
            aria-label=${uiText.languageNames[locale]}
            aria-pressed=${this.locale === locale}
            ?disabled=${this.disabled}
            @click=${() => this.choose(locale)}
          >
            ${this.localeLabel(locale)}
          </button>
        `,
      )}
    </div>`;
  }
}
