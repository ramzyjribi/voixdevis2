import assert from "node:assert/strict";
import test from "node:test";
import {
  FunctionCallingConfigMode,
  ThinkingLevel,
  type FunctionCall,
  type GenerateContentConfig,
} from "@google/genai";
import { createEmptyQuote } from "../domain/quoteActions.ts";
import { geminiFunctionNames } from "./tools.ts";
import {
  GEMINI_FALLBACK_MODELS,
  GeminiApiError,
  GeminiConfigurationError,
  GeminiModelError,
  buildGenerateContentConfig,
  getGeminiConfigFromEnv,
  normalizeGeminiFunctionCalls,
  normalizeGeminiRequestError,
  requestGeminiToolCalls,
  resolveGeminiModelChain,
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

test("resolveGeminiModelChain preserves priority order and deduplicates GEMINI_MODEL", () => {
  assert.deepEqual(resolveGeminiModelChain(), [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemma-4-26b-a4b-it",
    "gemini-3.6-flash",
    "gemini-4-hydrogen",
  ]);

  assert.deepEqual(resolveGeminiModelChain("gemini-3.6-flash"), [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemma-4-26b-a4b-it",
    "gemini-4-hydrogen",
  ]);

  assert.deepEqual(resolveGeminiModelChain("custom-model"), [
    "custom-model",
    ...GEMINI_FALLBACK_MODELS,
  ]);
});

test("buildGenerateContentConfig configures thinkingLevel LOW only for thinking models and omits temperature", () => {
  const signal = new AbortController().signal;

  for (const model of [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemma-4-26b-a4b-it",
  ]) {
    const config = buildGenerateContentConfig(model, signal);
    assert.equal(config.temperature, undefined);
    assert.equal(config.thinkingConfig, undefined);
    assert.equal(config.abortSignal, signal);
    assert.equal(
      config.toolConfig?.functionCallingConfig?.mode,
      FunctionCallingConfigMode.ANY,
    );
    assert.deepEqual(
      config.toolConfig?.functionCallingConfig?.allowedFunctionNames,
      geminiFunctionNames,
    );
  }

  for (const model of ["gemini-3.6-flash", "gemini-4-hydrogen"]) {
    const config = buildGenerateContentConfig(model, signal);
    assert.equal(config.temperature, undefined);
    assert.deepEqual(config.thinkingConfig, {
      thinkingLevel: ThinkingLevel.LOW,
    });
    assert.equal(config.maxOutputTokens, 1536);
  }
});

test("requestGeminiToolCalls falls back on 429, 503, missing functionCalls and returns modelVersion", async () => {
  const quote = createEmptyQuote();
  const calledModels: string[] = [];
  const receivedConfigs: Record<string, GenerateContentConfig> = {};
  const warnings: string[] = [];

  const result = await requestGeminiToolCalls(
    {
      quote,
      userMessage: "Ajoute un mitigeur evier",
    },
    {
      env: { GEMINI_API_KEY: "test-key" },
      logger: {
        warn: (message?: unknown) => {
          warnings.push(String(message));
        },
      },
      generateContent: async ({ model, config }) => {
        calledModels.push(model);
        receivedConfigs[model] = config;

        if (model === "gemini-3.5-flash-lite") {
          throw { status: 429, message: "Quota exceeded. Please retry in 12s." };
        }
        if (model === "gemini-3.1-flash-lite") {
          throw { status: 503, message: "Service unavailable" };
        }
        if (model === "gemma-4-26b-a4b-it") {
          return { functionCalls: [] };
        }

        return {
          modelVersion: "gemini-3.6-flash-001",
          functionCalls: [
            {
              id: "call_ok",
              name: "add_article",
              args: { articleId: "ART_MIT_EVIER_STD", quantity: 1 },
            },
          ],
        };
      },
    },
  );

  assert.deepEqual(calledModels, [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
    "gemma-4-26b-a4b-it",
    "gemini-3.6-flash",
  ]);
  assert.equal(result.model, "gemini-3.6-flash-001");
  assert.deepEqual(result.toolCallIds, ["call_ok"]);
  assert.equal(warnings.length, 3);
  assert.deepEqual(receivedConfigs["gemini-3.6-flash"]?.thinkingConfig, {
    thinkingLevel: ThinkingLevel.LOW,
  });
  assert.equal(receivedConfigs["gemini-3.5-flash-lite"]?.thinkingConfig, undefined);
});

test("requestGeminiToolCalls aborts timed-out model and falls back to next model", async () => {
  const quote = createEmptyQuote();
  const calledModels: string[] = [];
  let firstAbortSignal: AbortSignal | undefined;
  const warnings: string[] = [];

  const result = await requestGeminiToolCalls(
    {
      quote,
      userMessage: "Passe la TVA a 10%",
    },
    {
      env: { GEMINI_API_KEY: "test-key" },
      timeoutMs: 25,
      logger: {
        warn: (message?: unknown) => {
          warnings.push(String(message));
        },
      },
      generateContent: async ({ model, config }) => {
        calledModels.push(model);

        if (model === "gemini-3.5-flash-lite") {
          firstAbortSignal = config.abortSignal;
          return new Promise(() => {
            // Never resolves; timeout must abort and trigger fallback.
          });
        }

        return {
          functionCalls: [
            {
              id: "call_tva",
              name: "set_tva",
              args: { rate: 10 },
            },
          ],
        };
      },
    },
  );

  assert.deepEqual(calledModels, [
    "gemini-3.5-flash-lite",
    "gemini-3.1-flash-lite",
  ]);
  assert.equal(firstAbortSignal?.aborted, true);
  assert.equal(result.model, "gemini-3.1-flash-lite");
  assert.equal(warnings.length, 1);
  assert.match(warnings[0] ?? "", /timed out after 25ms/i);
});

test("requestGeminiToolCalls fails fast on missing API key and on 401/403", async () => {
  const quote = createEmptyQuote();

  await assert.rejects(
    () =>
      requestGeminiToolCalls(
        { quote, userMessage: "Bonjour" },
        { env: {} },
      ),
    GeminiConfigurationError,
  );

  let attemptsCount = 0;
  await assert.rejects(
    () =>
      requestGeminiToolCalls(
        { quote, userMessage: "Bonjour" },
        {
          env: { GEMINI_API_KEY: "bad-key" },
          generateContent: async () => {
            attemptsCount += 1;
            throw { status: 401, message: "API key not valid." };
          },
        },
      ),
    (error: unknown) => {
      assert.ok(error instanceof GeminiApiError);
      assert.equal(error.status, 401);
      assert.equal(error.attempts?.length, 1);
      return true;
    },
  );

  assert.equal(attemptsCount, 1);
});

test("requestGeminiToolCalls throws GeminiApiError with full attempt history when all models fail", async () => {
  const quote = createEmptyQuote();
  const warnings: string[] = [];

  await assert.rejects(
    () =>
      requestGeminiToolCalls(
        { quote, userMessage: "Ajoute une prestation" },
        {
          env: { GEMINI_API_KEY: "test-key" },
          logger: {
            warn: (message?: unknown) => {
              warnings.push(String(message));
            },
          },
          generateContent: async ({ model }) => {
            throw {
              status: 503,
              message: `${model} overloaded`,
            };
          },
        },
      ),
    (error: unknown) => {
      assert.ok(error instanceof GeminiApiError);
      assert.equal(error.status, 503);
      assert.equal(error.attempts?.length, GEMINI_FALLBACK_MODELS.length);
      assert.deepEqual(
        error.attempts?.map((attempt) => attempt.model),
        [...GEMINI_FALLBACK_MODELS],
      );
      assert.match(error.message, /gemini-3\.5-flash-lite/);
      assert.match(error.message, /gemini-4-hydrogen/);
      return true;
    },
  );

  assert.equal(warnings.length, GEMINI_FALLBACK_MODELS.length);
});
