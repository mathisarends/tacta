import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { uiText } from "@tacta/core/messages";
import { tooltip } from "@tacta/core/tooltip";
import { surfaceIcons, type Surface } from "./surfaces.js";
import { workspaceTabStyles } from "./workspace-tabs.styles.js";

export interface WorkspaceTabData {
  id: string;
  label: string;
  surface: Surface;
  url: string;
  favicon: string;
}

export class WorkspaceTab extends LitElement {
  @property({ attribute: false }) tab!: WorkspaceTabData;
  @property({ type: Boolean, reflect: true }) active = false;

  private get closeLabel(): string {
    return uiText.closeItem({ name: this.tab.label });
  }

  private onClose(event: Event): void {
    event.stopPropagation();
    this.dispatchEvent(
      new CustomEvent<string>("tab-close", { detail: this.tab.id, bubbles: true, composed: true }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    ${workspaceTabStyles}
    .tab-favicon {
      flex-shrink: 0;
      object-fit: contain;
      pointer-events: none;
    }
  `;

  private renderIcon(): TemplateResult {
    if (!this.tab.favicon) {
      return icon(surfaceIcons[this.tab.surface], 16);
    }
    return html`<img
      class="tab-favicon"
      src=${this.tab.favicon}
      alt=""
      width="16"
      height="16"
      draggable="false"
    />`;
  }

  override render(): TemplateResult<1> {
    return html`${this.renderIcon()}<span class="tab-name">${this.tab.label}</span
      ><button
        part="tab-close"
        class="tab-close"
        aria-label=${this.closeLabel}
        ${tooltip(this.closeLabel)}
        @click=${this.onClose}
      >
        ${icon("close", 14)}
      </button>`;
  }
}
