import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { ImageTextResult } from "./annotation-types.js";
import { imageEditorText as text } from "./messages/index.js";

export class ImageTextInput extends LitElement {
  @property() value = "";
  private finished = false;

  protected override firstUpdated(): void {
    this.renderRoot.querySelector("textarea")?.focus();
  }

  private finish(cancel: boolean, focusCanvas: boolean): void {
    if (this.finished) {
      return;
    }
    this.finished = true;
    this.dispatchEvent(
      new CustomEvent<ImageTextResult>("text-finish", {
        detail: { text: cancel ? null : this.value, focusCanvas },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private onKey(event: KeyboardEvent): void {
    if (event.isComposing) {
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.finish(true, true);
    } else if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      this.finish(false, true);
    }
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    textarea {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: var(
        --tacta-color-image-text-input,
        color-mix(in srgb, var(--tacta-color-image-editor-background) 45%, transparent)
      );
      color: var(--tacta-annotation-color);
      font-family: var(--tacta-font-image-annotation, sans-serif);
      font-size: var(--tacta-annotation-size);
      line-height: var(--tacta-line-height-image-annotation, 1.2);
      resize: none;
      overflow: auto;
    }
    textarea:focus-visible {
      outline: 1px dashed var(--tacta-color-focus, #9b9b9e);
      outline-offset: var(--tacta-image-editor-text-outline-offset, -1px);
    }
  `;

  override render(): TemplateResult<1> {
    return html`<textarea
      data-raw-keys
      aria-label=${text.textLabel}
      title=${text.textHelp}
      placeholder=${text.placeText}
      rows=${Math.max(1, this.value.split("\n").length)}
      wrap="off"
      spellcheck="false"
      .value=${live(this.value)}
      @input=${(event: Event) => (this.value = (event.target as HTMLTextAreaElement).value)}
      @keydown=${this.onKey}
      @blur=${() => this.finish(false, false)}
    ></textarea>`;
  }
}
