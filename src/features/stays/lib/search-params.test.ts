import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { firstParam, parseISODate, parseStay, serializeStay } from "./search-params.ts";

describe("parseStay", () => {
  it("round-trips with serializeStay", () => {
    assert.deepEqual(parseStay("3-months"), { amount: 3, unit: "months" });
    assert.equal(serializeStay({ amount: 2, unit: "weeks" }), "2-weeks");
  });
  it("rejects junk, unknown units, zero and absurd lengths", () => {
    for (const v of [undefined, "", "abc", "3-years", "0-days", "-2-days", "9999-days", "50-months"]) {
      assert.equal(parseStay(v), undefined, String(v));
    }
  });
});

describe("parseISODate", () => {
  it("accepts real dates only", () => {
    assert.equal(parseISODate("2026-12-01"), "2026-12-01");
    for (const v of ["2026-13-01", "2026-02-30", "12/01/2026", "", undefined]) assert.equal(parseISODate(v), undefined, String(v));
  });
});

describe("firstParam", () => {
  it("takes the first of repeated params", () => {
    assert.equal(firstParam(["a", "b"]), "a");
    assert.equal(firstParam("a"), "a");
  });
});
