import { TactaElement as LitElement } from "@tacta/core/element";
import SpreadsheetWorker from "./spreadsheet.worker.js?worker";
import { css, html, nothing, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { fileBytes, type PreviewFile } from "./formats.js";
import { previewText as text } from "./messages/index.js";
import { previewStyles } from "./preview.styles.js";
import {
  MAX_PREVIEW_COLUMNS,
  MAX_PREVIEW_ROWS,
  type SheetPreview,
  type SheetReply,
  type SheetRow,
  type SheetRequest,
} from "./spreadsheet-types.js";

export class SpreadsheetPreview extends LitElement {
  @property({ attribute: false }) file!: PreviewFile;
  @state() private names: string[] = [];
  @state() private active = 0;
  @state() private sheet?: SheetPreview;
  @state() private filter = "";
  @state() private loading = true;
  @state() private failed = false;
  private worker?: Worker;

  override connectedCallback(): void {
    super.connectedCallback();
    if (this.hasUpdated) {
      this.open();
    }
  }

  override disconnectedCallback(): void {
    this.worker?.terminate();
    this.worker = undefined;
    super.disconnectedCallback();
  }

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (changed.has("file")) {
      this.open();
    }
  }

  private send(request: SheetRequest, transfer: Transferable[] = []): void {
    this.worker?.postMessage(request, transfer);
  }

  private open(): void {
    this.worker?.terminate();
    this.sheet = undefined;
    this.names = [];
    this.filter = "";
    this.active = 0;
    this.failed = false;
    this.loading = true;
    try {
      this.worker = new SpreadsheetWorker();
      this.worker.onerror = () => {
        this.failed = true;
        this.loading = false;
      };
      this.worker.onmessage = (event: MessageEvent<SheetReply>) => {
        const reply = event.data;
        if (reply.type === "names") {
          this.names = reply.names;
          this.select(0);
          return;
        }
        if (reply.type === "error") {
          this.failed = true;
          this.loading = false;
          return;
        }
        if (reply.index === this.active) {
          this.sheet = reply.sheet;
          this.loading = false;
          void this.updateComplete.then(() => {
            const viewport = this.renderRoot.querySelector(".viewport");
            viewport?.scrollTo(0, 0);
          });
        }
      };
      const bytes = fileBytes(this.file).buffer;
      this.send(
        {
          type: "open",
          bytes,
          delimited: /\.(csv|tsv)$/i.test(this.file.path),
          tabSeparated: /\.tsv$/i.test(this.file.path),
        },
        [bytes],
      );
    } catch {
      this.failed = true;
      this.loading = false;
    }
  }

  private select(index: number): void {
    if (!this.names[index]) {
      this.failed = true;
      this.loading = false;
      return;
    }
    this.active = index;
    this.filter = "";
    this.loading = true;
    this.send({ type: "sheet", index });
  }

  static override styles = [
    ...previewStyles,
    css`
      input {
        min-width: 100px;
        width: 170px;
        border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
        background: var(--tacta-color-background, #181818);
        color: var(--tacta-color-text, #e6e6e6);
        border-radius: var(--tacta-radius-pill, 999px);
        padding: 7px 12px;
        font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      }
      table {
        border-collapse: separate;
        border-spacing: 0;
        font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
        width: max-content;
        min-width: 100%;
      }
      td,
      th {
        padding: 10px 14px;
        border-bottom: 1px solid var(--tacta-color-border-strong, #ffffff1f);
        border-right: 1px solid var(--tacta-color-border-strong, #ffffff1f);
        min-width: 110px;
        max-width: 300px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: left;
      }
      td {
        background: var(--tacta-color-background, #181818);
      }
      th {
        color: var(--tacta-color-muted, #a3a3a5);
        font-weight: var(--tacta-font-weight-table-header, var(--tacta-font-weight-medium));
        background: var(--tacta-color-surface, #252627);
      }
      thead th {
        position: sticky;
        top: 0;
        z-index: 2;
        text-align: center;
      }
      tr > th:first-child {
        position: sticky;
        left: 0;
        min-width: 36px;
        text-align: center;
        padding-inline: 8px;
      }
      thead th:first-child {
        z-index: 3;
      }
      .numeric {
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      tbody tr:first-child td {
        font-weight: var(--tacta-font-weight-emphasis, var(--tacta-font-weight-semibold));
        background: var(--tacta-color-surface, #252627);
      }
      tr:hover td {
        background: var(--tacta-color-panel-hover, #2d2e2f);
      }
      .sheets {
        display: flex;
        overflow-x: auto;
        gap: 5px;
        padding: 8px 12px;
        border-top: 1px solid var(--tacta-color-border-strong, #ffffff1f);
        background: var(--tacta-color-background, #181818);
      }
      .sheets button {
        flex-shrink: 0;
        padding: 6px 14px;
        border: 0;
        border-radius: var(--tacta-radius-subtle, 5px);
        background: transparent;
        color: var(--tacta-color-muted, #a3a3a5);
        font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
      }
      .sheets button[aria-pressed="true"] {
        background: var(--tacta-color-selected, #303132);
        color: var(--tacta-color-text, #e6e6e6);
      }
      .note {
        border-top: 1px solid var(--tacta-color-border, #ffffff0d);
      }
    `,
  ];

  private renderRow(row: SheetRow): TemplateResult<1> {
    return html`<tr>
      <th scope="row">${row.number}</th>
      ${row.cells.map(
        (cell) =>
          html`<td class=${cell.numeric ? "numeric" : ""} title=${cell.text}>${cell.text}</td>`,
      )}
    </tr>`;
  }

  private renderTable(sheet: SheetPreview | undefined, rows: SheetRow[]): TemplateResult<1> {
    if (!sheet?.rows.length) {
      return html`<div class="state">${text.emptySheet}</div>`;
    }
    return html`<table aria-label=${sheet.name}>
      <thead>
        <tr>
          <th aria-label=${text.rowNumber}></th>
          ${sheet.columns.map((column) => html`<th scope="col">${column}</th>`)}
        </tr>
      </thead>
      <tbody>
        ${rows.map((row) => this.renderRow(row))}
      </tbody>
    </table>`;
  }

  override render(): TemplateResult<1> {
    const sheet = this.sheet;
    const search = this.filter.trim().toLocaleLowerCase();
    const rows =
      sheet?.rows.filter(
        (row) =>
          !search || row.cells.some((cell) => cell.text.toLocaleLowerCase().includes(search)),
      ) ?? [];
    return html` <div class="controls">
        <input
          type="search"
          aria-label=${text.filterRows}
          placeholder=${text.filterRows}
          .value=${this.filter}
          ?disabled=${this.loading || this.failed}
          @input=${(event: Event) => (this.filter = (event.target as HTMLInputElement).value)}
        />
        <span class="meta" role="status"
          >${sheet ? text.cells({ rows: rows.length, columns: sheet.columns.length }) : ""}</span
        >
      </div>
      ${this.loading ? html`<div class="state" role="status">${text.loading}</div>` : nothing}
      ${this.failed ? html`<div class="state" role="alert"><p>${text.failed}</p></div>` : nothing}
      <div
        class="viewport"
        ?hidden=${this.loading || this.failed}
        tabindex="0"
        aria-label=${sheet?.name ?? text.sheets}
      >
        ${this.renderTable(sheet, rows)}
      </div>
      ${sheet?.limited ? html`<p class="note" role="status">${text.limited({ rows: MAX_PREVIEW_ROWS, columns: MAX_PREVIEW_COLUMNS })}</p>` : nothing}
      <nav aria-label=${text.sheets} class="sheets">
        ${this.names.map((name, index) => html`<button aria-pressed=${index === this.active} @click=${() => this.select(index)}>${name}</button>`)}
      </nav>
      <p class="note">${text.formulas}</p>`;
  }
}
