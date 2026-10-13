import { html, nothing, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import type { PendingApproval } from "./types.js";
import { icon, type IconName } from "@tacta/core/icons";
import { approvalCardStyles } from "./approval-card.styles.js";
import { chatUiText } from "./messages/index.js";

export type ApprovalDecision = { requestId: string; decision: "allow" | "deny" };

export class ApprovalCard extends LitElement {
  @property({ attribute: false }) approval!: PendingApproval;

  @state() private now = Date.now();

  private clock: number | undefined;

  private get expired(): boolean {
    return !!this.approval.expiresAt && new Date(this.approval.expiresAt).getTime() <= this.now;
  }

  private get pending(): boolean {
    return this.approval.state === "pending" && !this.expired;
  }

  private get presentation(): { title: string; icon: IconName } {
    const text = chatUiText.approval;
    switch (this.approval.state) {
      case "allowed":
        return { title: text.allowed, icon: "check" };
      case "denied":
        return { title: text.denied, icon: "close" };
      case "cancelled":
        return { title: text.cancelled, icon: "minus" };
      default:
        if (this.expired) {
          return { title: text.expired, icon: "timerOff" };
        }
        return { title: text.title, icon: "shield" };
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.clock = window.setInterval(() => (this.now = Date.now()), 1000);
  }

  override disconnectedCallback(): void {
    window.clearInterval(this.clock);
    super.disconnectedCallback();
  }

  private decide(decision: "allow" | "deny"): void {
    if (this.approval.busy || this.approval.state !== "pending" || this.expired) {
      return;
    }
    this.dispatchEvent(
      new CustomEvent<ApprovalDecision>("resolve-approval", {
        detail: { requestId: this.approval.id, decision },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = approvalCardStyles;

  private renderActions(): TemplateResult<1> {
    const text = chatUiText.approval;
    return html`<div part="actions" class="actions">
      <button
        part="button"
        class="button"
        ?disabled=${this.approval.busy}
        @click=${() => this.decide("deny")}
      >
        ${text.deny}
      </button>
      <button
        part="button"
        class="button allow"
        ?disabled=${this.approval.busy}
        @click=${() => this.decide("allow")}
      >
        ${this.approval.busy ? html`<span class="submitting">${icon("refresh", 16)}</span>` : nothing}
        ${this.approval.busy ? text.allowing : text.allow}
      </button>
    </div>`;
  }

  private renderError(): TemplateResult<1> | typeof nothing {
    if (!this.approval.error || !this.pending) {
      return nothing;
    }
    return html`<p class="error" role="alert">
      ${icon("warning", 16)}${chatUiText.approval.failed}
    </p>`;
  }

  override render(): TemplateResult<1> {
    const text = chatUiText.approval;
    const view = this.presentation;
    return html`<section aria-label=${text.title} aria-busy=${!!this.approval.busy}>
      <header>
        ${icon(view.icon, 16)}
        <h3 role=${this.pending ? nothing : "status"}>${view.title}</h3>
      </header>
      <div part="content" class="content">
        ${this.approval.reason ? html`<p class="reason">${this.approval.reason}</p>` : nothing}
        <pre tabindex="0" aria-label=${text.action}><code>${this.approval.action}</code></pre>
        ${this.renderError()}
      </div>
      <footer>
        <p class="scope">${text.scope}</p>
        ${this.pending ? this.renderActions() : nothing}
      </footer>
    </section>`;
  }
}
