import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { TactaElement as LitElement } from "@tacta/core/element";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { icon } from "@tacta/core/icons";
import { tooltip } from "@tacta/core/tooltip";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { Message } from "./index.js";
import { chatText } from "./history-messages.js";
import { chatNavigationEntries } from "./chat-navigation.js";
import type { ChatNavigationEntry } from "./navigation-types.js";
import "./chat-message-navigation.js";
import { presentToolCall } from "./tool-calls/presenter.js";
import "./human-message.js";
import "./assistant-message.js";

export class ChatMessageList extends LitElement {
  @property() conversationId = "";
  @property({ attribute: false }) messages: Message[] = [];
  @property({ attribute: false }) presentCall = presentToolCall;
  @property({ attribute: false }) workingIndicator?: () => TemplateResult | Node;
  @property({ type: Boolean }) sending = false;
  @property({ type: Boolean }) hasMoreHistory = false;
  @property({ type: Boolean }) loadingHistory = false;
  @state() private showScrollToBottom = false;
  @state() private showNavigation = false;
  @state() private activeMessageId = "";
  @state() private visibleMessageIds: string[] = [];
  private navigationEntries: ChatNavigationEntry[] = [];
  private historyAnchor: { id: string; top: number; index: number } | undefined;
  private followLatest = false;
  private placedMessageIndex: number | null = null;

  private readonly resizeObserver = new ResizeObserver(() => {
    this.updateTurnSpace();
    this.updateScrollButton();
  });

