import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, query } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { type Shortcut, shortcutAria, shortcutLabel } from "@tacta/core/keyboard/shortcuts";
import { isRovingKey, rovingIndex } from "@tacta/core/keyboard/roving";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { uiText } from "@tacta/core/messages";
import { tooltip } from "@tacta/core/tooltip";
import { panelText } from "./messages/index.js";
import type { SurfaceMenu } from "./surface-menu.js";
import "./surface-menu.js";
import type { Surface } from "./surfaces.js";
import { TabDragController } from "./tab-drag-controller.js";
import type { WorkspaceTabData } from "./workspace-tab.js";
import "./workspace-tab.js";
import { workspaceTabBarStyles } from "./workspace-tabs.styles.js";

export type TabMove = { id: string; index: number };

export class WorkspaceTabBar extends LitElement {
  @property({ attribute: false }) shortcuts: Partial<
    Record<"toggleSidebar" | "toggleWorkspace" | "toggleWorkspaceMaximize", Shortcut>
  > = {};
  @property({ attribute: false }) tabs: WorkspaceTabData[] = [];
  @property({ attribute: false }) active: string | null = null;
  @property({ attribute: false }) panelFor: (id: string) => HTMLElement | null = () => null;
  @property({ attribute: false }) addSurface?: Surface;
  @property() addLabel = panelText.openSurface;
  @property({ type: Boolean }) windowControls = true;
  @property({ type: Boolean }) maximized = false;
  @property({ type: Boolean }) sidebarOpen = true;
  @query("tacta-surface-menu") private surfaceMenu?: SurfaceMenu;

  private readonly drag = new TabDragController(this, {
    count: () => this.tabs.length,
    scroller: () => this.renderRoot.querySelector<HTMLElement>(".tab-scroll"),
    onStart: () => this.closeMenu(),
    onMove: (id, index) => this.move(id, index),
  });

  private get ids(): string[] {
    return this.tabs.map((tab) => tab.id);
  }

  private get maximizeLabel(): string {
    return this.maximized ? panelText.restore : panelText.maximize;
  }

  protected override updated(): void {
    for (const tab of this.renderRoot.querySelectorAll<HTMLElement>("[role=tab]")) {
      const panel = this.panelFor(tab.dataset.tab ?? "");
      tab.ariaControlsElements = panel ? [panel] : [];
    }
  }

  showMenu(): void {
    if (this.addSurface) {
      this.emit("surface-open", this.addSurface);
      return;
    }
    this.surfaceMenu?.show();
  }

  closeMenu(): void {
    this.surfaceMenu?.close();
  }

  focusTab(id: string): void {
    this.revealTab(id)?.focus();
  }

  revealTab(id: string): HTMLElement | undefined {
    const tab = [...this.renderRoot.querySelectorAll<HTMLElement>("[role=tab]")].find(
      (element) => element.dataset.tab === id,
    );
    tab?.scrollIntoView({ block: "nearest", inline: "nearest" });
    return tab;
  }

