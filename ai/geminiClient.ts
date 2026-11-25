import {
  FunctionCallingConfigMode,
  GoogleGenAI,
  type FunctionCall,
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

//const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash";
const DEFAULT_GEMINI_MODEL = "gemini-3.5-flash-lite";

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

  constructor(
    message: string,
    options?: { status?: number; retryAfterSeconds?: number },
  ) {
    super(message);
    this.name = "GeminiApiError";
    this.status = options?.status;
    this.retryAfterSeconds = options?.retryAfterSeconds;
  }
}

type GeminiConfig = {
  apiKey: string;
  model: string;
};

type RequestGeminiToolCallsInput = {
  quote: Quote;
  userMessage: string;
  clarification?: ClarificationState;
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

export const requestGeminiToolCalls = async ({
  quote,
  userMessage,
  clarification,
}: RequestGeminiToolCallsInput): Promise<AiRouteResponse> => {
  const { apiKey, model } = getGeminiConfigFromEnv();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildGeminiPrompt({ quote, userMessage, clarification });

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
        maxOutputTokens: 768,
        tools: [{ functionDeclarations: geminiFunctionDeclarations }],
        toolConfig: {
          functionCallingConfig: {
            mode: FunctionCallingConfigMode.ANY,
            allowedFunctionNames: geminiFunctionNames,
          },
        },
      },
    });
    const normalized = normalizeGeminiFunctionCalls(response.functionCalls);

    return {
      toolCalls: normalized.toolCalls,
      toolCallIds: normalized.toolCallIds,
      model,
    };
  } catch (error) {
    if (
      error instanceof GeminiConfigurationError ||
      error instanceof GeminiModelError
    ) {
      throw error;
    }

    throw normalizeGeminiRequestError(error);
  }
};
