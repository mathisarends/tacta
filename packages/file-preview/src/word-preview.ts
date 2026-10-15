import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import DOMPurify from "dompurify";
import { fileBytes, type PreviewFile } from "./formats.js";
import { previewText as text } from "./messages/index.js";
import { previewStyles } from "./preview.styles.js";

/** A DOCX stays inert: sanitized output, sandboxed frame, no external resources. */
export class WordPreview extends LitElement {
  @property({ attribute: false }) file!: PreviewFile;
  @state() private source = "";
  @state() private loading = true;
  @state() private failed = false;
  private request = 0;

  override disconnectedCallback(): void {
    ++this.request;
    super.disconnectedCallback();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) {
      void this.load();
    }
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("file")) {
      void this.load();
    }
  }

  private async load(): Promise<void> {
    const request = ++this.request;
    this.source = "";
    this.loading = true;
    this.failed = false;
    try {
      const { renderAsync } = await import("docx-preview");
      if (request !== this.request || !this.isConnected) {
        return;
      }
      const body = document.createElement("div");
      const styles = document.createElement("div");
      await renderAsync(fileBytes(this.file).buffer, body, styles, {
        useBase64URL: true,
        renderAltChunks: false,
        renderComments: false,
        ignoreHeight: true,
        breakPages: true,
      });
      if (request !== this.request || !this.isConnected) {
        return;
      }
      const clean = DOMPurify.sanitize(`${styles.innerHTML}${body.innerHTML}`, {
        ADD_TAGS: ["style"],
        FORCE_BODY: true,
        FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
        FORBID_ATTR: ["href", "target", "srcset"],
      });
      const theme = getComputedStyle(this);
      const background = theme.getPropertyValue("--tacta-color-sidebar").trim();
      const paper = theme.getPropertyValue("--tacta-color-paper").trim();
      const ink = theme.getPropertyValue("--tacta-color-on-paper").trim();
      const shadow = theme.getPropertyValue("--tacta-shadow-paper").trim();
      // CSP also constrains CSS/font/image URLs originating inside the document.
      this.source = `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; font-src data:; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'"><style>
        html { color-scheme: light; background: ${background}; }
        body { margin: 0; font-family: system-ui, sans-serif; }
        .docx-wrapper { background: transparent !important; padding: 20px 16px !important; }
        section.docx { max-width: 100%; box-sizing: border-box; background: ${paper} !important; color: ${ink}; box-shadow: ${shadow} !important; margin-bottom: 20px !important; }
        @media(max-width: 600px) { section.docx { padding: 28px !important; } }
      </style></head><body>${clean}</body></html>`;
      this.loading = false;
    } catch {
      if (request === this.request && this.isConnected) {
        this.failed = true;
        this.loading = false;
      }
    }
  }

  static override styles = [
    ...previewStyles,
    css`
      iframe {
        flex: 1;
        width: 100%;
        min-height: 0;
        border: 0;
        background: var(--tacta-color-sidebar, #1e1f20);
      }
      .note {
        border-top: 1px solid var(--tacta-color-border-strong, #ffffff1f);
      }
    `,
  ];

  private renderDocument(): TemplateResult<1> | typeof nothing {
    if (!this.source) {
      return nothing;
    }
    return html`<iframe
        title=${text.word}
        sandbox=""
        referrerpolicy="no-referrer"
        .srcdoc=${this.source}
      ></iframe>
      <p class="note">${text.wordNote}</p>`;
  }

  override render(): TemplateResult<1> {
    return html` ${this.loading ? html`<div class="state" role="status">${text.loading}</div>` : nothing}
    ${this.failed ? html`<div class="state" role="alert"><p>${text.failed}</p></div>` : nothing}
    ${this.renderDocument()}`;
  }
}
