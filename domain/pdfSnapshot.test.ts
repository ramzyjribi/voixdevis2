import assert from "node:assert/strict";
import test from "node:test";
import {
  addArticleToQuote,
  addCustomLineToQuote,
  applyInterventionTemplateToQuote,
  applyQuoteDiscount,
  createEmptyQuote,
  setClientInfo,
  setQuoteTva,
} from "./quoteActions.ts";
import {
  createPdfFilename,
  createPdfQuoteSnapshot,
} from "./pdfSnapshot.ts";

const deterministicContext = {
  createId: (prefix: "quote" | "section" | "line" | "message") =>
    `${prefix}_pdf`,
  now: () => "2026-06-24T10:00:00.000Z",
};

test("createPdfQuoteSnapshot freezes a detached quote with centralized totals", () => {
  let quote = createEmptyQuote(20, deterministicContext);
  quote = setClientInfo(
    quote,
    { name: "Mme Dürand", city: "Lyon" },
    deterministicContext,
  );
  quote = addArticleToQuote(
    quote,
    {
      articleId: "ART_MIT_EVIER_STD",
      quantity: 2,
      sectionName: "Cuisine",
    },
    deterministicContext,
  );
  quote = addCustomLineToQuote(
    quote,
    {
      designation: "Percement sur mesure",
      price: 50,
      quantity: 1,
      unit: "forfait",
      sectionName: "Cuisine",
    },
    deterministicContext,
  );
  quote = applyInterventionTemplateToQuote(
    quote,
    { templateId: "TMP_WC_POSER_REMPL", sectionName: "WC" },
    deterministicContext,
  );
  quote = applyQuoteDiscount(
    quote,
    { type: "percent", value: 10 },
    deterministicContext,
  );
  quote = setQuoteTva(quote, { rate: 10 }, deterministicContext);

  const snapshot = createPdfQuoteSnapshot({
    quote,
    companySettings: {
      companyName: "Durand Plomberie",
      defaultTvaRate: 20,
    },
  });

  assert.notEqual(snapshot.quote, quote);
  assert.equal(snapshot.quote.sections.length, 2);
  assert.equal(snapshot.quote.sections[0]?.lineItems[1]?.source, "custom");
  assert.equal(snapshot.quote.sections[1]?.lineItems[0]?.source, "template");
  assert.equal(snapshot.totals.subtotalHt, 845);
  assert.equal(snapshot.totals.discountAmount, 84.5);
  assert.equal(snapshot.totals.totalAfterDiscountHt, 760.5);
  assert.equal(snapshot.totals.tvaAmount, 76.05);
  assert.equal(snapshot.totals.totalTtc, 836.55);
  assert.ok(Object.isFrozen(snapshot));
  assert.ok(Object.isFrozen(snapshot.quote.sections));
  assert.equal(createPdfFilename(snapshot), "devis-2026-06-24-mme-durand.pdf");
});

test("createPdfFilename uses a stable fallback without a client", () => {
  const snapshot = createPdfQuoteSnapshot({
    quote: createEmptyQuote(5.5, deterministicContext),
    companySettings: { defaultTvaRate: 5.5 },
  });

  assert.equal(createPdfFilename(snapshot), "devis-2026-06-24-devis.pdf");
});
