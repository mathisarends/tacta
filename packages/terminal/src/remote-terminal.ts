import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, unsafeCSS, type PropertyValues, type TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import type { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";
import { SearchAddon, type ISearchOptions } from "@xterm/addon-search";
import { Unicode11Addon } from "@xterm/addon-unicode11";
import { WebLinksAddon } from "@xterm/addon-web-links";
import { xtermCss } from "./xterm-styles.js";
import { matchesShortcut } from "@tacta/core/keyboard/shortcuts";
import { terminalShortcuts } from "./terminal-shortcuts.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { terminalText } from "./messages/index.js";
import { isClipboardShortcut, isWordDelete } from "./data/terminal-keys.js";
import type { FindRequest, FindResults, TerminalSearch } from "./terminal-search.js";
import "./terminal-search.js";
import { TerminalSessionController } from "./terminal-session-controller.js";
import { createTerminal, findOptions, loadFontFamily } from "./data/terminal-setup.js";
import type { TerminalConnector } from "./types.js";

export class RemoteTerminal extends LitElement {
  @property({ type: Boolean }) active = true;
  @property() sessionId = "";
  @property({ attribute: false }) connector?: TerminalConnector;
  @property({ type: Boolean }) canInterrupt = false;
  @state() private searching = false;
  @state() private findResults: FindResults | null = null;
  @query("tacta-terminal-search") private searchBar?: TerminalSearch;

  private readonly session = new TerminalSessionController(this, {
    sessionId: () => this.sessionId,
    connector: () => this.connector,
    reset: () => this.terminal?.reset(),
    measure: () => this.measure(),
    write: (data) => this.write(data),
    onConnecting: () => this.terminal?.reset(),
    onReady: () => this.focusWhenUntouched(),
    onInput: (enabled) => this.enableInput(enabled),
  });

  private terminal?: Terminal;
  private fit?: FitAddon;
  private search?: SearchAddon;
  private findOptions: ISearchOptions = {};
  private observer?: ResizeObserver;
  private initialFocus: Element | null = null;
  private pointerType = "";
  private started = false;

  private get focusedElement(): Element | null {
    let focused = this.ownerDocument.activeElement;
    while (focused?.shadowRoot?.activeElement) {
      focused = focused.shadowRoot.activeElement;
    }
    return focused;
  }

  private get statusLabel(): string {
    const { status, exitCode } = this.session;
    if (status === "ended" && exitCode !== null) {
      return terminalText.exit({ code: exitCode });
    }
    return terminalText[status];
  }

  private get noticeClass(): string {
    if (this.session.status === "connected") {
      return "status sr-only";
    }
    return "notice";
  }

  private get noticeText(): string {
    if (this.session.error) {
      return this.session.error;
    }
    return this.statusLabel;
  }

  private get noticeRole(): string {
    if (this.session.error) {
      return "alert";
    }
    return "status";
  }

  protected override firstUpdated(): void {
    void this.mountTerminal();
  }

  protected override updated(changed: PropertyValues): void {
    if ((changed.has("connector") || changed.has("sessionId")) && this.terminal && this.active) {
      this.connect();
    }
    this.terminal?.textarea?.setAttribute("aria-label", terminalText.title);
    if (changed.has("active") && this.active) {
      this.resize();
      if (this.terminal && !this.started) {
        this.connect();
      }
      this.terminal?.focus();
    }
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) {
      this.started = false;
      void this.mountTerminal();
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.terminal?.dispose();
    this.terminal = undefined;
  }

  private async mountTerminal(): Promise<void> {
    const initialFocus = this.focusedElement;
    const container = this.renderRoot.querySelector<HTMLElement>(".viewport")!;
    const style = getComputedStyle(this);
    const fontFamily = await loadFontFamily(style);
    if (!this.isConnected) {
      return;
    }
    this.terminal = createTerminal(style, fontFamily);
    this.fit = new FitAddon();
    this.terminal.loadAddon(this.fit);
    this.search = new SearchAddon();
    this.terminal.loadAddon(this.search);
    this.search.onDidChangeResults(({ resultIndex, resultCount }) => {
      this.findResults = { index: resultIndex, count: resultCount };
    });
    this.findOptions = findOptions(style);
    this.terminal.loadAddon(new Unicode11Addon());
    this.terminal.unicode.activeVersion = "11";
    this.terminal.loadAddon(new WebLinksAddon((event, uri) => this.openLink(event, uri)));
    this.terminal.open(container);
    this.terminal.textarea?.setAttribute("aria-label", terminalText.title);
    this.terminal.attachCustomKeyEventHandler((event) => this.handleKey(event));
    this.terminal.onData((data) => this.session.send(data));
    // DOM rendering can update cell measurements after a font load or panel resize.
    this.terminal.onRender(() => this.resize());
    this.terminal.onResize(({ cols, rows }) => this.session.resize(cols, rows));
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(container);
    await document.fonts.ready;
    if (this.isConnected) {
      this.resize();
      if (this.active) {
        this.connect(initialFocus);
      }
    }
  }

  private connect(initialFocus = this.focusedElement): void {
    this.started = true;
    this.initialFocus = initialFocus;
    void this.session.connect();
  }

  // A late connection must not take focus back from another control.
  private focusWhenUntouched(): void {
    const focused = this.focusedElement;
    if (
      this.sessionId ||
      !this.active ||
      focused !== this.initialFocus ||
      focused?.getAttribute("role") === "tab"
    ) {
      return;
    }
    this.terminal?.focus();
  }

  private enableInput(enabled: boolean): void {
    if (this.terminal) {
      this.terminal.options.disableStdin = !enabled;
    }
  }

  private measure(): { cols: number; rows: number } {
    this.resize();
    return { cols: this.terminal?.cols ?? 80, rows: this.terminal?.rows ?? 24 };
  }

  private write(data: string): Promise<void> {
    const terminal = this.terminal;
    if (!terminal) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => terminal.write(data, resolve));
  }

  private resize(): void {
    const container = this.renderRoot.querySelector<HTMLElement>(".viewport");
    if (!container || container.clientWidth < 40 || container.clientHeight < 40) {
      return;
    }
    this.fit?.fit();
  }

  private handleKey(event: KeyboardEvent): boolean {
    const interrupt = event.ctrlKey && !event.altKey && !event.metaKey && event.key === "c";
    if (this.sessionId && interrupt && !this.terminal?.hasSelection()) {
      if (event.type === "keydown") {
        event.preventDefault();
        if (this.canInterrupt) {
          this.dispatchEvent(
            new CustomEvent<string>("terminal-interrupt", {
              detail: this.sessionId,
              bubbles: true,
              composed: true,
            }),
          );
        }
      }
      return false;
    }
    if (event.type === "keydown" && matchesShortcut(event, terminalShortcuts.search)) {
      event.preventDefault();
      void this.openSearch();
      return false;
    }
    if (isClipboardShortcut(event, Boolean(this.terminal?.hasSelection()))) {
      return false;
    }
    if (event.type === "keydown" && isWordDelete(event)) {
      event.preventDefault();
      // xterm sends ^H, which shells treat like Backspace; ^W deletes the previous word.
      this.terminal?.input("\x17");
      return false;
    }
    return true;
  }

  private async openSearch(): Promise<void> {
    let term = this.terminal?.getSelection() ?? "";
    if (term.includes("\n")) {
      term = "";
    }
    this.searching = true;
    await this.updateComplete;
    await this.searchBar?.show(term);
  }

  private find(event: CustomEvent<FindRequest>): void {
    const { term, previous, incremental } = event.detail;
    if (!term) {
      this.search?.clearDecorations();
      this.terminal?.clearSelection();
      this.findResults = null;
      return;
    }
    if (previous) {
      this.search?.findPrevious(term, this.findOptions);
      return;
    }
    this.search?.findNext(term, { ...this.findOptions, incremental });
  }

  private closeFind(): void {
    this.searching = false;
    this.findResults = null;
    this.search?.clearDecorations();
    this.terminal?.focus();
  }

  // Clearing the selection lets the next Ctrl+C interrupt again.
  private copied(): void {
    this.terminal?.clearSelection();
  }

  private pointed(event: PointerEvent): void {
    this.pointerType = event.pointerType;
  }

  // Touch has no modifier keys, so a tap opens the link directly.
  private openLink(event: MouseEvent, uri: string): void {
    if (event.ctrlKey || event.metaKey || this.pointerType === "touch") {
      window.open(uri, "_blank", "noopener");
    }
  }

  static override styles = css`
    ${workspaceStyles}
    ${unsafeCSS(xtermCss)}
    :host {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      background: var(--tacta-color-background, #181818);
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .button {
      margin-left: auto;
      color: var(--tacta-color-text, #e6e6e6);
      flex-shrink: 0;
    }
    .screen {
      position: relative;
      display: flex;
      flex: 1;
      min-width: 0;
      min-height: 0;
    }
    tacta-terminal-search {
      position: absolute;
      top: 8px;
      right: 16px;
      z-index: 10;
      width: min(360px, calc(100% - 32px));
    }
    .viewport {
      flex: 1;
      min-height: 0;
      min-width: 0;
      margin: 14px 16px 10px;
      overflow: hidden;
      letter-spacing: normal;
    }
    .xterm {
      height: 100%;
    }
    .xterm .xterm-viewport {
      background-color: var(--tacta-color-background, #181818);
    }
    .notice {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 12px 16px 0;
      padding: 12px;
      border-radius: var(--tacta-radius-control, 12px);
      background: var(--tacta-color-surface, #252627);
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    }
    @media (max-width: 450px) {
      .viewport {
        margin-inline: 12px;
      }
      tacta-terminal-search {
        right: 12px;
        width: calc(100% - 24px);
      }
    }
  `;

  private renderReconnect(): TemplateResult<1> | typeof nothing {
    const status = this.session.status;
    if (status === "connected" || status === "connecting") {
      return nothing;
    }
    return html`<button class="button" @click=${() => this.connect()}>
      ${terminalText.reconnect}
    </button>`;
  }

  private renderSearch(): TemplateResult<1> | typeof nothing {
    if (!this.searching) {
      return nothing;
    }
    return html`<tacta-terminal-search
      .results=${this.findResults}
      @find=${(event: CustomEvent<FindRequest>) => this.find(event)}
      @close-find=${() => this.closeFind()}
    ></tacta-terminal-search>`;
  }

  override render(): TemplateResult<1> {
    return html` <div class=${this.noticeClass}>
        <span role=${this.noticeRole}>${this.noticeText}</span>
        ${this.renderReconnect()}
      </div>
      <div class="screen" @keydown=${(event: KeyboardEvent) => event.stopPropagation()}>
        <div
          data-raw-keys
          class="viewport"
          @copy=${() => this.copied()}
          @pointerdown=${(event: PointerEvent) => this.pointed(event)}
        ></div>
        ${this.renderSearch()}
      </div>`;
  }
}
