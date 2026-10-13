import { css } from "lit";

export const scrollbarStyles = css`
  * {
    scrollbar-width: thin;
    scrollbar-color: var(--tacta-color-scrollbar, #3b3c3d) transparent;
  }
  @supports selector(::-webkit-scrollbar) {
    * {
      scrollbar-width: auto;
      scrollbar-color: auto;
    }
    ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    ::-webkit-scrollbar-track,
    ::-webkit-scrollbar-corner {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      border: 2px solid transparent;
      border-radius: var(--tacta-radius-pill, 999px);
      background: var(--tacta-color-scrollbar, #3b3c3d);
      background-clip: padding-box;
    }
    ::-webkit-scrollbar-thumb:hover {
      background-color: var(--tacta-color-scrollbar-hover, #555658);
    }
    ::-webkit-scrollbar-button {
      display: none;
      width: 0;
      height: 0;
    }
  }
`;
