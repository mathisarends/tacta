import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { menuStyles } from "@tacta/core/styles/menu";

export const modelMenuStyles = css`
  ${workspaceStyles}
  ${menuStyles}
  :host {
    display: block;
    min-width: 0;
  }
  .trigger {
    display: flex;
    align-items: center;
    gap: 7px;
    max-width: 100%;
    min-height: 36px;
    padding: 6px 10px;
    border: 0;
    border-radius: var(--tacta-radius-element, 8px);
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
  svg {
    flex: none;
  }
  .trigger > svg:first-child {
    color: var(--tacta-color-text, #e6e6e6);
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
  .menu {
    width: 420px;
    max-width: calc(100vw - 16px);
    height: 360px;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }
  .menu:popover-open {
    display: flex;
  }
  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }
  .search {
    display: flex;
    align-items: center;
    flex: none;
    gap: 7px;
    margin: 0 10px;
    padding: 13px 4px;
    border-bottom: 1px solid var(--tacta-color-border, #ffffff0d);
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .search:focus-within {
    border-bottom-color: var(--tacta-color-border-strong, #ffffff1f);
  }
  .search input {
    width: 100%;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: none;
    box-shadow: none;
    background: transparent;
    color: var(--tacta-color-text, #e6e6e6);
    font: inherit;
  }
  .model-list {
    flex: 1;
    min-height: 0;
    padding: 8px;
    overflow-y: auto;
  }
  .model {
    padding: 10px 12px;
    margin-bottom: 3px;
  }
  .model[aria-pressed="true"] {
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  .copy {
    flex: 1;
    min-width: 0;
  }
  .name {
    display: block;
    overflow-wrap: anywhere;
    font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold, 600));
  }
  .description {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 5px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
  .check {
    display: flex;
    flex: 0 0 16px;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .empty {
    padding: 14px 12px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
`;
