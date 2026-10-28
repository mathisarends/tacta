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
    margin-bottom: var(--tabs-content-gap, 24px);
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
    width: min(var(--tabs-content-width, 100%), calc(100% - 2 * var(--tabs-inline-gutter, 0px)));
    margin-inline: auto;
    padding-inline-start: var(--tabs-leading-space, 0px);
    overflow-x: auto;
  }
  .section-picker {
    display: none;
  }
  button {
    flex: 0 0 auto;
    min-height: 40px;
    padding: 8px 18px;
    border: 0;
    border-radius: var(--tacta-radius-pill, 999px);
    background: transparent;
    color: var(--tacta-color-muted, #667085);
    font-size: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem));
    font-weight: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500));
    transition:
      background var(--tacta-motion-duration-control, 160ms),
      color var(--tacta-motion-duration-control, 160ms);
  }
  button:hover {
    background: var(--tacta-color-surface, #f3f4f6);
    color: var(--tacta-color-text, #202124);
  }
  button[aria-selected="true"] {
    background: var(--tacta-color-selected, #e8edf8);
    color: var(--tacta-color-text, #202124);
  }
  button:focus-visible {
    outline-offset: -3px;
  }
  :host([variant="underline"]) .navigation {
    padding-bottom: 0;
    border-bottom: 1px solid var(--tacta-color-border, #e5e7eb);
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
    border-bottom-color: var(--tacta-color-text, #202124);
  }
  @media (max-width: 650px) {
    button {
      padding-inline: 12px;
      font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    }
  }
  @media (max-width: 800px) {
    :host([compact]) .navigation {
      padding: 8px var(--tacta-mobile-page-gutter, initial);
      padding-inline-start: calc(
        var(--tacta-mobile-page-gutter, initial) + var(--tabs-leading-space, 0px)
      );
    }
    :host([compact]) .tabs {
      display: none;
    }
    :host([compact]) .section-picker {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: var(--tacta-touch-target, 36px);
      font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
      color: var(--tacta-color-muted, #667085);
    }
    select {
      flex: 1;
      min-width: 0;
      min-height: var(--tacta-touch-target, 36px);
      border: 1px solid var(--tacta-color-border-strong, #c3c7cf);
      border-radius: var(--tacta-radius-control, 12px);
      padding-inline: 12px;
      background: var(--tacta-color-surface, #f3f4f6);
      color: var(--tacta-color-text, #202124);
      font-size: var(--tacta-font-size-input, var(--tacta-text-xl, 1rem));
    }
  }
  [role="tabpanel"][hidden] {
    display: none;
  }
  [role="tabpanel"]:focus-visible {
    outline: 2px solid var(--tacta-color-focus, #2563eb);
    outline-offset: -2px;
    border-radius: var(--tacta-radius-subtle, 5px);
  }
`;
