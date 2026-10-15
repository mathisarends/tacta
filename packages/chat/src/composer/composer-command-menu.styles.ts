import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { scrollbarStyles } from "@tacta/core/styles/scrollbar";

export const composerCommandMenuStyles = css`
  ${workspaceStyles}
  ${scrollbarStyles}
  :host {
    display: block;
  }
  .list {
    max-height: min(320px, 42dvh, var(--composer-commands-max-height, 320px));
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 6px;
    scroll-padding-block: 6px;
  }
  .group {
    padding: 8px 10px 4px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  .group:not(:first-child) {
    margin-top: 4px;
  }
  .option {
    width: 100%;
    min-height: 38px;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 7px 10px;
    border: 0;
    border-radius: var(--tacta-radius-pill, 999px);
    background: transparent;
    color: var(--tacta-color-text, #e6e6e6);
    text-align: left;
    cursor: pointer;
    transition: background var(--tacta-motion-duration-control, 160ms);
  }
  .option:hover,
  .option:focus-visible {
    background: var(--tacta-color-selected, #303132);
  }
  .option:focus-visible {
    outline: 1px solid var(--tacta-color-focus, #9b9b9e);
    outline-offset: -1px;
  }
  .badge {
    display: grid;
    place-items: center;
    flex: 0 0 20px;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .copy {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: baseline;
    gap: 10px;
  }
  .title {
    flex-shrink: 0;
    max-width: 45%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: var(--tacta-font-weight-control, var(--tacta-font-weight-regular));
    font-size: var(--tacta-font-size-body, var(--tacta-text-base));
  }
  .description {
    min-width: 0;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .command {
    flex-shrink: 0;
    max-width: 30%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--tacta-color-muted, #a3a3a5);
    font-family: var(--tacta-font-mono, ui-monospace, monospace);
    font-size: var(--tacta-font-size-fine-print, var(--tacta-text-xs));
  }
  .status {
    margin: 0;
    padding: 12px 16px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
  }
  @media (max-width: 650px) {
    .command {
      display: none;
    }
    .copy {
      gap: 8px;
    }
    .title {
      max-width: 55%;
    }
  }
`;
