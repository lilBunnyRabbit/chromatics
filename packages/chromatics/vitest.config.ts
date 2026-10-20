import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts", "scripts/**/*.test.ts"],
    setupFiles: ["./vitest.setup.ts"],
    // The property suites (Hct's root search above all) take ~2 s locally and over 5 s, Vitest's default, on a
    // 2-core CI runner with every file in parallel.
    testTimeout: 30_000,
  },
});
