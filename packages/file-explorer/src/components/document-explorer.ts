import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { agentText as text } from "../messages/index.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";
export interface ExplorerState {
  collapsed: string[];
  revealed: string[];
}
import {
  ancestorPaths,
  buildTree,
  childPath,
  isOpen,
  openDirectoryIds,
  type Folder,
  type FolderState,
} from "../data/explorer-tree.js";
import "./document-explorer-skeleton.js";
import type { FolderToggle } from "./explorer-folder-row.js";
import "./explorer-file-row.js";
import "./explorer-folder-row.js";

export class DocumentExplorer extends LitElement {
  @property({ attribute: false }) entries: WorkspaceEntry[] = [];
  @property() active = "";
  @property() path = "";
  @property({ type: Boolean }) loading = false;
  @property({ attribute: false }) state: ExplorerState = { collapsed: [], revealed: [] };
  @state() private search = "";
  @state() private collapsed = new Set<string>();
  @state() private revealed = new Set<string>();
  private tree: Folder = { folders: new Map(), files: [] };
  private scrollPending = false;
  private openedDirectories = new Set<string>();

  private get folderState(): FolderState {
    return { collapsed: this.collapsed, revealed: this.revealed };
  }

  private get searching(): boolean {
    return this.search.trim() !== "";
  }

  private get skeletonOnly(): boolean {
    return this.loading && !this.entries.length;
  }

