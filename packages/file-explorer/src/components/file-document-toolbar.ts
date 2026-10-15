import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { agentText as text } from "../messages/index.js";
import { fileSize } from "../file-size.js";
import { icon } from "@tacta/core/icons";

export type FileModes = "none" | "markdown" | "code";

export class FileDocumentToolbar extends LitElement {
  @property() format = "";
  @property({ attribute: false }) size: number | null = null;
  @property() modes: FileModes = "none";
  @property({ type: Boolean }) source = false;
  @property() status = "";

  private choose(source: boolean): void {
    this.dispatchEvent(
      new CustomEvent<boolean>("mode-change", { detail: source, bubbles: true, composed: true }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      flex-shrink: 0;
    }
    .toolbar {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .file-meta {
      display: flex;
      align-items: center;
      gap: 8px;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      white-space: nowrap;
    }
    .format {
      padding: 2px 6px;
      border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      border-radius: var(--tacta-radius-subtle, 5px);
      font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
      color: var(--tacta-color-text, #e6e6e6);
    }
    .mode {
      border: 0;
      padding: 6px 10px;
      border-radius: var(--tacta-radius-inset, 6px);
      display: flex;
      gap: 6px;
      align-items: center;
      background: transparent;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      white-space: nowrap;
    }
    .mode:hover {
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-text, #e6e6e6);
    }
    .status {
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    }
    .status:empty {
      display: none;
    }
  `;

  private renderMeta(): TemplateResult<1> | typeof nothing {
    if (this.size === null) {
      return nothing;
    }
    return html`<span class="file-meta"
      ><span class="format">${this.format}</span>${fileSize(this.size)}</span
    >`;
  }

  private renderModes(): TemplateResult<1> | typeof nothing {
    if (this.modes === "none") {
      return nothing;
    }
    return html`<button class="mode" @click=${() => this.choose(!this.source)}>
      ${icon(this.source ? "eye" : "code", 14)}${this.source ? text.showPreview : text.showSource}
    </button>`;
  }

  override render(): TemplateResult<1> {
    return html`<div class="toolbar">
      ${this.renderMeta()}
      <span class="status" role="status">${this.status}</span>
      ${this.renderModes()}
    </div>`;
  }
}
