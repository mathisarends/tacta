import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const toolCallStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    min-width: 0;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  .calls {
    display: grid;
    gap: 2px;
  }
  [hidden] {
    display: none !important;
  }
  .list-toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 24px;
    max-width: 100%;
    padding: 0;
    border: 0;
    border-radius: var(--tacta-radius-inset, 6px);
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
    transition: color var(--tacta-motion-duration-control, 160ms) ease;
  }
  .list-toggle:hover {
    color: var(--tacta-color-text, #e6e6e6);
  }
  .list-toggle:focus-visible {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: 2px;
  }
  .list-caption {
    display: flex;
    align-items: baseline;
    gap: 10px;
    min-width: 0;
  }
  .list-title {
    flex-shrink: 0;
    color: var(--tacta-color-text, #e6e6e6);
  }
  .list-preview {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .list-elapsed {
    flex-shrink: 0;
    font-variant-numeric: tabular-nums;
    opacity: 0.65;
  }
  .list-chevron {
    flex-shrink: 0;
  }
  .call {
    min-width: 0;
  }
  .summary {
    display: grid;
    grid-template-columns: 18px minmax(0, 1fr) auto 14px;
    align-items: center;
    gap: 10px;
    width: 100%;
    min-height: 42px;
    padding: 8px;
    border: 0;
    border-radius: var(--tacta-radius-element, 8px);
    background: transparent;
    color: inherit;
    text-align: left;
    font: inherit;
    cursor: pointer;
    transition: background var(--tacta-motion-duration-control, 160ms) ease;
  }
  .summary:hover {
    background: color-mix(in srgb, var(--tacta-color-panel-hover, #2d2e2f) 50%, transparent);
  }
  .summary:focus-visible {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: -3px;
    border-radius: var(--tacta-radius-element, 8px);
  }
  .kind-icon,
  .chevron,
  .list-chevron {
    display: grid;
    place-items: center;
  }
  .kind-icon {
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .running .kind-icon,
  .running .title {
    color: var(--tacta-color-text, #e6e6e6);
  }
  .failed .status {
    color: var(--tacta-color-error, #f0aaa1);
  }
  .label {
    display: flex;
    align-items: baseline;
    gap: 12px;
    min-width: 0;
  }
  .title {
    flex-shrink: 0;
    max-width: 60%;
    overflow: hidden;
    color: var(--tacta-color-text, #e6e6e6);
    font-size: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem));
    font-weight: var(--tacta-font-weight-medium, 500);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .status {
    grid-column: 3;
    grid-row: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
  }
  .chevron {
    grid-column: 4;
    grid-row: 1;
  }
  .chevron,
  .list-chevron {
    transition: transform var(--tacta-motion-duration-control, 160ms) ease;
  }
  .expanded .chevron {
    transform: rotate(180deg);
  }
  .list-chevron {
    transform: rotate(-90deg);
  }
  .list-chevron.open {
    transform: rotate(0deg);
  }
  .preview {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    opacity: 0.8;
  }
  .spinner {
    width: 12px;
    height: 12px;
    border: 1.5px solid var(--tacta-color-border-strong, #ffffff1f);
    border-top-color: var(--tacta-color-text, #e6e6e6);
    border-radius: var(--tacta-radius-round, 50%);
    animation: spin var(--tacta-motion-duration-spin, 850ms) linear infinite;
  }
  .detail {
    padding: 6px 8px 18px 36px;
    animation: reveal var(--tacta-motion-duration-control, 160ms) ease-out;
  }
  .tool-name {
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 12px;
    overflow-wrap: anywhere;
  }
  code {
    font-family: var(
      --tacta-font-mono,
      "Geist Mono Variable",
      Consolas,
      "Liberation Mono",
      monospace
    );
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
  }
  tacta-tool-call-detail + tacta-tool-call-detail {
    margin-top: 14px;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @keyframes reveal {
    from {
      opacity: 0;
      transform: translateY(-3px);
    }
  }
  @media (max-width: 480px) {
    .list-caption {
      flex-wrap: wrap;
      gap: 2px 10px;
    }
    .list-title {
      flex-shrink: 1;
    }
    .summary {
      padding-inline: 10px;
      column-gap: 7px;
    }
    .detail {
      padding-left: 35px;
    }
    .label {
      flex-direction: column;
      align-items: stretch;
      gap: 2px;
    }
    .title {
      max-width: 100%;
    }
  }
`;
