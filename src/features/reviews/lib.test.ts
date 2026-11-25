import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { publicName } from "./lib.ts";

describe("publicName", () => {
  it("shortens the last name to an initial", () => {
    assert.equal(publicName("Sokha Chan"), "Sokha C.");
    assert.equal(publicName("  Anna Maria Lopez "), "Anna L.");
  });
  it("keeps a single name as is", () => {
    assert.equal(publicName("Sokha"), "Sokha");
  });
});
