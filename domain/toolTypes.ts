import type { TvaRate } from "./quoteTypes.ts";

export type SetClientInfoArgs = {
  name?: string;
  address?: string;
  city?: string;
};

export type ApplyInterventionTemplateArgs = {
  templateId: string;
  sectionName?: string;
};

export type AddArticleArgs = {
  articleId: string;
  quantity?: number;
  sectionName?: string;
};

export type AddCustomLineArgs = {
  designation: string;
  price: number;
  unit: string;
  quantity: number;
  sectionName?: string;
};

export type UpdateArticleArgs = {
  lineItemId: string;
  quantity?: number;
  price?: number;
  designation?: string;
};

export type RemoveArticleArgs = {
  lineItemId: string;
};

export type DeleteSectionArgs = {
  sectionName: string;
};

export type SetTvaArgs = {
  rate: TvaRate;
};

export type ApplyDiscountArgs = {
  type: "percent" | "fixed";
  value: number;
};

export type AnswerQuestionArgs = {
  userMessageFeedback: string;
};

export type RequestClarificationArgs = {
  userMessageFeedback: string;
  candidates?: string[];
};

export type UnknownActionArgs = {
  userMessageFeedback: string;
};

export type EmptyToolArgs = Record<string, never>;

export type AiToolCall =
  | { name: "set_client_info"; args: SetClientInfoArgs }
  | { name: "apply_intervention_template"; args: ApplyInterventionTemplateArgs }
  | { name: "add_article"; args: AddArticleArgs }
  | { name: "add_custom_line"; args: AddCustomLineArgs }
  | { name: "update_article"; args: UpdateArticleArgs }
  | { name: "remove_article"; args: RemoveArticleArgs }
  | { name: "delete_section"; args: DeleteSectionArgs }
  | { name: "set_tva"; args: SetTvaArgs }
  | { name: "apply_discount"; args: ApplyDiscountArgs }
  | { name: "answer_question"; args: AnswerQuestionArgs }
  | { name: "trigger_pdf_export"; args: EmptyToolArgs }
  | { name: "reset_quote"; args: EmptyToolArgs }
  | { name: "request_clarification"; args: RequestClarificationArgs }
  | { name: "unknown_action"; args: UnknownActionArgs };
