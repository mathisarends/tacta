import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        playground: fileURLToPath(new URL("./index.html", import.meta.url)),
        chatbot: fileURLToPath(new URL("./chatbot.html", import.meta.url)),
      },
    },
  },
});
