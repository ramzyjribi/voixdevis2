import {
  findCatalogArticleById,
  findInterventionTemplateById,
} from "./catalogLookup.ts";
import { QuoteActionError } from "./quoteActions.ts";
import type {
  ClarificationState,
  Quote,
  QuoteLineItem,
} from "./quoteTypes.ts";
import type {
  AddArticleArgs,
  AddCustomLineArgs,
  AiToolCall,
  ApplyDiscountArgs,
  ApplyInterventionTemplateArgs,
  DeleteSectionArgs,
  SetClientInfoArgs,
  SetTvaArgs,
  UpdateArticleArgs,
} from "./toolTypes.ts";
import { aiToolCallSchema } from "./validation.ts";

export type ToolExecutionEvent =
  | "pdf_export_requested"
  | "quote_reset_requested";

export type ToolCallRejection = {
  name: string;
  reason: string;
};

export type ToolExecutionResult = {
  appliedToolNames: string[];
  rejectedToolCalls: ToolCallRejection[];
  assistantMessages: string[];
  events: ToolExecutionEvent[];
};

export type ToolExecutorContext = {
  getQuote: () => Quote;
  setClientInfo: (args: SetClientInfoArgs) => void;
  applyInterventionTemplate: (args: ApplyInterventionTemplateArgs) => void;
  addArticle: (args: AddArticleArgs) => void;
  addCustomLine: (args: AddCustomLineArgs) => void;
  updateArticle: (args: UpdateArticleArgs) => void;
  removeArticle: (lineItemId: string) => void;
  deleteSection: (args: DeleteSectionArgs) => void;
  setTva: (args: SetTvaArgs) => void;
  applyDiscount: (args: ApplyDiscountArgs) => void;
  setClarification: (clarification: NonNullable<ClarificationState>) => void;
  clearClarification: () => void;
};

type MutableToolName =
  | "set_client_info"
  | "apply_intervention_template"
  | "add_article"
  | "add_custom_line"
  | "update_article"
  | "remove_article"
  | "delete_section"
  | "set_tva"
  | "apply_discount";

const mutableConfirmations: Record<MutableToolName, string> = {
  set_client_info: "Client mis a jour.",
  apply_intervention_template: "Template ajoute.",
  add_article: "Article ajoute.",
  add_custom_line: "Ligne ajoutee.",
  update_article: "Article modifie.",
  remove_article: "Article supprime.",
  delete_section: "Section supprimee.",
  set_tva: "TVA mise a jour.",
  apply_discount: "Remise appliquee.",
};

const createEmptyResult = (): ToolExecutionResult => ({
  appliedToolNames: [],
  rejectedToolCalls: [],
  assistantMessages: [],
  events: [],
});

const findLineItem = (quote: Quote, lineItemId: string): QuoteLineItem | undefined =>
  quote.sections
    .flatMap((section) => section.lineItems)
    .find((lineItem) => lineItem.lineItemId === lineItemId);

const hasSection = (quote: Quote, sectionName: string): boolean =>
  quote.sections.some(
    (section) =>
      section.name.toLocaleLowerCase() === sectionName.toLocaleLowerCase(),
  );

const pushRejection = (
  result: ToolExecutionResult,
  name: string,
  reason: string,
): void => {
  result.rejectedToolCalls.push({ name, reason });
  result.assistantMessages.push(`Action refusee: ${reason}`);
};

