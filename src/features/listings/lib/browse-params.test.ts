import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseBrowseParams, serializeBrowseParams } from "./browse-params.ts";

describe("browse params", () => {
  it("reads the living-detail filters", () => {
    const { filters } = parseBrowseParams({ pets: "1", stepfree: "1", quiet: "1" });
    assert.equal(filters.petsOnly, true);
    assert.equal(filters.stepFreeOnly, true);
    assert.equal(filters.quietOnly, true);
  });

  it("defaults to off and ignores junk", () => {
    const { filters, sort } = parseBrowseParams({ pets: "yes", quiet: "0", sort: "nonsense", max: "5" });
    assert.equal(filters.petsOnly, false);
    assert.equal(filters.quietOnly, false);
    assert.equal(sort, "recommended");
    assert.equal(filters.maxMonthly, 1500);
  });

  it("round-trips and leaves defaults out of the URL", () => {
    assert.equal(serializeBrowseParams(parseBrowseParams({}).filters, "recommended", "list"), "");
    const parsed = parseBrowseParams({ pets: "1", stepfree: "1", beds: "2", sort: "price-asc", view: "map" });
    const qs = serializeBrowseParams(parsed.filters, parsed.sort, parsed.view);
    const again = parseBrowseParams(Object.fromEntries(new URLSearchParams(qs)));
    assert.deepEqual(again.filters, parsed.filters);
    assert.equal(again.sort, "price-asc");
    assert.equal(again.view, "map");
  });
});
