import { css } from "lit";
import { workspaceStyles } from "./styles/workspace.js";

export const segmentedTabsStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    min-width: 0;
  }
  :host([scrollable]) {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  :host([scrollable]) .navigation {
    flex: 0 0 auto;
    margin-bottom: 0;
    padding: 8px 16px 24px;
  }
  :host([scrollable]) .panels {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .navigation {
    display: flex;
    justify-content: center;
    margin-bottom: var(--tabs-content-gap, 40px);
  }
  .tabs {
    display: inline-flex;
    max-width: 100%;
    overflow-x: auto;
    padding: 3px;
    border-radius: var(--tacta-radius-pill, 999px);
    background: var(--tacta-color-sidebar, #1e1f20);
  }
  button {
    flex: 1 0 auto;
    padding: 8px 24px;
    min-width: 120px;
    min-height: 40px;
    border: 0;
    border-radius: var(--tacta-radius-pill, 999px);
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    font-weight: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500));
    transition:
      background var(--tacta-motion-duration-control, 160ms),
      color var(--tacta-motion-duration-control, 160ms);
  }
  button:hover {
    color: var(--tacta-color-text, #e6e6e6);
  }
  button[aria-selected="true"] {
    background: var(--tacta-color-surface, #252627);
    color: var(--tacta-color-text, #e6e6e6);
  }
  button:focus-visible {
    outline-offset: -3px;
  }
  [role="tabpanel"][hidden] {
    display: none;
  }
  [role="tabpanel"]:focus-visible {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: 6px;
    border-radius: var(--tacta-radius-subtle, 5px);
  }
  @media (max-width: 650px) {
    .navigation {
      margin-bottom: var(--tabs-content-gap, 24px);
    }
    button {
      min-width: 100px;
      padding-inline: 18px;
    }
  }
`;
