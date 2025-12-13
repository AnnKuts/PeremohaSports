import { defineConfig } from "vitest/config";
import * as path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: [
      "tests/**/*.test.ts",
      "src/**/*.test.ts",
      "**/*.spec.ts"
    ],
    exclude: [
      "node_modules/**",
      "dist/**",
      "prisma/**"
    ],
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@tests": path.resolve(__dirname, "./tests")
    }
  },
});