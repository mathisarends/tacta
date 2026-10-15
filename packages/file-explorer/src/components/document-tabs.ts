import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { agentText as text } from "../messages/index.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";
import { repeat } from "lit/directives/repeat.js";
import { panelText, workspaceTabBarStyles } from "@tacta/workspace-panel";
import "./document-tab.js";

export class DocumentTabs extends LitElement {
  @property({ attribute: false }) tabs: WorkspaceEntry[] = [];
  @property({ attribute: false }) panel: HTMLElement | null = null;
  @property() active = "";
  @property({ type: Boolean }) panelControls = false;
  @property({ type: Boolean }) maximized = false;

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("active")) {
      this.tab(this.active)?.scrollIntoView({ block: "nearest", inline: "nearest" });
    }
  }

  private tab(id: string): HTMLElement | undefined {
    return [...this.renderRoot.querySelectorAll<HTMLElement>("tacta-document-tab")].find(
      (element) => element.dataset.id === id,
    );
  }

  private emit(name: string, detail?: string): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private focusTab(id: string): void {
    void this.updateComplete.then(() => {
      const tab = this.tab(id);
      tab?.focus();
      tab?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  private onRailScroll(event: Event): void {
    const rail = event.currentTarget as HTMLElement;
    rail.toggleAttribute("data-scrolled", rail.scrollLeft > 0);
  }

  private onTabKey(event: KeyboardEvent, id: string): void {
    if ((event.composedPath()[0] as Element).role !== "tab") {
      return;
    }
    const index = this.tabs.findIndex((tab) => tab.id === id);
    let next: number;
    switch (event.key) {
      case "ArrowRight":
        next = (index + 1) % this.tabs.length;
        break;
      case "ArrowLeft":
        next = (index - 1 + this.tabs.length) % this.tabs.length;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = this.tabs.length - 1;
        break;
      case "Delete":
        event.preventDefault();
        this.emit("document-close", id);
        void this.updateComplete.then(() => this.focusTab(this.active));
        return;
      default:
        return;
    }
    event.preventDefault();
    const tab = this.tabs[next];
    if (tab) {
      this.emit("document-open", tab.id);
      this.focusTab(tab.id);
    }
  }

  static override styles = [
    workspaceStyles,
    workspaceTabBarStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
    `,
  ];

  private renderPanelControls(): TemplateResult<1> | typeof nothing {
    if (!this.panelControls) {
      return nothing;
    }
    const maximizeLabel = this.maximized ? panelText.restore : panelText.maximize;
    return html`<button
        class="icon-button"
        aria-label=${maximizeLabel}
        @click=${() => this.emit("toggle-maximize")}
      >
        ${icon(this.maximized ? "minimize" : "maximize", 15)}
      </button>
      <button
        class="icon-button"
        aria-label=${panelText.closePanel}
        @click=${() => this.emit("close-workspace")}
      >
        ${icon("close", 16)}
      </button>`;
  }

  private renderTab(entry: WorkspaceEntry): TemplateResult<1> {
    return html`<tacta-document-tab
      class="tab"
      .entry=${entry}
      .panel=${this.panel}
      ?active=${entry.id === this.active}
      ?preview=${Boolean(entry.preview)}
      data-id=${entry.id}
      @keydown=${(event: KeyboardEvent) => this.onTabKey(event, entry.id)}
    ></tacta-document-tab>`;
  }

  override render(): TemplateResult<1> {
    return html`<header class="tab-bar">
      <div class="tab-strip">
        <div
          class="tab-scroll"
          role="tablist"
          aria-label=${text.openDocuments}
          @scroll=${this.onRailScroll}
        >
          ${repeat(
            this.tabs,
            (entry) => entry.id,
            (entry) => this.renderTab(entry),
          )}
        </div>
        <button
          class="icon-button add-tab"
          aria-label=${text.openDocument}
          @click=${() => this.emit("explorer-reveal")}
        >
          ${icon("plus", 18)}
        </button>
      </div>
      ${this.renderPanelControls()}
    </header>`;
  }
}
