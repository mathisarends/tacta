import { css } from "lit";
import { workspaceStyles } from "@tacta/core/styles/workspace";

export const imageColorPickerStyles = css`
  ${workspaceStyles}
  :host {
    display: block;
    flex: none;
  }
  .trigger {
    width: var(--tacta-image-editor-control, 34px);
    height: var(--tacta-image-editor-control, 34px);
  }
  .chip {
    width: var(--tacta-image-editor-color-chip, 24px);
    height: var(--tacta-image-editor-color-chip, 24px);
    border-radius: var(--tacta-radius-round, 50%);
    background: var(--tacta-annotation-color);
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
  }
  [popover] {
    position: fixed;
    inset: auto;
    margin: 0;
    width: var(--tacta-image-editor-palette-width, 232px);
    max-width: calc(100vw - var(--tacta-image-editor-inset, 20px));
    padding: var(--tacta-image-editor-palette-padding, 12px);
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    border-radius: var(--tacta-radius-menu, 13px);
    background: var(--tacta-color-surface, #252627);
    color: var(--tacta-color-text, #e6e6e6);
    box-shadow: var(--tacta-shadow-menu, 0 12px 36px #0004);
    overflow: auto;
    font-size: var(--tacta-font-size-caption, var(--tacta-text-sm));
  }
  .heading {
    display: flex;
    align-items: center;
    gap: var(--tacta-image-editor-gap, 6px);
    margin-bottom: var(--tacta-image-editor-palette-padding, 12px);
    font-weight: var(--tacta-font-weight-emphasis, var(--tacta-font-weight-semibold));
  }
  .swatches {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--tacta-image-editor-gap, 6px);
  }
  .swatch {
    display: grid;
    place-items: center;
    height: var(--tacta-image-editor-control, 34px);
    background: var(--tacta-swatch);
    border: 2px solid transparent;
    border-radius: var(--tacta-radius-element, 8px);
    color: var(--tacta-color-text, #e6e6e6);
  }
  .swatch[aria-pressed="true"] {
    outline: 2px solid var(--tacta-color-text, #e6e6e6);
    outline-offset: 2px;
  }
  form {
    display: flex;
    gap: var(--tacta-image-editor-gap, 6px);
    align-items: flex-end;
    margin-top: var(--tacta-image-editor-palette-padding, 12px);
  }
  label {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: var(--tacta-image-editor-gap, 6px);
  }
  input {
    width: 100%;
    min-width: 0;
    height: var(--tacta-image-editor-control, 34px);
    padding-inline: var(--tacta-image-editor-gap, 6px);
    border: 1px solid var(--tacta-color-border-strong, #ffffff1f);
    border-radius: var(--tacta-radius-element, 8px);
    background: var(--tacta-color-background, #181818);
    color: var(--tacta-color-text, #e6e6e6);
    font: inherit;
  }
  .apply {
    height: var(--tacta-image-editor-control, 34px);
  }
`;
