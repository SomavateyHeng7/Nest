import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { hasContactDetails } from "./contact-detect.ts";

describe("hasContactDetails", () => {
  it("flags phone numbers, including spaced, international and Khmer digits", () => {
    for (const t of ["call 012 345 678", "+855 12 345 678", "០១២៣៤៥៦៧៨"]) assert.equal(hasContactDetails(t), true, t);
  });
  it("flags links, emails and chat handles", () => {
    for (const t of ["see https://x.com/a", "t.me/someone", "me@mail.com", "telegram: @sokha99"]) {
      assert.equal(hasContactDetails(t), true, t);
    }
  });
  it("leaves ordinary messages and dates alone", () => {
    for (const t of ["Is it free on 2026-12-01?", "Can I move in on 12/01/2026?", "Rent is $350 for 3 months", "Hello!"]) {
      assert.equal(hasContactDetails(t), false, t);
    }
  });
});
