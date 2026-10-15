import type { NavigationEntry } from "../navigation-types.js";
import { type Shortcut, shortcutLabel, shortcutAria } from "@tacta/core/keyboard/shortcuts";
import { html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, query, state } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { opensInPlace } from "@tacta/core/link-click";
import type { ProfileMenu } from "./profile-menu.js";
import "./conversation-row.js";
import "./profile-menu.js";
import "./rename-dialog.js";
import { sideBarStyles } from "./side-bar.styles.js";
import type { SidebarItem } from "./types.js";
import { sidebarText } from "./messages/index.js";
import { uiText } from "@tacta/core/messages";

const navIconSize = 18;

export class SideBar extends LitElement {
  @property({ attribute: false }) shortcuts: Partial<
    Record<"newChat" | "search" | "toggleSidebar", Shortcut>
  > = {};
  @property({ attribute: false }) items: SidebarItem[] = [];

  @property({ attribute: false }) entries: NavigationEntry[] = [];
  @property({ attribute: false }) accountEntry?: NavigationEntry;
  @property() newChatHref = "";

  @property() label = sidebarText.title;
  @property() activeId = "";
  @property({ type: Boolean }) newChatActive = false;
  @property({ type: Boolean, reflect: true }) collapsed = false;
  @property() activeSection = "";
  @property() userName = "";
  @property() profileImageUrl = "";
  @property() profileBaseUrl = "";
  @property({ type: Boolean }) hasMore = false;
  @property({ type: Boolean }) loading = false;
  @state() private menuId: string | null = null;
  @state() private renaming: SidebarItem | null = null;
  @query("tacta-profile-menu", true) private profileMenu!: ProfileMenu;

  private readonly closeMenu = (): void => {
    this.menuId = null;
  };

