import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  resolve: {
    alias: {
      "@tacta/core": fileURLToPath(new URL("./packages/core/src", import.meta.url)),
      "@tacta/workspace-panel": fileURLToPath(
        new URL("./packages/workspace-panel/src", import.meta.url),
      ),
      "@tacta/sidebar": fileURLToPath(new URL("./packages/sidebar/src", import.meta.url)),
      "@tacta/workspace": fileURLToPath(new URL("./packages/workspace/src", import.meta.url)),
      "@tacta/question": fileURLToPath(new URL("./packages/question/src", import.meta.url)),
      "@tacta/voice-input": fileURLToPath(new URL("./packages/voice-input/src", import.meta.url)),
      "@tacta/markdown": fileURLToPath(new URL("./packages/markdown/src", import.meta.url)),
      "@tacta/chat": fileURLToPath(new URL("./packages/chat/src", import.meta.url)),
      "@tacta/terminal": fileURLToPath(new URL("./packages/terminal/src", import.meta.url)),
      "@tacta/browser": fileURLToPath(new URL("./packages/browser/src", import.meta.url)),
      "@tacta/image-editor": fileURLToPath(new URL("./packages/image-editor/src", import.meta.url)),
      "@tacta/file-preview": fileURLToPath(new URL("./packages/file-preview/src", import.meta.url)),
      "@tacta/code-diff": fileURLToPath(new URL("./packages/code-diff/src", import.meta.url)),
      "@tacta/markdown-document": fileURLToPath(
        new URL("./packages/markdown-document/src", import.meta.url),
      ),
    },
  },
});
