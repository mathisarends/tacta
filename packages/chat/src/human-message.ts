import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { Message } from "./types.js";
import { markdownStyles, renderMarkdown } from "./markdown/index.js";
import "./chat-attachment.js";

export class HumanMessage extends LitElement {
  @property({ attribute: false }) message!: Message;

  static override styles = css`
    ${workspaceStyles}
    ${markdownStyles}
    .markdown {
      font-size: var(--tacta-font-size-chat, var(--tacta-text-xl, 1rem));
    }
    :host {
      display: flex;
      justify-content: flex-end;
    }
    .message {
      max-width: min(85%, 620px);
      min-width: 0;
    }
    .attachments {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
      margin-bottom: 8px;
    }
    .message-body {
      padding: 11px 15px;
      border-radius: var(--tacta-radius-panel, 20px);
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-text, #e6e6e6);
    }
  `;

  override render(): TemplateResult<1> {
    return html`<div part="message" class="message">
      ${this.message.attachments?.length ? html`<div part="attachments" class="attachments">${this.message.attachments.map((file) => html`<tacta-chat-attachment .file=${file}></tacta-chat-attachment>`)}</div>` : nothing}
      ${this.message.text ? html`<div part="message-body" class="message-body markdown">${renderMarkdown(this.message.text)}</div>` : nothing}
    </div>`;
  }
}
