import { fileURLToPath } from "node:url";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vitest/config";

export default defineConfig({
  optimizeDeps: {
    entries: ["packages/*/src/**/*.ts", "test/**/*.ts"],
    include: [
      "dompurify",
      "marked",
      "lit/directives/guard.js",
      "lit/directives/live.js",
      "lit/directives/keyed.js",
      "lit/directives/unsafe-html.js",
    ],
  },
  resolve: {
    alias: {
      "@tacta/core": fileURLToPath(new URL("./packages/core/src", import.meta.url)),
      "@tacta/chat": fileURLToPath(new URL("./packages/chat/src", import.meta.url)),
      "@tacta/workspace": fileURLToPath(new URL("./packages/workspace/src", import.meta.url)),
    },
  },
  test: {
    include: ["test/**/*.test.ts"],
    restoreMocks: true,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: "chromium", viewport: { width: 1280, height: 800 } }],
    },
  },
});
