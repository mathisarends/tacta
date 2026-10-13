import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, query } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { positionMenu } from "@tacta/core/menu-position";
import { opensInPlace } from "@tacta/core/link-click";
import type { SidebarItem } from "./types.js";
import { sidebarText } from "./messages/index.js";
import { uiText } from "@tacta/core/messages";

export class ConversationRow extends LitElement {
  @property({ attribute: false }) item!: SidebarItem;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true, attribute: "menu-open" }) menuOpen = false;
  @query(".conversation-menu-button", true) private trigger!: HTMLButtonElement;

  protected override updated(): void {
    const menu = this.renderRoot.querySelector<HTMLElement>(".conversation-menu");
    if (!menu || menu.matches(":popover-open")) {
      return;
    }
    menu.showPopover();
    positionMenu(menu, this.trigger);
    const left = this.trigger.getBoundingClientRect().right - menu.offsetWidth;
    menu.style.left = `${Math.max(8, left)}px`;
    menu.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
  }

  private emit(name: string, detail?: string | SidebarItem): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private select(event: MouseEvent): void {
    if (!opensInPlace(event)) {
      return;
    }
    event.preventDefault();
    this.emit("select-conversation", this.item.id);
  }

  private onMenuButtonClick(): void {
    this.emit("menu-toggle", this.item.id);
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || !this.menuOpen) {
      return;
    }
    event.stopPropagation();
    this.trigger.focus();
    this.emit("menu-close");
  }

  private onMenuToggle(event: ToggleEvent): void {
    if (event.newState === "closed" && this.menuOpen) {
      this.emit("menu-close");
    }
  }

  private beginRename(): void {
    this.trigger.focus();
    this.emit("rename-request", this.item);
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      position: relative;
      display: flex;
      align-items: center;
      border-radius: var(--tacta-radius-control, 12px);
    }
    :host(:hover),
    :host(:focus-within),
    :host([menu-open]) {
      background: var(--tacta-color-panel-hover, #2d2e2f);
    }
    :host([active]) {
      background: var(--tacta-color-selected, #303132);
    }
    button:focus-visible,
    a:focus-visible {
      outline: 1px solid var(--tacta-color-focus, #9b9b9e);
      outline-offset: 2px;
    }
    .conversation {
      flex: 1;
      min-width: 0;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 0;
      border-radius: var(--tacta-radius-control, 12px);
      background: none;
      color: var(--tacta-color-text, #e6e6e6);
      padding: 9px 12px;
      font: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400))
        var(
          --tacta-font-size-navigation,
          var(--tacta-font-size-reading, var(--tacta-text-lg, 0.9375rem))
        ) /
        var(--tacta-line-height-body, 1.6)
        var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
      text-align: left;
      text-decoration: none;
      cursor: pointer;
    }
    :host([active]) .conversation {
      color: var(--tacta-color-accent, #ffffff);
      font-weight: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400));
    }
    .conversation-menu-button {
      width: 24px;
      height: 26px;
      display: grid;
      place-items: center;
      flex: 0 0 auto;
      margin-right: 6px;
      border: 0;
      border-radius: var(--tacta-radius-control, 12px);
      background: none;
      color: var(--tacta-color-muted, #a3a3a5);
      cursor: pointer;
    }
    .conversation-menu-button:hover {
      background: var(--tacta-color-panel-hover, #2d2e2f);
      color: var(--tacta-color-text, #e6e6e6);
    }
    .conversation-menu {
      position: fixed;
      inset: auto;
      margin: 0;
      z-index: 12;
      min-width: 180px;
      padding: 6px;
      border: 0;
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-surface, #252627);
      box-shadow: var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background, #181818) 65%, transparent)
      );
    }
    .conversation-menu button {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 9px 10px;
      border: 0;
      border-radius: var(--tacta-radius-control, 12px);
      background: none;
      color: var(--tacta-color-text, #e6e6e6);
      text-align: left;
      font: var(--tacta-font-weight-caption, var(--tacta-font-weight-regular, 400))
        var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))
        var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
      cursor: pointer;
    }
    .conversation-menu button:hover {
      background: var(--tacta-color-accent-soft, #ffffff14);
    }
    .menu-divider {
      height: 1px;
      margin: 4px 3px;
      background: var(--tacta-color-border, #ffffff0d);
    }
    .conversation-menu .delete-conversation {
      color: var(--tacta-color-error, #f0aaa1);
    }
    .conversation-menu .delete-conversation:hover {
      background: var(--tacta-color-error-surface, #302325);
    }
    .title {
      flex: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .title-skeleton {
      flex: 1;
      max-width: 70%;
      height: 9px;
      border-radius: var(--tacta-radius-placeholder, 3px);
      background: linear-gradient(
          100deg,
          var(--tacta-color-border, #ffffff0d) 30%,
          var(--tacta-color-accent-soft, #ffffff14) 50%,
          var(--tacta-color-border, #ffffff0d) 70%
        )
        100% 0 / 250% 100%;
      animation: title-shimmer var(--tacta-motion-duration-pulse, 1.6s) ease-in-out infinite;
    }
    @keyframes title-shimmer {
      to {
        background-position: 0 0;
      }
    }
    .spinner {
      flex: 0 0 auto;
      width: 12px;
      height: 12px;
      border: 2px solid var(--tacta-color-border, #ffffff0d);
      border-top-color: var(--tacta-color-accent, #ffffff);
      border-radius: var(--tacta-radius-round, 50%);
      animation: spin var(--tacta-motion-duration-spin, 850ms) linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    .unread {
      width: 6px;
      height: 6px;
      border-radius: var(--tacta-radius-round, 50%);
      background: var(--tacta-color-accent, #ffffff);
    }
  `;

  private renderTitle(): TemplateResult<1> {
    if (this.item.titlePending) {
      return html`<span
        class="title-skeleton"
        role="status"
        aria-label=${sidebarText.generatingTitle}
      ></span>`;
    }
    return html`<span class="title">${this.item.title}</span>`;
  }

  private renderStatus(): TemplateResult<1> | typeof nothing {
    if (this.item.replying) {
      return html`<span class="spinner" role="status" aria-label=${sidebarText.replying}></span>`;
    }
    if (this.item.unread) {
      return html`<span class="unread" aria-label=${sidebarText.unread}></span>`;
    }
    return nothing;
  }

  private renderPinButton(): TemplateResult<1> {
    const { id, pinned } = this.item;
    if (pinned) {
      return html`<button @click=${() => this.emit("toggle-pin", id)}>
        ${icon("pinOff", 16)} ${sidebarText.unpin}
      </button>`;
    }
    return html`<button @click=${() => this.emit("toggle-pin", id)}>
      ${icon("pin", 16)} ${sidebarText.pin}
    </button>`;
  }

  private renderMenu(): TemplateResult<1> | typeof nothing {
    if (!this.menuOpen) {
      return nothing;
    }
    const { id } = this.item;
    return html`<div
      part="conversation-menu"
      class="conversation-menu"
      popover="auto"
      @toggle=${this.onMenuToggle}
      @keydown=${this.onKeyDown}
    >
      ${this.renderPinButton()}<button @click=${this.beginRename}>
        ${icon("pencil", 16)}${sidebarText.rename}
      </button>
      <div part="menu-divider" class="menu-divider"></div>
      <button
        part="delete-conversation"
        class="delete-conversation"
        @click=${() => this.emit("delete-conversation", id)}
      >
        ${icon("trash", 16)}${sidebarText.delete}
      </button>
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`<a
        aria-current=${this.active ? "page" : nothing}
        class="conversation"
        href=${this.item.href}
        title=${this.item.title}
        @click=${this.select}
      >
        ${this.renderTitle()}${this.renderStatus()}</a
      ><button
        part="conversation-menu-button"
        class="conversation-menu-button"
        aria-label=${uiText.itemAction({
          item: this.item.title,
          action: sidebarText.conversationActions,
        })}
        ${tooltip(sidebarText.conversationActions)}
        aria-expanded=${this.menuOpen}
        @click=${this.onMenuButtonClick}
        @keydown=${this.onKeyDown}
      >
        ${icon("more", 14)}
      </button>
      ${this.renderMenu()}`;
  }
}
