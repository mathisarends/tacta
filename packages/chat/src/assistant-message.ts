import { css, html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { Message } from "./types.js";
import { markdownStyles, renderMarkdown } from "./markdown/index.js";
import { chatUiText } from "./messages/index.js";
import "./tool-calls/index.js";
import "./approval-card.js";
import { presentToolCall } from "./tool-calls/presenter.js";

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}

export class AssistantMessage extends LitElement {
  @property({ attribute: false }) message!: Message;
  @property({ attribute: false }) presentCall = presentToolCall;
  @property({ attribute: false }) workingIndicator?: () => TemplateResult;
  @state() private now = Date.now();
  private clock: number | undefined;

  private get elapsed(): string {
    const startedAt = this.message.startedAt;
    if (startedAt === undefined) {
      return "";
    }
    const seconds = Math.max(0, Math.floor((this.now - startedAt) / 1000));
    return seconds ? formatDuration(seconds) : "";
  }

  override disconnectedCallback(): void {
    window.clearInterval(this.clock);
    this.clock = undefined;
    super.disconnectedCallback();
  }

  protected override willUpdate(): void {
    const working = this.message.startedAt !== undefined;
    if (working && this.clock === undefined) {
      this.now = Date.now();
      this.clock = window.setInterval(() => (this.now = Date.now()), 1000);
    } else if (!working && this.clock !== undefined) {
      window.clearInterval(this.clock);
      this.clock = undefined;
    }
  }

  private completedMeta(): string {
    const { workedSeconds } = this.message;
    if (workedSeconds === undefined) {
      return "";
    }
    return chatUiText.worked({ duration: formatDuration(workedSeconds) });
  }

  static override styles = css`
    ${workspaceStyles}
    ${markdownStyles}
    .markdown {
      font-size: var(--tacta-font-size-chat, var(--tacta-text-xl, 1rem));
    }
    :host {
      display: block;
      color: var(--tacta-color-text, #e6e6e6);
    }
    .meta {
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
      font-weight: var(--tacta-font-weight-caption, var(--tacta-font-weight-regular, 400));
      line-height: var(--tacta-line-height-caption, 1.5);
    }
    .meta {
      margin-bottom: 8px;
    }
    .working {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 28px;
      margin: 4px 0 16px;
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
      line-height: var(--tacta-line-height-caption, 1.5);
    }
    .working-mark {
      width: 23px;
      height: 23px;
      flex: none;
      overflow: visible;
      color: var(--tacta-color-text, #e6e6e6);
      animation: breathe var(--tacta-motion-duration-ambient, 3s) ease-in-out infinite;
    }
    .mark-track {
      opacity: 0.16;
    }
    .mark-trace {
      stroke-dasharray: 32 68;
      animation: trace var(--tacta-motion-duration-ambient, 3s) ease-in-out infinite;
    }
    .working-label {
      background: linear-gradient(
          100deg,
          var(--tacta-color-muted, #a3a3a5) 30%,
          var(--tacta-color-text, #e6e6e6) 50%,
          var(--tacta-color-muted, #a3a3a5) 70%
        )
        100% 0 / 250% 100%;
      background-clip: text;
      -webkit-background-clip: text;
      color: transparent;
      animation: shimmer var(--tacta-motion-duration-ambient, 3s) ease-in-out infinite;
    }
    .elapsed {
      font-variant-numeric: tabular-nums;
      opacity: 0.65;
    }
    .body {
      margin: 12px 0 18px;
    }
    tacta-tool-call-list + .body {
      margin-top: 4px;
    }
    .body.streaming {
      animation: reveal var(--tacta-motion-duration-panel, 280ms) ease-out;
    }
    @keyframes shimmer {
      to {
        background-position: 0 0;
      }
    }
    @keyframes trace {
      from {
        stroke-dashoffset: 32;
      }
      to {
        stroke-dashoffset: -68;
      }
    }
    @keyframes breathe {
      0%,
      100% {
        opacity: 0.65;
        transform: scale(0.96);
      }
      50% {
        opacity: 1;
        transform: scale(1);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .mark-trace {
        stroke-dasharray: none;
      }
      .working-label {
        background: none;
        color: var(--tacta-color-muted, #a3a3a5);
      }
    }
    @keyframes reveal {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
    }
  `;

  private renderMeta(): TemplateResult<1> | typeof nothing {
    if (this.message.approvals?.some((approval) => approval.state === "pending")) {
      return html`<div part="meta" class="meta" role="status">
        ${chatUiText.approval.waitingLabel}
      </div>`;
    }
    if (this.message.toolCalls?.length || this.message.startedAt === undefined) {
      return nothing;
    }
    return html`<div part="working" class="working" role="status" aria-label=${chatUiText.working}>
      <slot name="working-indicator"
        >${
          this.workingIndicator?.() ??
          html`<svg class="working-mark" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle
              class="mark-track"
              cx="16"
              cy="16"
              r="12"
              stroke="currentColor"
              stroke-width="2.3"
            />
            <circle
              class="mark-trace"
              cx="16"
              cy="16"
              r="12"
              stroke="currentColor"
              stroke-width="2.3"
              pathLength="100"
            />
          </svg>`
        }</slot
      >
      <span class="working-label" aria-hidden="true">${chatUiText.working}</span>
      ${this.elapsed ? html`<span class="elapsed" aria-hidden="true">${this.elapsed}</span>` : nothing}
    </div>`;
  }

  private renderBody(): typeof nothing | TemplateResult<1> {
    const { startedAt, text } = this.message;
    if (startedAt !== undefined && !text) {
      return nothing;
    }
    return html`<div
      part="body"
      class="body markdown ${startedAt === undefined ? "" : "streaming"}"
    >
      ${renderMarkdown(text)}
    </div>`;
  }

  private renderToolCalls(summary: string): TemplateResult<1> | typeof nothing {
    if (!this.message.toolCalls?.length) {
      return nothing;
    }
    return html`<tacta-tool-call-list
      .toolCalls=${this.message.toolCalls}
      .summary=${summary}
      .working=${this.message.startedAt !== undefined}
      .elapsed=${this.elapsed}
      .presentCall=${this.presentCall}
    ></tacta-tool-call-list>`;
  }

  override render(): TemplateResult<1> {
    const hasCompletedTools =
      this.message.startedAt === undefined && !!this.message.toolCalls?.length;
    const toolSummary = hasCompletedTools ? this.completedMeta() : "";
    const reviewedApprovals = this.message.approvals?.filter(
      (approval) => approval.state !== "pending",
    );
    return html`${this.renderMeta()}${this.renderToolCalls(
      toolSummary,
    )}${reviewedApprovals?.map((approval) => html`<tacta-approval-card .approval=${approval}></tacta-approval-card>`)}${this.renderBody()}`;
  }
}
