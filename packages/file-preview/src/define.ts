import type { SpreadsheetPreview } from "./spreadsheet-preview.js";
import type { WordPreview } from "./word-preview.js";
import type { PdfPreview } from "./pdf-preview.js";
import { FilePreview } from "./file-preview.js";
import { ImagePreview } from "./image-preview.js";
import { registerImageEditorElements } from "@tacta/image-editor/define";
export function registerFilePreviewElements(): void {
  registerImageEditorElements();
  if (!customElements.get("tacta-file-preview")) {
    customElements.define("tacta-file-preview", FilePreview);
  }
  if (!customElements.get("tacta-image-preview")) {
    customElements.define("tacta-image-preview", ImagePreview);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-file-preview": FilePreview;
    "tacta-image-preview": ImagePreview;
    "tacta-pdf-preview": PdfPreview;
    "tacta-spreadsheet-preview": SpreadsheetPreview;
    "tacta-word-preview": WordPreview;
  }
}
