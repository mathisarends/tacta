import { css } from "lit";
import { menuStyles } from "@tacta/core/styles/menu";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const surfacePickerStyles = css`
  ${workspaceStyles}
  ${menuStyles}
  :host {
    display: block;
  }
  :host(:not([menu])) {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  .surface-option > span {
    flex: 1;
    min-width: 0;
  }
  .surface-option > svg,
  .surface-option kbd {
    color: var(--tacta-color-muted, #a3a3a5);
    flex: none;
  }
  button:focus-visible {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: 2px;
  }
  .picker {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px var(--tacta-workspace-header-padding-inline, 16px);
  }
  .picker:focus {
    outline: none;
  }
  .picker-menu {
    width: min(100%, var(--tacta-workspace-surface-content-width, 680px));
    flex: 0 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 240px), 1fr));
    gap: 12px;
  }
  .picker h3 {
    grid-column: 1 / -1;
    margin: 0 0 8px;
    font-size: var(--tacta-font-size-header-title, var(--tacta-text-xl, 1rem));
    line-height: var(--tacta-line-height-heading, 1.3);
    letter-spacing: var(--tacta-letter-spacing-heading, -0.025em);
    font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold, 600));
  }
  .picker .surface-option {
    min-height: 40px;
    gap: 12px;
    padding: 8px 12px;
    border-radius: var(--tacta-radius-menu-item, 7px);
    background: var(--tacta-color-sidebar, #1e1f20);
    font-size: var(--tacta-font-size-reading, var(--tacta-text-lg, 0.9375rem));
    font-weight: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400));
    line-height: var(--tacta-line-height-control, 1.4);
    transition: background var(--tacta-motion-duration-control, 160ms);
  }
  .picker .surface-option:hover,
  .picker .surface-option:focus-visible {
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  .picker .surface-option > svg:first-child {
    width: 1.25em;
    height: 1.25em;
  }
  kbd {
    color: var(--tacta-color-muted, #a3a3a5);
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    border-radius: var(--tacta-radius-subtle, 5px);
    background: var(--tacta-color-sidebar, #1e1f20);
    text-align: center;
    font: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400))
      var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem))
      var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
  }
  .picker kbd {
    width: 24px;
    height: 20px;
    border-radius: var(--tacta-radius-pill, 999px);
    background: var(--tacta-color-surface, #252627);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
`;
