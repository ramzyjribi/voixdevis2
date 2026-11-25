import type {
  CatalogArticle,
  InterventionTemplate,
} from "./catalogTypes.ts";
import { catalogArticles, interventionTemplates } from "./catalogLookup.ts";

const normalizeSearchText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const isWithinOneEdit = (left: string, right: string): boolean => {
  if (left === right) {
    return true;
  }

  if (Math.abs(left.length - right.length) > 1) {
    return false;
  }

  const shorter = left.length <= right.length ? left : right;
  const longer = left.length <= right.length ? right : left;
  let shorterIndex = 0;
  let longerIndex = 0;
  let edits = 0;

  while (shorterIndex < shorter.length && longerIndex < longer.length) {
    if (shorter[shorterIndex] === longer[longerIndex]) {
      shorterIndex += 1;
      longerIndex += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) {
      return false;
    }

    if (shorter.length === longer.length) {
      shorterIndex += 1;
    }
    longerIndex += 1;
  }

  return edits + (longer.length - longerIndex) <= 1;
};

type SearchableEntry<T> = {
  item: T;
  primaryText: string;
  keywords: string[];
  id: string;
  index: number;
};

const scoreToken = (
  queryToken: string,
  primaryWords: string[],
  allWords: string[],
): number => {
  if (primaryWords.includes(queryToken)) {
    return 50;
  }
  if (primaryWords.some((word) => word.startsWith(queryToken))) {
    return 40;
  }
  if (allWords.includes(queryToken)) {
    return 30;
  }
  if (allWords.some((word) => word.startsWith(queryToken))) {
    return 24;
  }
  if (allWords.some((word) => word.includes(queryToken))) {
    return 18;
  }
  if (
    queryToken.length >= 4 &&
    allWords.some((word) => isWithinOneEdit(queryToken, word))
  ) {
    return 12;
  }

  return 0;
};

const searchEntries = <T>(
  query: string,
  entries: SearchableEntry<T>[],
): T[] => {
  const normalizedQuery = normalizeSearchText(query);

  if (!normalizedQuery) {
    return entries.map((entry) => entry.item);
  }

  const queryTokens = normalizedQuery.split(" ");

  return entries
    .flatMap((entry) => {
      const normalizedPrimary = normalizeSearchText(entry.primaryText);
      const primaryWords = normalizedPrimary.split(" ");
      const allWords = normalizeSearchText(
        [entry.primaryText, entry.id, ...entry.keywords].join(" "),
      ).split(" ");
      let score = normalizedPrimary.includes(normalizedQuery) ? 120 : 0;

      for (const queryToken of queryTokens) {
        const tokenScore = scoreToken(queryToken, primaryWords, allWords);

        if (tokenScore === 0) {
          return [];
        }

        score += tokenScore;
      }

      return [{ entry, score }];
    })
    .sort(
      (left, right) =>
        right.score - left.score || left.entry.index - right.entry.index,
    )
    .map(({ entry }) => entry.item);
};

export const searchCatalogArticles = (
  query: string,
  articles: CatalogArticle[] = catalogArticles,
): CatalogArticle[] =>
  searchEntries(
    query,
    articles.map((article, index) => ({
      item: article,
      primaryText: article.designation,
      keywords: article.keywords,
      id: article.id,
      index,
    })),
  );

export const searchInterventionTemplates = (
  query: string,
  templates: InterventionTemplate[] = interventionTemplates,
): InterventionTemplate[] =>
  searchEntries(
    query,
    templates.map((template, index) => ({
      item: template,
      primaryText: template.title,
      keywords: template.keywords,
      id: template.id,
      index,
    })),
  );
