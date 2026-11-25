import { createId, type IdFactory } from "../lib/ids.ts";
import { nowIso } from "../lib/dates.ts";
import {
  findCatalogArticleById,
  resolveInterventionTemplate,
} from "./catalogLookup.ts";
import type {
  AddArticleArgs,
  AddCustomLineArgs,
  ApplyDiscountArgs,
  ApplyInterventionTemplateArgs,
  DeleteSectionArgs,
  SetClientInfoArgs,
  SetTvaArgs,
  UpdateArticleArgs,
} from "./toolTypes.ts";
import type {
  CompanySettings,
  Quote,
  QuoteLineItem,
  QuoteSection,
  TvaRate,
} from "./quoteTypes.ts";

export const DEFAULT_SECTION_NAME = "Prestations";
export const DEFAULT_TVA_RATE: TvaRate = 20;

export class QuoteActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteActionError";
  }
}

type ActionContext = {
  createId: IdFactory;
  now: () => string;
};

const defaultContext: ActionContext = {
  createId,
  now: nowIso,
};

const withDefaults = (context?: Partial<ActionContext>): ActionContext => ({
  ...defaultContext,
  ...context,
});

const cleanOptionalText = (value?: string): string | undefined => {
  const cleaned = value?.trim();
  return cleaned ? cleaned : undefined;
};

export const normalizeSectionName = (sectionName?: string): string =>
  cleanOptionalText(sectionName) ?? DEFAULT_SECTION_NAME;

export const createDefaultCompanySettings = (): CompanySettings => ({
  defaultTvaRate: DEFAULT_TVA_RATE,
});

export const createEmptyQuote = (
  tvaRate: TvaRate = DEFAULT_TVA_RATE,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  const createdAt = actionContext.now();

  return {
    id: actionContext.createId("quote"),
    status: "draft",
    createdAt,
    updatedAt: createdAt,
    client: {},
    sections: [],
    tvaRate,
  };
};

const touchQuote = (quote: Quote, now: string): Quote => ({
  ...quote,
  updatedAt: now,
});

const findSectionIndex = (sections: QuoteSection[], sectionName: string): number =>
  sections.findIndex(
    (section) => section.name.toLocaleLowerCase() === sectionName.toLocaleLowerCase(),
  );

const ensureSection = (
  sections: QuoteSection[],
  sectionName: string,
  createSectionId: () => string,
): { sections: QuoteSection[]; sectionIndex: number } => {
  const sectionIndex = findSectionIndex(sections, sectionName);

  if (sectionIndex >= 0) {
    return { sections, sectionIndex };
  }

  return {
    sections: [
      ...sections,
      {
        id: createSectionId(),
        name: sectionName,
        lineItems: [],
      },
    ],
    sectionIndex: sections.length,
  };
};

const appendLineItems = (
  quote: Quote,
  sectionName: string,
  lineItems: QuoteLineItem[],
  context: ActionContext,
): Quote => {
  const ensured = ensureSection(quote.sections, sectionName, () =>
    context.createId("section"),
  );
  const sections = ensured.sections.map((section, index) =>
    index === ensured.sectionIndex
      ? { ...section, lineItems: [...section.lineItems, ...lineItems] }
      : section,
  );

  return touchQuote({ ...quote, sections }, context.now());
};

export const setClientInfo = (
  quote: Quote,
  args: SetClientInfoArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);

  return touchQuote(
    {
      ...quote,
      client: {
        ...quote.client,
        name: cleanOptionalText(args.name) ?? quote.client.name,
        address: cleanOptionalText(args.address) ?? quote.client.address,
        city: cleanOptionalText(args.city) ?? quote.client.city,
      },
    },
    actionContext.now(),
  );
};

