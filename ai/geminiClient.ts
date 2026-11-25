import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  ThinkingLevel,
  type FunctionCall,
  type GenerateContentConfig,
  type GenerateContentResponse,
} from "@google/genai";
import { SYSTEM_PROMPT } from "./promptSystem.ts";
import { buildGeminiPrompt } from "./promptBuilder.ts";
import {
  geminiFunctionDeclarations,
  geminiFunctionNames,
} from "./tools.ts";
import { aiToolCallsSchema } from "../domain/validation.ts";
import type { ClarificationState, Quote } from "../domain/quoteTypes.ts";
import type { AiToolCall } from "../domain/toolTypes.ts";
import type { AiRouteResponse } from "./types.ts";

export const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemma-4-26b-a4b-it",
  "gemini-3.6-flash",
  "gemini-4-hydrogen",
] as const;

const DEFAULT_GEMINI_MODEL = GEMINI_FALLBACK_MODELS[0];

const THINKING_LOW_MODELS = new Set<string>([
  "gemini-3.6-flash",
  "gemini-4-hydrogen",
]);

export const GEMINI_REQUEST_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_OUTPUT_TOKENS = 768;
const THINKING_MAX_OUTPUT_TOKENS = 1536;

export type GeminiAttemptFailure = {
  model: string;
  reason: string;
  status?: number;
  retryAfterSeconds?: number;
  timedOut?: boolean;
  durationMs: number;
};

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigurationError";
  }
}

export class GeminiModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiModelError";
  }
}

export class GeminiApiError extends Error {
  status?: number;
  retryAfterSeconds?: number;
  attempts?: GeminiAttemptFailure[];
  model?: string;
  timedOut?: boolean;

  constructor(
    message: string,
    options?: {
      status?: number;
      retryAfterSeconds?: number;
      attempts?: GeminiAttemptFailure[];
      model?: string;
      timedOut?: boolean;
    },
  ) {
    super(message);
    this.name = "GeminiApiError";
    this.status = options?.status;
    this.retryAfterSeconds = options?.retryAfterSeconds;
    this.attempts = options?.attempts;
    this.model = options?.model;
    this.timedOut = options?.timedOut;
  }
}

type GeminiConfig = {
  apiKey: string;
  model: string;
};

type GeminiGenerateContentResult = Pick<
  GenerateContentResponse,
  "functionCalls" | "modelVersion"
>;

export type GeminiGenerateContentFn = (params: {
  model: string;
  contents: string;
  config: GenerateContentConfig;
}) => Promise<GeminiGenerateContentResult>;

type RequestGeminiToolCallsInput = {
  quote: Quote;
  userMessage: string;
  clarification?: ClarificationState;
  signal?: AbortSignal;
};

export type RequestGeminiToolCallsOptions = {
  env?: NodeJS.ProcessEnv;
  timeoutMs?: number;
  models?: readonly string[];
  generateContent?: GeminiGenerateContentFn;
  logger?: Pick<Console, "warn">;
};

const extractRetryAfterSeconds = (message: string): number | undefined => {
  const retryMatch =
    message.match(/retry in ([\d.]+)s/i) ??
    message.match(/"retryDelay":"([\d.]+)s"/i);

  if (!retryMatch?.[1]) {
    return undefined;
  }

  const retryAfterSeconds = Number(retryMatch[1]);
  return Number.isFinite(retryAfterSeconds)
    ? Math.ceil(retryAfterSeconds)
    : undefined;
};

export const normalizeGeminiRequestError = (
  error: unknown,
): GeminiApiError => {
  if (error instanceof GeminiApiError) {
    return error;
  }

  const message =
    error instanceof Error
      ? error.message
      : typeof error === "object" &&
          error !== null &&
          "message" in error &&
          typeof error.message === "string"
        ? error.message
        : String(error);
  const status =
    typeof error === "object" &&
    error !== null &&
    "status" in error &&
    typeof error.status === "number"
      ? error.status
      : undefined;

  return new GeminiApiError(message, {
    status,
    retryAfterSeconds: extractRetryAfterSeconds(message),
  });
};

export const getGeminiConfigFromEnv = (
  env: NodeJS.ProcessEnv = process.env,
): GeminiConfig => {
  const apiKey = env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiConfigurationError("GEMINI_API_KEY is missing.");
  }

  return {
    apiKey,
    model: env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL,
  };
};

