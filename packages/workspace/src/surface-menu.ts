import { css, html, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, query, state } from "lit/decorators.js";
import { menuStyles } from "@tacta/core/styles/menu";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { positionMenu } from "@tacta/core/menu-position";
import { tooltip } from "@tacta/core/tooltip";
import { panelText } from "./messages/index.js";
import type { PickerClose, SurfacePicker } from "./surface-picker.js";
import "./surface-picker.js";

export class SurfaceMenu extends LitElement {
  @property({ attribute: false }) opened: string[] = [];
  @state() private open = false;
  @query(".add-tab", true) private trigger!: HTMLButtonElement;
  @query(".tacta-surface-menu", true) private menu!: HTMLElement;
  @query("tacta-surface-picker", true) private picker!: SurfacePicker;

  readonly close = (): void => {
    this.menu?.hidePopover();
    this.open = false;
  };

  override connectedCallback(): void {
    super.connectedCallback();
    window.addEventListener("resize", this.close);
  }

  override disconnectedCallback(): void {
    window.removeEventListener("resize", this.close);
    super.disconnectedCallback();
  }

  show(): void {
    this.menu.showPopover();
    this.reveal();
  }

  private reveal(): void {
    positionMenu(this.menu, this.trigger);
    if (!this.menu.contains(this.shadowRoot?.activeElement ?? null)) {
      this.picker.focusFirst();
    }
  }

  private onBeforeToggle(event: ToggleEvent): void {
    this.open = event.newState === "open";
  }

  private onToggle(event: ToggleEvent): void {
    if (event.newState === "open") {
      this.reveal();
    }
  }

  private onPickerClose(event: CustomEvent<PickerClose>): void {
    event.stopPropagation();
    this.close();
    if (event.detail.restoreFocus) {
      this.trigger.focus();
    }
  }

  static override styles = css`
    ${workspaceStyles}
    ${menuStyles}
    :host {
      display: contents;
    }
    .add-tab {
      flex: 0 0 32px;
      border-radius: var(--tacta-radius-tab, 8px);
    }
    .tacta-surface-menu {
      min-width: 220px;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<button
        part="icon-button"
        class="icon-button add-tab"
        aria-haspopup="menu"
        aria-expanded=${this.open}
        aria-controls="tacta-surface-menu"
        popovertarget="tacta-surface-menu"
        aria-label=${panelText.openSurface}
        ${tooltip(panelText.openSurface)}
      >
        ${icon("plus", 18)}
      </button>
      <div
        id="tacta-surface-menu"
        class="menu tacta-surface-menu"
        popover="auto"
        role="menu"
        aria-label=${panelText.openSurface}
        @beforetoggle=${this.onBeforeToggle}
        @toggle=${this.onToggle}
      >
        <tacta-surface-picker
          menu
          .opened=${this.opened}
          @picker-close=${this.onPickerClose}
        ></tacta-surface-picker>
      </div>`;
  }
}
