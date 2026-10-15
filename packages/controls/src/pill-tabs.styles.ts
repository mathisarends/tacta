import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const pillTabsStyles = css`
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
  .navigation {
    flex: 0 0 auto;
    padding: 16px 0;
    margin-bottom: var(--tacta-tabs-content-gap, 24px);
  }
  :host([scrollable]) .navigation {
    margin-bottom: 0;
  }
  :host([scrollable]) .panels {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .tabs {
    display: flex;
    gap: 4px;
    width: min(
      var(--tacta-tabs-content-width, 100%),
      calc(100% - 2 * var(--tacta-tabs-inline-gutter, 0px))
    );
    margin-inline: auto;
    padding-inline-start: var(--tacta-tabs-leading-space, 0px);
    overflow-x: auto;
  }
  button {
    flex: 0 0 auto;
    min-height: 40px;
    padding: 8px 18px;
    border: 0;
    border-radius: var(--tacta-radius-pill, 999px);
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-body, var(--tacta-text-base));
    font-weight: var(--tacta-font-weight-button, var(--tacta-font-weight-medium));
    transition:
      background var(--tacta-motion-duration-control, 160ms),
      color var(--tacta-motion-duration-control, 160ms);
  }
  button:hover {
    background: var(--tacta-color-surface, #252627);
    color: var(--tacta-color-text, #e6e6e6);
  }
  button[aria-selected="true"] {
    background: var(--tacta-color-selected, #303132);
    color: var(--tacta-color-text, #e6e6e6);
  }
  button:focus-visible {
    outline-offset: -3px;
  }
  :host([variant="underline"]) .navigation {
    padding-bottom: 0;
    border-bottom: 1px solid var(--tacta-color-border, #ffffff0d);
  }
  :host([variant="underline"]) .tabs {
    gap: 16px;
  }
  :host([variant="underline"]) button {
    padding-inline: 4px;
    border-bottom: 2px solid transparent;
    border-radius: 0;
    background: transparent;
  }
  :host([variant="underline"]) button[aria-selected="true"] {
    border-bottom-color: var(--tacta-color-text, #e6e6e6);
  }
  @media (max-width: 650px) {
    button {
      padding-inline: 12px;
      font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    }
  }
  [role="tabpanel"][hidden] {
    display: none;
  }
  [role="tabpanel"]:focus-visible {
    outline: 2px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: -2px;
    border-radius: var(--tacta-radius-subtle, 5px);
  }
`;
