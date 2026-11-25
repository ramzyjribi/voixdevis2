import { calculateQuoteTotals } from "../domain/quoteCalculations.ts";
import { catalogArticles } from "../domain/catalogLookup.ts";
import type { QuoteStore } from "./useQuoteStore.ts";

export const selectCurrentQuote = (state: QuoteStore) => state.currentQuote;

export const selectCompanySettings = (state: QuoteStore) =>
  state.companySettings;

export const selectQuoteTotals = (state: QuoteStore) =>
  calculateQuoteTotals(state.currentQuote);

export const selectLineItemById = (state: QuoteStore, lineItemId: string) =>
  state.currentQuote.sections
    .flatMap((section) => section.lineItems)
    .find((lineItem) => lineItem.lineItemId === lineItemId);

export const selectCatalogArticles = () => catalogArticles;
