import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyQuote } from "../domain/quoteActions.ts";
import { buildGeminiPrompt } from "./promptBuilder.ts";

test("buildGeminiPrompt includes the active clarification on the next turn", () => {
  const prompt = buildGeminiPrompt({
    quote: createEmptyQuote(),
    userMessage: "Le premier",
    clarification: {
      userMessageFeedback: "Pour la douche ou la baignoire ?",
      candidates: ["ART_MIT_THERMO_DOUCHE", "ART_MIT_THERMO_BAIN"],
    },
  });

  assert.match(prompt, /\[CONTEXTE_CLARIFICATION_EN_COURS\]/);
  assert.match(prompt, /ART_MIT_THERMO_DOUCHE/);
  assert.match(prompt, /\[MESSAGE_UTILISATEUR\]\nLe premier/);
});
