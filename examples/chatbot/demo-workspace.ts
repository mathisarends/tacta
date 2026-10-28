import { LitElement, css, html, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { Surface, WorkspaceTabData, TabMove } from "@tacta/workspace";
import "@tacta/workspace/register";

/** Demo-owned surface content; Tacta owns the tab strip and surface picker. */
export class DemoWorkspace extends LitElement {
  @property({ type: Boolean }) maximized = false;
  @state() private tabs: WorkspaceTabData[] = [];
  @state() private active: string | null = null;
  @state() private preferences = false;
  @state() private file = "README.md";

  private open(surface: Surface): void {
    const tab = { id: crypto.randomUUID(), label: surface, surface, url: "", favicon: "" };
    this.tabs = [...this.tabs, tab];
    this.active = tab.id;
    this.preferences = false;
  }
  private close(id: string): void {
    const index = this.tabs.findIndex((tab) => tab.id === id);
    this.tabs = this.tabs.filter((tab) => tab.id !== id);
    if (this.active === id) {
      this.active = this.tabs[Math.min(index, this.tabs.length - 1)]?.id ?? null;
    }
  }
  private move({ id, index }: TabMove): void {
    const tab = this.tabs.find((tab) => tab.id === id);
    if (!tab) {
      return;
    }
    const tabs = this.tabs.filter((tab) => tab.id !== id);
    tabs.splice(index, 0, tab);
    this.tabs = tabs;
  }
  static override styles = css`
    ${workspaceStyles}
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--tacta-color-background);
    }
    .tools {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      border-bottom: 1px solid var(--tacta-color-border);
      gap: 12px;
    }
    .tools span {
      font-size: 12px;
      color: var(--tacta-color-muted);
    }
    .body {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
    .empty {
      display: grid;
      place-content: center;
      height: 100%;
      padding: 24px;
    }
    .empty h2 {
      font-size: 20px;
      margin: 0 0 10px;
      font-weight: 500;
    }
    .empty p,
    .note {
      font-size: 13px;
      color: var(--tacta-color-muted);
    }
    .surface {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .address {
      padding: 10px 16px;
      font-size: 13px;
      background: var(--tacta-color-sidebar);
      border-bottom: 1px solid var(--tacta-color-border);
    }
    iframe {
      border: 0;
      width: 100%;
      flex: 1;
      background: white;
    }
    pre {
      white-space: pre-wrap;
      padding: 20px;
      font: 13px/1.7 var(--tacta-font-mono, monospace);
    }
    .note {
      padding: 12px 16px;
      border-bottom: 1px solid var(--tacta-color-border);
      margin: 0;
    }
    .files {
      display: flex;
      gap: 8px;
      padding: 12px;
    }
    [hidden] {
      display: none !important;
    }
  `;
  private content(tab: WorkspaceTabData) {
    if (tab.surface === "Browser") {
      return html`<div class="address">tacta://welcome</div>
        <p class="note">Local browser preview · Connect a browser session in your app.</p>
        <iframe
          title="Local browser preview"
          sandbox=""
          srcdoc="<!doctype html><html lang='en'><meta name='viewport' content='width=device-width'><style>body{font:16px/1.7 system-ui;margin:48px;color:#242424}small{color:#666}h1{font-size:28px;letter-spacing:-.03em}</style><small>TACTA / BROWSER</small><h1>A place to explore.</h1><p>Your browser surface lives alongside the conversation. This local document demonstrates the layout without a remote browser service.</p></html>"
        ></iframe>`;
    }
    if (tab.surface === "Terminal") {
      return html`<p class="note">Terminal preview · No shell is connected.</p>
        <pre>
$ npm run build
✓ @tacta/core
✓ @tacta/chat
✓ @tacta/workspace

Application transport supplies terminal output here.</pre>`;
    }
    return html`<p class="note">Sample files · No filesystem access.</p>
      <div class="files">
        ${["README.md", "app.ts"].map(
          (name) =>
            html`<button
              class="button"
              @click=${() => {
                this.file = name;
              }}
            >
              ${name}
            </button>`,
        )}
      </div>
      <pre>
${this.file === "README.md" ? "# Tacta workspace\n\nOpen Browser, Terminal or Files with the + menu.\nTabs can be selected, reordered and closed." : 'import "@tacta/chat/register";\nimport "@tacta/workspace/register";\n\n// Your app owns data and transport.'}</pre>`;
  }
  override render() {
    return html`<tacta-workspace-tab-bar
        .tabs=${this.tabs}
        .active=${this.active}
        .maximized=${this.maximized}
        .panelFor=${(id: string) => this.renderRoot.querySelector<HTMLElement>(`[data-panel="${id}"]`)}
        @surface-open=${(event: CustomEvent<Surface>) => this.open(event.detail)}
        @tab-select=${(event: CustomEvent<string>) => {
          this.active = event.detail;
          this.preferences = false;
        }}
        @tab-close=${(event: CustomEvent<string>) => this.close(event.detail)}
        @tab-move=${(event: CustomEvent<TabMove>) => this.move(event.detail)}
      ></tacta-workspace-tab-bar>
      <div class="tools">
        <span>Workspace</span
        ><button
          class="button"
          aria-pressed=${this.preferences}
          @click=${() => {
            this.preferences = !this.preferences;
          }}
        >
          Preferences
        </button>
      </div>
      <div class="body" ?hidden=${this.preferences}>
        ${
          !this.tabs.length
            ? html`<div class="empty">
                <h2>Open a workspace</h2>
                <p>Keep your tools beside the conversation.</p>
                <tacta-surface-picker
                  @surface-open=${(event: CustomEvent<Surface>) => this.open(event.detail)}
                ></tacta-surface-picker>
              </div>`
            : nothing
        }
        ${repeat(
          this.tabs,
          (tab) => tab.id,
          (tab) =>
            html`<section
              class="surface"
              role="tabpanel"
              aria-label=${tab.label}
              data-panel=${tab.id}
              ?hidden=${tab.id !== this.active}
            >
              ${this.content(tab)}
            </section>`,
        )}
      </div>
      <div class="body" ?hidden=${!this.preferences}><slot></slot></div>`;
  }
}
customElements.define("tacta-demo-workspace", DemoWorkspace);
