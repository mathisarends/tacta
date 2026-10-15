import { TactaElement as LitElement } from "@tacta/core/element";
import { css, html, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { workspaceStyles } from "@tacta/core/styles/workspace";
import { Compartment, EditorState, type Extension, Transaction } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, placeholder } from "@codemirror/view";
import { defaultKeymap, history, historyKeymap, redo } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { json } from "@codemirror/lang-json";
import { yamlFrontmatter } from "@codemirror/lang-yaml";
import {
  HighlightStyle,
  LanguageDescription,
  syntaxHighlighting,
  foldGutter,
  foldKeymap,
} from "@codemirror/language";
import { languages } from "@codemirror/language-data";
import { tags } from "@lezer/highlight";
import { livePreview } from "./live-preview.js";
import { metadataPreview } from "./metadata-preview.js";
import { tablePreview } from "./table-preview.js";

const highlighting = HighlightStyle.define([
  { tag: tags.heading1, fontSize: "26px", fontWeight: "650", letterSpacing: "-0.035em" },
  { tag: tags.heading2, fontSize: "20px", fontWeight: "600", letterSpacing: "-0.02em" },
  { tag: [tags.heading3, tags.heading4, tags.heading5, tags.heading6], fontWeight: "600" },
  { tag: tags.strong, fontWeight: "650" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  {
    tag: [tags.processingInstruction, tags.meta, tags.comment],
    color: "var(--tacta-color-muted, #a3a3a5)",
  },
  { tag: tags.link, color: "var(--tacta-color-accent, #ffffff)", textDecoration: "underline" },
  {
    tag: tags.monospace,
    fontFamily: "var(--tacta-font-mono, ui-monospace, monospace)",
    color: "var(--tacta-color-accent, #ffffff)",
  },
  { tag: tags.string, color: "var(--tacta-color-positive, #b5df69)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--tacta-color-warning, #e5c07b)" },
  { tag: tags.propertyName, color: "var(--tacta-color-syntax-property, #9ccaff)" },
  { tag: [tags.keyword, tags.operator], color: "var(--tacta-color-syntax-heading, #ff8e86)" },
  {
    tag: [tags.function(tags.variableName), tags.typeName],
    color: "var(--tacta-color-warning, #e5c07b)",
  },
  { tag: [tags.tagName, tags.attributeName], color: "var(--tacta-color-syntax-property, #9ccaff)" },
]);

const sourceHighlighting = HighlightStyle.define([
  { tag: [tags.keyword, tags.operator], color: "var(--tacta-color-syntax-heading, #ff8e86)" },
  {
    tag: [tags.function(tags.variableName), tags.typeName, tags.className],
    color: "var(--tacta-color-warning, #e5c07b)",
  },
  { tag: [tags.tagName, tags.attributeName], color: "var(--tacta-color-syntax-property, #9ccaff)" },
  { tag: tags.regexp, color: "var(--tacta-color-positive, #b5df69)" },
  { tag: tags.heading, color: "var(--tacta-color-syntax-heading, #ff8e86)", fontWeight: "550" },
  { tag: tags.strong, fontWeight: "650" },
  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
  { tag: [tags.monospace, tags.string], color: "var(--tacta-color-positive, #b5df69)" },
  {
    tag: [tags.link, tags.url, tags.propertyName],
    color: "var(--tacta-color-syntax-property, #9ccaff)",
  },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--tacta-color-warning, #e5c07b)" },
  {
    tag: [tags.meta, tags.processingInstruction, tags.comment],
    color: "var(--tacta-color-muted, #a3a3a5)",
  },
]);

export class MarkdownEditor extends LitElement {
  @property() value = "";
  @property() label = "";
  @property({ type: Boolean }) disabled = false;
  @property({ type: Boolean }) readOnly = false;
  @property({ type: Boolean, reflect: true }) source = false;
  @property({ type: Boolean }) wrap = true;
  @property({ type: Boolean }) folding = false;
  @property({ type: Boolean }) live = false;
  @property() placeholder = "";
  private editor: EditorView | null = null;
  private readonly configuration = new Compartment();
  private readonly language = new Compartment();
  private languageRequest = 0;
  private replacing = false;
  private editPosition: number | null = null;

  private readonly editSource = (position: number): void => {
    if (this.disabled || this.readOnly || !this.live) {
      return;
    }
    this.editPosition = position;
    this.source = true;
    this.live = false;
    this.dispatchEvent(new CustomEvent("document-edit", { bubbles: true, composed: true }));
  };

  protected override updated(changed: Map<PropertyKey, unknown>): void {
    if (!this.editor) {
      this.editor = new EditorView({
        parent: this.renderRoot.querySelector(".editor")!,
        state: EditorState.create({
          doc: this.value,
          extensions: [
            this.configuration.of(this.extensions()),
            this.language.of([]),
            history(),
            keymap.of([
              { key: "Mod-Shift-z", run: redo, preventDefault: true },
              ...defaultKeymap,
              ...historyKeymap,
            ]),
            EditorView.updateListener.of((update) => {
              if (update.docChanged && !this.replacing) {
                this.value = update.state.doc.toString();
                this.dispatchEvent(
                  new CustomEvent<string>("document-change", {
                    detail: this.value,
                    bubbles: true,
                    composed: true,
                  }),
                );
              }
            }),
          ],
        }),
      });
      void this.loadLanguage();
      return;
    }
    if (
      changed.has("label") ||
      changed.has("disabled") ||
      changed.has("readOnly") ||
      changed.has("source") ||
      changed.has("wrap") ||
      changed.has("folding") ||
      changed.has("live") ||
      changed.has("placeholder")
    ) {
      this.editor.dispatch({ effects: this.configuration.reconfigure(this.extensions()) });
    }
    if (changed.has("label")) {
      void this.loadLanguage();
    }
    if (
      changed.has("value") &&
      this.editor.state.doc.toString() !== this.value.replaceAll("\r\n", "\n")
    ) {
      this.replacing = true;
      try {
        this.editor.dispatch({
          changes: { from: 0, to: this.editor.state.doc.length, insert: this.value },
          annotations: Transaction.addToHistory.of(false),
        });
      } finally {
        this.replacing = false;
      }
    }
    if (this.editPosition !== null && this.source && !this.live) {
      const position = Math.min(this.editPosition, this.editor.state.doc.length);
      this.editPosition = null;
      this.editor.dispatch({
        selection: { anchor: position },
        effects: EditorView.scrollIntoView(position, { y: "center" }),
      });
      this.editor.focus();
    }
  }

  override disconnectedCallback(): void {
    ++this.languageRequest;
    this.editor?.destroy();
    this.editor = null;
    super.disconnectedCallback();
  }

  private async loadLanguage(): Promise<void> {
    const request = ++this.languageRequest;
    const editor = this.editor;
    if (!editor) {
      return;
    }
    const filename = this.label.split(/[\\/]/).at(-1) ?? this.label;
    if (/\.(?:md|markdown|mkd)$/i.test(filename)) {
      editor.dispatch({
        effects: this.language.reconfigure(
          yamlFrontmatter({
            content: markdown({ base: markdownLanguage, codeLanguages: languages }),
          }),
        ),
      });
      return;
    }
    if (/\.json$/i.test(filename)) {
      editor.dispatch({ effects: this.language.reconfigure(json()) });
      return;
    }
    editor.dispatch({ effects: this.language.reconfigure([]) });
    const description = LanguageDescription.matchFilename(languages, filename);
    if (!description) {
      return;
    }
    try {
      const support = await description.load();
      if (this.isConnected && this.editor === editor && request === this.languageRequest) {
        editor.dispatch({ effects: this.language.reconfigure(support) });
      }
    } catch {
      // Keep the file readable as plain text if a language chunk cannot be loaded.
    }
  }

  private extensions(): Extension[] {
    const isMarkdown = /\.(?:md|markdown|mkd)$/i.test(this.label);
    const editSource = this.disabled || this.readOnly ? undefined : this.editSource;
    let fontSize = this.source ? "12px" : "var(--tacta-font-size-reading, var(--tacta-text-lg))";
    let lineHeight = "var(--tacta-source-line-height, 1.85)";
    if (this.live) {
      fontSize = "14px";
      lineHeight = "22px";
    }
    return [
      EditorState.readOnly.of(this.disabled || this.readOnly || this.live),
      EditorView.editable.of(!this.disabled && !this.readOnly && !this.live),
      EditorView.contentAttributes.of({
        "data-raw-keys": "",
        "aria-label": this.label,
        "aria-multiline": "true",
        tabindex: "0",
      }),
      this.source ? lineNumbers() : [],
      this.live ? [metadataPreview(editSource), tablePreview, livePreview] : [],
      this.placeholder ? placeholder(this.placeholder) : [],
      this.wrap ? EditorView.lineWrapping : [],
      this.folding ? [foldGutter(), keymap.of(foldKeymap)] : [],
      syntaxHighlighting(this.source ? sourceHighlighting : highlighting),
      EditorView.theme({
        "&": {
          color: "var(--tacta-color-text, #e6e6e6)",
          backgroundColor: "transparent",
          minHeight: "var(--tacta-source-min-height, 360px)",
        },
        "&.cm-focused": { outline: "none" },
        ".cm-scroller": {
          fontFamily:
            isMarkdown && !this.source
              ? "var(--tacta-font-family, system-ui, sans-serif)"
              : "var(--tacta-font-mono, ui-monospace, monospace)",
          lineHeight,
          fontSize,
        },
        ".cm-content": { padding: "18px 0 64px", caretColor: "var(--tacta-color-text, #e6e6e6)" },
        ".cm-line": { padding: "0 2px" },
        ".cm-line.cm-live-spacer": { fontSize: "0", lineHeight: "10px" },
        ".cm-line.cm-live-heading": { lineHeight: "1.3", paddingTop: "6px", paddingBottom: "4px" },
        ".cm-line.cm-live-list": { paddingLeft: "14px" },
        ".cm-line.cm-live-before-block": { paddingBottom: "10px" },
        ".cm-line.cm-live-after-block": { paddingTop: "10px" },
        ".cm-live-inline-code": {
          backgroundColor: "var(--tacta-color-surface, #252627)",
          borderRadius: "3px",
          padding: "1px 4px",
          fontSize: "0.92em",
        },
        ".cm-cursor": { borderLeftColor: "var(--tacta-color-text, #e6e6e6)" },
        ".cm-gutters": {
          backgroundColor: "var(--tacta-color-background, #181818)",
          color: "var(--tacta-color-muted, #a3a3a5)",
          border: "none",
          userSelect: "none",
        },
        ".cm-lineNumbers .cm-gutterElement": { padding: "0 16px 0 4px", minWidth: "24px" },
        ".cm-foldGutter .cm-gutterElement": { padding: "0 8px 0 0", cursor: "pointer" },
        ".cm-foldPlaceholder": {
          backgroundColor: "var(--tacta-color-surface, #252627)",
          color: "var(--tacta-color-muted, #a3a3a5)",
          border: "none",
          borderRadius: "4px",
          padding: "0 6px",
        },
        ".cm-placeholder": { color: "var(--tacta-color-muted, #a3a3a5)" },
        ".cm-live-bullet": { color: "var(--tacta-color-muted, #a3a3a5)" },
        ".cm-live-quote": {
          borderLeft: "3px solid var(--tacta-color-border-strong, #ffffff1f)",
          paddingLeft: "12px",
          color: "var(--tacta-color-muted, #a3a3a5)",
        },
        ".cm-live-rule": { borderBottom: "1px solid var(--tacta-color-border, #ffffff0d)" },
        ".cm-line.cm-live-block": {
          backgroundColor: "var(--tacta-color-surface, #252627)",
          borderInline: "1px solid var(--tacta-color-border, #ffffff0d)",
          padding: "0 16px",
          fontFamily: "var(--tacta-font-mono, ui-monospace, monospace)",
          fontSize: "13px",
          lineHeight: "1.7",
        },
        ".cm-line.cm-live-block-start": {
          borderTop: "1px solid var(--tacta-color-border, #ffffff0d)",
          borderRadius: "8px 8px 0 0",
          paddingTop: "8px",
          paddingBottom: "6px",
        },
        ".cm-line.cm-live-block-end": {
          borderBottom: "1px solid var(--tacta-color-border, #ffffff0d)",
          borderRadius: "0 0 8px 8px",
          paddingBottom: "8px",
        },
        ".cm-line.cm-live-block-footer": { fontSize: "0", lineHeight: "0" },
        ".cm-live-block-label": {
          color: "var(--tacta-color-muted, #a3a3a5)",
          fontFamily: "var(--tacta-font-family, system-ui, sans-serif)",
          fontSize: "11px",
          fontWeight: "600",
        },
        "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection": {
          backgroundColor: "var(--tacta-color-selection, #414347)",
        },
      }),
    ];
  }

  static override styles = css`
    ${workspaceStyles}
    :host {
      display: block;
      min-width: 0;
      font-size: var(--tacta-font-size-body, var(--tacta-text-base));
    }
    .editor {
      max-width: var(--tacta-document-content-width, 100ch);
      margin: 0;
    }
    :host([source]) .editor {
      max-width: none;
    }
  `;

  override render(): TemplateResult<1> {
    return html`<div class="editor"></div>`;
  }
}