const executeMutableTool = (
  toolCall: Extract<AiToolCall, { name: MutableToolName }>,
  context: ToolExecutorContext,
  result: ToolExecutionResult,
): void => {
  try {
    switch (toolCall.name) {
      case "set_client_info":
        context.setClientInfo(toolCall.args);
        break;
      case "apply_intervention_template":
        if (!findInterventionTemplateById(toolCall.args.templateId)) {
          pushRejection(result, toolCall.name, "templateId inconnu.");
          return;
        }
        context.applyInterventionTemplate(toolCall.args);
        break;
      case "add_article":
        if (!findCatalogArticleById(toolCall.args.articleId)) {
          pushRejection(result, toolCall.name, "articleId inconnu.");
          return;
        }
        context.addArticle(toolCall.args);
        break;
      case "add_custom_line":
        context.addCustomLine(toolCall.args);
        break;
      case "update_article":
        if (!findLineItem(context.getQuote(), toolCall.args.lineItemId)) {
          pushRejection(result, toolCall.name, "lineItemId introuvable.");
          return;
        }
        context.updateArticle(toolCall.args);
        break;
      case "remove_article":
        if (!findLineItem(context.getQuote(), toolCall.args.lineItemId)) {
          pushRejection(result, toolCall.name, "lineItemId introuvable.");
          return;
        }
        context.removeArticle(toolCall.args.lineItemId);
        break;
      case "delete_section":
        if (!hasSection(context.getQuote(), toolCall.args.sectionName)) {
          pushRejection(result, toolCall.name, "section introuvable.");
          return;
        }
        context.deleteSection(toolCall.args);
        break;
      case "set_tva":
        context.setTva(toolCall.args);
        break;
      case "apply_discount":
        context.applyDiscount(toolCall.args);
        break;
    }

    result.appliedToolNames.push(toolCall.name);
    result.assistantMessages.push(mutableConfirmations[toolCall.name]);
  } catch (error) {
    const reason =
      error instanceof QuoteActionError
        ? error.message
        : "mutation impossible.";
    pushRejection(result, toolCall.name, reason);
  }
};

const executeClarification = (
  toolCall: Extract<AiToolCall, { name: "request_clarification" }>,
  context: ToolExecutorContext,
  result: ToolExecutionResult,
): void => {
  const candidates = [
    ...new Set(
      (toolCall.args.candidates ?? []).filter((candidateId) =>
        Boolean(findCatalogArticleById(candidateId)),
      ),
    ),
  ];

  context.setClarification({
    userMessageFeedback: toolCall.args.userMessageFeedback,
    candidates,
  });
  result.appliedToolNames.push(toolCall.name);
  result.assistantMessages.push(toolCall.args.userMessageFeedback);
};

const executeResetRequest = (result: ToolExecutionResult): void => {
  result.appliedToolNames.push("reset_quote");
  result.events.push("quote_reset_requested");
  result.assistantMessages.push("Confirmez la reinitialisation du devis.");
};

const parseToolCalls = (
  rawToolCalls: unknown[],
  result: ToolExecutionResult,
): AiToolCall[] => {
  const parsedToolCalls: AiToolCall[] = [];

  rawToolCalls.forEach((rawToolCall) => {
    const parsed = aiToolCallSchema.safeParse(rawToolCall);

    if (!parsed.success) {
      const name =
        typeof rawToolCall === "object" &&
        rawToolCall !== null &&
        "name" in rawToolCall &&
        typeof rawToolCall.name === "string"
          ? rawToolCall.name
          : "unknown";

      pushRejection(result, name, "arguments invalides.");
      return;
    }

    parsedToolCalls.push(parsed.data);
  });

  return parsedToolCalls;
};

export const executeAiToolCalls = (
  rawToolCalls: unknown[],
  context: ToolExecutorContext,
): ToolExecutionResult => {
  const result = createEmptyResult();
  const toolCalls = parseToolCalls(rawToolCalls, result);
  const clarification = toolCalls.find(
    (toolCall): toolCall is Extract<AiToolCall, { name: "request_clarification" }> =>
      toolCall.name === "request_clarification",
  );

  if (clarification) {
    executeClarification(clarification, context, result);
    return result;
  }

  context.clearClarification();

  if (toolCalls.some((toolCall) => toolCall.name === "reset_quote")) {
    executeResetRequest(result);
    return result;
  }

  toolCalls.forEach((toolCall) => {
    switch (toolCall.name) {
      case "set_client_info":
      case "apply_intervention_template":
      case "add_article":
      case "add_custom_line":
      case "update_article":
      case "remove_article":
      case "delete_section":
      case "set_tva":
      case "apply_discount":
        executeMutableTool(toolCall, context, result);
        break;
      case "answer_question":
      case "unknown_action":
        result.appliedToolNames.push(toolCall.name);
        result.assistantMessages.push(toolCall.args.userMessageFeedback);
        break;
      case "trigger_pdf_export":
        result.appliedToolNames.push(toolCall.name);
        result.events.push("pdf_export_requested");
        result.assistantMessages.push("Export PDF demande.");
        break;
      case "reset_quote":
        executeResetRequest(result);
        break;
    }
  });

  if (
    result.assistantMessages.length === 0 &&
    result.appliedToolNames.length === 0
  ) {
    result.assistantMessages.push("Aucune action valide.");
  }

  return result;
};
