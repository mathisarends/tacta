import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const chatbotStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    height: 100dvh;
    background: var(--tacta-color-background);
  }
  .shell {
    --tacta-font-family: "Segoe UI Variable Text", "Segoe UI", system-ui, sans-serif;
    --tacta-font-size-chat: 1rem;
    height: 100%;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    background: var(--tacta-color-background);
    color: var(--tacta-color-text);
  }
  .shell[data-tacta-theme="light"] {
    --tacta-color-accent: #202124;
    --tacta-color-accent-hover: #343536;
    --tacta-color-on-accent: #ffffff;
    --tacta-color-focus: #667085;
    --tacta-color-selected: #ececee;
    --tacta-color-accent-soft: #2021240a;
    --tacta-color-error: #b42318;
  }
  tacta-side-bar {
    width: 260px;
    border-right: 1px solid var(--tacta-color-border);
  }
  tacta-side-bar[collapsed] {
    width: 64px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px;
    font-weight: 600;
    letter-spacing: -0.025em;
    font-size: 20px;
  }
  .brand-mark {
    display: grid;
    place-items: center;
    width: 27px;
    height: 27px;
    color: var(--tacta-color-muted);
  }
  .workspace {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }
  header {
    min-height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 28px;
    border-bottom: 1px solid var(--tacta-color-border);
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .badge {
    font-size: 12px;
    letter-spacing: normal;
    color: var(--tacta-color-muted);
    white-space: nowrap;
  }
  tacta-split-pane {
    flex: 1;
    min-height: 0;
  }
  .chat {
    height: 100%;
    min-height: 0;
    display: flex;
    flex-direction: column;
  }
  tacta-split-pane.maximized::part(main) {
    display: none;
  }
  tacta-split-pane.maximized::part(panel) {
    width: 100% !important;
    flex: 1;
  }
  tacta-chat-message-list {
    flex: 1;
    min-height: 0;
  }
  .welcome {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: min(720px, 100%);
    margin: auto;
    padding: 32px;
  }
  .eyebrow {
    color: var(--tacta-color-muted);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: normal;
  }
  h1 {
    font-size: clamp(26px, 2.75vw, 36px);
    line-height: 1.3;
    margin: 16px 0;
    letter-spacing: -0.025em;
    font-weight: 600;
    text-align: center;
    text-wrap: balance;
    max-width: 550px;
  }
  .intro {
    max-width: 470px;
    color: var(--tacta-color-muted);
    text-align: center;
    text-wrap: balance;
    margin: 0 0 26px;
  }
  .suggestions {
    width: 100%;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
  .suggestion {
    padding: 16px;
    text-align: left;
    border: 1px solid var(--tacta-color-border);
    border-radius: 12px;
    background: transparent;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }
  .suggestion:hover {
    background: var(--tacta-color-surface);
    border-color: var(--tacta-color-border-strong);
  }
  .suggestion span {
    display: block;
    margin-top: 6px;
    color: var(--tacta-color-muted);
    font-size: 12px;
  }
  .composer {
    padding: 12px 24px 16px;
    max-width: 850px;
    width: 100%;
    margin: 0 auto;
  }
  .footnote {
    margin: 10px 0 0;
    text-align: center;
    font-size: 11px;
    color: var(--tacta-color-muted);
  }
  .inspector {
    height: 100%;
    overflow: auto;
    padding: 24px;
    background: var(--tacta-color-sidebar);
  }
  .inspector h2 {
    margin: 6px 0;
    font-size: 20px;
    font-weight: 600;
  }
  .inspector p {
    color: var(--tacta-color-muted);
    font-size: 13px;
  }
  .header-actions > .button {
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }
  .header-actions > .button[aria-pressed="true"] {
    background: var(--tacta-color-selected);
  }
  .inspector tacta-pill-tabs {
    margin-top: 24px;
  }
  .inspector tacta-select {
    min-width: 140px;
  }
  .inspector tacta-settings-section {
    margin-top: 22px;
  }
  .inspector tacta-text-input {
    width: 100%;
  }
  .stack {
    display: grid;
    gap: 14px;
    padding: 20px 0;
  }
  .component-card {
    padding: 16px;
    border: 1px solid var(--tacta-color-border);
    border-radius: 12px;
  }
  .component-card h3 {
    font-size: 14px;
    margin: 0 0 8px;
  }
  .component-card p {
    margin: 0;
  }
  code {
    color: var(--tacta-color-text);
    font-size: 12px;
    overflow-wrap: anywhere;
  }
  .error {
    margin: 8px 24px;
    padding: 12px;
    border: 1px solid var(--tacta-color-error);
    border-radius: 10px;
  }
  @media (max-width: 900px) {
    tacta-side-bar {
      width: 220px;
    }
    header {
      padding: 12px 16px;
    }
    .badge {
      display: none;
    }
  }
  @media (max-width: 650px) {
    .shell {
      grid-template-columns: minmax(0, 1fr);
    }
    tacta-side-bar {
      display: none;
    }
    header {
      min-height: 60px;
    }
    .composer {
      padding: 10px 12px;
    }
    .welcome {
      padding: 24px;
    }
    .suggestions {
      grid-template-columns: 1fr;
    }
    tacta-split-pane {
      position: relative;
    }
    tacta-split-pane::part(panel) {
      position: absolute;
      inset: 0 0 0 auto;
      max-width: 100%;
      z-index: 2;
      box-shadow: -8px 0 30px #0003;
    }
  }
`;
