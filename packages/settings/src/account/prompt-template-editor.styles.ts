import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { scrollbarStyles } from "@tacta/core/styles/scrollbar";
import { modalStyles } from "@tacta/settings/dialog";

export const promptTemplateEditorStyles = css`
  ${workspaceStyles}
  ${scrollbarStyles}
  ${modalStyles}
  :host {
    display: contents;
  }
  .editor-fields {
    display: grid;
    gap: 12px;
  }
  .intro {
    margin: 0 0 8px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
  }
  .fields {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  label {
    display: grid;
    min-width: 0;
    gap: 8px;
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
  }
  input,
  textarea,
  .command {
    width: 100%;
    min-width: 0;
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    border-radius: var(--tacta-radius-element, 8px);
    background: var(--tacta-color-background, #181818);
    color: var(--tacta-color-text, #e6e6e6);
    font: inherit;
  }
  input,
  textarea {
    padding: 10px 12px;
  }
  input::placeholder,
  textarea::placeholder {
    color: var(--tacta-color-muted, #a3a3a5);
  }
  input:focus-visible,
  textarea:focus-visible {
    outline: 1px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: 2px;
  }
  textarea {
    min-height: 220px;
    max-height: 40dvh;
    resize: vertical;
    line-height: var(--tacta-line-height-reading, 1.65);
    font-size: var(--tacta-font-size-body, var(--tacta-text-base));
  }
  .command {
    display: flex;
    align-items: center;
    padding-left: 12px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-family: var(--tacta-font-mono, ui-monospace, monospace);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
  }
  .command input {
    padding-left: 0;
    border: 0;
    background: transparent;
  }
  .command:focus-within {
    outline: 2px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: 2px;
  }
  .command input:focus-visible {
    outline: none;
    box-shadow: none;
  }
  .hint {
    margin: -4px 0 4px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  @media (max-width: 650px) {
    .fields {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    textarea {
      min-height: 160px;
    }
  }
`;
