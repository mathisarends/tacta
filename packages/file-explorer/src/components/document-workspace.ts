import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { uiText } from "@tacta/core/messages";
import { type Shortcut, shortcutAria, shortcutLabel } from "@tacta/core/keyboard/shortcuts";
import { panelText } from "@tacta/workspace-panel";
import { agentText as text } from "../messages/index.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";
import type { DocumentExplorer } from "./document-explorer.js";
import type { DocumentTabs } from "./document-tabs.js";
import type { ExplorerResizeDetail } from "@tacta/workspace-panel/types";
import "@tacta/workspace-panel/explorer-splitter";
import "./document-explorer.js";
import "./document-tabs.js";
import "./workspace-breadcrumb.js";
import "./document-skeleton.js";
import "@tacta/core/loading";

export class DocumentWorkspace extends LitElement {
  @property({ attribute: false }) entries: WorkspaceEntry[] = [];
  @property({ attribute: false }) tabs: WorkspaceEntry[] = [];
  @property() active = "";
  @property({ type: Boolean }) panelControls = false;
  @property({ type: Boolean }) maximized = false;
  @property({ type: Boolean }) sidebarToggle = false;
  @property({ type: Boolean, reflect: true, attribute: "hide-tabs" }) hideTabs = false;
  @property() contentRole: "tabpanel" | "region" = "tabpanel";
  @property({ type: Boolean }) loading = false;
  @property({ attribute: false }) sidebarShortcut?: Shortcut;
  @property({ attribute: false }) explorerState = {
    collapsed: [] as string[],
    revealed: [] as string[],
  };
  @state() private explorer = true;
  @property({ type: Number }) explorerWidth = 260;
  @state() private resizing = false;

  protected override updated(): void {
    const tabs = this.renderRoot.querySelector<DocumentTabs>("tacta-document-tabs");
    if (tabs) {
      tabs.panel = this.renderRoot.querySelector<HTMLElement>("#document-content");
    }
  }

  async revealExplorer(): Promise<void> {
    this.explorer = true;
    await this.updateComplete;
    await this.renderRoot.querySelector<DocumentExplorer>("tacta-document-explorer")?.focusSearch();
  }

  private resizeExplorer(event: CustomEvent<ExplorerResizeDetail>): void {
    this.explorerWidth = event.detail.width;
    this.resizing = event.detail.resizing;
    if (!event.detail.resizing && !event.detail.collapse) {
      this.dispatchEvent(
        new CustomEvent<number>("explorer-width-change", {
          detail: event.detail.width,
          bubbles: true,
          composed: true,
        }),
      );
    }
    if (event.detail.collapse) {
      this.explorer = false;
      this.renderRoot.querySelector<HTMLButtonElement>(".explorer-toggle")?.focus();
    }
  }

  private openSidebar(): void {
    this.dispatchEvent(new CustomEvent("open-sidebar", { bubbles: true, composed: true }));
  }

  private refreshWorkspace(): void {
    this.dispatchEvent(new CustomEvent("workspace-refresh", { bubbles: true, composed: true }));
  }