  private emit<T>(name: string, detail?: T): void {
    this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true }));
  }

  private emitWindowAction(name: string): void {
    this.closeMenu();
    this.emit(name);
  }

  private select(id: string): void {
    this.emit("tab-select", id);
  }

  private move(id: string, index: number): void {
    this.emit<TabMove>("tab-move", { id, index });
  }

  private onTabKeyDown(event: KeyboardEvent, id: string): void {
    if (event.composedPath()[0] !== event.currentTarget) {
      return;
    }
    const ids = this.ids;
    const index = ids.indexOf(id);
    if (isRovingKey(event.key, "horizontal")) {
      event.preventDefault();
      if (event.altKey && event.key.startsWith("Arrow")) {
        this.moveByKey(id, index + (event.key === "ArrowRight" ? 1 : -1));
        return;
      }
      const next = ids[rovingIndex(event.key, index, ids.length, "horizontal")];
      if (!next) {
        return;
      }
      this.select(next);
      void this.updateComplete.then(() => this.focusTab(next));
      return;
    }
    if (event.key === "Delete") {
      event.preventDefault();
      this.emit("tab-close", id);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.select(id);
    }
  }

  private moveByKey(id: string, target: number): void {
    const index = this.ids.indexOf(id);
    if (target < 0 || target >= this.tabs.length) {
      return;
    }
    this.move(id, target > index ? target + 1 : target);
  }

  private onScroll(event: Event): void {
    const rail = event.currentTarget as HTMLElement;
    rail.toggleAttribute("data-scrolled", rail.scrollLeft > 0);
  }

  private tabClass(tab: WorkspaceTabData, index: number): string {
    const dragging = this.drag.dragging === tab.id ? "dragging" : "";
    return `tab ${dragging} ${this.drag.dropClass(index)}`;
  }

  static override styles = css`
    ${workspaceStyles}
    ${workspaceTabBarStyles}
    :host {
      display: block;
      min-width: 0;
    }
    [hidden] {
      display: none !important;
    }
    .tab {
      cursor: grab;
      user-select: none;
    }
    .tab.dragging {
      opacity: 0.4;
    }
    .tab.drop-before::after,
    .tab.drop-after::after {
      content: "";
      position: absolute;
      top: 4px;
      bottom: 4px;
      width: 2px;
      background: var(--tacta-color-accent, #ffffff);
      border-radius: var(--tacta-radius-indicator, 2px);
    }
    .tab.drop-before::after {
      left: -3px;
    }
    .tab.drop-after::after {
      right: -3px;
    }
  `;

  private renderSidebarToggle(): TemplateResult<1> | typeof nothing {
    if (!this.windowControls || !this.maximized || this.sidebarOpen) {
      return nothing;
    }
    return html`<button
      part="icon-button"
      class="icon-button sidebar-toggle"
      aria-label=${panelText.toggleSidebar}
      aria-keyshortcuts=${shortcutAria(this.shortcuts.toggleSidebar)}
      ${tooltip(
        uiText.withShortcut({
          label: panelText.toggleSidebar,
          shortcut: shortcutLabel(this.shortcuts.toggleSidebar),
        }),
      )}
      @click=${() => this.emitWindowAction("open-sidebar")}
    >
      ${icon("panelLeft", 16)}
    </button>`;
  }

  private renderTab(tab: WorkspaceTabData, index: number): TemplateResult<1> {
    return html`<tacta-workspace-tab
      class=${this.tabClass(tab, index)}
      role="tab"
      .tab=${tab}
      ?active=${this.active === tab.id}
      data-tab=${tab.id}
      data-surface=${tab.surface}
      aria-label=${tab.label}
      aria-selected=${this.active === tab.id}
      title=${tab.url || panelText.reorderTab}
      tabindex=${this.active === tab.id ? "0" : "-1"}
      draggable="true"
      @dragstart=${(event: DragEvent) => this.drag.start(event, tab.id)}
      @dragover=${(event: DragEvent) => this.drag.over(event, index)}
      @drop=${(event: DragEvent) => this.drag.drop(event)}
      @dragend=${() => this.drag.finish()}
      @click=${() => this.select(tab.id)}
      @keydown=${(event: KeyboardEvent) => this.onTabKeyDown(event, tab.id)}
    ></tacta-workspace-tab>`;
  }

  private renderAddTab(): TemplateResult<1> {
    if (this.addSurface) {
      return html`<button
        part="icon-button"
        class="icon-button add-tab"
        aria-label=${this.addLabel}
        ${tooltip(this.addLabel)}
        @click=${this.showMenu}
      >
        ${icon("plus", 18)}
      </button>`;
    }
    return html`<tacta-surface-menu
      ?hidden=${!this.tabs.length}
      .opened=${this.ids}
    ></tacta-surface-menu>`;
  }

  private renderTabStrip(): TemplateResult<1> {
    return html`<div part="tab-strip" class="tab-strip">
      <div
        part="tab-scroll"
        class="tab-scroll"
        role="tablist"
        aria-label=${panelText.workspace}
        @scroll=${this.onScroll}
      >
        ${repeat(
          this.tabs,
          (tab) => tab.id,
          (tab, index) => this.renderTab(tab, index),
        )}
      </div>
      ${this.renderAddTab()}
    </div>`;
  }

  private renderWindowControls(): TemplateResult<1> | typeof nothing {
    if (!this.windowControls) {
      return nothing;
    }
    return html`<button
        part="icon-button"
        class="icon-button"
        aria-label=${this.maximizeLabel}
        aria-keyshortcuts=${shortcutAria(this.shortcuts.toggleWorkspaceMaximize)}
        ${tooltip(
          uiText.withShortcut({
            label: this.maximizeLabel,
            shortcut: shortcutLabel(this.shortcuts.toggleWorkspaceMaximize),
          }),
        )}
        @click=${() => this.emitWindowAction("toggle-maximize")}
      >
        ${icon(this.maximized ? "minimize" : "maximize", 15)}
      </button>
      <button
        part="icon-button"
        class="icon-button"
        aria-label=${panelText.closePanel}
        aria-keyshortcuts=${shortcutAria(this.shortcuts.toggleWorkspace)}
        ${tooltip(
          uiText.withShortcut({
            label: panelText.closePanel,
            shortcut: shortcutLabel(this.shortcuts.toggleWorkspace),
          }),
        )}
        @click=${() => this.emitWindowAction("close-workspace")}
      >
        ${icon("close", 16)}
      </button>`;
  }

  override render(): TemplateResult<1> {
    return html`<div part="tab-bar" class="tab-bar">
      ${this.renderSidebarToggle()} ${this.renderTabStrip()} ${this.renderWindowControls()}
    </div>`;
  }
}
