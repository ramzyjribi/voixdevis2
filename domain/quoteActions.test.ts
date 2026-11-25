import assert from "node:assert/strict";
import test from "node:test";
import {
  addArticleToQuote,
  addCustomLineToQuote,
  applyInterventionTemplateToQuote,
  createEmptyQuote,
  deleteQuoteSection,
  removeQuoteLine,
  updateQuoteLine,
} from "./quoteActions.ts";

const deterministicContext = {
  createId: (prefix: "quote" | "section" | "line" | "message") =>
    `${prefix}_${Math.random().toString(36).slice(2, 6)}`,
  now: () => "2026-06-14T00:00:00.000Z",
};

test("addArticleToQuote copies catalogue data into an atomic line", () => {
  const quote = createEmptyQuote(20, deterministicContext);
  const updatedQuote = addArticleToQuote(
    quote,
    {
      articleId: "ART_MIT_EVIER_STD",
      quantity: 2,
      sectionName: "Cuisine",
    },
    deterministicContext,
  );
  const [line] = updatedQuote.sections[0]?.lineItems ?? [];

  assert.equal(updatedQuote.sections[0]?.name, "Cuisine");
  assert.equal(line?.articleId, "ART_MIT_EVIER_STD");
  assert.equal(line?.source, "catalog");
  assert.equal(line?.quantity, 2);
  assert.equal(line?.unitPriceHt, 125);
});

test("applyInterventionTemplateToQuote decomposes a template into line items", () => {
  const quote = createEmptyQuote(20, deterministicContext);
  const updatedQuote = applyInterventionTemplateToQuote(
    quote,
    {
      templateId: "TMP_WC_POSER_REMPL",
      sectionName: "WC",
    },
    deterministicContext,
  );

  assert.equal(updatedQuote.sections[0]?.name, "WC");
  assert.equal(updatedQuote.sections[0]?.lineItems.length, 4);
  assert.equal(updatedQuote.sections[0]?.lineItems[0]?.source, "template");
  assert.equal(
    updatedQuote.sections[0]?.lineItems[0]?.templateId,
    "TMP_WC_POSER_REMPL",
  );
});

test("update and remove operate with lineItemId", () => {
  const quote = addCustomLineToQuote(
    createEmptyQuote(20, deterministicContext),
    {
      designation: "Forfait nettoyage",
      price: 250,
      unit: "forfait",
      quantity: 1,
      sectionName: "Divers",
    },
    deterministicContext,
  );
  const lineItemId = quote.sections[0]?.lineItems[0]?.lineItemId;

  assert.ok(lineItemId);

  const updatedQuote = updateQuoteLine(
    quote,
    {
      lineItemId,
      quantity: 2,
      price: 200,
      designation: "Forfait nettoyage fin de chantier",
    },
    deterministicContext,
  );

  assert.equal(updatedQuote.sections[0]?.lineItems[0]?.quantity, 2);
  assert.equal(updatedQuote.sections[0]?.lineItems[0]?.unitPriceHt, 200);

  const cleanedQuote = removeQuoteLine(
    updatedQuote,
    lineItemId,
    deterministicContext,
  );

  assert.equal(cleanedQuote.sections[0]?.lineItems.length, 0);
});

test("deleteQuoteSection removes a full section by name", () => {
  const quote = addCustomLineToQuote(
    createEmptyQuote(20, deterministicContext),
    {
      designation: "Forfait",
      price: 100,
      unit: "forfait",
      quantity: 1,
      sectionName: "Salle de bain",
    },
    deterministicContext,
  );

  const updatedQuote = deleteQuoteSection(
    quote,
    { sectionName: "salle de bain" },
    deterministicContext,
  );

  assert.equal(updatedQuote.sections.length, 0);
});
