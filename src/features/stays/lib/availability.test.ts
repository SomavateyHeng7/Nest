import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { stayProblem } from "./availability.ts";
import type { Listing } from "../../listings/types.ts";

const listing = {
  minStayNights: 3,
  maxStayMonths: 6,
  availableFrom: "2026-12-01",
  bookedRanges: [{ start: "2026-12-20", end: "2026-12-27" }],
} as unknown as Listing;

describe("stayProblem", () => {
  it("accepts a stay that fits", () => {
    assert.equal(stayProblem(listing, "2026-12-01", 10), null);
  });
  it("rejects a stay below the minimum", () => {
    assert.deepEqual(stayProblem(listing, "2026-12-01", 2), { kind: "min", nights: 3 });
  });
  it("rejects a stay above the maximum", () => {
    assert.equal(stayProblem(listing, "2026-12-01", 6 * 31 + 1)?.kind, "max");
  });
  it("asks for a date when none is picked", () => {
    assert.deepEqual(stayProblem(listing, "", 10), { kind: "noDate" });
  });
  it("rejects a move-in before the home is free", () => {
    assert.deepEqual(stayProblem(listing, "2026-11-20", 10), { kind: "early", from: "2026-12-01" });
  });
  it("rejects a stay that runs into a booking", () => {
    assert.equal(stayProblem(listing, "2026-12-15", 10)?.kind, "clash");
  });
  it("allows moving in the day another stay ends", () => {
    assert.equal(stayProblem(listing, "2026-12-27", 5), null);
  });
});
