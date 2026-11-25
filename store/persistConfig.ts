import { z } from "zod";
import {
  chatMessageSchema,
  clarificationSchema,
  companySettingsSchema,
  quoteSchema,
} from "../domain/validation.ts";

export const QUOTE_STORE_NAME = "voixdevis-quote-store";
export const QUOTE_STORE_VERSION = 1;

export const persistedQuoteStateSchema = z
  .object({
    currentQuote: quoteSchema,
    companySettings: companySettingsSchema,
    messages: z.array(chatMessageSchema),
    clarification: clarificationSchema,
  })
  .strict();

export type QuotePersistedState = z.infer<typeof persistedQuoteStateSchema>;

export const parsePersistedQuoteState = (
  persistedState: unknown,
): QuotePersistedState | undefined => {
  const parsed = persistedQuoteStateSchema.safeParse(persistedState);
  return parsed.success ? parsed.data : undefined;
};