  static override styles = [
    workspaceStyles,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-width: 0;
        min-height: 0;
        height: 100%;
        background: var(--tacta-color-background, #181818);
        container-type: inline-size;
      }
      [hidden],
      ::slotted([hidden]) {
        display: none !important;
      }
      tacta-document-tabs {
        flex-shrink: 0;
      }
      .toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 52px;
        gap: 12px;
        padding: 0 14px;
      }
      :host([hide-tabs]) .toolbar {
        min-height: var(--tacta-workspace-header-height, 60px);
        padding-left: 36px;
      }
      :host([hide-tabs]) .document {
        padding-left: 16px;
      }
      .toolbar-start {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .toolbar-actions {
        display: flex;
        gap: 4px;
        flex-shrink: 0;
      }
      .toolbar-actions [aria-pressed="true"] {
        background: var(--tacta-color-surface, #252627);
        color: var(--tacta-color-text, #e6e6e6);
      }
      .body {
        display: flex;
        flex: 1;
        min-height: 0;
        min-width: 0;
      }
      .body.resizing {
        user-select: none;
        cursor: col-resize;
      }
      .document {
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: hidden;
      }
      .document-skeleton {
        height: 100%;
        box-sizing: border-box;
        padding: 16px 24px;
        overflow: hidden;
      }
      .breadcrumb-loading {
        --tacta-skeleton-background: color-mix(
          in srgb,
          var(--tacta-color-panel-hover, #2d2e2f) 55%,
          var(--tacta-color-background, #181818)
        );
        width: clamp(100px, 24cqi, 280px);
        height: 26px;
        border-radius: var(--tacta-radius-card, 16px);
      }
      tacta-document-explorer {
        width: min(var(--tacta-explorer-width, 100%), calc((100% - 5px) / 2));
        flex-shrink: 0;
      }
      .empty {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
        gap: 12px;
        height: 100%;
        min-height: 180px;
        text-align: center;
        padding: 24px;
        box-sizing: border-box;
        color: var(--tacta-color-muted, #a3a3a5);
        font-size: var(--tacta-font-size-label, var(--tacta-text-md));
      }
      @container (max-width: 560px) {
        tacta-explorer-splitter {
          display: none;
        }
        .body {
          flex-direction: column-reverse;
        }
        tacta-document-explorer {
          width: 100%;
          max-height: 210px;
        }
        .toolbar,
        :host([hide-tabs]) .toolbar {
          padding-inline: 10px;
        }
        :host([hide-tabs]) .document {
          padding-left: 0;
        }
      }
    `,
  ];

  private renderDocument(active?: WorkspaceEntry): TemplateResult {
    if (active) {
      return html`<slot></slot>`;
    }
    if (this.loading) {
      return html`<div class="tacta-document-skeleton" aria-busy="true">
        <tacta-document-skeleton></tacta-document-skeleton>
      </div>`;
    }
    return html`<div class="empty">
      ${icon("folder", 30)}
      <strong>${text.workspace}</strong>
      <span>${text.selectDocument}</span>
    </div>`;
  }

  private renderTabs(): TemplateResult<1> | typeof nothing {
    if (this.hideTabs) {
      return nothing;
    }
    return html`<tacta-document-tabs
      .tabs=${this.tabs}
      .active=${this.active}
      .panelControls=${this.panelControls}
      .maximized=${this.maximized}
      @explorer-reveal=${this.revealExplorer}
    ></tacta-document-tabs>`;
  }

  private renderSidebarToggle(): TemplateResult<1> | typeof nothing {
    if (!this.sidebarToggle) {
      return nothing;
    }
    return html`<button
      class="icon-button sidebar-toggle"
      aria-label=${panelText.toggleSidebar}
      aria-keyshortcuts=${shortcutAria(this.sidebarShortcut)}
      ${tooltip(
        uiText.withShortcut({
          label: panelText.toggleSidebar,
          shortcut: shortcutLabel(this.sidebarShortcut),
        }),
      )}
      @click=${this.openSidebar}
    >
      ${icon("panelLeft", 16)}
    </button>`;
  }

  private renderBreadcrumb(path: string): TemplateResult<1> {
    if (this.loading && !this.entries.length) {
      return html`<tacta-skeleton class="breadcrumb-loading" aria-hidden="true"></tacta-skeleton>`;
    }
    return html`<tacta-workspace-breadcrumb
      .entries=${this.entries}
      .path=${path}
    ></tacta-workspace-breadcrumb>`;
  }

  override render(): TemplateResult<1> {
    const active = this.tabs.find((tab) => tab.id === this.active);
    return html`${this.renderTabs()}
      <div class="toolbar">
        <div class="toolbar-start">
          ${this.renderSidebarToggle()} ${this.renderBreadcrumb(active?.path ?? "")}
        </div>
        <div class="toolbar-actions">
          <slot name="document-actions"></slot>
          <button
            class="icon-button"
            aria-label=${text.refresh}
            ?disabled=${this.loading}
            @click=${this.refreshWorkspace}
          >
            ${icon("refresh", 14)}
          </button>
          <button
            class="icon-button explorer-toggle"
            aria-label=${text.fileExplorer}
            aria-pressed=${this.explorer}
            @click=${() => (this.explorer = !this.explorer)}
          >
            ${icon("folder", 16)}
          </button>
        </div>
      </div>
      <div
        class="body ${this.resizing ? "resizing" : ""}"
        style=${this.explorerWidth ? `--tacta-explorer-width:${this.explorerWidth}px` : ""}
      >
        <section
          class="document"
          id="document-content"
          role=${this.contentRole}
          aria-label=${active?.label ?? active?.path ?? text.workspace}
        >
          ${this.renderDocument(active)}
        </section>
        <tacta-explorer-splitter
          .value=${this.explorerWidth}
          ?resizing=${this.resizing}
          ?hidden=${!this.explorer}
          @explorer-resize=${this.resizeExplorer}
        ></tacta-explorer-splitter>
        <tacta-document-explorer
          .entries=${this.entries}
          .active=${this.active}
          .path=${active?.path ?? ""}
          .loading=${this.loading}
          .state=${this.explorerState}
          ?hidden=${!this.explorer}
        >
          <slot name="explorer-notice" slot="notice"></slot>
        </tacta-document-explorer>
      </div>`;
  }
}
