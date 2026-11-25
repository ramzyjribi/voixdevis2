import assert from "node:assert/strict";
import test from "node:test";
import type { FunctionCall } from "@google/genai";
import {
  GeminiConfigurationError,
  GeminiModelError,
  getGeminiConfigFromEnv,
  normalizeGeminiFunctionCalls,
  normalizeGeminiRequestError,
} from "./geminiClient.ts";

test("normalizeGeminiFunctionCalls parses an add_article fixture", () => {
  const functionCalls: FunctionCall[] = [
    {
      id: "call_1",
      name: "add_article",
      args: {
        articleId: "ART_MIT_EVIER_STD",
        quantity: 2,
        sectionName: "Cuisine",
      },
    },
  ];

  const normalized = normalizeGeminiFunctionCalls(functionCalls);

  assert.deepEqual(normalized.toolCallIds, ["call_1"]);
  assert.deepEqual(normalized.toolCalls, [
    {
      name: "add_article",
      args: {
        articleId: "ART_MIT_EVIER_STD",
        quantity: 2,
        sectionName: "Cuisine",
      },
    },
  ]);
});

test("normalizeGeminiFunctionCalls parses multiple ordered tool calls", () => {
  const functionCalls: FunctionCall[] = [
    {
      name: "set_client_info",
      args: { name: "Martin" },
    },
    {
      name: "apply_intervention_template",
      args: { templateId: "TMP_WC_POSER_REMPL", sectionName: "WC" },
    },
  ];

  const normalized = normalizeGeminiFunctionCalls(functionCalls);

  assert.deepEqual(
    normalized.toolCalls.map((toolCall) => toolCall.name),
    ["set_client_info", "apply_intervention_template"],
  );
});

test("normalizeGeminiFunctionCalls rejects unknown tools and invalid args", () => {
  assert.throws(
    () => normalizeGeminiFunctionCalls([{ name: "invent_tool", args: {} }]),
    GeminiModelError,
  );
  assert.throws(
    () =>
      normalizeGeminiFunctionCalls([
        { name: "add_article", args: { quantity: -1 } },
      ]),
    GeminiModelError,
  );
});

test("getGeminiConfigFromEnv requires GEMINI_API_KEY", () => {
  assert.throws(
    () => getGeminiConfigFromEnv({ GEMINI_MODEL: "gemini-test" }),
    GeminiConfigurationError,
  );

  assert.deepEqual(
    getGeminiConfigFromEnv({
      GEMINI_API_KEY: "secret",
      GEMINI_MODEL: "gemini-test",
    }),
    { apiKey: "secret", model: "gemini-test" },
  );
});

test("normalizeGeminiRequestError preserves quota status and retry delay", () => {
  const error = normalizeGeminiRequestError({
    status: 429,
    message: "Quota exceeded. Please retry in 39.2s.",
  });

  assert.equal(error.status, 429);
  assert.equal(error.retryAfterSeconds, 40);
});
