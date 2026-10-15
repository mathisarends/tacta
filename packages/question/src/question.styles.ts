import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const composerQuestionStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    min-width: 0;
  }
  section {
    padding: 12px;
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    border-radius: var(--tacta-radius-panel, 20px);
    background: var(--tacta-color-composer, var(--tacta-color-surface, #252627));
  }
  header,
  .heading,
  .footer,
  .actions,
  .custom-answer {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  header {
    padding: 0 4px 10px;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .heading {
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
  }
  .preview {
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
  header .icon-button {
    margin-left: auto;
  }
  fieldset {
    margin: 0;
    padding: 0;
    border: 0;
    min-width: 0;
  }
  legend {
    padding: 0 6px;
    margin-bottom: 12px;
    font-weight: var(--tacta-font-weight-emphasis, var(--tacta-font-weight-semibold, 600));
    overflow-wrap: anywhere;
  }
  .options {
    display: grid;
    gap: 4px;
  }
  .option {
    position: relative;
    display: flex;
    align-items: center;
    gap: 10px;
    min-height: 40px;
    padding: 8px;
    border-radius: var(--tacta-radius-control, 12px);
    cursor: pointer;
  }
  .option:hover,
  .option:has(input:checked) {
    background: var(--tacta-color-selected, #303132);
  }
  .option:has(input:focus-visible) {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: 1px;
  }
  .option input {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }
  .number {
    display: grid;
    place-items: center;
    flex: 0 0 23px;
    height: 23px;
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    border-radius: var(--tacta-radius-subtle, 5px);
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
  .label {
    flex: 1;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .indicator {
    display: flex;
    color: var(--tacta-color-muted, #a3a3a5);
    opacity: 0;
  }
  .option:has(input:checked) .indicator {
    opacity: 1;
  }
  .footer {
    margin-top: 12px;
    gap: 12px;
  }
  .custom-answer {
    flex: 1;
    min-width: 0;
    padding-left: 8px;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .custom-answer svg {
    flex: none;
  }
  textarea {
    width: 100%;
    min-width: 0;
    min-height: 36px;
    max-height: 120px;
    field-sizing: content;
    resize: none;
    padding: 7px 4px;
    border: 0;
    border-radius: var(--tacta-radius-subtle, 5px);
    background: transparent;
    color: var(--tacta-color-text, #e6e6e6);
    line-height: var(--tacta-line-height-control, 1.4);
  }
  .actions {
    flex: none;
    gap: 8px;
  }
  .secondary {
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
  }
  .actions .button {
    min-height: 28px;
    padding: 4px 10px;
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    line-height: var(--tacta-line-height-control, 1.4);
  }
  button:disabled {
    cursor: default;
  }
  fieldset:disabled .option,
  fieldset:disabled .custom-answer {
    opacity: 0.5;
    cursor: default;
  }
  @container (max-width: 540px) {
    .footer {
      flex-wrap: wrap;
    }
    .custom-answer {
      flex-basis: 100%;
    }
    .actions {
      margin-left: auto;
    }
  }
`;
