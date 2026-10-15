import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { agentText as text } from "../messages/index.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";
import { explorerRowStyles } from "./explorer-row.styles.js";

export type FolderToggle = { path: string; expanded: boolean };

export class ExplorerFolderRow extends LitElement {
  @property() name = "";
  @property() path = "";
  @property({ type: Number }) depth = 0;
  @property({ type: Boolean }) expanded = false;
  @property({ attribute: false }) entry?: WorkspaceEntry;

  private get loading(): boolean {
    return Boolean(this.entry?.loading);
  }

  private get chevronClass(): string {
    if (this.expanded) {
      return "chevron expanded";
    }
    return "chevron";
  }

  private get folderIconClass(): string {
    if (this.loading) {
      return "folder-icon loading";
    }
    return "folder-icon";
  }

  private onToggle(): void {
    this.dispatchEvent(
      new CustomEvent<FolderToggle>("folder-toggle", {
        detail: { path: this.path, expanded: this.expanded },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onDelete(): void {
    this.dispatchEvent(
      new CustomEvent<string>("document-delete", {
        detail: this.entry?.id,
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = [
    explorerRowStyles,
    css`
      .folder-icon {
        display: flex;
        flex: 0 0 14px;
        width: 14px;
        height: 14px;
      }
      .folder-icon.loading {
        animation: directory-loading var(--tacta-motion-duration-spin, 850ms) linear infinite;
      }
      .chevron {
        transition: transform var(--tacta-motion-duration-control, 160ms) ease;
      }
      @keyframes directory-loading {
        to {
          transform: rotate(360deg);
        }
      }
    `,
  ];

  private renderFolderIcon(): TemplateResult {
    if (this.loading) {
      return icon("refresh", 14);
    }
    return icon("folder", 14);
  }

  private renderDelete(): TemplateResult<1> | typeof nothing {
    if (!this.entry?.deletable) {
      return nothing;
    }
    const name = this.entry.path.split("/").at(-1) ?? this.entry.path;
    return html`<button
      class="row-action"
      aria-label=${text.deleteLabel({ name })}
      @click=${this.onDelete}
    >
      ${icon("trash", 14)}
    </button>`;
  }

  override render(): TemplateResult<1> {
    return html`<button
        class="tree-row folder"
        style=${`--tacta-depth:${this.depth}`}
        aria-expanded=${this.expanded}
        aria-busy=${this.loading ? "true" : nothing}
        data-path=${this.path}
        @click=${this.onToggle}
      >
        <span class=${this.chevronClass}>${icon("chevronDown", 12)}</span>
        <span class=${this.folderIconClass}>${this.renderFolderIcon()}</span
        ><span class="name">${this.name}</span>
      </button>
      ${this.renderDelete()}`;
  }
}
