import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const pagePaginationStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
  }
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .page-number {
    color: var(--tacta-color-muted, #667085);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
`;
