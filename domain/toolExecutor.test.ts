import assert from "node:assert/strict";
import test from "node:test";
import {
  addArticleToQuote,
  addCustomLineToQuote,
  applyInterventionTemplateToQuote,
  applyQuoteDiscount,
  createEmptyQuote,
  deleteQuoteSection,
  removeQuoteLine,
  setClientInfo,
  setQuoteTva,
  updateQuoteLine,
} from "./quoteActions.ts";
import type { ClarificationState, Quote } from "./quoteTypes.ts";
import {
  executeAiToolCalls,
  type ToolExecutorContext,
} from "./toolExecutor.ts";

const deterministicContext = {
  createId: (prefix: "quote" | "section" | "line" | "message") =>
    `${prefix}_test`,
  now: () => "2026-06-15T00:00:00.000Z",
};

const createExecutorHarness = () => {
  let quote: Quote = createEmptyQuote(20, deterministicContext);
  let clarification: ClarificationState = null;

  const context: ToolExecutorContext = {
    getQuote: () => quote,
    setClientInfo: (args) => {
      quote = setClientInfo(quote, args, deterministicContext);
    },
    applyInterventionTemplate: (args) => {
      quote = applyInterventionTemplateToQuote(
        quote,
        args,
        deterministicContext,
      );
    },
    addArticle: (args) => {
      quote = addArticleToQuote(quote, args, deterministicContext);
    },
    addCustomLine: (args) => {
      quote = addCustomLineToQuote(quote, args, deterministicContext);
    },
    updateArticle: (args) => {
      quote = updateQuoteLine(quote, args, deterministicContext);
    },
    removeArticle: (lineItemId) => {
      quote = removeQuoteLine(quote, lineItemId, deterministicContext);
    },
    deleteSection: (args) => {
      quote = deleteQuoteSection(quote, args, deterministicContext);
    },
    setTva: (args) => {
      quote = setQuoteTva(quote, args, deterministicContext);
    },
    applyDiscount: (args) => {
      quote = applyQuoteDiscount(quote, args, deterministicContext);
    },
    setClarification: (nextClarification) => {
      clarification = nextClarification;
    },
    clearClarification: () => {
      clarification = null;
    },
  };

  return {
    context,
    get quote() {
      return quote;
    },
    get clarification() {
      return clarification;
    },
  };
};

test("executeAiToolCalls applies several tool calls in order", () => {
  const harness = createExecutorHarness();
  const result = executeAiToolCalls(
    [
      {
        name: "set_client_info",
        args: { name: "Martin", city: "Lyon" },
      },
      {
        name: "add_article",
        args: {
          articleId: "ART_MIT_EVIER_STD",
          quantity: 2,
          sectionName: "Cuisine",
        },
      },
    ],
    harness.context,
  );

  assert.deepEqual(result.rejectedToolCalls, []);
  assert.deepEqual(result.appliedToolNames, ["set_client_info", "add_article"]);
  assert.equal(harness.quote.client.name, "Martin");
  assert.equal(harness.quote.sections[0]?.lineItems[0]?.articleId, "ART_MIT_EVIER_STD");
  assert.equal(harness.quote.sections[0]?.lineItems[0]?.quantity, 2);
});

test("executeAiToolCalls applies a valid template as atomic lines", () => {
  const harness = createExecutorHarness();
  const result = executeAiToolCalls(
    [
      {
        name: "apply_intervention_template",
        args: { templateId: "TMP_WC_POSER_REMPL", sectionName: "WC" },
      },
    ],
    harness.context,
  );

  assert.deepEqual(result.rejectedToolCalls, []);
  assert.equal(harness.quote.sections[0]?.lineItems.length, 4);
  assert.equal(harness.quote.sections[0]?.lineItems[0]?.source, "template");
});

test("executeAiToolCalls rejects unknown ids without corrupting the quote", () => {
  const harness = createExecutorHarness();
  const before = harness.quote.updatedAt;
  const result = executeAiToolCalls(
    [
      { name: "add_article", args: { articleId: "ART_UNKNOWN" } },
      {
        name: "apply_intervention_template",
        args: { templateId: "TMP_UNKNOWN" },
      },
      { name: "update_article", args: { lineItemId: "line_unknown", quantity: 3 } },
    ],
    harness.context,
  );

  assert.equal(result.rejectedToolCalls.length, 3);
  assert.equal(harness.quote.sections.length, 0);
  assert.equal(harness.quote.updatedAt, before);
});

