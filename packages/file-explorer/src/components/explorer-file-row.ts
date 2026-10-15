import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { icon } from "@tacta/core/icons";
import { agentText as text } from "../messages/index.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";
import { explorerRowStyles } from "./explorer-row.styles.js";
import { fileIcon } from "./file-icon.js";

export class ExplorerFileRow extends LitElement {
  @property({ attribute: false }) entry!: WorkspaceEntry;
  @property({ type: Number }) depth = 0;
  @property({ type: Boolean, reflect: true }) active = false;

  private get name(): string {
    return this.entry.path.split("/").at(-1) ?? this.entry.path;
  }

  private emit(name: "document-open" | "document-delete"): void {
    this.dispatchEvent(
      new CustomEvent<string>(name, { detail: this.entry.id, bubbles: true, composed: true }),
    );
  }

  private onOpen(): void {
    this.emit("document-open");
  }

  private onDelete(): void {
    this.emit("document-delete");
  }

  static override styles = [
    explorerRowStyles,
    css`
      .dirty {
        width: 6px;
        height: 6px;
        border-radius: var(--tacta-radius-round, 50%);
        background: var(--tacta-color-text, #e6e6e6);
        flex-shrink: 0;
      }
    `,
  ];

  private renderDirty(): TemplateResult<1> | typeof nothing {
    if (!this.entry.dirty) {
      return nothing;
    }
    return html`<span class="dirty" aria-label=${text.dirty}></span>`;
  }

  private renderDelete(): TemplateResult<1> | typeof nothing {
    if (!this.entry.deletable) {
      return nothing;
    }
    return html`<button
      class="row-action"
      aria-label=${text.deleteLabel({ name: this.name })}
      @click=${this.onDelete}
    >
      ${icon("trash", 14)}
    </button>`;
  }

  override render(): TemplateResult<1> {
    return html`<button
        class="tree-row file"
        style=${`--tacta-depth:${this.depth}`}
        title=${this.entry.path}
        aria-current=${this.active ? "true" : nothing}
        @click=${this.onOpen}
      >
        <span class="file-icon">${fileIcon(this.entry.path, 16, this.entry.icon)}</span>
        <span class="name">${this.name}</span>
        ${this.renderDirty()}
      </button>
      ${this.renderDelete()}`;
  }
}
