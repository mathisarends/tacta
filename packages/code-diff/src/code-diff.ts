import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, nothing, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import type { DiffHunk, DiffLine } from "./types.js";
import { DiffSyntaxController } from "./diff-syntax-controller.js";
import { diffText } from "./messages/index.js";

export class CodeDiff extends LitElement {
  @property({ attribute: false }) hunks: DiffHunk[] = [];
  @property() label = "";
  @property() path = "";
  private readonly syntax = new DiffSyntaxController(this);

  protected override willUpdate(): void {
    void this.syntax.load(this.hunks, this.path);
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
    }
    .diff {
      overflow: auto;
      font-family: var(--tacta-font-mono, ui-monospace, monospace);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
      line-height: var(--tacta-line-height-code, 1.6);
    }
    .hunk {
      padding: 7px 12px;
      margin: 4px 10px;
      color: var(--tacta-color-muted, #a3a3a5);
      background: var(--tacta-color-selected, #303132);
      border-radius: var(--tacta-radius-element, 8px);
      font-family: var(--tacta-font-family, system-ui, sans-serif);
    }
    .line {
      display: flex;
      min-width: max-content;
      border-inline-start: 3px solid transparent;
    }
    .added {
      background: var(
        --tacta-color-diff-added-surface,
        color-mix(in srgb, var(--tacta-color-diff-added) 13%, transparent)
      );
      border-color: var(--tacta-color-diff-added, #56c790);
    }
    .removed {
      background: var(
        --tacta-color-diff-removed-surface,
        color-mix(in srgb, var(--tacta-color-diff-removed) 13%, transparent)
      );
      border-color: var(--tacta-color-diff-removed, #ef7777);
    }
    .number {
      width: 5ch;
      flex: none;
      text-align: right;
      padding-inline-end: 12px;
      color: var(--tacta-color-muted, #a3a3a5);
      user-select: none;
    }
    .sign {
      width: 2ch;
      flex: none;
      user-select: none;
    }
    .added .sign {
      color: var(--tacta-color-diff-added, #56c790);
    }
    .removed .sign {
      color: var(--tacta-color-diff-removed, #ef7777);
    }
    code {
      display: block;
      white-space: pre;
      padding-inline-end: 16px;
      font: inherit;
      tab-size: 4;
      min-height: 1lh;
    }
    .tok-keyword,
    .tok-operator {
      color: var(--tacta-color-syntax-heading, #ff8e86);
    }
    .tok-string,
    .tok-string2,
    .tok-inserted {
      color: var(--tacta-color-positive, #b5df69);
    }
    .tok-number,
    .tok-bool,
    .tok-atom,
    .tok-typeName {
      color: var(--tacta-color-warning, #e5c07b);
    }
    .tok-propertyName,
    .tok-labelName,
    .tok-namespace {
      color: var(--tacta-color-syntax-property, #9ccaff);
    }
    .tok-comment,
    .tok-meta {
      color: var(--tacta-color-muted, #a3a3a5);
    }
  `;

  private renderLine(line: DiffLine): TemplateResult<1> {
    let sign = " ";
    if (line.kind === "added") {
      sign = "+";
    }
    if (line.kind === "removed") {
      sign = "−";
    }
    const tokens = this.syntax.tokens.get(line);
    const text = tokens
      ? tokens.map((token) => html`<span class=${token.classes}>${token.text}</span>`)
      : line.text.replace(/\r?\n$/, "");
    return html`<div class="line ${line.kind}">
      <span class="number">${line.oldLine ?? ""}</span
      ><span class="number">${line.newLine ?? ""}</span><span class="sign">${sign}</span
      ><code>${text}</code>
    </div>`;
  }

  private renderHunk(hunk: DiffHunk, index: number): TemplateResult<1> {
    const previous = this.hunks[index - 1];
    const oldEnd = previous?.lines.filter((line) => line.oldLine !== null).at(-1)?.oldLine ?? 0;
    const count = hunk.oldStart - oldEnd - 1;
    return html`${count > 0 ? html`<div class="hunk">${diffText.unchanged({ count })}</div>` : nothing}${hunk.lines.map((line) => this.renderLine(line))}`;
  }

  override render(): TemplateResult<1> {
    return html`<div class="diff" role="region" aria-label=${this.label} tabindex="0">
      ${this.hunks.map((hunk, index) => this.renderHunk(hunk, index))}
    </div>`;
  }
}
