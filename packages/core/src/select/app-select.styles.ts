import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const appSelectStyles = css`
  ${workspaceStyles}
  :host {
    display: inline-block;
    position: relative;
    min-width: 0;
    max-width: 100%;
  }
  .trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    width: 100%;
    min-height: 34px;
    padding: 8px 14px;
    border: 0;
    border-radius: var(--tacta-radius-pill, 999px);
    background: var(--tacta-color-surface, #f3f4f6);
    color: var(--tacta-color-text, #202124);
    font: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500))
      var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem))
      var(--tacta-font-family, system-ui, sans-serif);
    text-align: left;
    transition:
      background var(--tacta-motion-duration-control, 160ms),
      box-shadow var(--tacta-motion-duration-control, 160ms);
  }
  .trigger:hover:not(:disabled) {
    background: var(--tacta-color-panel-hover, #e5e7eb);
  }
  .trigger:focus-visible,
  .trigger[aria-expanded="true"] {
    outline: none;
    box-shadow: 0 0 0 2px var(--tacta-color-muted, #667085);
  }
  .trigger:disabled {
    cursor: default;
  }
  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .chevron {
    display: flex;
    flex: 0 0 auto;
    color: var(--tacta-color-muted, #667085);
    transition: transform var(--tacta-motion-duration-control, 160ms);
  }
  [aria-expanded="true"] .chevron {
    transform: rotate(180deg);
    color: var(--tacta-color-accent, #2563eb);
  }
  .menu {
    position: absolute;
    z-index: 15;
    inset-inline-start: 0;
    bottom: calc(100% + 8px);
    min-width: 100%;
    width: max-content;
    max-width: min(320px, calc(100vw - 48px));
    max-height: min(260px, 40dvh);
    overflow-y: auto;
    padding: 5px;
    border: 0;
    border-radius: var(--tacta-radius-panel, 20px);
    background: var(--tacta-color-surface, #f3f4f6);
    box-shadow: var(
      --tacta-shadow-panel,
      0 12px 40px color-mix(in srgb, var(--tacta-color-background, #ffffff) 65%, transparent)
    );
  }
  :host([placement="bottom"]) .menu {
    top: calc(100% + 8px);
    bottom: auto;
  }
  .option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 9px 10px;
    border-radius: calc(var(--tacta-radius-control, 12px) - 3px);
    color: var(--tacta-color-text, #202124);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    cursor: pointer;
  }
  .option.active {
    background: var(--tacta-color-panel-hover, #e5e7eb);
  }
  .option[aria-selected="true"] {
    color: var(--tacta-color-accent, #2563eb);
    background: var(--tacta-color-accent-soft, #ffffff14);
  }
  .option.active[aria-selected="true"] {
    box-shadow: inset 0 0 0 1px var(--tacta-color-border-strong, #c3c7cf);
  }
  .check {
    display: flex;
    width: 15px;
    flex: 0 0 auto;
  }
`;
