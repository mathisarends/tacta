import { EmptyFile } from "./empty-file.js";
import { MarkdownEditor } from "./markdown-editor.js";
import { SourceDocument } from "./source-document.js";
export function registerMarkdownDocumentElements(): void {
  if (!customElements.get("tacta-empty-file")) {
    customElements.define("tacta-empty-file", EmptyFile);
  }
  if (!customElements.get("tacta-markdown-editor")) {
    customElements.define("tacta-markdown-editor", MarkdownEditor);
  }
  if (!customElements.get("tacta-source-document")) {
    customElements.define("tacta-source-document", SourceDocument);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-empty-file": EmptyFile;
    "tacta-markdown-editor": MarkdownEditor;
    "tacta-source-document": SourceDocument;
  }
}
