import { css } from "lit";

export const appCheckboxStyles = css`
  tacta-app-checkbox {
    display: block;
  }
  .checkbox {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
    line-height: var(--tacta-line-height-relaxed, 1.7);
    cursor: pointer;
  }
  .checkbox input {
    width: 15px;
    height: 15px;
    flex-shrink: 0;
    margin: 2px 0 0;
    accent-color: var(--tacta-color-accent, #ffffff);
  }
`;
