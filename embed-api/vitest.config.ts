import { defineConfig } from "vitest/config";

// Vitest is the test runner for embed-api. Property tests are written with
// fast-check (imported directly inside the test files) and run via `vitest run`.
// Per the design, property tests run a minimum of 100 iterations.
export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    // fast-check property tests can be longer-running; give them headroom.
    testTimeout: 30_000,
  },
});
