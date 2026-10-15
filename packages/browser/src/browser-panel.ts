import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type PropertyValues, type TemplateResult } from "lit";
import { property, query, state } from "lit/decorators.js";
import type { BrowserStateUpdate } from "./types.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { resolveBrowserAddress } from "./data/browser-address.js";
import type { BrowserAddressBar } from "./browser-address-bar.js";
import "./browser-address-bar.js";
import "./browser-navigation.js";
import type { BrowserConnector } from "./types.js";
import { browserText as text } from "./messages/index.js";
import type { BrowserPage, BrowserViewMode } from "./data/browser-types.js";
import type { RemoteBrowser } from "./remote-browser.js";
import "./remote-browser.js";

async function decodedImage(url: string): Promise<string> {
  if (!url) {
    return "";
  }
  const image = new Image();
  image.src = url;
  try {
    await image.decode();
    return url;
  } catch {
    return "";
  }
}

export class BrowserPanel extends LitElement {
  @property() initialUrl = "";
  @property({ type: Boolean }) active = false;
  @property({ attribute: false }) connector?: BrowserConnector;
  @state() private currentUrl = "";
  @state() private remoteTitle = "";
  @state() private canGoBack = false;
  @state() private canGoForward = false;
  @state() private loading = false;
  @state() private ready = false;
  @state() private favicon = "";
  @state() private navigationStarted = false;
  @property() mode: BrowserViewMode = "responsive";
  private faviconRequest = 0;
  private restored = false;
  @query("tacta-browser-address-bar") private addressBar?: BrowserAddressBar;
  @query("tacta-remote-browser") private remote?: RemoteBrowser;

  get url(): string {
    return this.currentUrl;
  }

  private get pageTitle(): string {
    if (!this.url) {
      return text.newTab;
    }
    try {
      return new URL(this.url).host || this.remoteTitle || text.newTab;
    } catch {
      return this.remoteTitle || text.newTab;
    }
  }

  protected override firstUpdated(): void {
    this.restoreAddress();
  }

  protected override updated(changed: PropertyValues<this>): void {
    this.restoreAddress();
    if (changed.has("active") && this.active && !this.url) {
      void this.addressBar?.focusAddress();
    }
  }

  async focusAddress(): Promise<void> {
    await this.updateComplete;
    if (this.isConnected) {
      await this.addressBar?.focusAddress();
    }
  }

  navigate(address: string): void {
    const url = resolveBrowserAddress(address);
    if (url) {
      this.navigationStarted = true;
      this.remote?.navigate(url.href);
    }
  }

  private restoreAddress(): void {
    if (this.restored || !this.active) {
      return;
    }
    this.restored = true;
    if (this.initialUrl) {
      this.navigate(this.initialUrl);
    }
  }

  private submitAddress(event: CustomEvent<string>): void {
    event.stopPropagation();
    this.navigate(event.detail);
  }

  private back(): void {
    this.remote?.back();
  }

  private forward(): void {
    this.remote?.forward();
  }

  private reloadOrStop(): void {
    if (this.loading) {
      this.remote?.stop();
    } else {
      this.remote?.reload();
    }
  }

  private browserReady(): void {
    this.ready = true;
  }

  private browserEnded(): void {
    this.ready = false;
  }

  private browserState(event: CustomEvent<BrowserStateUpdate>): void {
    event.stopPropagation();
    const update = event.detail;
    const url = update.url ?? "";
    this.currentUrl = url === "about:blank" ? "" : url;
    this.remoteTitle = update.title ?? "";
    this.canGoBack = update.canGoBack ?? false;
    this.canGoForward = update.canGoForward ?? false;
    this.loading = update.loading ?? false;
    this.publishPage();
  }

  private async browserFavicon(event: CustomEvent<string>): Promise<void> {
    event.stopPropagation();
    const request = ++this.faviconRequest;
    const favicon = await decodedImage(event.detail);
    if (request !== this.faviconRequest || !this.isConnected) {
      return;
    }
    this.favicon = favicon;
    this.publishPage();
  }

  private publishPage(): void {
    this.dispatchEvent(
      new CustomEvent<BrowserPage>("browser-page-change", {
        detail: { url: this.url, title: this.pageTitle, favicon: this.favicon },
        bubbles: true,
        composed: true,
      }),
    );
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      min-height: 0;
      overflow: hidden;
      background: var(--tacta-color-background, #181818);
    }
    :host([hidden]) {
      display: none;
    }
    .browser-toolbar {
      display: flex;
      align-items: center;
      gap: var(--tacta-browser-toolbar-gap, 8px);
      flex: 0 0 auto;
      padding: var(--tacta-browser-toolbar-padding-block, 8px)
        var(--tacta-workspace-header-padding-inline, 16px);
      border-bottom: 1px solid var(--tacta-color-border, #ffffff0d);
    }
    slot {
      display: flex;
      position: absolute;
      inset: 0;
      background: var(--tacta-color-background, #181818);
    }
    .viewport {
      position: relative;
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
  `;

  private renderStartPage(): TemplateResult<1> | typeof nothing {
    if (this.url || this.navigationStarted) {
      return nothing;
    }
    return html`<slot></slot>`;
  }

  override render(): TemplateResult<1> {
    return html`<div class="browser-toolbar" role="group" aria-label=${text.toolbar}>
        <tacta-browser-navigation
          .ready=${this.ready}
          .url=${this.url}
          .canGoBack=${this.canGoBack}
          .canGoForward=${this.canGoForward}
          .loading=${this.loading}
          @back-request=${this.back}
          @forward-request=${this.forward}
          @reload-request=${this.reloadOrStop}
        ></tacta-browser-navigation>
        <tacta-browser-address-bar
          .url=${this.url}
          .label=${this.pageTitle}
          @address-submit=${this.submitAddress}
        ></tacta-browser-address-bar>
        <button
          class="button"
          aria-label="Toggle viewport fit"
          @click=${() => {
            this.mode = this.mode === "fit" ? "responsive" : "fit";
          }}
        >
          ${this.mode === "fit" ? "Fit" : "Responsive"}
        </button>
      </div>
      <div class="viewport">
        <tacta-remote-browser
          .active=${this.active}
          .connector=${this.connector}
          .mode=${this.mode}
          @browser-ready=${this.browserReady}
          @browser-state=${this.browserState}
          @browser-favicon=${this.browserFavicon}
          @browser-ended=${this.browserEnded}
        ></tacta-remote-browser>
        ${this.renderStartPage()}
      </div>`;
  }
}
