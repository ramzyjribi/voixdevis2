import assert from "node:assert/strict";
import test from "node:test";
import { catalogArticles, interventionTemplates } from "./catalogLookup.ts";
import {
  searchCatalogArticles,
  searchInterventionTemplates,
} from "./catalogSearch.ts";

test("empty catalogue searches keep every item browsable", () => {
  assert.equal(searchCatalogArticles("").length, catalogArticles.length);
  assert.equal(
    searchInterventionTemplates("   ").length,
    interventionTemplates.length,
  );
});

test("article search ignores accents and combines every query word", () => {
  const results = searchCatalogArticles("evier cuisine douchette");

  assert.equal(results[0]?.id, "ART_MIT_EVIER_DOUCHETTE");
  assert.ok(
    results.every((article) =>
      article.keywords.some((keyword) => keyword.includes("cuisine")),
    ),
  );
});

test("article search tolerates a one-character typo", () => {
  const results = searchCatalogArticles("mitigeure thermostatique douche");

  assert.equal(results[0]?.id, "ART_MIT_THERMO_DOUCHE");
});

test("template search uses titles and business keywords", () => {
  const results = searchInterventionTemplates("cumulus 200l");

  assert.equal(results[0]?.id, "TMP_CE_200L_REMPL");
});
