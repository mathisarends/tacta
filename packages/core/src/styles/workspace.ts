import { css } from "lit";
import { controls } from "./controls.js";
import { scrollbarStyles } from "./scrollbar.js";

export const workspaceStyles = css`
  ${controls}
  :host {
    font-family: var(
      --tacta-font-family,
      "Segoe UI Variable Text",
      "Segoe UI",
      "Geist Variable",
      sans-serif
    );
    font-size: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem));
    line-height: var(--tacta-line-height-body, 1.6);
    font-weight: var(--tacta-font-weight-body, var(--tacta-font-weight-regular, 400));
    letter-spacing: var(--tacta-letter-spacing-ui, normal);
    color: var(--tacta-color-text, #e6e6e6);
  }
  strong,
  b {
    font-weight: var(--tacta-font-weight-emphasis, var(--tacta-font-weight-semibold, 600));
  }
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold, 600));
    letter-spacing: var(--tacta-letter-spacing-heading, -0.025em);
  }
  .button {
    min-height: 34px;
    gap: 8px;
    padding: 8px 14px;
    border: 0;
    border-radius: var(--tacta-radius-pill, 999px);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
  }
  .button.primary:hover:not(:disabled) {
    transform: none;
  }
  .icon-button {
    width: 32px;
    height: 32px;
    display: inline-grid;
    place-items: center;
    flex: 0 0 auto;
    padding: 0;
    border: 0;
    border-radius: var(--tacta-radius-control, 12px);
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
    cursor: pointer;
  }
  .icon-button:hover {
    color: var(--tacta-color-text, #e6e6e6);
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  @media (min-width: 801px) {
    .sidebar-toggle {
      display: none;
    }
  }
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  textarea:focus-visible,
  select:focus-visible,
  [tabindex]:focus-visible {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: 2px;
  }
  input,
  textarea,
  select {
    font-family: var(
      --tacta-font-family,
      "Segoe UI Variable Text",
      "Segoe UI",
      "Geist Variable",
      sans-serif
    );
    accent-color: var(--tacta-color-accent, #ffffff);
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--tacta-color-muted, #a3a3a5);
    opacity: 1;
  }
  input:focus-visible,
  select:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--tacta-color-muted, #a3a3a5);
  }
  ${scrollbarStyles}
`;
