import type { BrowserConnector } from "./types.js";
import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { BrowserStateUpdate, BrowserViewport } from "./types.js";
import {
  clipboardAction,
  isCommandKey,
  keyInput,
  mouseInput,
  pagePoint,
  pictureBounds,
  scrollInput,
  type ClipboardAction,
  type MouseInput,
  type PagePoint,
  type PageSize,
} from "./data/browser-input.js";
import { BrowserSessionController } from "./browser-session-controller.js";
import type { BrowserViewMode } from "./data/browser-types.js";
import { browserViewport } from "./data/browser-viewport.js";
import { browserText as text } from "./messages/index.js";

export class RemoteBrowser extends LitElement {
  @property({ type: Boolean }) active = false;
  @property() mode: BrowserViewMode = "responsive";
  @property({ attribute: false }) connector?: BrowserConnector;
  @state() private stream?: MediaStream;

  @query("video", true) private video!: HTMLVideoElement;
  @query("textarea", true) private keyboard!: HTMLTextAreaElement;

  private readonly session = new BrowserSessionController(this, {
    connector: () => this.connector,
    viewport: () => this.viewport(),
    onVideo: (stream) => this.showVideo(stream),
    onReady: () => this.browserReady(),
    onState: (state) => this.browserState(state),
    onFavicon: (url) => this.browserFavicon(url),
    onEnded: () => this.browserEnded(),
  });
  private observer?: ResizeObserver;
  private density?: MediaQueryList;
  private readonly densityChanged = (): void => {
    this.watchDensity();
    this.resize();
  };

  private get page(): PageSize {
    return { width: this.video.videoWidth, height: this.video.videoHeight };
  }

  private get pictureShown(): boolean {
    return this.session.ready && this.page.width > 0 && this.page.height > 0;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.watchDensity();
    if (this.hasUpdated) {
      this.observer?.observe(this);
      this.resize();
    }
  }

  protected override firstUpdated(): void {
    this.observer = new ResizeObserver(() => this.resize());
    this.observer.observe(this);
    this.resize();
  }

  protected override updated(changed: PropertyValues<this>): void {
    if (changed.has("connector") && changed.get("connector")) {
      this.session.disconnect();
    }
    if (changed.has("active") || changed.has("mode") || changed.has("connector")) {
      this.resize();
    }
  }

  override disconnectedCallback(): void {
    this.observer?.disconnect();
    this.density?.removeEventListener("change", this.densityChanged);
    super.disconnectedCallback();
  }

  navigate(url: string): void {
    this.session.navigate(url);
  }

  back(): void {
    this.session.back();
  }

  forward(): void {
    this.session.forward();
  }

  reload(): void {
    this.session.reload();
  }

  stop(): void {
    this.session.stop();
  }

  private viewport(): BrowserViewport | undefined {
    const bounds = this.getBoundingClientRect();
    if (bounds.width <= 0 || bounds.height <= 0) {
      return undefined;
    }
    return browserViewport(bounds, this.mode, window.devicePixelRatio);
  }

  private watchDensity(): void {
    this.density?.removeEventListener("change", this.densityChanged);
    this.density = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    this.density.addEventListener("change", this.densityChanged);
  }

  private resize(): void {
    if (!this.active || !this.viewport()) {
      return;
    }
    this.session.resize();
    if (this.session.status === "disconnected" && !this.session.error) {
      void this.session.connect();
    }
  }

  private showVideo(stream: MediaStream | undefined): void {
    this.stream = stream;
  }

  private browserReady(): void {
    this.resize();
    this.dispatchEvent(new CustomEvent("browser-ready", { bubbles: true, composed: true }));
  }

