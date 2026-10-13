import { html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import type { ToolCall } from "../types.js";
import { icon } from "@tacta/core/icons";
import { chatUiText } from "../messages/index.js";
import { presentToolCall, type ToolCallPresentation } from "./presenter.js";
import { toolCallStyles } from "./tool-call.styles.js";
import "./tool-call-detail.js";

export class ToolCallItem extends LitElement {
  @property({ attribute: false }) call!: ToolCall;
  @property({ attribute: false }) presentCall = presentToolCall;
  @state() private expanded = false;

  static override styles = toolCallStyles;

  private renderPreview(presentation: ToolCallPresentation): TemplateResult<1> | typeof nothing {
    if (!presentation.inputPreview) {
      return nothing;
    }
    return html`<span class="preview">${presentation.inputPreview}</span>`;
  }

  private renderStatus(): TemplateResult<1> | typeof nothing {
    const status = this.call.status;
    if (status === "completed") {
      return nothing;
    }
    return html`<span class="status" role="status" aria-label=${chatUiText.tool.status[status]}>
      ${status === "running" ? html`<span class="spinner"></span>` : icon("warning", 13)}
    </span>`;
  }

  private renderDetail(presentation: ToolCallPresentation): TemplateResult<1> | typeof nothing {
    if (!this.expanded) {
      return nothing;
    }
    const running = this.call.status === "running";
    return html`<div part="tool-name" class="tool-name"><code>${this.call.name}</code></div>
      <tacta-tool-call-detail
        .label=${chatUiText.tool.input}
        .value=${presentation.input}
        .emptyText=${chatUiText.tool.noInput}
      ></tacta-tool-call-detail>
      <tacta-tool-call-detail
        .label=${chatUiText.tool.output}
        .value=${presentation.output}
        .emptyText=${running ? chatUiText.tool.waiting : chatUiText.tool.noOutput}
      ></tacta-tool-call-detail>`;
  }

  override render(): TemplateResult<1> {
    const call = this.call;
    const presentation = this.presentCall(call);
    return html`<div part="call" class="call ${call.status} ${this.expanded ? "expanded" : ""}">
      <button
        part="summary"
        class="summary"
        type="button"
        aria-expanded=${this.expanded}
        aria-controls="detail"
        @click=${() => (this.expanded = !this.expanded)}
      >
        <span class="kind-icon" aria-hidden="true">${icon(presentation.icon, 17)}</span>
        <span class="label">
          <span class="title">${presentation.title}</span>
          ${this.renderPreview(presentation)}
        </span>
        ${this.renderStatus()}
        <span class="chevron">${icon("chevronDown", 14)}</span>
      </button>
      <div part="detail" class="detail" id="detail" ?hidden=${!this.expanded}>
        ${this.renderDetail(presentation)}
      </div>
    </div>`;
  }
}
