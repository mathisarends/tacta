import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import "@tacta/image-editor";

export class ImagePreview extends LitElement {
  @property() url = "";
  @property() label = "";

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
    }
    tacta-image-editor {
      flex: 1;
      min-height: 0;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<tacta-image-editor .src=${this.url} .filename=${this.label}></tacta-image-editor>`;
  }
}
