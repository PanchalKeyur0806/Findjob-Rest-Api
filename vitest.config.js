import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true, // optional: allows using `describe`, `it`, `expect` without import
    include: ["tests/**/*.test.js"],
    fileParallelism: false,
  },
});
