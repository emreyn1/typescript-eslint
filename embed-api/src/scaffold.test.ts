import { describe, it, expect } from "vitest";
import fc from "fast-check";
import { APP_NAME } from "./index.js";

// Scaffold-only smoke tests. These verify the test runner (Vitest) and the
// property-based testing library (fast-check) are wired and runnable via
// `vitest run`. They are NOT design correctness properties — those are added
// alongside their modules by later tasks.
describe("embed-api scaffold", () => {
  it("exposes the app name", () => {
    expect(APP_NAME).toBe("embed-api");
  });

  it("fast-check runs property tests (>=100 iterations)", () => {
    fc.assert(
      fc.property(fc.array(fc.integer()), (xs) => {
        // reversing twice is the identity — trivial sanity check that the
        // generator/assertion plumbing executes.
        expect([...xs].reverse().reverse()).toEqual(xs);
      }),
      { numRuns: 100 },
    );
  });
});
