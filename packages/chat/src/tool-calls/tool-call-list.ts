import { html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import type { ToolCall } from "../types.js";
import { icon } from "@tacta/core/icons";
import { chatUiText } from "../messages/index.js";
import { toolCallStyles } from "./tool-call.styles.js";
import { presentToolCall, type ToolCallPresentation } from "./presenter.js";
import "./tool-call-item.js";

export class ToolCallList extends LitElement {
  @property({ attribute: false }) toolCalls: ToolCall[] = [];
  @property({ attribute: false }) presentCall = presentToolCall;
  @property() summary = "";
  @property({ type: Boolean }) working = false;
  @property() elapsed = "";
  @state() private expanded = false;

  private get currentCall(): ToolCall | undefined {
    if (!this.working) {
      return undefined;
    }
    for (let index = this.toolCalls.length - 1; index >= 0; index--) {
      const call = this.toolCalls[index];
      if (call?.status === "running") {
        return call;
      }
    }
    return this.toolCalls.at(-1);
  }

  static override styles = toolCallStyles;

  private renderActivity(presentation: ToolCallPresentation): TemplateResult<1> {
    return html`<span class="kind-icon" aria-hidden="true">${icon(presentation.icon, 17)}</span>
      <span class="list-caption">
        <span class="list-title" aria-live="polite">${presentation.activity}</span>
        ${
          presentation.activityPreview
            ? html`<span class="list-preview">${presentation.activityPreview}</span>`
            : nothing
        }
      </span>`;
  }

  override render(): typeof nothing | TemplateResult<1> {
    if (this.toolCalls.length === 0) {
      return nothing;
    }
    const call = this.currentCall;
    return html` <button
        part="list-toggle"
        class="list-toggle"
        type="button"
        aria-expanded=${this.expanded}
        aria-controls="tool-calls"
        @click=${() => (this.expanded = !this.expanded)}
      >
        ${
          call
            ? this.renderActivity(this.presentCall(call))
            : html`<span
                >${this.summary || chatUiText.tool.count({ count: this.toolCalls.length })}</span
              >`
        }
        ${
          call && this.elapsed
            ? html`<span class="list-elapsed" aria-hidden="true">${this.elapsed}</span>`
            : nothing
        }
        <span class="list-chevron ${this.expanded ? "open" : ""}">${icon("chevronDown", 14)}</span>
      </button>
      <div
        id="tool-calls"
        class="calls"
        role="group"
        aria-label=${chatUiText.tool.label}
        ?hidden=${!this.expanded}
      >
        ${repeat(
          this.toolCalls,
          (call) => call.id,
          (call) =>
            html`<tacta-tool-call-item
              .call=${call}
              .presentCall=${this.presentCall}
            ></tacta-tool-call-item>`,
        )}
      </div>`;
  }
}
