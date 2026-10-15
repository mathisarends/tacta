import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { menuStyles } from "@tacta/core/styles/menu";
import { icon } from "@tacta/core/icons";
import { positionMenu } from "@tacta/core/menu-position";
import { agentText as text } from "../messages/index.js";
import type { WorkspaceEntry } from "../data/workspace-types.js";
import { fileIcon } from "./file-icon.js";
import type { PathPicker } from "./path-picker.js";
import "./path-picker.js";

export class WorkspaceBreadcrumb extends LitElement {
  @property({ attribute: false }) entries: WorkspaceEntry[] = [];
  @property() path = "";
  @state() private folder: string | null = null;
  @state() private triggerIndex = -1;
  @query("[popover]") private menu?: HTMLElement;
  @query("tacta-path-picker") private picker?: PathPicker;

  private readonly dismiss = (): void => {
    this.menu?.hidePopover();
    this.folder = null;
  };

  private get parts(): string[] {
    if (!this.path) {
      return [];
    }
    return this.path.split("/");
  }

  private get trigger(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`[data-index="${this.triggerIndex}"]`);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.dismiss);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.dismiss);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("path")) {
      this.dismiss();
    }
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    const { menu, picker, trigger } = this;
    if (this.folder === null || !menu || !picker || !trigger) {
      return;
    }
    if (!menu.matches(":popover-open")) {
      menu.showPopover();
    }
    if (changed.has("folder") || changed.has("triggerIndex")) {
      void this.showPicker(menu, picker, trigger);
    }
  }

  private async showPicker(
    menu: HTMLElement,
    picker: PathPicker,
    trigger: HTMLElement,
  ): Promise<void> {
    picker.expandCurrent();
    await picker.updateComplete;
    positionMenu(menu, trigger);
    picker.focusItem(this.parts.slice(0, this.triggerIndex + 1).join("/"));
  }

  private open(index: number): void {
    if (this.folder !== null && this.triggerIndex === index) {
      this.dismiss();
      return;
    }
    const parts = this.parts;
    this.triggerIndex = index;
    this.folder = parts.slice(0, Math.min(index, parts.length - 1)).join("/");
  }

  private close(): void {
    this.dismiss();
    this.trigger?.focus();
  }

  private pick(event: CustomEvent<string>): void {
    this.close();
    this.dispatchEvent(
      new CustomEvent("document-open", { detail: event.detail, bubbles: true, composed: true }),
    );
  }

  private onToggle(event: ToggleEvent): void {
    if (
      event.newState === "closed" &&
      !(event.currentTarget as HTMLElement).matches(":popover-open")
    ) {
      this.folder = null;
    }
  }

  static override styles = [
    workspaceStyles,
    menuStyles,
    css`
      :host {
        display: block;
        min-width: 0;
      }
      .trail {
        display: flex;
        align-items: center;
        gap: 4px;
        min-width: 0;
        padding: 5px 9px;
        border-radius: var(--tacta-radius-pill, 999px);
        background: var(--tacta-color-surface, #252627);
        color: var(--tacta-color-muted, #a3a3a5);
        font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
        overflow: hidden;
      }
      button {
        font: inherit;
        cursor: pointer;
        color: inherit;
        border: 0;
        background: transparent;
      }
      .crumb {
        display: flex;
        align-items: center;
        gap: 6px;
        min-width: 0;
        padding: 3px 4px;
        border-radius: var(--tacta-radius-subtle, 5px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .crumb > img {
        flex-shrink: 0;
        vertical-align: middle;
      }
      .crumb-name {
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .crumb:last-child {
        color: var(--tacta-color-text, #e6e6e6);
        font-weight: var(--tacta-font-weight-semibold, 600);
      }
      .crumb:hover,
      .crumb[aria-expanded="true"] {
        background: var(--tacta-color-panel-hover, #2d2e2f);
      }
      .trail > svg {
        flex-shrink: 0;
        transform: rotate(-90deg);
        opacity: 0.6;
      }
      .crumb:focus-visible {
        outline: 1px solid var(--tacta-color-focus, #9b9b9e);
        outline-offset: -1px;
        background: var(--tacta-color-panel-hover, #2d2e2f);
      }
      .menu {
        width: 300px;
        max-width: calc(100vw - 24px);
        font-size: var(--tacta-font-size-tree, var(--tacta-font-size-body));
      }
    `,
  ];

  private renderSeparator(index: number): TemplateResult<2> | typeof nothing {
    if (!index) {
      return nothing;
    }
    return icon("chevronDown", 12);
  }

  private renderCrumbIcon(index: number): TemplateResult | typeof nothing {
    if (!index || index !== this.parts.length) {
      return nothing;
    }
    const entry = this.entries.find((entry) => entry.path === this.path);
    return fileIcon(this.path, 16, entry?.icon);
  }

  private renderCrumb(part: string, index: number): TemplateResult {
    const expanded = this.folder !== null && this.triggerIndex === index;
    return html`
      ${this.renderSeparator(index)}
      <button
        class="crumb"
        data-index=${index}
        title=${part}
        aria-expanded=${expanded}
        aria-controls="tacta-path-picker"
        @click=${() => this.open(index)}
      >
        ${this.renderCrumbIcon(index)}<span class="crumb-name">${part}</span>
      </button>
    `;
  }

  private renderTrail(): TemplateResult[] {
    return [text.workspace, ...this.parts].map((part, index) => this.renderCrumb(part, index));
  }

  private renderPicker(): TemplateResult | typeof nothing {
    if (this.folder === null) {
      return nothing;
    }
    return html`<tacta-path-picker
      .entries=${this.entries}
      .root=${this.folder}
      .current=${this.path}
      @file-pick=${this.pick}
      @picker-dismiss=${this.close}
    ></tacta-path-picker>`;
  }

  override render(): TemplateResult<1> {
    return html`<div class="trail" aria-label=${text.documentPath}>${this.renderTrail()}</div>
      <div id="tacta-path-picker" class="menu" popover="auto" @toggle=${this.onToggle}>
        ${this.renderPicker()}
      </div>`;
  }
}
