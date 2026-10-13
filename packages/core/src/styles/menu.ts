import { css } from "lit";

export const menuStyles = css`
  .menu {
    position: fixed;
    inset: auto;
    margin: 0;
    padding: 5px;
    width: max-content;
    min-width: 180px;
    max-width: min(360px, calc(100vw - 16px));
    overflow-y: auto;
    border: 1px solid var(--tacta-color-border, #ffffff0d);
    border-radius: var(--tacta-radius-menu, 13px);
    background: var(--tacta-color-menu, var(--tacta-color-surface, #252627));
    color: var(--tacta-color-text, #e6e6e6);
    box-shadow: var(--tacta-shadow-menu, 0 12px 36px #0004);
  }
  .menu-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border: 0;
    border-radius: var(--tacta-radius-menu-item, 7px);
    background: transparent;
    text-align: left;
    color: var(--tacta-color-text, #e6e6e6);
    cursor: pointer;
    font: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400))
      var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))
      var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
  }
  .menu-option:hover,
  .menu-option:focus-visible,
  .menu-option[aria-checked="true"] {
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  .menu-option:focus-visible {
    outline: 1px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: -1px;
  }
`;
