import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const chatComposerStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    width: 100%;
    container-type: inline-size;
  }
  tacta-queued-messages {
    margin: 0 14px -20px;
  }
  tacta-queued-messages:has(~ tacta-composer-question),
  tacta-queued-messages:has(~ .question-notice:not(:empty)) {
    margin-bottom: 10px;
  }
  tacta-composer-question {
    position: relative;
    margin-bottom: 10px;
  }
  .question-notice:not(:empty) {
    padding: 0 14px 8px;
    color: var(--tacta-color-muted, #a3a3a5);
    font: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem)) /
      var(--tacta-line-height-caption, 1.5)
      var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
  }
  .approval-dock {
    display: grid;
    gap: 10px;
    max-height: min(46dvh, 440px);
    margin-bottom: 10px;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
`;
