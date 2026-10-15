import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const searchBarStyles = css`
  ${workspaceStyles}
  :host {
    box-sizing: border-box;
    position: fixed;
    inset: 0;
    z-index: 20;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: min(16dvh, 144px) 16px 16px;
    background: var(
      --tacta-color-overlay,
      color-mix(in srgb, var(--tacta-color-background) 72%, transparent)
    );
    backdrop-filter: blur(3px);
    color: var(--tacta-color-text, #e6e6e6);
    font: var(--tacta-font-size-label, var(--tacta-text-md))
      var(--tacta-font-family, system-ui, sans-serif);
  }
  .dialog {
    min-width: 0;
    width: min(620px, 100%);
    max-height: min(80dvh, 780px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--tacta-color-text, #e6e6e6) 10%, transparent);
    border-radius: var(--tacta-radius-dialog, 18px);
    background: color-mix(
      in srgb,
      var(--tacta-color-surface, #252627) 72%,
      var(--tacta-color-sidebar, #1e1f20)
    );
    box-shadow:
      var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background) 65%, transparent)
      ),
      var(--tacta-shadow-dialog, 0 24px 80px #0005);
  }
  .input-row {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 12px;
    min-height: 52px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--tacta-color-accent-soft, #ffffff14);
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .input-row:focus-within {
    color: var(--tacta-color-accent, #ffffff);
    border-bottom-color: color-mix(in srgb, var(--tacta-color-text, #e6e6e6) 18%, transparent);
  }
  .input-row > svg {
    flex-shrink: 0;
  }
  .close-button {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 0;
    border-radius: var(--tacta-radius-menu-item, 7px);
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .close-button:hover {
    background: var(--tacta-color-accent-soft, #ffffff14);
    color: var(--tacta-color-text, #e6e6e6);
  }
  input:focus-visible {
    outline: none;
    box-shadow: none;
  }
  input {
    flex: 1;
    min-width: 0;
    padding: 0;
    border: 0;
    outline: none;
    color: var(--tacta-color-text, #e6e6e6);
    background: transparent;
    font: var(--tacta-font-size-body, var(--tacta-text-base))/1.5
      var(--tacta-font-family, system-ui, sans-serif);
  }
  input::placeholder {
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .results {
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 10px 10px 14px;
  }
  .item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 48px;
    padding: 8px 12px;
    border: 0;
    border-radius: var(--tacta-radius-element, 8px);
    color: var(--tacta-color-text, #e6e6e6);
    background: transparent;
    text-align: left;
    text-decoration: none;
    font: var(--tacta-font-size-body, var(--tacta-text-base))/1.45
      var(--tacta-font-family, system-ui, sans-serif);
    cursor: pointer;
  }
  .group-title {
    margin: 12px 12px 7px;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
    font-weight: var(--tacta-font-weight-medium, 500);
  }
  .item + .group-title {
    margin-top: 20px;
  }
  .item.selected,
  .item:hover {
    background: var(--tacta-color-accent-soft, #ffffff14);
  }
  .item-icon {
    display: grid;
    place-items: center;
    flex: 0 0 28px;
    height: 28px;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .item.selected .item-icon {
    color: var(--tacta-color-text, #e6e6e6);
  }
  .item-label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .shortcut {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
  }
  kbd {
    display: inline-grid;
    place-items: center;
    min-width: 22px;
    height: 22px;
    padding: 0 5px;
    border: 1px solid var(--tacta-color-accent-soft, #ffffff14);
    border-radius: var(--tacta-radius-subtle, 5px);
    background: color-mix(in srgb, var(--tacta-color-sidebar, #1e1f20) 36%, transparent);
    color: var(--tacta-color-muted, #a3a3a5);
    font: var(--tacta-font-size-caption, var(--tacta-text-sm))
      var(--tacta-font-family, system-ui, sans-serif);
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 42px 20px;
    text-align: center;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 20px;
    padding: 12px 22px;
    border-top: 1px solid var(--tacta-color-accent-soft, #ffffff14);
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
  }
  .footer-hint {
    display: inline-flex;
    align-items: center;
    gap: 7px;
  }
  .close-hint {
    margin-left: auto;
  }
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--tacta-color-accent, #ffffff);
    outline-offset: -2px;
  }
  @media (max-width: 480px) {
    :host {
      padding: 10dvh 12px 12px;
    }
    .input-row {
      gap: 10px;
      min-height: 52px;
      padding: 10px 14px;
    }
    input {
      font-size: var(--tacta-font-size-input, var(--tacta-text-xl));
    }
    .item {
      gap: 8px;
      padding-inline: 8px;
    }
    .item .shortcut {
      display: none;
    }
    footer {
      gap: 12px;
      padding-inline: 16px;
    }
    .close-hint {
      display: none;
    }
  }
`;
