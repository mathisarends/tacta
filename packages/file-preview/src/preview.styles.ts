import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const previewStyles = [
  workspaceStyles,
  css`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
      min-height: 0;
      min-width: 0;
    }
    [hidden] {
      display: none !important;
    }
    .controls {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 6px;
      padding: 8px 14px;
      border-bottom: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    }
    .controls .meta {
      margin-left: auto;
    }
    .meta,
    .note {
      color: var(--tacta-color-muted, #a3a3a5);
      font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    }
    .note {
      padding: 8px 14px;
      margin: 0;
      line-height: var(--tacta-line-height-caption, 1.5);
    }
    .state {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 14px;
      padding: 32px;
      text-align: center;
      color: var(--tacta-color-muted, #a3a3a5);
    }
    .state p {
      max-width: 48ch;
      margin: 0;
    }
    .viewport {
      flex: 1;
      min-height: 0;
      min-width: 0;
      overflow: auto;
      background: var(--tacta-color-sidebar, #1e1f20);
    }
    .paper {
      --preview-paper: var(--tacta-color-paper, #ffffff);
      --preview-ink: var(--tacta-color-on-paper, #202124);
    }
    button:disabled {
      opacity: 0.4;
      cursor: default;
    }
  `,
];
