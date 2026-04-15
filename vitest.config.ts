import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "node",
    globals: true,
    include: ["lib/**/__tests__/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["lib/repositories/**/*.ts"],
      exclude: ["lib/repositories/__tests__/**"],
      thresholds: {
        lines: 60,
        functions: 60,
      },
    },
  },
});
