import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { icon } from "@tacta/core/icons";
import "@tacta/core/loading";
import { random } from "../data/random.js";

export class DocumentExplorerSkeleton extends LitElement {
  // Stable for this loading session, including while the explorer is resized.
  private readonly groups = Array.from({ length: 10 }, (_, group) => {
    const count = 3 + Math.floor(random() * 6);
    const nested = group > 0 && random() > 0.25;
    return {
      width: Math.round(70 + random() * 90),
      rows: Array.from({ length: count }, (_, index) => ({
        width: Math.round(80 + random() * 180),
        folder: nested && index === 1,
        depth: nested && index > 1 ? 2 : 1,
      })),
    };
  });

  static override styles = css`
    ${workspaceStyles}
    :host {
      --tacta-skeleton-background: color-mix(
        in srgb,
        var(--tacta-color-panel-hover, #2d2e2f) 55%,
        var(--tacta-color-background, #181818)
      );
      display: block;
      min-height: 0;
      overflow: hidden;
      padding: 2px var(--tacta-tree-row-padding-inline, 8px);
      mask-image: linear-gradient(to bottom, black calc(100% - 24px), transparent);
    }
    .tree {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    .group {
      flex: 1 0 auto;
    }
    .group + .group {
      margin-top: 12px;
    }
    .row {
      display: flex;
      align-items: center;
      gap: var(--tacta-tree-row-gap, 7px);
      height: var(--tacta-tree-row-height, 34px);
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .child {
      padding-left: calc(
        var(--tacta-depth) * var(--tacta-tree-indent, 14px) + 12px + var(--tacta-tree-row-gap, 7px)
      );
    }
    .child.folder {
      padding-left: calc(var(--tacta-depth) * var(--tacta-tree-indent, 14px));
    }
    .row svg {
      flex-shrink: 0;
      opacity: 0.55;
    }
    .row app-skeleton {
      height: 10px;
    }
    .label {
      width: min(var(--tacta-skeleton-width), 60%);
    }
    .child .label {
      width: min(var(--tacta-skeleton-width), 70%);
    }
    .row .file-shape {
      flex: 0 0 14px;
      height: 16px;
      border-radius: var(--tacta-radius-placeholder, 3px);
    }
  `;

  private renderLabel(width: number): TemplateResult<1> {
    return html`<tacta-skeleton
      class="label"
      style="--tacta-skeleton-width:${width}px"
    ></tacta-skeleton>`;
  }

  private renderMarker(folder: boolean): TemplateResult<1> {
    if (folder) {
      return html`${icon("chevronDown", 12)}${icon("folder", 14)}`;
    }
    return html`<tacta-skeleton class="file-shape"></tacta-skeleton>`;
  }

  private renderRow(row: { width: number; folder: boolean; depth: number }): TemplateResult<1> {
    return html`<div
      class="row child ${row.folder ? "folder" : ""}"
      style="--tacta-depth:${row.depth}"
    >
      ${this.renderMarker(row.folder)}${this.renderLabel(row.width)}
    </div>`;
  }

  override render(): TemplateResult<1> {
    return html`<div class="tree" aria-hidden="true">
      ${this.groups.map(
        (group) =>
          html`<div class="group">
            <div class="row">
              ${icon("chevronDown", 12)}${icon("folder", 14)}${this.renderLabel(group.width)}
            </div>
            ${group.rows.map((row) => this.renderRow(row))}
          </div>`,
      )}
    </div>`;
  }
}