export const addArticleToQuote = (
  quote: Quote,
  args: AddArticleArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  const article = findCatalogArticleById(args.articleId);

  if (!article) {
    throw new QuoteActionError(`Unknown articleId: ${args.articleId}`);
  }

  const lineItem: QuoteLineItem = {
    lineItemId: actionContext.createId("line"),
    source: "catalog",
    articleId: article.id,
    designation: article.designation,
    unit: article.unit,
    quantity: args.quantity ?? 1,
    unitPriceHt: article.price,
  };

  return appendLineItems(
    quote,
    normalizeSectionName(args.sectionName),
    [lineItem],
    actionContext,
  );
};

export const applyInterventionTemplateToQuote = (
  quote: Quote,
  args: ApplyInterventionTemplateArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  const resolvedTemplate = resolveInterventionTemplate(args.templateId);

  if (!resolvedTemplate) {
    throw new QuoteActionError(`Unknown templateId: ${args.templateId}`);
  }

  const lineItems = resolvedTemplate.items.map(({ article, defaultQuantity }) => ({
    lineItemId: actionContext.createId("line"),
    source: "template" as const,
    articleId: article.id,
    templateId: resolvedTemplate.template.id,
    designation: article.designation,
    unit: article.unit,
    quantity: defaultQuantity,
    unitPriceHt: article.price,
  }));

  return appendLineItems(
    quote,
    normalizeSectionName(args.sectionName ?? resolvedTemplate.template.title),
    lineItems,
    actionContext,
  );
};

export const addCustomLineToQuote = (
  quote: Quote,
  args: AddCustomLineArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  const lineItem: QuoteLineItem = {
    lineItemId: actionContext.createId("line"),
    source: "custom",
    designation: args.designation.trim(),
    unit: args.unit.trim(),
    quantity: args.quantity,
    unitPriceHt: args.price,
  };

  return appendLineItems(
    quote,
    normalizeSectionName(args.sectionName),
    [lineItem],
    actionContext,
  );
};

export const updateQuoteLine = (
  quote: Quote,
  args: UpdateArticleArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  let foundLine = false;

  const sections = quote.sections.map((section) => ({
    ...section,
    lineItems: section.lineItems.map((lineItem) => {
      if (lineItem.lineItemId !== args.lineItemId) {
        return lineItem;
      }

      foundLine = true;

      return {
        ...lineItem,
        quantity: args.quantity ?? lineItem.quantity,
        unitPriceHt: args.price ?? lineItem.unitPriceHt,
        designation: args.designation?.trim() ?? lineItem.designation,
      };
    }),
  }));

  if (!foundLine) {
    throw new QuoteActionError(`Unknown lineItemId: ${args.lineItemId}`);
  }

  return touchQuote({ ...quote, sections }, actionContext.now());
};

export const removeQuoteLine = (
  quote: Quote,
  lineItemId: string,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  let foundLine = false;
  const sections = quote.sections.map((section) => {
    const lineItems = section.lineItems.filter((lineItem) => {
      const shouldKeep = lineItem.lineItemId !== lineItemId;
      foundLine = foundLine || !shouldKeep;
      return shouldKeep;
    });

    return { ...section, lineItems };
  });

  if (!foundLine) {
    throw new QuoteActionError(`Unknown lineItemId: ${lineItemId}`);
  }

  return touchQuote({ ...quote, sections }, actionContext.now());
};

export const deleteQuoteSection = (
  quote: Quote,
  args: DeleteSectionArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  const sectionName = normalizeSectionName(args.sectionName);
  const sections = quote.sections.filter(
    (section) =>
      section.name.toLocaleLowerCase() !== sectionName.toLocaleLowerCase(),
  );

  if (sections.length === quote.sections.length) {
    throw new QuoteActionError(`Unknown sectionName: ${sectionName}`);
  }

  return touchQuote({ ...quote, sections }, actionContext.now());
};

export const setQuoteTva = (
  quote: Quote,
  args: SetTvaArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  return touchQuote({ ...quote, tvaRate: args.rate }, actionContext.now());
};

export const applyQuoteDiscount = (
  quote: Quote,
  args: ApplyDiscountArgs,
  context?: Partial<ActionContext>,
): Quote => {
  const actionContext = withDefaults(context);
  return touchQuote({ ...quote, discount: args }, actionContext.now());
};
