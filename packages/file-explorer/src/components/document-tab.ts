import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { uiText } from "@tacta/core/messages";
import { workspaceTabStyles } from "@tacta/workspace-panel";
import { agentText as text } from "../messages/index.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";
import { fileIcon } from "./file-icon.js";

function tabName(entry: WorkspaceEntry): string {
  return entry.label ?? entry.path.split("/").at(-1) ?? entry.path;
}

export class DocumentTab extends LitElement {
  @property({ attribute: false }) entry!: WorkspaceEntry;
  @property({ attribute: false }) panel: HTMLElement | null = null;
  @property({ type: Boolean, reflect: true }) active = false;
  @property({ type: Boolean, reflect: true }) preview = false;
  @query("[role=tab]") private tabButton!: HTMLButtonElement;
  static override shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  private get name(): string {
    return tabName(this.entry);
  }

  protected override updated(): void {
    this.tabButton.ariaControlsElements = this.panel ? [this.panel] : [];
  }

  private emit(name: string): void {
    this.dispatchEvent(
      new CustomEvent<string>(name, { detail: this.entry.id, bubbles: true, composed: true }),
    );
  }

  private onOpen(): void {
    this.emit("document-open");
  }

  private onClose(): void {
    this.emit("document-close");
  }

  static override styles = [
    workspaceStyles,
    workspaceTabStyles,
    css`
      .tab-button > img {
        flex-shrink: 0;
      }
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

  override render(): TemplateResult<1> {
    return html`<button
        class="tab-button"
        role="tab"
        aria-label=${this.name}
        aria-description=${this.entry.dirty ? text.dirty : nothing}
        aria-selected=${this.active}
        tabindex=${this.active ? "0" : "-1"}
        title=${this.entry.path}
        @click=${this.onOpen}
      >
        ${fileIcon(this.entry.path, 16, this.entry.icon)}<span class="tab-name">${this.name}</span>
        ${this.renderDirty()}
      </button>
      <button
        class="tab-close"
        aria-label=${uiText.closeItem({ name: this.name })}
        @click=${this.onClose}
      >
        ${icon("close", 14)}
      </button>`;
  }
}