export const resolveGeminiModelChain = (
  preferredModel?: string,
  fallbackModels: readonly string[] = GEMINI_FALLBACK_MODELS,
): string[] => {
  const trimmedPreferred = preferredModel?.trim();
  const candidates = trimmedPreferred
    ? [trimmedPreferred, ...fallbackModels]
    : [...fallbackModels];

  return Array.from(new Set(candidates.filter((model) => model.length > 0)));
};

export const buildGenerateContentConfig = (
  model: string,
  abortSignal: AbortSignal,
): GenerateContentConfig => {
  const useLowThinking = THINKING_LOW_MODELS.has(model);

  return {
    abortSignal,
    systemInstruction: SYSTEM_PROMPT,
    maxOutputTokens: useLowThinking
      ? THINKING_MAX_OUTPUT_TOKENS
      : DEFAULT_MAX_OUTPUT_TOKENS,
    ...(useLowThinking
      ? {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.LOW,
          },
        }
      : {}),
    tools: [{ functionDeclarations: geminiFunctionDeclarations }],
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.ANY,
        allowedFunctionNames: geminiFunctionNames,
      },
    },
  };
};

export const normalizeGeminiFunctionCalls = (
  functionCalls: FunctionCall[] | undefined,
): { toolCalls: AiToolCall[]; toolCallIds: string[] } => {
  if (!functionCalls?.length) {
    throw new GeminiModelError("Gemini returned no tool call.");
  }

  const rawToolCalls = functionCalls.map((functionCall) => ({
    name: functionCall.name,
    args: functionCall.args ?? {},
  }));
  const parsedToolCalls = aiToolCallsSchema.safeParse(rawToolCalls);

  if (!parsedToolCalls.success) {
    throw new GeminiModelError("Gemini returned invalid tool arguments.");
  }

  return {
    toolCalls: parsedToolCalls.data,
    toolCallIds: functionCalls
      .map((functionCall) => functionCall.id)
      .filter((id): id is string => Boolean(id)),
  };
};

const isAuthErrorStatus = (status: number | undefined): boolean =>
  status === 401 || status === 403;

const formatFailureReason = (failure: {
  status?: number;
  timedOut?: boolean;
  message: string;
}): string => {
  if (failure.timedOut) {
    return failure.message;
  }

  if (failure.status !== undefined) {
    return `HTTP ${failure.status}: ${failure.message}`;
  }

  return failure.message;
};

const callModelWithTimeout = async ({
  model,
  prompt,
  timeoutMs,
  externalSignal,
  generateContent,
}: {
  model: string;
  prompt: string;
  timeoutMs: number;
  externalSignal?: AbortSignal;
  generateContent: GeminiGenerateContentFn;
}): Promise<GeminiGenerateContentResult> => {
  if (externalSignal?.aborted) {
    throw new GeminiApiError("Request aborted by client.", {
      status: 499,
      model,
    });
  }

  const controller = new AbortController();
  let timerId: ReturnType<typeof setTimeout> | undefined;
  let onExternalAbort: (() => void) | undefined;

  const abortPromise = new Promise<never>((_, reject) => {
    timerId = setTimeout(() => {
      const timeoutError = new GeminiApiError(
        `Model "${model}" timed out after ${timeoutMs}ms.`,
        {
          status: 504,
          model,
          timedOut: true,
        },
      );
      controller.abort(timeoutError);
      reject(timeoutError);
    }, timeoutMs);

    if (externalSignal) {
      onExternalAbort = () => {
        const abortError = new GeminiApiError("Request aborted by client.", {
          status: 499,
          model,
        });
        controller.abort(abortError);
        reject(abortError);
      };
      externalSignal.addEventListener("abort", onExternalAbort, { once: true });
    }
  });

  const config = buildGenerateContentConfig(model, controller.signal);

  try {
    const requestPromise = generateContent({
      model,
      contents: prompt,
      config,
    });
    // Avoid unhandled rejections if timeout/abort settles the race first.
    void requestPromise.catch(() => undefined);

    return await Promise.race([requestPromise, abortPromise]);
  } finally {
    if (timerId !== undefined) {
      clearTimeout(timerId);
    }

    if (externalSignal && onExternalAbort) {
      externalSignal.removeEventListener("abort", onExternalAbort);
    }
  }
};

