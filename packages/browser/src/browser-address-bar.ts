import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { resolveBrowserAddress } from "./data/browser-address.js";
import { browserText as text } from "./messages/index.js";

export class BrowserAddressBar extends LitElement {
  @property() url = "";
  @property() label = "";
  @state() private editing = false;
  @state() private draft = "";
  @query("input") private field?: HTMLInputElement;

  private get shown(): string {
    if (this.editing) {
      return this.draft;
    }
    if (!this.url) {
      return "";
    }
    return this.label;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("url")) {
      this.editing = false;
    }
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("url")) {
      this.field?.setCustomValidity("");
    }
  }

  async focusAddress(): Promise<void> {
    await this.updateComplete;
    if (this.isConnected) {
      this.field?.focus();
    }
  }

  private submit(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.draft.trim()) {
      return;
    }
    const url = resolveBrowserAddress(this.draft);
    if (!url) {
      this.field?.setCustomValidity(text.invalidAddress);
      this.field?.reportValidity();
      return;
    }
    this.field?.setCustomValidity("");
    this.field?.blur();
    this.dispatchEvent(
      new CustomEvent<string>("address-submit", {
        detail: url.href,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private beginEditing(): void {
    this.draft = this.url;
    this.editing = true;
    void this.updateComplete.then(() => {
      if (this.isConnected && this.editing) {
        this.field?.select();
      }
    });
  }

  private endEditing(): void {
    this.editing = false;
    this.field?.setCustomValidity("");
  }

  private edit(event: Event): void {
    this.draft = (event.target as HTMLInputElement).value;
    this.field?.setCustomValidity("");
  }

  private cancelEditing(event: KeyboardEvent): void {
    if (event.key !== "Escape") {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
    this.field?.blur();
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      flex: 1;
      min-width: 0;
      max-width: var(--tacta-workspace-surface-content-width, 680px);
      margin-inline: auto;
    }
    .address-bar {
      position: relative;
      display: flex;
      flex: 1;
      min-width: 0;
      height: 36px;
      border-radius: var(--tacta-radius-pill, 999px);
      background: var(--tacta-color-surface, #252627);
    }
    .address-bar:focus-within {
      box-shadow: 0 0 0 2px var(--tacta-color-muted, #a3a3a5);
    }
    input {
      width: 100%;
      min-width: 0;
      box-sizing: border-box;
      height: 36px;
      padding: 0 40px;
      border: 1px solid transparent;
      border-radius: var(--tacta-radius-pill, 999px);
      background: transparent;
      color: var(--tacta-color-text, #e6e6e6);
      text-align: center;
      text-overflow: ellipsis;
      font: var(--tacta-font-weight-control, var(--tacta-font-weight-regular))
        var(--tacta-font-size-label, var(--tacta-text-md))
        var(--tacta-font-family, system-ui, sans-serif);
    }
    input:focus {
      text-align: left;
    }
    input:focus-visible {
      box-shadow: none;
    }
    .external-link {
      position: absolute;
      top: 2px;
      right: 4px;
      width: 32px;
      height: 32px;
      border-radius: var(--tacta-radius-pill, 999px);
      color: var(--tacta-color-text, #e6e6e6);
    }
  `;

  private renderExternalLink(): TemplateResult<1> | typeof nothing {
    if (!this.url) {
      return nothing;
    }
    return html`<a
      class="icon-button external-link"
      href=${this.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label=${text.openInBrowser}
      ${tooltip(text.openInBrowser)}
      >${icon("external", 16)}</a
    >`;
  }

  override render(): TemplateResult<1> {
    return html`<form class="address-bar" @submit=${this.submit}>
      <input
        type="text"
        aria-label=${text.address}
        placeholder=${text.addressPlaceholder}
        title=${this.url}
        autocomplete="off"
        spellcheck="false"
        .value=${live(this.shown)}
        @focus=${this.beginEditing}
        @blur=${this.endEditing}
        @input=${this.edit}
        @keydown=${this.cancelEditing}
      />
      ${this.renderExternalLink()}
    </form>`;
  }
}
