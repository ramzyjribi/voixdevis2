export type TvaRate = 5.5 | 10 | 20;

export type ClientInfo = {
  name?: string;
  address?: string;
  city?: string;
};

export type CompanySettings = {
  companyName?: string;
  artisanName?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  siret?: string;
  phone?: string;
  email?: string;
  defaultTvaRate: TvaRate;
};

export type Discount = {
  type: "percent" | "fixed";
  value: number;
};

export type QuoteLineSource = "catalog" | "template" | "custom";

export type QuoteLineItem = {
  lineItemId: string;
  source: QuoteLineSource;
  articleId?: string;
  templateId?: string;
  designation: string;
  unit: string;
  quantity: number;
  unitPriceHt: number;
};

export type QuoteSection = {
  id: string;
  name: string;
  lineItems: QuoteLineItem[];
};

export type Quote = {
  id: string;
  status: "draft";
  createdAt: string;
  updatedAt: string;
  quoteNumber?: string;
  client: ClientInfo;
  sections: QuoteSection[];
  discount?: Discount;
  tvaRate: TvaRate;
};

export type QuoteTotals = {
  subtotalHt: number;
  discountAmount: number;
  totalAfterDiscountHt: number;
  tvaAmount: number;
  totalTtc: number;
};

export type ChatRole = "user" | "assistant" | "system";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ClarificationState = {
  userMessageFeedback: string;
  candidates: string[];
} | null;
