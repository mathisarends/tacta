import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const approvalCardStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    container-type: inline-size;
    margin: 16px 0;
  }
  section {
    padding: 16px 18px;
    border: 1px solid var(--tacta-color-border, #ffffff0d);
    border-radius: var(--tacta-radius-control, 12px);
  }
  :host([docked]) {
    margin: 0;
  }
  :host([docked]) section {
    padding: 12px;
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    border-radius: var(--tacta-radius-panel, 20px);
    background: var(--tacta-color-composer, var(--tacta-color-surface, #252627));
  }
  header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  header svg {
    flex-shrink: 0;
  }
  h3 {
    margin: 0;
    color: var(--tacta-color-text, #e6e6e6);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    font-weight: var(--tacta-font-weight-button, var(--tacta-font-weight-medium, 500));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  .reason {
    margin: 6px 0 0;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    line-height: var(--tacta-line-height-caption, 1.5);
    overflow-wrap: anywhere;
  }
  pre {
    margin: 12px 0;
    padding: 10px 12px;
    border-radius: var(--tacta-radius-subtle, 5px);
    background: var(--tacta-color-background, #181818);
    overflow: auto;
    max-height: 180px;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
    font: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem)) /
      var(--tacta-line-height-body, 1.6)
      var(--tacta-font-mono, "Geist Mono Variable", Consolas, "Liberation Mono", monospace);
    tab-size: 2;
  }
  code {
    font: inherit;
  }
  footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }
  .scope {
    margin: 0;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  .actions {
    display: flex;
    flex-shrink: 0;
    gap: 6px;
  }
  .button {
    min-height: 28px;
    padding: 4px 10px;
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
    line-height: var(--tacta-line-height-control, 1.4);
    background: transparent;
  }
  .button.allow {
    background: var(--tacta-color-text, #e6e6e6);
    color: var(--tacta-color-background, #181818);
  }
  .button.allow:hover:not(:disabled) {
    background: var(--tacta-color-accent-hover, #e8e8e8);
  }
  .error {
    display: flex;
    gap: 8px;
    color: var(--tacta-color-error, #f0aaa1);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
  }
  .error svg {
    flex-shrink: 0;
  }
  .submitting {
    display: inline-flex;
    animation: spin var(--tacta-motion-duration-spinner, 1.2s) linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  @container (max-width: 440px) {
    footer {
      flex-wrap: wrap;
    }
    .actions {
      margin-left: auto;
    }
  }
`;
