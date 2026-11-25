import { calculateQuoteTotals } from "./quoteCalculations.ts";
import type {
  CompanySettings,
  Quote,
  QuoteTotals,
} from "./quoteTypes.ts";

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends readonly (infer Item)[]
    ? readonly DeepReadonly<Item>[]
    : T extends object
      ? { readonly [Key in keyof T]: DeepReadonly<T[Key]> }
      : T;

export type PdfQuoteSnapshot = {
  readonly quote: DeepReadonly<Quote>;
  readonly companySettings: DeepReadonly<CompanySettings>;
  readonly totals: DeepReadonly<QuoteTotals>;
};

type CreatePdfQuoteSnapshotInput = {
  quote: Quote;
  companySettings: CompanySettings;
};

const deepFreeze = <T>(value: T): DeepReadonly<T> => {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach((nestedValue) => {
      deepFreeze(nestedValue);
    });
    Object.freeze(value);
  }

  return value as DeepReadonly<T>;
};

const cloneValue = <T>(value: T): T => structuredClone(value);

export const createPdfQuoteSnapshot = ({
  quote,
  companySettings,
}: CreatePdfQuoteSnapshotInput): PdfQuoteSnapshot => {
  const quoteSnapshot = cloneValue(quote);
  const companySettingsSnapshot = cloneValue(companySettings);
  const totals = calculateQuoteTotals(quoteSnapshot);

  return deepFreeze({
    quote: quoteSnapshot,
    companySettings: companySettingsSnapshot,
    totals,
  });
};

const slugifyFilenamePart = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("fr-FR")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);

export const createPdfFilename = (snapshot: PdfQuoteSnapshot): string => {
  const date = snapshot.quote.createdAt.slice(0, 10);
  const client = snapshot.quote.client.name
    ? slugifyFilenamePart(snapshot.quote.client.name)
    : "devis";

  return `devis-${date}-${client || "devis"}.pdf`;
};