  private get chatActive(): boolean {
    return this.newChatActive || (this.collapsed && Boolean(this.activeId));
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.closeMenu);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.closeMenu);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("collapsed")) {
      this.closeMenu();
    }
  }

  private emit(name: string): void {
    this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true }));
  }

  private follow(event: MouseEvent, name: string): void {
    if (!opensInPlace(event)) {
      return;
    }
    event.preventDefault();
    this.emit(name);
  }

  private followRoute(event: MouseEvent, href: string): void {
    if (!opensInPlace(event)) {
      return;
    }
    event.preventDefault();
    this.dispatchEvent(
      new CustomEvent<string>("navigate", { detail: href, bubbles: true, composed: true }),
    );
  }

  private toggleMenu(event: CustomEvent<string>): void {
    event.stopPropagation();
    this.menuId = this.menuId === event.detail ? null : event.detail;
  }

  private beginRename(event: CustomEvent<SidebarItem>): void {
    event.stopPropagation();
    this.menuId = null;
    this.renaming = event.detail;
  }

  private onMenuClose(event: Event): void {
    event.stopPropagation();
    this.closeMenu();
  }

  private onGroupsScroll(): void {
    this.closeMenu();
    this.profileMenu.close();
  }

  private navTooltip(link: NavigationEntry): string {
    if (!link.shortcut) {
      return link.label;
    }
    return uiText.withShortcut({
      label: link.label,
      shortcut: shortcutLabel(link.shortcut),
    });
  }

  static override styles = sideBarStyles;

  private renderHead(): TemplateResult<1> {
    const toggleLabel = this.collapsed ? sidebarText.expand : sidebarText.collapse;
    const toggleTooltip = this.collapsed ? "right" : "bottom";
    const toggleEvent = this.collapsed ? "open-sidebar" : "close-sidebar";
    return html`<div part="sidebar-head" class="sidebar-head">
      <slot name="brand"></slot
      ><button
        part="icon-button"
        class="icon-button"
        ${tooltip(
          uiText.withShortcut({
            label: toggleLabel,
            shortcut: shortcutLabel(this.shortcuts.toggleSidebar),
          }),
          toggleTooltip,
        )}
        aria-label=${toggleLabel}
        aria-expanded=${!this.collapsed}
        aria-keyshortcuts=${shortcutAria(this.shortcuts.toggleSidebar)}
        @click=${() => this.emit(toggleEvent)}
      >
        ${icon("panelLeft", this.collapsed ? 18 : 16)}
      </button>
    </div>`;
  }

  private renderNewChat(): TemplateResult<1> {
    return html`<a
      class="new-chat ${this.chatActive ? "active" : ""}"
      href=${this.newChatHref}
      aria-label=${sidebarText.newChat}
      aria-current=${this.chatActive ? "page" : nothing}
      ${tooltip(
        uiText.withShortcut({
          label: sidebarText.newChat,
          shortcut: shortcutLabel(this.shortcuts.newChat),
        }),
        "right",
      )}
      aria-keyshortcuts=${shortcutAria(this.shortcuts.newChat)}
      @click=${(event: MouseEvent) => this.follow(event, "new-chat")}
    >
      ${icon("newChat", navIconSize)}<span class="nav-label">${sidebarText.newChat}</span>
    </a>`;
  }

  private renderSearch(): TemplateResult<1> {
    return html`<button
      part="new-chat"
      class="new-chat"
      aria-label=${sidebarText.search}
      ${tooltip(
        uiText.withShortcut({
          label: sidebarText.search,
          shortcut: shortcutLabel(this.shortcuts.search),
        }),
        "right",
      )}
      aria-keyshortcuts=${shortcutAria(this.shortcuts.search)}
      @click=${() => this.emit("open-search")}
    >
      ${icon("search", navIconSize)}<span class="nav-label">${sidebarText.search}</span>
    </button>`;
  }

  private renderNavLink(link: NavigationEntry): TemplateResult<1> {
    const shortcut = link.shortcut ? link.shortcut : undefined;
    const label = this.navTooltip(link);
    return html`<a
      class="new-chat"
      href=${link.href}
      aria-label=${link.label}
      aria-current=${this.activeSection === link.name ? "page" : nothing}
      ${tooltip(label, "right")}
      aria-keyshortcuts=${shortcut ? shortcutAria(shortcut) : nothing}
      @click=${(event: MouseEvent) => this.followRoute(event, link.href)}
    >
      ${icon(link.icon, navIconSize)}<span class="nav-label">${link.label}</span>
    </a>`;
  }

  private renderGroup(title: string, items: SidebarItem[]): TemplateResult<1> | typeof nothing {
    if (!items.length) {
      return nothing;
    }
    return html`<p class="group-title">${title}</p>
      ${items.map(
        (item) =>
          html`<tacta-conversation-row
            .item=${item}
            .active=${this.activeId === item.id}
            .menuOpen=${this.menuId === item.id}
          ></tacta-conversation-row>`,
      )}`;
  }

  private renderLoadMore(): TemplateResult<1> | typeof nothing {
    if (!this.hasMore) {
      return nothing;
    }
    return html`<button
      part="new-chat"
      class="new-chat"
      ?disabled=${this.loading}
      @click=${() => this.emit("load-more")}
    >
      ${this.loading ? sidebarText.loading : sidebarText.loadMore}
    </button>`;
  }

  private renderConversations(): TemplateResult<1> {
    const pinned = this.items.filter((item) => item.pinned);
    const recent = this.items.filter((item) => !item.pinned);
    return html`<div
      part="groups"
      class="groups"
      @scroll=${this.onGroupsScroll}
      @menu-toggle=${this.toggleMenu}
      @menu-close=${this.onMenuClose}
      @rename-request=${this.beginRename}
      @select-conversation=${this.closeMenu}
      @toggle-pin=${this.closeMenu}
      @delete-conversation=${this.closeMenu}
    >
      ${this.renderGroup(sidebarText.pinned, pinned)}
      ${this.renderGroup(sidebarText.recent, recent)} ${this.renderLoadMore()}
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`
      <aside aria-label=${this.label}>
        ${this.renderHead()} ${this.renderNewChat()} ${this.renderSearch()}
        ${this.entries.map((link) => this.renderNavLink(link))} ${this.renderConversations()}
        <footer part="profile-footer" class="profile-footer">
          <tacta-profile-menu
            .baseUrl=${this.profileBaseUrl}
            .entry=${this.accountEntry}
            .name=${this.userName}
            .src=${this.profileImageUrl}
            .collapsed=${this.collapsed}
          ></tacta-profile-menu>
        </footer>
      </aside>
      <tacta-rename-dialog
        .conversation=${this.renaming}
        @rename-cancel=${() => (this.renaming = null)}
        @rename-conversation=${() => (this.renaming = null)}
      ></tacta-rename-dialog>
    `;
  }
}