test("executeAiToolCalls rejects invalid arguments", () => {
  const harness = createExecutorHarness();
  const result = executeAiToolCalls(
    [{ name: "add_article", args: { quantity: -1 } }],
    harness.context,
  );

  assert.equal(result.rejectedToolCalls.length, 1);
  assert.equal(harness.quote.sections.length, 0);
});

test("executeAiToolCalls stores clarification and skips later mutations", () => {
  const harness = createExecutorHarness();
  const result = executeAiToolCalls(
    [
      {
        name: "request_clarification",
        args: {
          userMessageFeedback: "Pour la douche ou la baignoire ?",
          candidates: ["ART_MIT_THERMO_DOUCHE", "ART_MIT_THERMO_BAIN"],
        },
      },
      {
        name: "add_article",
        args: { articleId: "ART_MIT_THERMO_DOUCHE" },
      },
    ],
    harness.context,
  );

  assert.deepEqual(result.appliedToolNames, ["request_clarification"]);
  assert.equal(harness.quote.sections.length, 0);
  assert.deepEqual(harness.clarification?.candidates, [
    "ART_MIT_THERMO_DOUCHE",
    "ART_MIT_THERMO_BAIN",
  ]);
});

test("executeAiToolCalls filters unknown and duplicate clarification candidates", () => {
  const harness = createExecutorHarness();

  executeAiToolCalls(
    [
      {
        name: "request_clarification",
        args: {
          userMessageFeedback: "Lequel ?",
          candidates: [
            "ART_MIT_THERMO_DOUCHE",
            "ART_UNKNOWN",
            "ART_MIT_THERMO_DOUCHE",
          ],
        },
      },
    ],
    harness.context,
  );

  assert.deepEqual(harness.clarification?.candidates, [
    "ART_MIT_THERMO_DOUCHE",
  ]);
});

test("answer_question and unknown_action never mutate the quote", () => {
  const harness = createExecutorHarness();
  harness.context.addArticle({ articleId: "ART_MIT_EVIER_STD" });
  const quoteBefore = structuredClone(harness.quote);
  const result = executeAiToolCalls(
    [
      {
        name: "answer_question",
        args: { userMessageFeedback: "Le total est disponible dans le devis." },
      },
      {
        name: "unknown_action",
        args: { userMessageFeedback: "Demande hors du devis." },
      },
    ],
    harness.context,
  );

  assert.deepEqual(harness.quote, quoteBefore);
  assert.deepEqual(result.appliedToolNames, [
    "answer_question",
    "unknown_action",
  ]);
});

test("reset_quote requests UI confirmation without mutating the quote", () => {
  const harness = createExecutorHarness();
  harness.context.addArticle({ articleId: "ART_MIT_EVIER_STD" });
  const quoteBefore = structuredClone(harness.quote);
  const result = executeAiToolCalls(
    [{ name: "reset_quote", args: {} }],
    harness.context,
  );

  assert.deepEqual(harness.quote, quoteBefore);
  assert.deepEqual(result.events, ["quote_reset_requested"]);
  assert.deepEqual(result.rejectedToolCalls, []);
});

test("reset_quote skips every mutation returned in the same response", () => {
  const harness = createExecutorHarness();
  const result = executeAiToolCalls(
    [
      { name: "add_article", args: { articleId: "ART_MIT_EVIER_STD" } },
      { name: "reset_quote", args: {} },
    ],
    harness.context,
  );

  assert.deepEqual(result.appliedToolNames, ["reset_quote"]);
  assert.equal(harness.quote.sections.length, 0);
});

test("delete_section removes every line in the target section", () => {
  const harness = createExecutorHarness();
  harness.context.addArticle({
    articleId: "ART_MIT_EVIER_STD",
    sectionName: "Cuisine",
  });
  harness.context.addArticle({
    articleId: "ART_MO_PLOMB",
    sectionName: "Cuisine",
  });

  const result = executeAiToolCalls(
    [{ name: "delete_section", args: { sectionName: "Cuisine" } }],
    harness.context,
  );

  assert.deepEqual(result.appliedToolNames, ["delete_section"]);
  assert.equal(harness.quote.sections.length, 0);
});

test("trigger_pdf_export emits a UI event without mutating the quote", () => {
  const harness = createExecutorHarness();
  harness.context.addArticle({ articleId: "ART_MIT_EVIER_STD" });
  const quoteBefore = structuredClone(harness.quote);
  const result = executeAiToolCalls(
    [{ name: "trigger_pdf_export", args: {} }],
    harness.context,
  );

  assert.deepEqual(harness.quote, quoteBefore);
  assert.deepEqual(result.events, ["pdf_export_requested"]);
  assert.deepEqual(result.appliedToolNames, ["trigger_pdf_export"]);
});
