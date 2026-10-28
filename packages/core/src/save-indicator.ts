import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { controls } from "@tacta/core/styles/controls";
import { icon } from "./icons.js";
import { tooltip } from "./tooltip.js";
import "./loading/app-spinner.js";

export type SaveIndicatorState = "idle" | "saving" | "saved" | "error";

const MIN_SPINNER_DURATION = 450;
const SUCCESS_DURATION = 1800;

export class SaveIndicator extends LitElement {
  @property() state: SaveIndicatorState = "idle";
  @property() savingLabel = "";
  @property() savedLabel = "";
  @state() private spinning = false;
  @state() private faded = false;
  private startedAt = 0;
  private timer: ReturnType<typeof setTimeout> | undefined;

  private get label(): string {
    if (this.faded) {
      return "";
    }
    if (this.spinning) {
      return this.savingLabel;
    }
    return this.state === "saved" ? this.savedLabel : "";
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.requestUpdate("state");
  }

  override disconnectedCallback(): void {
    clearTimeout(this.timer);
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (!changed.has("state")) {
      return;
    }
    clearTimeout(this.timer);
    this.faded = false;
    if (this.state === "idle" || this.state === "error") {
      this.spinning = false;
      return;
    }
    if (!this.spinning) {
      this.spinning = true;
      this.startedAt = performance.now();
    }
    if (this.state === "saved") {
      const remaining = Math.max(0, MIN_SPINNER_DURATION - (performance.now() - this.startedAt));
      this.timer = setTimeout(() => {
        this.spinning = false;
        this.timer = setTimeout(() => {
          this.faded = true;
        }, SUCCESS_DURATION);
      }, remaining);
    }
  }

  static override styles = css`
    ${controls}
    :host {
      display: inline-grid;
      place-items: center;
      width: var(--tacta-save-indicator-size, 24px);
      height: var(--tacta-save-indicator-size, 24px);
      flex-shrink: 0;
    }
    .indicator {
      display: grid;
      place-items: center;
      width: 100%;
      height: 100%;
    }
    .success {
      display: grid;
      color: var(--tacta-color-positive, #b5df69);
      animation: appear var(--tacta-motion-duration-control, 160ms)
        var(--tacta-motion-ease-layout, cubic-bezier(0.2, 0, 0, 1));
      transition:
        opacity var(--tacta-motion-duration-control, 160ms),
        transform var(--tacta-motion-duration-control, 160ms);
    }
    .success.faded {
      opacity: 0;
      transform: scale(0.9);
    }
    .label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    @keyframes appear {
      from {
        opacity: 0;
        transform: scale(0.8);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }
  `;

  private renderIcon(): TemplateResult<1> | typeof nothing {
    if (this.spinning) {
      return html`<tacta-spinner aria-hidden="true"></tacta-spinner>`;
    }
    if (this.state === "saved") {
      return html`<span class="success ${this.faded ? "faded" : ""}" aria-hidden="true"
        >${icon("check", 22)}</span
      >`;
    }
    return nothing;
  }

  override render(): TemplateResult<1> {
    return html`<span class="indicator" role="status" ${tooltip(this.label)}>
      ${this.renderIcon()}<span class="label">${this.label}</span>
    </span>`;
  }
}
