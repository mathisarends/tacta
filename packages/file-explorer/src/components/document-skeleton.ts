import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { agentText as text } from "../messages/index.js";
import "@tacta/core/loading";
import { random } from "../data/random.js";

function paragraphWidths(): number[] {
  const count = 2 + Math.floor(random() * 4);
  return Array.from({ length: count }, (_, index) => {
    if (index === count - 1) {
      return Math.round(38 + random() * 36);
    }
    return Math.round(88 + random() * 12);
  });
}

export class DocumentSkeleton extends LitElement {
  // Generate once so unrelated updates never move the placeholder content.
  private readonly titleWidth = Math.round(42 + random() * 22);
  private readonly introduction = paragraphWidths();
  private readonly tableRows = Array.from({ length: 3 + Math.floor(random() * 3) }, () => ({
    label: Math.round(50 + random() * 40),
    value: Math.round(55 + random() * 45),
  }));
  private readonly sections = Array.from({ length: 10 }, () => ({
    heading: random() > 0.35 ? Math.round(22 + random() * 24) : 0,
    paragraphs: Array.from({ length: 1 + Math.floor(random() * 2) }, paragraphWidths),
  }));

  static override styles = css`
    ${workspaceStyles}
    :host {
      --tacta-skeleton-background: color-mix(
        in srgb,
        var(--tacta-color-panel-hover, #2d2e2f) 55%,
        var(--tacta-color-background, #181818)
      );
      display: block;
      max-width: var(--tacta-document-content-width, 100ch);
      min-width: 0;
      height: 100%;
      box-sizing: border-box;
      overflow: hidden;
      padding-block: 16px 32px;
    }
    .loading-label {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
    .preview {
      display: flex;
      flex-direction: column;
      height: 100%;
      gap: 28px;
      overflow: hidden;
      mask-image: linear-gradient(to bottom, black calc(100% - 32px), transparent);
    }
    .preview > * {
      flex-shrink: 0;
    }
    .section {
      display: grid;
      gap: 24px;
      flex-grow: 1;
    }
    .lines {
      display: grid;
      gap: 12px;
    }
    app-skeleton {
      width: var(--tacta-skeleton-width, 100%);
      height: 11px;
    }
    .title {
      width: var(--tacta-skeleton-width, 54%);
      height: 24px;
      border-radius: var(--tacta-radius-inset, 6px);
    }
    .subtitle {
      width: var(--tacta-skeleton-width, 32%);
      height: 16px;
    }
    .block {
      display: grid;
      gap: 16px;
      padding-block: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 24px;
    }
  `;

  private renderBar(width: number, kind = ""): TemplateResult<1> {
    return html`<tacta-skeleton
      class=${kind}
      style="--tacta-skeleton-width:${width}%"
    ></tacta-skeleton>`;
  }

  private renderLines(widths: number[]): TemplateResult<1> {
    return html`<div class="lines">${widths.map((width) => this.renderBar(width))}</div>`;
  }

  private renderTable(): TemplateResult<1> {
    return html`<div class="block">
      ${this.tableRows.map(
        (row) =>
          html`<div class="row">${this.renderBar(row.label)}${this.renderBar(row.value)}</div>`,
      )}
    </div>`;
  }

  private renderHeading(width: number): TemplateResult<1> | typeof nothing {
    if (!width) {
      return nothing;
    }
    return this.renderBar(width, "subtitle");
  }

  private renderSection(section: { heading: number; paragraphs: number[][] }): TemplateResult<1> {
    return html`<div class="section">
      ${this.renderHeading(section.heading)}
      ${section.paragraphs.map((lines) => this.renderLines(lines))}
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`
      <span class="loading-label" role="status">${text.loading}</span>
      <div class="preview" aria-hidden="true">
        ${this.renderBar(this.titleWidth, "title")} ${this.renderLines(this.introduction)}
        <tacta-skeleton class="subtitle"></tacta-skeleton>
        ${this.renderTable()} ${this.sections.map((section) => this.renderSection(section))}
      </div>
    `;
  }
}
