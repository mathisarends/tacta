import { css } from "lit";

export const controls = css`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  button,
  input,
  textarea,
  select {
    font: inherit;
    letter-spacing: inherit;
  }
  button,
  a,
  input {
    -webkit-tap-highlight-color: transparent;
  }
  button {
    cursor: pointer;
  }
  button:disabled {
    cursor: wait;
    opacity: 0.6;
  }
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  summary:focus-visible {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: 4px;
  }
  a {
    color: var(--tacta-color-accent, #ffffff);
    text-underline-offset: 4px;
  }
  .button {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 12px 20px;
    border: 0;
    border-radius: var(--tacta-radius-pill, 999px);
    background: var(--tacta-color-surface, #252627);
    color: var(--tacta-color-text, #e6e6e6);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    font-weight: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500));
    text-decoration: none;
    transition:
      background var(--tacta-motion-duration-control, 160ms),
      transform var(--tacta-motion-duration-control, 160ms);
  }
  .button:hover:not(:disabled) {
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  .button.primary {
    background: var(--tacta-color-accent, #ffffff);
    color: var(--tacta-color-on-accent, #0b0b0b);
  }
  .button.primary:hover:not(:disabled) {
    background: var(--tacta-color-accent-hover, #e8e8e8);
    transform: translateY(-1px);
  }
  .text-button {
    padding: 4px 0;
    border: 0;
    background: none;
    color: var(--tacta-color-accent, #ffffff);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
  .text-button:hover {
    text-decoration: underline;
    text-underline-offset: 4px;
  }
  .eyebrow {
    color: var(--tacta-color-accent, #ffffff);
    font-family: var(
      --tacta-font-mono,
      "Geist Mono Variable",
      Consolas,
      "Liberation Mono",
      monospace
    );
    font-size: var(--tacta-font-size-eyebrow, var(--tacta-text-2xs, 0.625rem));
    letter-spacing: var(--tacta-letter-spacing-eyebrow, 0.18em);
    font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold, 600));
  }
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation: none !important;
      transition: none !important;
    }
  }
`;
