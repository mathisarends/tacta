import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const agentApprovalSettingsStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    padding: 24px 0 12px;
    border-top: 1px solid var(--tacta-color-border, #ffffff0d);
    margin-top: 24px;
  }
  h2 {
    margin: 0;
    font-size: var(--tacta-font-size-body, var(--tacta-text-base));
    font-weight: var(--tacta-font-weight-medium, 500);
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  .intro,
  .hint {
    max-width: 65ch;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    line-height: var(--tacta-line-height-body, 1.6);
    text-wrap: pretty;
  }
  .intro {
    margin: 6px 0 18px;
  }
  fieldset {
    padding: 0;
    border: 0;
    margin: 0;
    min-width: 0;
  }
  legend {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
  }
  .mode {
    display: grid;
    grid-template-columns: 16px 1fr;
    column-gap: 12px;
    padding: 12px 0;
    cursor: pointer;
  }
  .mode + .mode {
    border-top: 1px solid var(--tacta-color-border, #ffffff0d);
  }
  input[type="radio"] {
    grid-row: 1 / 3;
    width: 15px;
    height: 15px;
    margin: 3px 0 0;
    accent-color: var(--tacta-color-text, #e6e6e6);
    cursor: pointer;
  }
  strong {
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    font-weight: var(--tacta-font-weight-medium, 500);
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  .description {
    grid-column: 2;
    margin-top: 2px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    line-height: var(--tacta-line-height-body, 1.6);
  }
  .reviewer {
    margin-top: 24px;
  }
  .instructions-label {
    display: block;
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    font-weight: var(--tacta-font-weight-medium, 500);
  }
  .hint {
    margin: 5px 0 12px;
  }
  textarea {
    display: block;
    width: 100%;
    min-height: 88px;
    resize: vertical;
    padding: 12px;
    border: 1px solid var(--tacta-color-border, #ffffff0d);
    border-radius: var(--tacta-radius-element, 8px);
    background: var(--tacta-color-surface, #252627);
    color: var(--tacta-color-text, #e6e6e6);
    font: var(--tacta-font-size-label, var(--tacta-text-md)) / 1.6
      var(--tacta-font-family, system-ui, sans-serif);
  }
  textarea:focus-visible {
    outline: 2px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: 2px;
  }
  .save-note {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 16px 0 0;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
  }
  .error {
    color: var(--tacta-color-error, #f0aaa1);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
  }
`;
