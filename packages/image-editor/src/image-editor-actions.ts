import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { imageEditorText as text } from "./messages/index.js";

export class ImageEditorActions extends LitElement {
  @property({ type: Number }) zoom = 1;
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) attachable = false;

  private zoomTo(value: number): void {
    this.dispatchEvent(
      new CustomEvent<number>("zoom-change", {
        detail: Math.max(0.25, Math.min(4, value)),
        bubbles: true,
        composed: true,
      }),
    );
  }

  private exportImage(attach: boolean): void {
    if (this.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<boolean>("image-export", {
        detail: attach,
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--tacta-image-editor-gap, 6px);
      padding: var(--tacta-image-editor-actions-padding, 12px);
    }
    .spacer {
      flex: 1;
    }
  `;

  private renderAttach(): TemplateResult<1> | typeof nothing {
    if (!this.attachable) {
      return nothing;
    }
    return html`<button
      class="button"
      ?disabled=${this.disabled}
      @click=${() => this.exportImage(true)}
    >
      ${text.attach}
    </button>`;
  }

  override render(): TemplateResult<1> {
    return html`<button
        class="icon-button"
        aria-label=${text.zoomOut}
        ${tooltip(text.zoomOut)}
        ?disabled=${this.zoom <= 0.25}
        @click=${() => this.zoomTo(this.zoom - 0.25)}
      >
        ${icon("minus", 16)}
      </button>
      <button class="button" @click=${() => this.zoomTo(1)}>${text.fit}</button>
      <button
        class="icon-button"
        aria-label=${text.zoomIn}
        ${tooltip(text.zoomIn)}
        ?disabled=${this.zoom >= 4}
        @click=${() => this.zoomTo(this.zoom + 0.25)}
      >
        ${icon("plus", 16)}
      </button>
      <span class="spacer"></span>
      <button
        class="icon-button"
        aria-label=${text.download}
        ${tooltip(text.download)}
        ?disabled=${this.disabled}
        @click=${() => this.exportImage(false)}
      >
        ${icon("download", 18)}
      </button>
      ${this.renderAttach()}`;
  }
}
