import type { NavigationEntry } from "../navigation-types.js";
import { opensInPlace } from "@tacta/core/link-click";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, query, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { positionMenu } from "@tacta/core/menu-position";
import "./user-profile.js";
import { sidebarText } from "./messages/index.js";
import { uiText } from "@tacta/core/messages";

export class ProfileMenu extends LitElement {
  @property({ attribute: false }) entry?: NavigationEntry;
  @property() name = "";
  @property() src = "";
  @property() baseUrl = "";
  @property({ type: Boolean, reflect: true }) collapsed = false;
  @state() private open = false;
  @query(".profile-button", true) private button!: HTMLButtonElement;

  readonly close = (): void => {
    this.open = false;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.close);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.close);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("collapsed")) {
      this.open = false;
    }
  }

  protected override updated(): void {
    const menu = this.renderRoot.querySelector<HTMLElement>(".tacta-profile-menu");
    if (!menu || menu.matches(":popover-open")) {
      return;
    }
    menu.style.width = `${Math.max(200, this.button.getBoundingClientRect().width)}px`;
    menu.showPopover();
    positionMenu(menu, this.button);
    menu.querySelector<HTMLElement>("a, button")?.focus({ preventScroll: true });
  }

  private emit(name: string): void {
    this.open = false;
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  private followEntry(event: MouseEvent): void {
    if (!this.entry || !opensInPlace(event)) {
      return;
    }
    event.preventDefault();
    this.open = false;
    this.dispatchEvent(
      new CustomEvent<string>("navigate", {
        detail: this.entry.href,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key !== "Escape" || !this.open) {
      return;
    }
    event.stopPropagation();
    this.open = false;
    this.button.focus();
  }

  private onToggle(event: ToggleEvent): void {
    if (event.newState === "closed") {
      this.open = false;
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    button:focus-visible,
    a:focus-visible {
      outline: 1px solid var(--tacta-color-focus, #9b9b9e);
      outline-offset: 2px;
    }
    .profile-button {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 10px 12px;
      border: 0;
      border-radius: var(--tacta-radius-control, 12px);
      background: none;
      text-align: left;
      cursor: pointer;
    }
    .profile-button:hover {
      background: var(--tacta-color-panel-hover, #2d2e2f);
    }
    .profile-button tacta-user-profile {
      flex: 1;
    }
    .profile-menu-icon {
      display: flex;
      flex-shrink: 0;
      margin-left: 8px;
      color: var(--tacta-color-muted, #a3a3a5);
      transition: transform var(--tacta-motion-duration-control, 160ms);
    }
    .profile-button[aria-expanded="true"] .profile-menu-icon {
      transform: rotate(180deg);
    }
    .tacta-profile-menu {
      box-sizing: border-box;
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
    .tacta-profile-menu button,
    .tacta-profile-menu a {
      box-sizing: border-box;
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
      text-decoration: none;
    }
    .tacta-profile-menu button:hover,
    .tacta-profile-menu a:hover {
      background: var(--tacta-color-accent-soft, #ffffff14);
    }
    .menu-divider {
      height: 1px;
      margin: 4px 3px;
      background: var(--tacta-color-border, #ffffff0d);
    }
    :host([collapsed]) .profile-menu-icon {
      display: none;
    }
    :host([collapsed]) .profile-button {
      justify-content: center;
      width: 40px;
      height: 40px;
      padding: 0;
    }
    :host([collapsed]) .profile-button tacta-user-profile {
      flex: none;
      --avatar-size: 28px;
    }
  `;

  private renderEntry(): TemplateResult<1> | typeof nothing {
    if (!this.entry) {
      return nothing;
    }
    return html`<a href=${this.entry.href} @click=${this.followEntry}
      >${icon(this.entry.icon, 16)}${this.entry.label}</a
    >`;
  }

  private renderMenu(): TemplateResult<1> | typeof nothing {
    if (!this.open) {
      return nothing;
    }
    return html`<div
      id="tacta-profile-menu"
      class="tacta-profile-menu"
      popover="auto"
      @toggle=${this.onToggle}
    >
      ${this.renderEntry()}
      <div part="menu-divider" class="menu-divider"></div>
      <button @click=${() => this.emit("sign-out")}>
        ${icon("logOut", 16)}${sidebarText.signOut}
      </button>
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`<div @keydown=${this.onKeyDown}>
      <button
        part="profile-button"
        class="profile-button"
        @click=${() => (this.open = !this.open)}
        aria-label=${uiText.itemAction({ item: this.name, action: sidebarText.accountMenu })}
        aria-expanded=${this.open}
        aria-controls="tacta-profile-menu"
      >
        <tacta-user-profile
          .baseUrl=${this.baseUrl}
          .name=${this.name}
          .src=${this.src}
          .avatarOnly=${this.collapsed}
        ></tacta-user-profile>
        <span class="profile-menu-icon" aria-hidden="true">${icon("chevronDown", 15)}</span>
      </button>
      ${this.renderMenu()}
    </div>`;
  }
}
