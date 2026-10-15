import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { browserText as text } from "./messages/index.js";

export class BrowserNavigation extends LitElement {
  @property({ type: Boolean }) ready = false;
  @property({ type: Boolean }) canGoBack = false;
  @property({ type: Boolean }) canGoForward = false;
  @property({ type: Boolean }) loading = false;
  @property() url = "";

  private get backDisabled(): boolean {
    return !this.ready || !this.canGoBack;
  }

  private get forwardDisabled(): boolean {
    return !this.ready || !this.canGoForward;
  }

  private get reloadDisabled(): boolean {
    return !this.ready || !this.url;
  }

  private get reloadLabel(): string {
    if (this.loading) {
      return text.stop;
    }
    return text.reload;
  }

  private back(): void {
    if (this.backDisabled) {
      return;
    }
    this.dispatchEvent(new CustomEvent<void>("back-request", { bubbles: true, composed: true }));
  }

  private forward(): void {
    if (this.forwardDisabled) {
      return;
    }
    this.dispatchEvent(new CustomEvent<void>("forward-request", { bubbles: true, composed: true }));
  }

  private reload(): void {
    if (this.reloadDisabled) {
      return;
    }
    this.dispatchEvent(new CustomEvent<void>("reload-request", { bubbles: true, composed: true }));
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      align-items: center;
      flex: 0 0 auto;
      padding: var(--tacta-browser-navigation-padding, 2px);
      border-radius: var(--tacta-radius-pill, 999px);
      background: var(--tacta-color-surface, #252627);
    }
    .icon-button {
      width: var(--tacta-browser-toolbar-control-size, 32px);
      height: var(--tacta-browser-toolbar-control-size, 32px);
      border-radius: var(--tacta-radius-pill, 999px);
      color: var(--tacta-color-text, #e6e6e6);
    }
    .icon-button:disabled {
      opacity: var(--tacta-browser-control-disabled-opacity, 0.3);
      cursor: default;
      background: transparent;
    }
    .reload {
      margin-left: var(--tacta-browser-navigation-reload-gap, 3px);
      position: relative;
    }
    .reload::before {
      content: "";
      position: absolute;
      left: calc(-1 * var(--tacta-browser-navigation-padding, 2px));
      height: var(--tacta-browser-navigation-separator-height, 18px);
      border-left: 1px solid var(--tacta-color-border, #ffffff0d);
    }
  `;

  override render(): TemplateResult<1> {
    return html`<button
        class="icon-button"
        aria-label=${text.back}
        ${tooltip(text.back)}
        ?disabled=${this.backDisabled}
        @click=${this.back}
      >
        ${icon("back", 16)}
      </button>
      <button
        class="icon-button"
        aria-label=${text.forward}
        ${tooltip(text.forward)}
        ?disabled=${this.forwardDisabled}
        @click=${this.forward}
      >
        ${icon("arrow", 16)}
      </button>
      <button
        class="icon-button reload"
        aria-label=${this.reloadLabel}
        ${tooltip(this.reloadLabel)}
        ?disabled=${this.reloadDisabled}
        @click=${this.reload}
      >
        ${icon("refresh", 16)}
      </button>`;
  }
}
