import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { menuStyles } from "@tacta/core/styles/menu";

export const composerMenuStyles = css`
  ${workspaceStyles}
  ${menuStyles}
    :host {
    display: block;
    min-width: 0;
  }
  .trigger {
    display: flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    min-height: 36px;
    padding: 6px 10px;
    border: 0;
    border-radius: var(--tacta-radius-tab, 8px);
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
    font: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500))
      var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))
      var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
    cursor: pointer;
    white-space: nowrap;
  }
  .trigger span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .trigger svg {
    flex: none;
  }
  .trigger:hover:not(:disabled),
  .trigger[aria-expanded="true"] {
    background: var(--tacta-color-panel-hover, #2d2e2f);
    color: var(--tacta-color-text, #e6e6e6);
  }
  .trigger:disabled {
    opacity: 0.45;
    cursor: default;
  }
  .group + .group {
    border-top: 1px solid var(--tacta-color-border, #ffffff0d);
    margin-top: 5px;
    padding-top: 5px;
  }
  .heading {
    margin: 5px 10px 6px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold, 600));
  }
  .copy {
    flex: 1;
    min-width: 0;
  }
  .name {
    display: flex;
    align-items: center;
    gap: 7px;
  }
  .description {
    display: block;
    margin-top: 5px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  .badge {
    border: 1px solid var(--tacta-color-border, #ffffff0d);
    border-radius: var(--tacta-radius-subtle, 5px);
    padding: 0 5px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs, 0.6875rem));
  }
  .check {
    display: flex;
    width: 14px;
    flex: none;
  }
`;