  private get navClass(): string {
    if (this.skeletonOnly) {
      return "loading";
    }
    return "";
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("state")) {
      const saved = this.state;
      this.collapsed = new Set(saved.collapsed);
      this.revealed = new Set(saved.revealed);
    }
    if (changed.has("path") && this.path) {
      this.reveal(this.path);
    }
    if (changed.has("entries") || changed.has("search")) {
      this.tree = buildTree(this.entries, this.search);
    }
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (!changed.has("state") && (changed.has("collapsed") || changed.has("revealed"))) {
      this.dispatchEvent(
        new CustomEvent<ExplorerState>("explorer-state-change", {
          detail: { collapsed: [...this.collapsed], revealed: [...this.revealed] },
          bubbles: true,
          composed: true,
        }),
      );
    }
    this.openNewDirectories();
    if (changed.has("active")) {
      this.scrollPending = !!this.active;
    }
    if (this.scrollPending) {
      this.scrollToActive();
    }
  }

  async focusSearch(): Promise<void> {
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLInputElement>("input")?.focus();
  }

  private emit(name: string, detail?: string): void {
    this.dispatchEvent(new CustomEvent(name, { detail, bubbles: true, composed: true }));
  }

  private reveal(path: string): void {
    const ancestors = ancestorPaths(path);
    if (ancestors.some((ancestor) => this.collapsed.has(ancestor))) {
      this.collapsed = new Set([...this.collapsed].filter((item) => !ancestors.includes(item)));
    }
    if (ancestors.some((ancestor) => !this.revealed.has(ancestor))) {
      this.revealed = new Set([...this.revealed, ...ancestors]);
    }
  }

  private onFolderToggle(event: CustomEvent<FolderToggle>): void {
    event.stopPropagation();
    const { path, expanded } = event.detail;
    const collapsed = new Set(this.collapsed);
    if (expanded) {
      collapsed.add(path);
    } else {
      collapsed.delete(path);
    }
    this.collapsed = collapsed;
    this.revealed = new Set([...this.revealed, path]);
  }

  private openNewDirectories(): void {
    const open = openDirectoryIds(this.tree, this.folderState);
    for (const id of open) {
      if (!this.openedDirectories.has(id)) {
        this.emit("directory-open", id);
      }
    }
    this.openedDirectories = open;
  }

  private scrollToActive(): void {
    const nav = this.renderRoot.querySelector("nav");
    const row = this.renderRoot.querySelector<HTMLElement>("explorer-file-row[active]");
    if (!nav || !row) {
      return;
    }
    this.scrollPending = false;
    const navBox = nav.getBoundingClientRect();
    const visibleTop =
      this.renderRoot.querySelector(".search-header")?.getBoundingClientRect().bottom ?? navBox.top;
    const rowBox = row.getBoundingClientRect();
    if (rowBox.top >= visibleTop && rowBox.bottom <= navBox.bottom) {
      return;
    }
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    row.scrollIntoView({ block: "center", behavior: reducedMotion ? "auto" : "smooth" });
  }

  private onSearch(event: InputEvent): void {
    this.search = (event.target as HTMLInputElement).value;
  }

  static override styles = [
    workspaceStyles,
    css`
      :host {
        display: flex;
        min-height: 0;
        overflow: hidden;
      }
      nav {
        flex: 1;
        min-width: 0;
        min-height: 0;
        overflow: auto;
        box-sizing: border-box;
        scrollbar-gutter: stable;
        border-left: 1px solid var(--tacta-color-border, #ffffff0d);
        padding: 0 8px 16px;
      }
      nav.loading {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .search-header {
        position: sticky;
        top: 0;
        z-index: 1;
        flex-shrink: 0;
        padding: 4px 0 10px;
        background: var(--tacta-color-background, #181818);
      }
      tacta-document-explorer-skeleton {
        flex: 1;
        min-height: 0;
      }
      [hidden] {
        display: none !important;
      }
      .search {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 7px 9px;
        border: 1px solid var(--tacta-color-border, #ffffff0d);
        border-radius: var(--tacta-radius-tab, 8px);
        color: var(--tacta-color-muted, #a3a3a5);
        background: var(--tacta-color-sidebar, #1e1f20);
      }
      input {
        width: 100%;
        min-width: 0;
        border: 0;
        background: none;
        padding: 0;
        color: var(--tacta-color-text, #e6e6e6);
        outline: none;
        font-size: var(--tacta-font-size-tree, var(--tacta-font-size-body));
      }
      input:focus-visible {
        outline: none;
        box-shadow: none;
      }
      .search:focus-within {
        border-color: var(--tacta-color-border-strong, #ffffff1f);
      }
      .hint {
        padding: 10px;
        color: var(--tacta-color-muted, #a3a3a5);
        font-size: var(--tacta-font-size-body, var(--tacta-text-base));
        line-height: var(--tacta-line-height-body, 1.6);
      }
      .loading-label {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      @container (max-width: 560px) {
        nav {
          border-left: 0;
          border-bottom: 1px solid var(--tacta-color-border, #ffffff0d);
        }
      }
    `,
  ];

  private renderFolderGroup(
    name: string,
    folder: Folder,
    parent: string,
    depth: number,
  ): TemplateResult<1> {
    const path = childPath(parent, name);
    const expanded = this.searching || isOpen(path, folder, depth, this.folderState);
    return html`<div class="folder-group">
      <tacta-explorer-folder-row
        name=${name}
        path=${path}
        depth=${depth}
        ?expanded=${expanded}
        .entry=${folder.entry}
        @folder-toggle=${this.onFolderToggle}
      ></tacta-explorer-folder-row>
      <div ?hidden=${!expanded}>${this.renderFolder(folder, path, depth + 1)}</div>
    </div>`;
  }

  private renderFolder(folder: Folder, parent = "", depth = 0): TemplateResult {
    return html`${repeat(
      [...folder.folders],
      ([name]) => name,
      ([name, child]) => this.renderFolderGroup(name, child, parent, depth),
    )}${repeat(
      folder.files,
      (entry) => entry.id,
      (entry) =>
        html`<tacta-explorer-file-row
          .entry=${entry}
          depth=${depth}
          ?active=${entry.id === this.active}
        ></tacta-explorer-file-row>`,
    )}`;
  }

  private renderLoading(): TemplateResult | typeof nothing {
    if (!this.loading) {
      return nothing;
    }
    if (this.entries.length) {
      return html`<p class="hint" role="status">${text.loading}</p>`;
    }
    return html`<span class="loading-label" role="status">${text.loading}</span>
      <tacta-document-explorer-skeleton></tacta-document-explorer-skeleton>`;
  }

  private renderEmptyMessage(): TemplateResult | typeof nothing {
    if (this.loading || this.tree.files.length || this.tree.folders.size) {
      return nothing;
    }
    if (this.search) {
      return html`<p class="hint">${text.noMatches}</p>`;
    }
    return html`<p class="hint">${text.workspaceEmpty}</p>`;
  }

  override render(): TemplateResult {
    return html`
      <nav class=${this.navClass} aria-label=${text.fileExplorer} aria-busy=${this.loading}>
        <div class="search-header">
          <label class="search">
            ${icon("search", 13)}<input
              type="search"
              aria-label=${text.filterFiles}
              placeholder=${text.filterFiles}
              ?disabled=${this.skeletonOnly}
              .value=${this.search}
              @input=${this.onSearch}
            />
          </label>
        </div>
        ${this.renderLoading()}
        <slot name="notice"></slot>
        ${this.renderFolder(this.tree)} ${this.renderEmptyMessage()}
      </nav>
    `;
  }
}
