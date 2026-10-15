import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon, type IconName } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { shortcutAria, shortcutLabel } from "@tacta/core/keyboard/shortcuts";
import { uiText } from "@tacta/core/messages";
import { imageShortcuts } from "./image-shortcuts.js";
import "./image-color-picker.js";
import type { ImageTool } from "./annotation-types.js";
import { imageEditorText as text } from "./messages/index.js";

export class ImageTools extends LitElement {
  @property() tool: ImageTool = "draw";
  @property() color = "";
  @property({ type: Number }) size = 4;
  @property({ type: Boolean }) canUndo = false;
  @property({ type: Boolean }) canRedo = false;
  @property({ type: Boolean }) disabled = false;

  private emit<T>(name: string, detail: T): void {
    if (!this.disabled) {
      this.dispatchEvent(new CustomEvent<T>(name, { detail, bubbles: true, composed: true }));
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      align-items: center;
      gap: var(--tacta-image-editor-gap, 6px);
    }
    .icon-button {
      width: var(--tacta-image-editor-control, 34px);
      height: var(--tacta-image-editor-control, 34px);
      flex: none;
    }
    [aria-pressed="true"] {
      background: var(--tacta-color-accent-soft, #ffffff14);
      color: var(--tacta-color-text, #e6e6e6);
    }
    input[type="range"] {
      width: var(--tacta-image-editor-range, 64px);
      min-width: 0;
      accent-color: var(--tacta-color-text, #e6e6e6);
    }
  `;

  private renderTool(tool: ImageTool, name: IconName): TemplateResult<1> {
    return html`<button
      class="icon-button"
      aria-label=${text[tool]}
      aria-pressed=${this.tool === tool}
      ${tooltip(text[tool])}
      ?disabled=${this.disabled}
      @click=${() => this.emit("tool-change", tool)}
    >
      ${icon(name, 18)}
    </button>`;
  }

  override render(): TemplateResult<1> {
    return html`${this.renderTool("draw", "pencil")}${this.renderTool("text", "type")}${this.renderTool("erase", "eraser")}
      <tacta-image-color-picker
        .color=${this.color}
        .disabled=${this.disabled}
      ></tacta-image-color-picker>
      <input
        type="range"
        min="1"
        max="24"
        aria-label=${text.size}
        .value=${String(this.size)}
        ?disabled=${this.disabled}
        @input=${(event: Event) => this.emit("size-change", Number((event.target as HTMLInputElement).value))}
      />
      <button
        class="icon-button"
        aria-label=${text.undo}
        aria-keyshortcuts=${shortcutAria(imageShortcuts.undo)}
        ${tooltip(uiText.withShortcut({ label: text.undo, shortcut: shortcutLabel(imageShortcuts.undo) }))}
        ?disabled=${!this.canUndo}
        @click=${() => this.emit("history-undo", undefined)}
      >
        ${icon("undo", 18)}
      </button>
      <button
        class="icon-button"
        aria-label=${text.redo}
        aria-keyshortcuts=${shortcutAria(imageShortcuts.redo)}
        ${tooltip(uiText.withShortcut({ label: text.redo, shortcut: shortcutLabel(imageShortcuts.redo) }))}
        ?disabled=${!this.canRedo}
        @click=${() => this.emit("history-redo", undefined)}
      >
        ${icon("redo", 18)}
      </button>`;
  }
}
