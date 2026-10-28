import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const searchBarStyles = css`
  ${workspaceStyles}
  :host {
    display: contents;
  }
  .overlay {
    box-sizing: border-box;
    position: fixed;
    inset: 0;
    z-index: 20;
    display: none;
    width: 100%;
    height: 100%;
    max-width: none;
    max-height: none;
    margin: 0;
    border: 0;
    justify-content: center;
    align-items: flex-start;
    padding: min(16dvh, 144px) 16px 16px;
    background: var(
      --tacta-color-overlay,
      color-mix(in srgb, var(--tacta-color-background, #ffffff) 72%, transparent)
    );
    backdrop-filter: blur(3px);
    color: var(--tacta-color-text, #202124);
    font: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem))
      var(--tacta-font-family, system-ui, sans-serif);
  }
  .overlay[open] {
    display: flex;
  }
  .overlay::backdrop {
    background: transparent;
  }
  .dialog {
    min-width: 0;
    width: min(620px, 100%);
    max-height: min(80dvh, 780px);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--tacta-color-text, #202124) 10%, transparent);
    border-radius: var(--tacta-radius-dialog, 18px);
    background: color-mix(
      in srgb,
      var(--tacta-color-surface, #f3f4f6) 72%,
      var(--tacta-color-sidebar, #fafafa)
    );
    box-shadow:
      var(
        --tacta-shadow-panel,
        0 12px 40px color-mix(in srgb, var(--tacta-color-background, #ffffff) 65%, transparent)
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
    color: var(--tacta-color-muted, #667085);
  }
  .input-row:focus-within {
    color: var(--tacta-color-accent, #2563eb);
    border-bottom-color: color-mix(in srgb, var(--tacta-color-text, #202124) 18%, transparent);
  }
  .input-row > svg {
    flex-shrink: 0;
  }
  .close-button {
    display: grid;
    place-items: center;
    flex-shrink: 0;
    width: var(--tacta-touch-target, 36px);
    height: var(--tacta-touch-target, 36px);
    padding: 0;
    border: 0;
    border-radius: var(--tacta-radius-menu-item, 7px);
    background: transparent;
    color: var(--tacta-color-muted, #667085);
  }
  .close-button:hover {
    background: var(--tacta-color-accent-soft, #ffffff14);
    color: var(--tacta-color-text, #202124);
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
    color: var(--tacta-color-text, #202124);
    background: transparent;
    font: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))/1.5
      var(--tacta-font-family, system-ui, sans-serif);
  }
  input::placeholder {
    color: var(--tacta-color-muted, #667085);
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
    color: var(--tacta-color-text, #202124);
    background: transparent;
    text-align: left;
    text-decoration: none;
    font: var(--tacta-font-size-body, var(--tacta-text-base, 0.875rem))/1.45
      var(--tacta-font-family, system-ui, sans-serif);
    cursor: pointer;
  }
  .group-title {
    margin: 4px 12px 7px;
    color: var(--tacta-color-muted, #667085);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
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
    color: var(--tacta-color-muted, #667085);
  }
  .item.selected .item-icon {
    color: var(--tacta-color-text, #202124);
  }
  .item-label {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .item-label > span {
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .item-description {
    color: var(--tacta-color-muted, #667085);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
  tacta-search-filters {
    flex-shrink: 0;
    border-bottom: 1px solid var(--tacta-color-accent-soft, #ffffff14);
  }
  .search-status {
    padding: 12px;
    color: var(--tacta-color-muted, #667085);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
  }
  .status-button {
    display: block;
    margin: 8px auto;
    min-height: var(--tacta-touch-target, 36px);
    padding: 6px 12px;
    border: 1px solid var(--tacta-color-accent-soft, #ffffff14);
    border-radius: var(--tacta-radius-menu-item, 7px);
    color: var(--tacta-color-text, #202124);
    background: transparent;
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
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
    background: color-mix(in srgb, var(--tacta-color-sidebar, #fafafa) 36%, transparent);
    color: var(--tacta-color-muted, #667085);
    font: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem))
      var(--tacta-font-family, system-ui, sans-serif);
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 14px;
    padding: 42px 20px;
    text-align: center;
    color: var(--tacta-color-muted, #667085);
  }
  footer {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px 20px;
    padding: 12px 22px;
    border-top: 1px solid var(--tacta-color-accent-soft, #ffffff14);
    color: var(--tacta-color-muted, #667085);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
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
    outline: 2px solid var(--tacta-color-accent, #2563eb);
    outline-offset: -2px;
  }
  @media (max-width: 480px) {
    .overlay {
      padding: max(12px, env(safe-area-inset-top)) 12px max(12px, env(safe-area-inset-bottom));
    }
    .dialog {
      max-height: calc(100dvh - 24px);
    }
    .input-row {
      gap: 10px;
      min-height: 52px;
      padding: 10px 14px;
    }
    input {
      font-size: var(--tacta-font-size-input, var(--tacta-text-xl, 1rem));
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
  @media (pointer: coarse) {
    footer,
    .shortcut {
      display: none;
    }
  }
  @media (max-width: 650px) {
    .overlay {
      padding: env(safe-area-inset-top) 0 env(safe-area-inset-bottom);
      background: var(--tacta-color-background, #ffffff);
    }
    .dialog {
      width: 100%;
      height: 100%;
      max-height: none;
      border: 0;
      border-radius: 0;
      box-shadow: none;
      background: var(--tacta-color-background, #ffffff);
    }
    .results {
      flex: 1;
    }
    footer,
    .shortcut {
      display: none;
    }
  }
`;
