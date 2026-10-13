import { css } from "lit";

/** Small shadow-root reset. Tokens inherit from the host, with standalone defaults. */
export const componentStyles = css`
  :host {
    font-family: var(--tacta-font-family, system-ui, sans-serif);
    color: var(--tacta-color-text, #202124);
  }
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
  :host([hidden]) {
    display: none;
  }
`;
