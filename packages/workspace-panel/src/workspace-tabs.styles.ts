import { css } from "lit";

export const workspaceTabBarStyles = css`
  .tab-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    height: var(--tacta-workspace-header-height, 60px);
    flex: 0 0 var(--tacta-workspace-header-height, 60px);
    box-sizing: border-box;
    min-width: 0;
    padding: 0 var(--tacta-workspace-header-padding-inline, 16px);
    border-bottom: 1px solid var(--tacta-color-border, #ffffff0d);
    background: var(--tacta-color-background, #181818);
  }
  .tab-strip {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
  }
  .tab-scroll {
    display: flex;
    align-items: center;
    flex: 0 1 auto;
    gap: 4px;
    min-width: 0;
    padding: 5px 0;
    overflow-x: auto;
    scrollbar-width: none;
    scroll-padding-inline: 2px;
  }
  .tab-scroll::-webkit-scrollbar {
    display: none;
  }
  .tab-scroll[data-scrolled] {
    mask-image: linear-gradient(to right, transparent, black 18px);
  }
  .tab {
    position: relative;
    flex: 0 1 240px;
    width: 240px;
    min-width: 156px;
  }
  .tab + .tab::before {
    content: "";
    position: absolute;
    top: 8px;
    left: -3px;
    width: 1px;
    height: 18px;
    background: var(--tacta-color-border, #ffffff0d);
    pointer-events: none;
  }
  .tab[active]::before,
  .tab[active] + .tab::before {
    opacity: 0;
  }
  .tab:focus-visible {
    outline-offset: -2px;
    border-radius: var(--tacta-radius-subtle, 5px);
  }
  .tab-bar .icon-button {
    border-radius: var(--tacta-radius-tab, 8px);
  }
  .tab-bar .add-tab {
    flex: 0 0 32px;
  }
`;

export const workspaceTabStyles = css`
  :host {
    display: flex;
    align-items: center;
    gap: 6px;
    height: 36px;
    padding: 0 6px 0 12px;
    box-sizing: border-box;
    border: 1px solid transparent;
    border-radius: var(--tacta-radius-tab, 8px);
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
    font: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400))
      var(--tacta-font-size-label, var(--tacta-text-md, 0.8125rem)) /
      var(--tacta-line-height-control, 1.4)
      var(--tacta-font-family, "Segoe UI Variable Text", "Segoe UI", "Geist Variable", sans-serif);
    white-space: nowrap;
  }
  :host(:hover) {
    color: var(--tacta-color-text, #e6e6e6);
    background: var(--tacta-color-surface, #252627);
  }
  :host([active]) {
    color: var(--tacta-color-text, #e6e6e6);
    font-weight: var(--tacta-font-weight-control, var(--tacta-font-weight-regular, 400));
    background: var(--tacta-color-surface, #252627);
    border-color: var(--tacta-color-border-strong, #ffffff1f);
  }
  .tab-button {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    min-width: 0;
    height: 100%;
    padding: 0;
    border: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    font: inherit;
    cursor: pointer;
  }
  .tab-button:focus-visible {
    outline-offset: -2px;
    border-radius: var(--tacta-radius-subtle, 5px);
  }
  .tab-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  :host([preview]) .tab-name {
    font-style: italic;
  }
  svg {
    flex-shrink: 0;
  }
  .tab-close {
    display: grid;
    place-items: center;
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    padding: 0;
    border: 0;
    border-radius: var(--tacta-radius-subtle, 5px);
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
    opacity: 0;
    cursor: pointer;
  }
  :host(:is([active], :hover, :focus-within)) .tab-close {
    opacity: 1;
  }
  .tab-close:hover {
    color: var(--tacta-color-text, #e6e6e6);
    background: var(--tacta-color-panel-hover, #2d2e2f);
  }
  @media (hover: none) {
    .tab-close {
      opacity: 1;
    }
  }
`;
