import {
  Articles,
  InterventionTemplates,
  getArticleById,
  getTemplateById,
} from "../data/catalog.ts";
import type {
  CatalogArticle,
  InterventionTemplate,
  InterventionTemplateItem,
} from "./catalogTypes.ts";

export type ResolvedTemplateItem = InterventionTemplateItem & {
  article: CatalogArticle;
};

export type ResolvedInterventionTemplate = {
  template: InterventionTemplate;
  items: ResolvedTemplateItem[];
};

export const catalogArticles = Articles;
export const interventionTemplates = InterventionTemplates;

export const findCatalogArticleById = (
  articleId: string,
): CatalogArticle | undefined => getArticleById(articleId);

export const findInterventionTemplateById = (
  templateId: string,
): InterventionTemplate | undefined => getTemplateById(templateId);

export const resolveInterventionTemplate = (
  templateId: string,
): ResolvedInterventionTemplate | undefined => {
  const template = findInterventionTemplateById(templateId);

  if (!template) {
    return undefined;
  }

  const items = template.items.flatMap((item): ResolvedTemplateItem[] => {
    const article = findCatalogArticleById(item.articleId);
    return article ? [{ ...item, article }] : [];
  });

  return { template, items };
};

export const validateCatalogIntegrity = (): string[] => {
  const articleIds = new Set(Articles.map((article) => article.id));

  return InterventionTemplates.flatMap((template) =>
    template.items
      .filter((item) => !articleIds.has(item.articleId))
      .map(
        (item) =>
          `Template ${template.id} references unknown article ${item.articleId}`,
      ),
  );
};
