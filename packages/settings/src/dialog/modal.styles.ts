import { css } from "lit";

export const modalStyles = css`
  .modal-body {
    padding-top: 8px;
  }
  .modal-body > p {
    margin: 0;
    line-height: var(--tacta-line-height-body, 1.6);
  }
  .modal-form {
    margin: 0;
  }
  .modal-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid var(--tacta-color-border, #ffffff0d);
  }
  .modal-actions .button.secondary {
    background: transparent;
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .modal-actions .button.secondary:hover:not(:disabled) {
    background: var(--tacta-color-panel-hover, #2d2e2f);
    color: var(--tacta-color-text, #e6e6e6);
  }
  .modal-actions .button.danger {
    background: var(--tacta-color-error-surface, #302325);
    color: var(--tacta-color-error, #f0aaa1);
  }
  .modal-actions .button.danger:hover:not(:disabled) {
    background: color-mix(
      in srgb,
      var(--tacta-color-error, #f0aaa1) 20%,
      var(--tacta-color-error-surface, #302325)
    );
  }
  .modal-error {
    margin: 16px 0 0;
    padding: 10px 12px;
    border-radius: var(--tacta-radius-menu-item, 7px);
    background: var(--tacta-color-error-surface, #302325);
    color: var(--tacta-color-error, #f0aaa1);
    font-size: var(--tacta-font-size-label, var(--tacta-text-md));
    line-height: var(--tacta-line-height-caption, 1.5);
  }
`;
