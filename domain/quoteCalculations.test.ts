import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyQuote } from "./quoteActions.ts";
import { calculateQuoteTotals } from "./quoteCalculations.ts";

test("calculateQuoteTotals derives HT, discount, TVA and TTC", () => {
  const quote = {
    ...createEmptyQuote(20, {
      createId: (prefix) => `${prefix}_1`,
      now: () => "2026-06-14T00:00:00.000Z",
    }),
    sections: [
      {
        id: "section_1",
        name: "Cuisine",
        lineItems: [
          {
            lineItemId: "line_1",
            source: "custom" as const,
            designation: "Forfait test",
            unit: "forfait",
            quantity: 2,
            unitPriceHt: 100,
          },
        ],
      },
    ],
    discount: { type: "percent" as const, value: 10 },
  };

  assert.deepEqual(calculateQuoteTotals(quote), {
    subtotalHt: 200,
    discountAmount: 20,
    totalAfterDiscountHt: 180,
    tvaAmount: 36,
    totalTtc: 216,
  });
});

test("fixed discount cannot make totals negative", () => {
  const quote = {
    ...createEmptyQuote(10),
    sections: [
      {
        id: "section_1",
        name: "Cuisine",
        lineItems: [
          {
            lineItemId: "line_1",
            source: "custom" as const,
            designation: "Forfait test",
            unit: "forfait",
            quantity: 1,
            unitPriceHt: 50,
          },
        ],
      },
    ],
    discount: { type: "fixed" as const, value: 120 },
  };

  assert.deepEqual(calculateQuoteTotals(quote), {
    subtotalHt: 50,
    discountAmount: 50,
    totalAfterDiscountHt: 0,
    tvaAmount: 0,
    totalTtc: 0,
  });
});
