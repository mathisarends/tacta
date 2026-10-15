import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const voiceInputStyles = css`
  ${workspaceStyles}
  :host {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    min-width: 0;
  }
  .controls {
    flex: none;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
  }
  .icon-button {
    width: 36px;
    height: 36px;
    color: var(--tacta-color-accent, #ffffff);
  }
  .icon-button svg {
    stroke-width: 1.8;
  }
  .capture .icon-button {
    background: var(--tacta-color-panel-hover, #2d2e2f);
    color: var(--tacta-color-text, #e6e6e6);
  }
  .capture .accept {
    color: var(--tacta-color-accent, #ffffff);
  }
  .status {
    white-space: nowrap;
    color: var(--tacta-color-muted, #a3a3a5);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    border: 0;
  }
  .error {
    margin: 0;
    color: var(--tacta-color-error, #f0aaa1);
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm, 0.75rem));
  }
  .wave {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 28px;
    padding-inline: 10px;
    color: var(--tacta-color-accent, #ffffff);
  }
  .wave span {
    width: 2px;
    height: 5px;
    border-radius: var(--tacta-radius-indicator, 2px);
    background: currentColor;
  }
  .wave.listening span {
    animation: pulse var(--tacta-motion-duration-wave, 850ms) ease-in-out infinite alternate;
  }
  .wave span:nth-child(3n) {
    animation-delay: calc(var(--tacta-motion-duration-wave, 850ms) * -0.4);
  }
  .wave span:nth-child(3n + 1) {
    animation-delay: calc(var(--tacta-motion-duration-wave, 850ms) * -0.7);
  }
  @keyframes pulse {
    to {
      transform: scaleY(4);
    }
  }
  @media (max-width: 420px) {
    .wave {
      gap: 3px;
      padding-inline: 4px;
    }
  }
`;
