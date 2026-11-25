import type { ClarificationState, Quote } from "../domain/quoteTypes.ts";
import type { AiToolCall } from "../domain/toolTypes.ts";

export type AiRouteRequest = {
  message: string;
  quote: Quote;
  clarification?: ClarificationState;
};

export type AiRouteResponse = {
  assistantMessage?: string;
  toolCalls: AiToolCall[];
  model: string;
  toolCallIds: string[];
};

export type AiRouteError = {
  error: string;
  issues?: string[];
};
