import { css } from "lit";
import { treeStyles } from "@tacta/file-explorer/tree.styles";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const explorerRowStyles = css`
  ${workspaceStyles}
  ${treeStyles}
  :host {
    display: block;
    position: relative;
  }
  button {
    font: inherit;
  }
  .row-action {
    position: absolute;
    top: 3px;
    right: 4px;
    display: grid;
    place-items: center;
    width: 26px;
    height: 26px;
    padding: 0;
    border: 0;
    border-radius: var(--tacta-radius-control, 12px);
    background: var(--tacta-color-panel-hover, #2d2e2f);
    color: var(--tacta-color-muted, #a3a3a5);
    opacity: 0;
    cursor: pointer;
  }
  :host(:hover) .row-action,
  .row-action:focus-visible {
    opacity: 1;
  }
  .row-action:hover {
    color: var(--tacta-color-error, #f0aaa1);
  }
  @media (hover: none) {
    .row-action {
      opacity: 1;
      background: transparent;
    }
  }
`;