  private get messageViewport(): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(".messages");
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.resizeObserver.observe(this);
    const stack = this.renderRoot.querySelector(".message-stack");
    if (stack) {
      this.resizeObserver.observe(stack);
    }
  }

  override disconnectedCallback(): void {
    this.resizeObserver.disconnect();
    super.disconnectedCallback();
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("messages")) {
      this.navigationEntries = chatNavigationEntries(this.messages);
    }
    if (!changed.has("messages") || changed.has("conversationId")) {
      return;
    }
    const previous = changed.get("messages") as Message[] | undefined;
    const viewport = this.messageViewport;
    const first = previous?.[0];
    if (
      first &&
      viewport &&
      first.id !== this.messages[0]?.id &&
      this.messages.some((message) => message.id === first.id)
    ) {
      const element = viewport.querySelector<HTMLElement>(`[data-message-id="${first.id}"]`);
      if (element) {
        this.historyAnchor = {
          id: first.id,
          top: element.getBoundingClientRect().top,
          index: this.messages.findIndex((message) => message.id === first.id),
        };
      }
    }
    this.followLatest = Boolean(
      viewport &&
      !this.sending &&
      viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight < 100,
    );
  }

  protected override updated(changed: PropertyValues): void {
    if (changed.has("conversationId")) {
      this.placedMessageIndex = null;
      this.updateTurnSpace();
      this.scrollToBottom(false);
    }
    if (this.historyAnchor) {
      void this.restoreHistoryAnchor();
    } else if (
      this.followLatest ||
      (changed.has("messages") && !(changed.get("messages") as Message[] | undefined)?.length)
    ) {
      this.scrollToBottom(false);
    }
    this.followLatest = false;
    const stack = this.renderRoot.querySelector(".message-stack");
    if (stack) {
      this.resizeObserver.observe(stack);
    }
    this.updateTurnSpace();
    this.updateScrollButton();
  }

  async scrollSentMessageIntoPlace(messageId: string): Promise<void> {
    const conversationId = this.conversationId;
    await this.updateComplete;
    if (conversationId !== this.conversationId || !this.sending) {
      return;
    }
    const viewport = this.messageViewport;
    const message = viewport?.querySelector<HTMLElement>(`[data-message-id="${messageId}"]`);
    if (!viewport || !message) {
      return;
    }
    this.placedMessageIndex = this.messages.findIndex((item) => item.id === messageId);
    this.updateTurnSpace();
    const viewportBounds = viewport.getBoundingClientRect();
    const distance = message.getBoundingClientRect().top - viewportBounds.top - 22;
    if (distance <= 1) {
      return;
    }
    viewport.scrollTo({
      top: viewport.scrollTop + distance,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
    this.updateScrollButton();
  }

  private async restoreHistoryAnchor(): Promise<void> {
    const anchor = this.historyAnchor;
    this.historyAnchor = undefined;
    const viewport = this.messageViewport;
    const conversationId = this.conversationId;
    if (!anchor || !viewport) {
      return;
    }
    const messages = viewport.querySelectorAll<LitElement>("[data-message-id]");
    await Promise.all(Array.from(messages, (message) => message.updateComplete));
    if (!this.isConnected || conversationId !== this.conversationId) {
      return;
    }
    const element = viewport.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(anchor.id)}"]`,
    );
    if (!element) {
      return;
    }
    viewport.scrollTop += element.getBoundingClientRect().top - anchor.top;
    if (this.placedMessageIndex !== null) {
      this.placedMessageIndex += anchor.index;
    }
    this.updateTurnSpace();
    this.updateScrollButton();
  }

  private updateTurnSpace(): void {
    const viewport = this.messageViewport;
    if (!viewport) {
      return;
    }
    const stack = viewport.querySelector<HTMLElement>(".message-stack");
    // The server replaces optimistic IDs when a reply finishes; the turn's index stays stable.
    const message =
      this.placedMessageIndex === null ? null : stack?.children[this.placedMessageIndex];
    if (!stack) {
      return;
    }
    if (!message) {
      stack.style.minHeight = "0px";
      return;
    }
    const styles = getComputedStyle(viewport);
    const availableHeight =
      viewport.clientHeight - parseFloat(styles.paddingTop) - parseFloat(styles.paddingBottom);
    const turnOffset = message.getBoundingClientRect().top - stack.getBoundingClientRect().top;
    // Keep unused answer space after completion so short replies never pull the prompt down.
    stack.style.minHeight = `${Math.max(0, turnOffset + availableHeight)}px`;
  }

  private updateScrollButton(): void {
    const viewport = this.messageViewport;
    this.updateNavigation();
    if (!viewport) {
      this.showScrollToBottom = false;
      return;
    }
    const latest = viewport.querySelector<HTMLElement>(".message-stack > :last-child");
    this.showScrollToBottom = Boolean(
      latest &&
      latest.getBoundingClientRect().bottom - viewport.getBoundingClientRect().bottom > 72,
    );
  }

  private updateNavigation(): void {
    const viewport = this.messageViewport;
    const latest = viewport?.querySelector<HTMLElement>(".message-stack > :last-child");
    if (!viewport || !latest) {
      this.showNavigation = false;
      this.activeMessageId = "";
      return;
    }
    const bounds = viewport.getBoundingClientRect();
    const contentBottom = latest.getBoundingClientRect().bottom;
    const contentHeight = contentBottom - bounds.top + viewport.scrollTop + 22;
    this.showNavigation = Boolean(
      this.clientWidth >= 650 &&
      contentHeight - viewport.clientHeight >= Math.max(240, viewport.clientHeight / 2) &&
      this.navigationEntries.length,
    );
    if (!this.showNavigation) {
      this.activeMessageId = "";
      return;
    }
    const anchors = new Set(this.navigationEntries.map((entry) => entry.id));
    const sections = Array.from(viewport.querySelectorAll<HTMLElement>("[data-message-id]"))
      .filter((element) => anchors.has(element.dataset.messageId ?? ""))
      .map((element) => ({
        id: element.dataset.messageId!,
        top: element.getBoundingClientRect().top,
      }));
    const visible = sections
      .filter((section, index) => {
        const bottom = sections[index + 1]?.top ?? contentBottom;
        return section.top < bounds.bottom && bottom > bounds.top;
      })
      .map((section) => section.id);
    if (visible.join("\0") !== this.visibleMessageIds.join("\0")) {
      this.visibleMessageIds = visible;
    }
    const readingTop = bounds.top + 24;
    let active = this.navigationEntries[0]?.id ?? "";
    for (const section of sections) {
      if (section.top > readingTop) {
        break;
      }
      active = section.id;
    }
    if (contentBottom <= bounds.bottom + 24) {
      active = this.navigationEntries.at(-1)?.id ?? active;
    }
    this.activeMessageId = active;
  }

  private jumpToMessage(event: CustomEvent<string>): void {
    const viewport = this.messageViewport;
    const target = viewport?.querySelector<HTMLElement>(
      `[data-message-id="${CSS.escape(event.detail)}"]`,
    );
    if (!viewport || !target) {
      return;
    }
    this.followLatest = false;
    viewport.scrollTo({
      top:
        viewport.scrollTop +
        target.getBoundingClientRect().top -
        viewport.getBoundingClientRect().top -
        22,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  private scrollToBottom(smooth = true): void {
    const viewport = this.messageViewport;
    const latest = viewport?.querySelector<HTMLElement>(".message-stack > :last-child");
    if (!viewport || !latest) {
      return;
    }
    const top =
      viewport.scrollTop +
      latest.getBoundingClientRect().bottom -
      viewport.getBoundingClientRect().bottom +
      22;
    viewport.scrollTo({
      top,
      behavior:
        smooth && !matchMedia("(prefers-reduced-motion: reduce)").matches ? "smooth" : "auto",
    });
    this.showScrollToBottom = false;
  }

  private loadOlder(): void {
    this.dispatchEvent(new CustomEvent("load-older", { bubbles: true, composed: true }));
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      flex: 1;
      min-height: 0;
      position: relative;
      container-type: inline-size;
    }
    .messages {
      height: 100%;
      box-sizing: border-box;
      overflow-y: auto;
      overflow-anchor: none;
      scrollbar-gutter: stable both-edges;
      padding: 22px clamp(18px, 2vw, 32px);
    }
    .messages.with-navigation {
      padding-inline-start: calc(var(--tacta-chat-navigation-width, 52px) + 20px);
    }
    .message-navigation {
      position: absolute;
      inset: 12px auto 12px 8px;
      width: var(--tacta-chat-navigation-width, 52px);
      z-index: 1;
    }
    .message-stack {
      max-width: var(--tacta-chat-content-width, 800px);
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }
    .history-button {
      display: block;
      margin: 0 auto 22px;
      padding: 8px 14px;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-element, 8px);
      color: var(--tacta-color-text, #e6e6e6);
      background: var(--tacta-color-surface, #252627);
      cursor: pointer;
    }
    .scroll-to-bottom {
      position: absolute;
      left: 50%;
      bottom: 12px;
      transform: translateX(-50%);
      display: grid;
      place-items: center;
      width: 38px;
      height: 38px;
      border: 1px solid var(--tacta-color-border, #ffffff0d);
      border-radius: var(--tacta-radius-round, 50%);
      background: var(--tacta-color-background, #181818);
      color: var(--tacta-color-text, #e6e6e6);
      box-shadow: var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background, #181818) 65%, transparent)
      );
      cursor: pointer;
    }
    .scroll-to-bottom:hover {
      background: var(--tacta-color-surface, #252627);
    }
    .scroll-to-bottom:focus-visible {
      outline: 2px solid var(--tacta-color-accent, #ffffff);
      outline-offset: 2px;
    }

    @media (max-width: 650px) {
      .messages {
        padding-inline: 15px;
      }
    }
  `;

  private renderHistoryButton(): TemplateResult<1> | typeof nothing {
    if (!this.hasMoreHistory) {
      return nothing;
    }
    return html`<button
      part="history-button"
      class="history-button"
      ?disabled=${this.loadingHistory || this.sending}
      @click=${this.loadOlder}
    >
      ${this.loadingHistory ? chatText.loadingHistory : chatText.loadOlder}
    </button>`;
  }

  private renderMessage(message: Message): TemplateResult<1> {
    if (message.role === "human") {
      return html`<tacta-human-message
        data-message-id=${message.id}
        .message=${message}
      ></tacta-human-message>`;
    }
    return html`<tacta-assistant-message
      .presentCall=${this.presentCall}
      .workingIndicator=${this.workingIndicator}
      data-message-id=${message.id}
      .message=${message}
    ></tacta-assistant-message>`;
  }

  private renderScrollButton(): TemplateResult<1> | typeof nothing {
    if (!this.showScrollToBottom) {
      return nothing;
    }
    return html`<button
      part="scroll-to-bottom"
      class="scroll-to-bottom"
      type="button"
      ${tooltip(chatText.scrollToBottom)}
      aria-label=${chatText.scrollToBottom}
      @click=${() => this.scrollToBottom()}
    >
      ${icon("arrowDown", 18)}
    </button>`;
  }

  private renderNavigation(): TemplateResult<1> | typeof nothing {
    if (!this.showNavigation) {
      return nothing;
    }
    return html`<tacta-chat-message-navigation
      class="message-navigation"
      .entries=${this.navigationEntries}
      .activeId=${this.activeMessageId}
      .visibleIds=${this.visibleMessageIds}
      @message-jump=${this.jumpToMessage}
    ></tacta-chat-message-navigation>`;
  }

  override render(): TemplateResult<1> {
    return html` <div
        part="messages"
        class="messages ${this.showNavigation ? "with-navigation" : ""}"
        @scroll=${this.updateScrollButton}
      >
        ${this.renderHistoryButton()}
        <div part="message-stack" class="message-stack">
          ${repeat(
            this.messages,
            (message) => message.renderKey ?? message.id,
            (message) => this.renderMessage(message),
          )}
        </div>
      </div>
      ${this.renderNavigation()} ${this.renderScrollButton()}`;
  }
}
