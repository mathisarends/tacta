import { css } from "lit";
import { scrollbarStyles } from "@tacta/core/styles/scrollbar";

export const markdownStyles = css`
  ${scrollbarStyles}
  .markdown {
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    overflow-wrap: anywhere;
    font-size: var(--tacta-font-size-reading, var(--tacta-text-lg, 0.9375rem));
    font-weight: var(--tacta-font-weight-body, var(--tacta-font-weight-regular, 400));
    line-height: var(--tacta-line-height-reading, 1.65);
    letter-spacing: var(--tacta-letter-spacing-reading, normal);
  }
  .markdown > :first-child {
    margin-top: 0;
  }
  .markdown > :last-child {
    margin-bottom: 0;
  }
  .markdown p,
  .markdown ul,
  .markdown ol,
  .markdown blockquote,
  .markdown pre,
  .markdown table {
    margin: 0 0 1.15em;
  }
  .markdown h1,
  .markdown h2,
  .markdown h3,
  .markdown h4,
  .markdown h5,
  .markdown h6 {
    margin: 1.2em 0 0.5em;
    line-height: var(--tacta-line-height-heading, 1.3);
    font-weight: var(--tacta-font-weight-heading, var(--tacta-font-weight-semibold, 600));
    letter-spacing: var(--tacta-letter-spacing-message-heading, -0.02em);
  }
  .markdown strong,
  .markdown b {
    font-weight: var(--tacta-font-weight-emphasis, var(--tacta-font-weight-semibold, 600));
  }
  .markdown h1 {
    font-size: var(--tacta-font-size-message-title, 1.45em);
  }
  .markdown h2 {
    font-size: var(--tacta-font-size-message-section, 1.3em);
  }
  .markdown h3 {
    font-size: var(--tacta-font-size-message-subheading, 1.15em);
  }
  .markdown h4,
  .markdown h5,
  .markdown h6 {
    font-size: var(--tacta-font-size-message-minor-heading, 1em);
  }
  .markdown ul,
  .markdown ol {
    padding-left: 1.5em;
  }
  .markdown li + li {
    margin-top: 0.4em;
  }
  .markdown blockquote {
    padding-left: 1em;
    border-left: 3px solid var(--tacta-color-border, #ffffff0d);
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .markdown a {
    color: var(--tacta-color-accent, #ffffff);
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .markdown code,
  .markdown pre {
    font-family: var(
      --tacta-font-mono,
      "Geist Mono Variable",
      Consolas,
      "Liberation Mono",
      monospace
    );
    font-size: var(--tacta-font-size-code, 0.9em);
  }
  .markdown code {
    padding: 0.1em 0.3em;
    border-radius: var(--tacta-radius-code, 4px);
    background: var(--tacta-color-surface, #252627);
  }
  .markdown pre {
    max-width: 100%;
    padding: 12px 14px;
    overflow-x: auto;
    border-radius: var(--tacta-radius-control, 12px);
    background: var(--tacta-color-surface, #252627);
  }
  .markdown pre code {
    padding: 0;
    background: none;
  }
  .markdown pre :is(.tok-keyword, .tok-operator) {
    color: var(--tacta-color-syntax-heading, #ff8e86);
  }
  .markdown pre :is(.tok-string, .tok-string2, .tok-inserted) {
    color: var(--tacta-color-positive, #b5df69);
  }
  .markdown
    pre
    :is(.tok-number, .tok-bool, .tok-atom, .tok-literal, .tok-typeName, .tok-className) {
    color: var(--tacta-color-warning, #e5c07b);
  }
  .markdown pre :is(.tok-propertyName, .tok-labelName, .tok-namespace) {
    color: var(--tacta-color-syntax-property, #9ccaff);
  }
  .markdown pre :is(.tok-comment, .tok-meta) {
    color: var(--tacta-color-muted, #a3a3a5);
  }
  .markdown pre :is(.tok-invalid, .tok-deleted) {
    color: var(--tacta-color-error, #f0aaa1);
  }
  .markdown table {
    width: 100%;
    min-width: min(100%, 360px);
    border-collapse: collapse;
    font-size: inherit;
  }
  .markdown th,
  .markdown td {
    padding: 9px 12px;
    border: 1px solid var(--tacta-color-border, #ffffff0d);
    text-align: left;
    vertical-align: top;
  }
  .markdown th {
    background: var(--tacta-color-surface, #252627);
    font-weight: var(--tacta-font-weight-table-header, var(--tacta-font-weight-medium, 500));
  }
  .markdown img {
    max-width: 100%;
    height: auto;
  }
  .markdown hr {
    margin: 1em 0;
    border: 0;
    border-top: 1px solid var(--tacta-color-border, #ffffff0d);
  }
`;
