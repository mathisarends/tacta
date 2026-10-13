import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const chatMessageNavigationStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
  }
  nav {
    height: 100%;
    display: flex;
    align-items: center;
  }
  .markers {
    width: 100%;
    max-height: 100%;
    overflow-y: auto;
    scrollbar-width: none;
    padding-block: 4px;
    box-sizing: border-box;
  }
  button {
    display: flex;
    align-items: center;
    width: 100%;
    height: var(--tacta-chat-navigation-step, 14px);
    padding: 0 8px 0 18px;
    border: 0;
    background: transparent;
    cursor: pointer;
  }
  .marker {
    flex-shrink: 0;
    width: var(--tacta-chat-navigation-mark-width, 6px);
    height: var(--tacta-chat-navigation-mark-height, 3px);
    border-radius: var(--tacta-radius-indicator, 2px);
    background: var(--tacta-color-scrollbar-hover, #555658);
    transition:
      width var(--tacta-motion-duration-control, 160ms),
      background var(--tacta-motion-duration-control, 160ms);
  }
  nav:hover .marker,
  nav:focus-within .marker {
    width: var(--tacta-chat-navigation-mark-expanded, 16px);
  }
  button[data-visible] .marker {
    background: var(--tacta-color-text, #e6e6e6);
  }
  nav:hover button[aria-current="location"] .marker,
  nav:focus-within button[aria-current="location"] .marker,
  button:hover .marker,
  button:focus-visible .marker {
    width: var(--tacta-chat-navigation-mark-active, 24px);
    background: var(--tacta-color-text, #e6e6e6);
  }
  button:focus-visible {
    outline-offset: -2px;
  }
  .preview {
    position: absolute;
    left: 100%;
    top: clamp(
      0px,
      calc(var(--preview-top) - 40px),
      max(0px, calc(100% - var(--tacta-chat-navigation-preview-height, 128px)))
    );
    width: min(
      var(--tacta-chat-navigation-preview-width, 350px),
      calc(100cqw - var(--tacta-chat-navigation-width, 52px) - 16px)
    );
    max-height: var(--tacta-chat-navigation-preview-height, 128px);
    box-sizing: border-box;
    overflow: hidden;
    padding: 10px 12px;
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    border-radius: var(--tacta-radius-control, 12px);
    background: var(--tacta-color-panel-hover, #2d2e2f);
    box-shadow: var(
      --tacta-shadow-control,
      0 3px 12px color-mix(in srgb, var(--tacta-color-background, #181818) 40%, transparent)
    );
    font-size: var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  p {
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    overflow-wrap: anywhere;
    margin: 6px 0 0;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  p:empty {
    display: none;
  }
`;
