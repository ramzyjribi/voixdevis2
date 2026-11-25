import assert from "node:assert/strict";
import test from "node:test";
import {
  addClarificationCandidateToQuote,
  resolveClarificationCandidates,
} from "./clarification.ts";
import { createEmptyQuote } from "./quoteActions.ts";

const clarification = {
  userMessageFeedback: "Pour la douche ou la baignoire ?",
  candidates: [
    "ART_MIT_THERMO_DOUCHE",
    "ART_UNKNOWN",
    "ART_MIT_THERMO_DOUCHE",
    "ART_MIT_THERMO_BAIN",
  ],
};

test("resolveClarificationCandidates maps, filters and deduplicates candidate ids", () => {
  const candidates = resolveClarificationCandidates(clarification);

  assert.deepEqual(
    candidates.map((candidate) => candidate.id),
    ["ART_MIT_THERMO_DOUCHE", "ART_MIT_THERMO_BAIN"],
  );
});

test("addClarificationCandidateToQuote adds only an offered catalogue article", () => {
  const quote = createEmptyQuote();
  const updatedQuote = addClarificationCandidateToQuote(
    quote,
    clarification,
    "ART_MIT_THERMO_BAIN",
  );

  assert.equal(updatedQuote.sections[0]?.lineItems[0]?.articleId, "ART_MIT_THERMO_BAIN");
  assert.throws(
    () =>
      addClarificationCandidateToQuote(
        quote,
        clarification,
        "ART_MIT_LAVABO",
      ),
    /absent de la clarification/,
  );
});
