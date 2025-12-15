import { defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/integration/**/*.test.ts"],
    exclude: ["node_modules/**", "dist/**", "tests/unit/**"],
    testTimeout: 30000,
    maxConcurrency: 1,
    pool: "threads",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests"),
    },
  },
});
