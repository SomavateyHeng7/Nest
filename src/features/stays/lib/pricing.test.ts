import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { nightsToStay, nextRentAmount, placementFee, placementFeeTier, quoteStay, stayToNights } from "./pricing.ts";

const pricing = { nightly: 40, weekly: 240, monthly: 800, deposit: 800 };

describe("stayToNights / nightsToStay", () => {
  it("converts units to nights", () => {
    assert.equal(stayToNights({ amount: 3, unit: "days" }), 3);
    assert.equal(stayToNights({ amount: 2, unit: "weeks" }), 14);
    assert.equal(stayToNights({ amount: 2, unit: "months" }), 60);
  });

  it("picks the most natural unit", () => {
    assert.deepEqual(nightsToStay(60), { amount: 2, unit: "months" });
    assert.deepEqual(nightsToStay(14), { amount: 2, unit: "weeks" });
    assert.deepEqual(nightsToStay(10), { amount: 10, unit: "days" });
    assert.deepEqual(nightsToStay(0), { amount: 1, unit: "days" });
  });
});

describe("quoteStay", () => {
  it("charges the nightly rate for a short stay", () => {
    const q = quoteStay(pricing, 3);
    assert.equal(q.tier, "nightly");
    assert.equal(q.rentTotal, 120);
    assert.equal(q.deposit, 0);
    assert.equal(q.dueAtBooking, 120);
    assert.equal(q.laterPayments, 0);
  });

  it("never costs more for a shorter stay than for a longer one", () => {
    // A shorter stay must not cost more than a longer one.
    let previous = 0;
    for (let nights = 1; nights <= 120; nights++) {
      const { rentTotal } = quoteStay(pricing, nights);
      assert.ok(rentTotal >= previous, `rent fell at ${nights} nights`);
      previous = rentTotal;
    }
  });

  it("caps a 6-night stay at the weekly price", () => {
    assert.equal(quoteStay(pricing, 6).rentTotal, 240);
  });

  it("splits a long stay into monthly instalments", () => {
    const q = quoteStay(pricing, 90);
    assert.equal(q.tier, "monthly");
    assert.equal(q.rentTotal, 2400);
    assert.equal(q.laterPayments, 2);
    assert.equal(q.deposit, 800);
    assert.equal(q.dueAtBooking, 800 + 800);
  });

  it("takes half the deposit for one to three weeks", () => {
    assert.equal(quoteStay(pricing, 14).deposit, 400);
    assert.equal(quoteStay(pricing, 6).deposit, 0);
  });

  it("never adds a renter fee", () => {
    assert.equal(quoteStay(pricing, 45).renterFee, 0);
  });

  it("treats zero or negative nights as one", () => {
    assert.equal(quoteStay(pricing, 0).nights, 1);
    assert.equal(quoteStay(pricing, -5).nights, 1);
  });
});

describe("nextRentAmount", () => {
  const stay = { moveIn: "2026-01-01", monthlyRent: 800, rentTotal: 2000 };
  it("charges a full month while rent remains", () => {
    assert.equal(nextRentAmount(stay, "2026-02-01"), 800);
  });
  it("charges only what is left for the final month", () => {
    assert.equal(nextRentAmount(stay, "2026-03-01"), 400);
  });
  it("never goes below zero", () => {
    assert.equal(nextRentAmount(stay, "2026-06-01"), 0);
  });
});

describe("placement fee", () => {
  it("uses the tier for the length of the stay", () => {
    assert.equal(placementFeeTier(1).rate, 0.5);
    assert.equal(placementFeeTier(3).rate, 0.5);
    assert.equal(placementFeeTier(4).rate, 0.75);
    assert.equal(placementFeeTier(7).rate, 1);
    assert.equal(placementFeeTier(24).rate, 1);
  });

  it("takes the fee from the first month's rent", () => {
    assert.equal(placementFee(800, 90, 2400).fee, 400);
    assert.equal(placementFee(800, 150, 4000).fee, 600);
  });

  it("uses the rent actually paid for stays under a month", () => {
    assert.equal(placementFee(800, 10, 300).fee, 150);
  });

  it("keeps a 92-night stay in the first tier", () => {
    assert.equal(placementFee(800, 92, 2450).tier.rate, 0.5);
  });
});
