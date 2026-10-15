import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { settingsText } from "./messages/index.js";
import type { PromptTemplate } from "./data/prompt-template-types.js";

export class PromptTemplateCard extends LitElement {
  @property({ attribute: false }) template!: PromptTemplate;
  @property({ type: Boolean }) disabled = false;

  private emit(name: "template-edit-request" | "template-delete-request"): void {
    if (this.disabled) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<PromptTemplate>(name, {
        detail: this.template,
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
    }
    article {
      display: flex;
      align-items: start;
      gap: 14px;
      padding: 18px 4px;
      border-bottom: 1px solid var(--tacta-color-border, #ffffff0d);
    }
    .badge {
      display: grid;
      place-items: center;
      flex: 0 0 36px;
      height: 36px;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .copy {
      flex: 1;
      min-width: 0;
      display: grid;
      gap: 7px;
    }
    .heading {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px 12px;
      min-width: 0;
    }
    strong {
      overflow-wrap: anywhere;
      font-weight: var(--tacta-font-weight-button, var(--tacta-font-weight-medium));
      font-size: var(--tacta-font-size-body, var(--tacta-text-base));
    }
    .preview {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
      margin: 0;
      color: var(--tacta-color-muted, #a3a3a5);
      overflow: hidden;
      overflow-wrap: anywhere;
      line-height: var(--tacta-line-height-caption, 1.5);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    }
    code {
      overflow-wrap: anywhere;
      color: var(--tacta-color-muted, #a3a3a5);
      font-family: var(--tacta-font-mono, ui-monospace, monospace);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    }
    .actions {
      display: flex;
      gap: 2px;
    }
    .delete:hover:not(:disabled) {
      color: var(--tacta-color-error, #f0aaa1);
      background: var(--tacta-color-error-surface, #302325);
    }
    @media (max-width: 650px) {
      article {
        gap: 10px;
      }
      .actions {
        flex-direction: column;
      }
    }
  `;

  override render(): TemplateResult<1> {
    const text = settingsText.templates;
    const template = this.template;
    return html`<article aria-label=${template.title}>
      <span class="badge" aria-hidden="true">${icon("clipboard", 18)}</span>
      <div class="copy">
        <div class="heading">
          <strong>${template.title}</strong><code>/prompt/${template.command}</code>
        </div>
        <p class="preview">${template.content}</p>
      </div>
      <div class="actions">
        <button
          class="icon-button"
          ?disabled=${this.disabled}
          aria-label=${text.editNamed({ name: template.title })}
          ${tooltip(text.editNamed({ name: template.title }))}
          @click=${() => this.emit("template-edit-request")}
        >
          ${icon("pencil", 16)}
        </button>
        <button
          class="icon-button delete"
          ?disabled=${this.disabled}
          aria-label=${text.deleteNamed({ name: template.title })}
          ${tooltip(text.deleteNamed({ name: template.title }))}
          @click=${() => this.emit("template-delete-request")}
        >
          ${icon("trash", 16)}
        </button>
      </div>
    </article>`;
  }
}
