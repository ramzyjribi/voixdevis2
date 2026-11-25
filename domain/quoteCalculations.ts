import { clampToZero, roundMoney } from "../lib/money.ts";
import type { Discount, Quote, QuoteLineItem, QuoteTotals } from "./quoteTypes.ts";

export const calculateLineTotalHt = (
  lineItem: Pick<QuoteLineItem, "quantity" | "unitPriceHt">,
): number =>
  roundMoney(lineItem.quantity * lineItem.unitPriceHt);

export const calculateSubtotalHt = (quote: Quote): number =>
  roundMoney(
    quote.sections.reduce(
      (sectionTotal, section) =>
        sectionTotal +
        section.lineItems.reduce(
          (lineTotal, lineItem) => lineTotal + calculateLineTotalHt(lineItem),
          0,
        ),
      0,
    ),
  );

export const calculateDiscountAmount = (
  subtotalHt: number,
  discount?: Discount,
): number => {
  if (!discount) {
    return 0;
  }

  if (discount.type === "percent") {
    return roundMoney(Math.min(subtotalHt, subtotalHt * (discount.value / 100)));
  }

  return roundMoney(Math.min(discount.value, subtotalHt));
};

export const calculateQuoteTotals = (quote: Quote): QuoteTotals => {
  const subtotalHt = calculateSubtotalHt(quote);
  const discountAmount = calculateDiscountAmount(subtotalHt, quote.discount);
  const totalAfterDiscountHt = roundMoney(
    clampToZero(subtotalHt - discountAmount),
  );
  const tvaAmount = roundMoney(totalAfterDiscountHt * (quote.tvaRate / 100));
  const totalTtc = roundMoney(totalAfterDiscountHt + tvaAmount);

  return {
    subtotalHt,
    discountAmount,
    totalAfterDiscountHt,
    tvaAmount,
    totalTtc,
  };
};