  private browserState(state: BrowserStateUpdate): void {
    this.dispatchEvent(
      new CustomEvent<BrowserStateUpdate>("browser-state", {
        detail: state,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private browserFavicon(url: string): void {
    this.dispatchEvent(
      new CustomEvent<string>("browser-favicon", {
        detail: url,
        bubbles: true,
        composed: true,
      }),
    );
  }

  private browserEnded(): void {
    this.dispatchEvent(new CustomEvent("browser-ended", { bubbles: true, composed: true }));
  }

  private point(event: MouseEvent): PagePoint {
    const page = this.page;
    return pagePoint(event, pictureBounds(this.video.getBoundingClientRect(), page), page);
  }

  private capturePointer(event: PointerEvent): void {
    if (this.pictureShown) {
      this.video.setPointerCapture(event.pointerId);
    }
  }

  private mouse(event: MouseEvent, type: MouseInput["type"]): void {
    if (!this.pictureShown) {
      return;
    }
    if (type === "mouseDown") {
      event.preventDefault();
      this.keyboard.focus({ preventScroll: true });
    }
    this.session.mouse(mouseInput(type, event, this.point(event)));
  }

  private wheel(event: WheelEvent): void {
    event.preventDefault();
    const viewport = this.viewport();
    if (this.pictureShown && viewport) {
      this.session.scroll(scrollInput(event, this.point(event), viewport.height));
    }
  }

  private key(event: KeyboardEvent): void {
    event.stopPropagation();
    if (event.isComposing || event.key === "Process") {
      return;
    }
    const action = clipboardAction(event);
    if (action) {
      event.preventDefault();
      this.clipboard(event, action);
      return;
    }
    if (isCommandKey(event)) {
      event.preventDefault();
    }
    this.session.key(keyInput(event));
  }

  private clipboard(event: KeyboardEvent, action: ClipboardAction): void {
    if (event.type !== "keydown") {
      return;
    }
    if (action === "copy") {
      this.session.copySelection();
    } else {
      this.session.pasteClipboard();
    }
  }

  private textInput(event: InputEvent): void {
    if (event.isComposing) {
      return;
    }
    event.preventDefault();
    if (
      event.data &&
      event.inputType.startsWith("insert") &&
      event.inputType !== "insertFromComposition"
    ) {
      this.session.insert(event.data);
    }
    this.keyboard.value = "";
  }

  private composition(event: CompositionEvent): void {
    if (event.data) {
      this.session.insert(event.data);
    }
    this.keyboard.value = "";
  }

  private reconnect(): void {
    void this.session.connect();
  }

  private paste(event: ClipboardEvent): void {
    event.preventDefault();
    this.session.paste(event.clipboardData?.getData("text/plain") ?? "");
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      position: relative;
      width: 100%;
      height: 100%;
      min-height: 0;
    }
    video {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
      outline: none;
      background: var(--tacta-color-background, #181818);
      cursor: var(--tacta-remote-cursor, default);
    }
    textarea {
      position: absolute;
      top: 0;
      left: 0;
      opacity: 0;
      width: 1px;
      height: 1px;
      padding: 0;
      border: 0;
      resize: none;
    }
    .status {
      position: absolute;
      inset: 0;
      display: grid;
      place-content: center;
      gap: 12px;
      text-align: center;
      color: var(--tacta-color-muted, #a3a3a5);
      background: var(--tacta-color-background, #181818);
    }
    .error {
      position: absolute;
      z-index: 1;
      bottom: 8px;
      left: 8px;
      right: 8px;
      color: var(--tacta-color-text, #e6e6e6);
      background: var(--tacta-color-surface, #252627);
      padding: 8px;
    }
  `;

  private renderStatus(): TemplateResult<1> | typeof nothing {
    const { status } = this.session;
    if (status === "connected") {
      return nothing;
    }
    if (status === "connecting") {
      return html`<div class="status" role="status">${text.connecting}</div>`;
    }
    return html`<div class="status" role="status">
      <span>${text.unavailable}</span>
      <button class="button" @click=${this.reconnect}>${text.reconnect}</button>
    </div>`;
  }

  private renderError(): TemplateResult<1> | typeof nothing {
    if (!this.session.error) {
      return nothing;
    }
    return html`<div class="error" role="alert">${this.session.error}</div>`;
  }

  override render(): TemplateResult<1> {
    return html`<video
        style=${`--tacta-remote-cursor: ${this.session.cursor}`}
        aria-label=${text.content}
        autoplay
        muted
        playsinline
        disablepictureinpicture
        .srcObject=${live(this.stream ?? null)}
        @pointerdown=${this.capturePointer}
        @mousedown=${(event: MouseEvent) => this.mouse(event, "mouseDown")}
        @pointermove=${(event: PointerEvent) => this.mouse(event, "mouseMove")}
        @mouseup=${(event: MouseEvent) => this.mouse(event, "mouseUp")}
        @pointercancel=${(event: PointerEvent) => this.mouse(event, "mouseUp")}
        @wheel=${this.wheel}
        @contextmenu=${(event: Event) => event.preventDefault()}
      ></video>
      <textarea
        data-raw-keys
        aria-label=${text.keyboard}
        autocomplete="off"
        autocapitalize="off"
        spellcheck="false"
        @keydown=${this.key}
        @keyup=${this.key}
        @beforeinput=${this.textInput}
        @compositionend=${this.composition}
        @paste=${this.paste}
      ></textarea>
      ${this.renderStatus()} ${this.renderError()}`;
  }
}
