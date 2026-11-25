import { addArticleToQuote, QuoteActionError } from "./quoteActions.ts";
import { findCatalogArticleById } from "./catalogLookup.ts";
import type { CatalogArticle } from "./catalogTypes.ts";
import type { ClarificationState, Quote } from "./quoteTypes.ts";

export const resolveClarificationCandidates = (
  clarification: ClarificationState,
): CatalogArticle[] => {
  if (!clarification) {
    return [];
  }

  const uniqueIds = new Set(clarification.candidates);

  return [...uniqueIds].flatMap((articleId) => {
    const article = findCatalogArticleById(articleId);
    return article ? [article] : [];
  });
};

export const addClarificationCandidateToQuote = (
  quote: Quote,
  clarification: ClarificationState,
  articleId: string,
): Quote => {
  if (!clarification?.candidates.includes(articleId)) {
    throw new QuoteActionError("Article absent de la clarification courante.");
  }

  if (!findCatalogArticleById(articleId)) {
    throw new QuoteActionError(`Unknown articleId: ${articleId}`);
  }

  return addArticleToQuote(quote, { articleId });
};