export const requestGeminiToolCalls = async (
  { quote, userMessage, clarification, signal }: RequestGeminiToolCallsInput,
  options: RequestGeminiToolCallsOptions = {},
): Promise<AiRouteResponse> => {
  const { apiKey, model: envPreferredModel } = getGeminiConfigFromEnv(
    options.env,
  );
  const modelChain = options.models
    ? resolveGeminiModelChain(undefined, options.models)
    : resolveGeminiModelChain(
        options.env
          ? options.env.GEMINI_MODEL
          : process.env.GEMINI_MODEL ?? envPreferredModel,
      );
  const timeoutMs = options.timeoutMs ?? GEMINI_REQUEST_TIMEOUT_MS;
  const logger = options.logger ?? console;
  const generateContent: GeminiGenerateContentFn =
    options.generateContent ??
    ((params) => new GoogleGenAI({ apiKey }).models.generateContent(params));
  const prompt = buildGeminiPrompt({ quote, userMessage, clarification });
  const attempts: GeminiAttemptFailure[] = [];

  for (let index = 0; index < modelChain.length; index += 1) {
    const model = modelChain[index];
    const nextModel = modelChain[index + 1];
    const startedAt = Date.now();

    try {
      const response = await callModelWithTimeout({
        model,
        prompt,
        timeoutMs,
        externalSignal: signal,
        generateContent,
      });
      const normalized = normalizeGeminiFunctionCalls(response.functionCalls);

      return {
        toolCalls: normalized.toolCalls,
        toolCallIds: normalized.toolCallIds,
        model: response.modelVersion?.trim() || model,
      };
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      if (error instanceof GeminiConfigurationError) {
        throw error;
      }

      if (signal?.aborted) {
        throw new GeminiApiError("Request aborted by client.", {
          status: 499,
          model,
          attempts,
        });
      }

      if (error instanceof GeminiModelError) {
        const failure: GeminiAttemptFailure = {
          model,
          reason: error.message,
          durationMs,
        };
        attempts.push(failure);
        logger.warn(
          `[Gemini Fallback] Model "${model}" failed (${failure.reason}) in ${durationMs}ms.${
            nextModel
              ? ` Falling back to "${nextModel}".`
              : " No fallback models remaining."
          }`,
        );
        continue;
      }

      const apiError = normalizeGeminiRequestError(error);
      const reason = formatFailureReason({
        status: apiError.status,
        timedOut: apiError.timedOut,
        message: apiError.message,
      });
      const failure: GeminiAttemptFailure = {
        model,
        reason,
        status: apiError.status,
        retryAfterSeconds: apiError.retryAfterSeconds,
        timedOut: apiError.timedOut,
        durationMs,
      };
      attempts.push(failure);

      if (isAuthErrorStatus(apiError.status)) {
        throw new GeminiApiError(apiError.message, {
          status: apiError.status,
          retryAfterSeconds: apiError.retryAfterSeconds,
          model,
          attempts,
        });
      }

      logger.warn(
        `[Gemini Fallback] Model "${model}" failed (${reason}) in ${durationMs}ms.${
          nextModel
            ? ` Falling back to "${nextModel}".`
            : " No fallback models remaining."
        }`,
      );
    }
  }

  const lastAttempt = attempts[attempts.length - 1];
  const allRateLimited =
    attempts.length > 0 && attempts.every((attempt) => attempt.status === 429);
  const allTimedOut =
    attempts.length > 0 && attempts.every((attempt) => attempt.timedOut);
  const lastRateLimited = lastAttempt?.status === 429;
  const finalStatus =
    allRateLimited || lastRateLimited
      ? 429
      : allTimedOut || lastAttempt?.timedOut
        ? 504
        : (lastAttempt?.status ?? 502);
  const finalRetryAfterSeconds =
    finalStatus === 429
      ? [...attempts]
          .reverse()
          .find((attempt) => attempt.retryAfterSeconds !== undefined)
          ?.retryAfterSeconds
      : undefined;
  const attemptsSummary = attempts
    .map((attempt) => `${attempt.model} (${attempt.reason})`)
    .join(" -> ");

  throw new GeminiApiError(
    `All Gemini models failed [${attemptsSummary}]. Last error: ${lastAttempt?.reason ?? "Unknown error"}`,
    {
      status: finalStatus,
      retryAfterSeconds: finalRetryAfterSeconds,
      timedOut: finalStatus === 504,
      model: lastAttempt?.model,
      attempts,
    },
  );
};
