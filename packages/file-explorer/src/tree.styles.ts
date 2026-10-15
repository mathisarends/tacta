import { css } from "lit";

export const treeStyles = css`
  .tree-row {
    display: flex;
    align-items: center;
    gap: var(--tacta-tree-row-gap, 7px);
    width: 100%;
    min-height: var(--tacta-tree-row-height, 34px);
    padding: 5px var(--tacta-tree-row-padding-inline, 8px);
    padding-left: calc(
      var(--tacta-tree-row-padding-inline, 8px) + var(--tacta-depth, 0) *
        var(--tacta-tree-indent, 14px)
    );
    border: 0;
    border-radius: var(--tacta-radius-menu-item, 7px);
    background: transparent;
    color: var(--tacta-color-text, #e6e6e6);
    text-align: left;
    font: var(--tacta-font-weight-control, var(--tacta-font-weight-regular))
      var(--tacta-font-size-tree, var(--tacta-font-size-body)) /
      var(--tacta-line-height-control, 1.4) var(--tacta-font-family, system-ui, sans-serif);
    cursor: pointer;
  }
  .tree-row:hover {
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  .tree-row[aria-current] {
    background: var(--tacta-color-selected, #303132);
    font-weight: var(--tacta-font-weight-medium, 500);
  }
  .tree-row:focus-visible {
    outline: 1px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: -1px;
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  .tree-row .name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tree-row svg {
    flex-shrink: 0;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .chevron,
  .file-icon {
    display: flex;
    flex-shrink: 0;
  }
  .file-icon {
    margin-left: calc(12px + var(--tacta-tree-row-gap, 7px));
  }
  .chevron {
    transform: rotate(-90deg);
  }
  .chevron.expanded {
    transform: none;
  }
`;
