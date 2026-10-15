import { ImageCanvas } from "./image-canvas.js";
import { ImageColorPicker } from "./image-color-picker.js";
import { ImageEditorActions } from "./image-editor-actions.js";
import { ImageEditor } from "./image-editor.js";
import { ImageTextInput } from "./image-text-input.js";
import { ImageTools } from "./image-tools.js";
import { MovableToolbar } from "./movable-toolbar.js";
export function registerImageEditorElements(): void {
  if (!customElements.get("tacta-image-canvas")) {
    customElements.define("tacta-image-canvas", ImageCanvas);
  }
  if (!customElements.get("tacta-image-color-picker")) {
    customElements.define("tacta-image-color-picker", ImageColorPicker);
  }
  if (!customElements.get("tacta-image-editor-actions")) {
    customElements.define("tacta-image-editor-actions", ImageEditorActions);
  }
  if (!customElements.get("tacta-image-editor")) {
    customElements.define("tacta-image-editor", ImageEditor);
  }
  if (!customElements.get("tacta-image-text-input")) {
    customElements.define("tacta-image-text-input", ImageTextInput);
  }
  if (!customElements.get("tacta-image-tools")) {
    customElements.define("tacta-image-tools", ImageTools);
  }
  if (!customElements.get("tacta-movable-toolbar")) {
    customElements.define("tacta-movable-toolbar", MovableToolbar);
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "tacta-image-canvas": ImageCanvas;
    "tacta-image-color-picker": ImageColorPicker;
    "tacta-image-editor-actions": ImageEditorActions;
    "tacta-image-editor": ImageEditor;
    "tacta-image-text-input": ImageTextInput;
    "tacta-image-tools": ImageTools;
    "tacta-movable-toolbar": MovableToolbar;
  }
}
