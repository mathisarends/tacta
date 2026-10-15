import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const sideBarStyles = css`
  ${workspaceStyles}
  :host {
    display: flex;
    flex-direction: column;
    background: var(--tacta-color-sidebar, #1e1f20);
    border-right: 1px solid var(--tacta-color-border, #ffffff0d);
    box-sizing: border-box;
  }
  :host([hidden]) {
    display: none;
  }
  aside {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    min-width: 220px;
    gap: 4px;
    padding: 0 8px max(8px, env(safe-area-inset-bottom));
  }
  .sidebar-head {
    display: flex;
    height: var(--tacta-workspace-header-height, 60px);
    flex: 0 0 var(--tacta-workspace-header-height, 60px);
    align-items: center;
    gap: 4px;
    padding: 0 0 0 calc(var(--tacta-workspace-header-padding-inline, 16px) - 8px);
  }
  .sidebar-head slot[name="brand"] {
    display: block;
    flex: 1;
    font-size: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem));
    letter-spacing: var(--tacta-letter-spacing-brand, -0.01em);
  }
  .icon-button:hover {
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  [hidden] {
    display: none !important;
  }
  .new-chat[aria-current="page"] {
    background: var(--tacta-color-selected, #303132);
    color: var(--tacta-color-accent, #ffffff);
  }
  :host([collapsed]) aside {
    min-width: 0;
    padding-inline: 7px;
  }
  :host([collapsed]) .sidebar-head {
    justify-content: center;
    padding: 0;
  }
  :host([collapsed]) slot[name="brand"],
  :host([collapsed]) .nav-label,
  :host([collapsed]) .groups {
    display: none;
  }
  :host([collapsed]) .new-chat,
  :host([collapsed]) .sidebar-head .icon-button {
    width: 40px;
    height: 40px;
    justify-content: center;
    padding: 0;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  :host([collapsed]) .new-chat:hover,
  :host([collapsed]) .new-chat[aria-current="page"] {
    color: var(--tacta-color-text, #e6e6e6);
  }
  :host([collapsed]) .profile-footer {
    margin-top: auto;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 1px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: 2px;
  }
  .new-chat {
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    flex: none;
    display: flex;
    align-items: center;
    gap: 8px;
    border: 0;
    border-radius: var(--tacta-radius-control, 12px);
    background: none;
    color: var(--tacta-color-text, #e6e6e6);
    padding: 0 10px;
    font: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400))
      var(
        --tacta-font-size-navigation,
        var(--tacta-font-size-reading, var(--tacta-text-lg, 0.9375rem))
      ) /
      var(--tacta-line-height-body, 1.6)
      var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
    text-align: left;
    text-decoration: none;
    cursor: pointer;
  }
  .new-chat:hover {
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  .new-chat.active {
    background: var(--tacta-color-selected, #303132);
    color: var(--tacta-color-accent, #ffffff);
  }
  .groups {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    margin-top: 12px;
  }
  .group-title {
    margin: 16px 12px 6px;
    color: var(--tacta-color-muted, #a3a3a5);
    font: var(--tacta-font-weight-caption, var(--tacta-font-weight-regular, 400))
      var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem))
      var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
  }
  .profile-footer {
    flex: none;
    min-width: 0;
    padding-top: 8px;
  }
`;
