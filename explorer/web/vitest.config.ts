import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const root = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  // Mirrors tsconfig.json's "@/*": ["./*"] — this vitest/vite version
  // predates native tsconfig-paths resolution, so it's set explicitly.
  resolve: { alias: { "@": path.resolve(root) } },
  test: { environment: "jsdom" },
});
