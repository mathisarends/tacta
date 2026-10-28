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
    --tacta-color-accent: #a7d8a0;
    --tacta-color-on-accent: #17251a;
    height: 100%;
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    background: var(--tacta-color-background);
    color: var(--tacta-color-text);
  }
  .shell[data-tacta-theme="light"] {
    --tacta-color-accent: #397345;
    --tacta-color-on-accent: white;
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
    font-weight: 650;
    letter-spacing: -0.04em;
    font-size: 22px;
  }
  .brand-mark {
    display: grid;
    place-items: center;
    width: 27px;
    height: 27px;
    border-radius: 8px;
    background: var(--tacta-color-accent);
    color: var(--tacta-color-on-accent);
    font-size: 18px;
  }
  .workspace {
    display: flex;
    flex-direction: column;
    min-height: 0;
    min-width: 0;
  }
  header {
    min-height: 72px;
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
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--tacta-color-muted);
    white-space: nowrap;
  }
  .badge::before {
    content: "";
    display: inline-block;
    width: 6px;
    height: 6px;
    margin-right: 8px;
    border-radius: 50%;
    background: var(--tacta-color-accent);
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
  tacta-chat-message-list {
    flex: 1;
    min-height: 0;
  }
  .welcome {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: min(720px, 100%);
    margin: auto;
    padding: 32px;
  }
  .eyebrow {
    color: var(--tacta-color-accent);
    font-size: 11px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
  }
  h1 {
    font-size: clamp(28px, 4vw, 44px);
    line-height: 1.12;
    margin: 15px 0;
    letter-spacing: -0.05em;
    font-weight: 500;
    max-width: 550px;
  }
  .intro {
    max-width: 470px;
    color: var(--tacta-color-muted);
    margin: 0 0 26px;
  }
  .suggestions {
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
    border-color: var(--tacta-color-accent);
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
    font-size: 23px;
    font-weight: 500;
  }
  .inspector p {
    color: var(--tacta-color-muted);
    font-size: 13px;
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
