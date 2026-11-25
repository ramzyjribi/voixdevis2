"use client";

import {
  executeAiToolCalls,
  type ToolExecutorContext,
} from "@/domain/toolExecutor";
import type { ClarificationState } from "@/domain/quoteTypes";
import type {
  AddArticleArgs,
  AddCustomLineArgs,
  ApplyDiscountArgs,
  ApplyInterventionTemplateArgs,
  DeleteSectionArgs,
  SetClientInfoArgs,
  SetTvaArgs,
  UpdateArticleArgs,
} from "@/domain/toolTypes";
import { aiRouteResponseSchema } from "@/domain/validation";
import { usePdfExport } from "@/hooks/usePdfExport";
import { getQuoteStoreSnapshot, useQuoteStore } from "@/store/useQuoteStore";
import { useCallback, useState } from "react";

const createExecutorContext = (): ToolExecutorContext => ({
  getQuote: () => getQuoteStoreSnapshot().currentQuote,
  setClientInfo: (args: SetClientInfoArgs) =>
    getQuoteStoreSnapshot().setClientInfo(args),
  applyInterventionTemplate: (args: ApplyInterventionTemplateArgs) =>
    getQuoteStoreSnapshot().applyInterventionTemplate(args),
  addArticle: (args: AddArticleArgs) =>
    getQuoteStoreSnapshot().addArticle(args),
  addCustomLine: (args: AddCustomLineArgs) =>
    getQuoteStoreSnapshot().addCustomLine(args),
  updateArticle: (args: UpdateArticleArgs) =>
    getQuoteStoreSnapshot().updateArticle(args),
  removeArticle: (lineItemId: string) =>
    getQuoteStoreSnapshot().removeArticle(lineItemId),
  deleteSection: (args: DeleteSectionArgs) =>
    getQuoteStoreSnapshot().deleteSection(args),
  setTva: (args: SetTvaArgs) =>
    getQuoteStoreSnapshot().setTva(args),
  applyDiscount: (args: ApplyDiscountArgs) =>
    getQuoteStoreSnapshot().applyDiscount(args),
  setClarification: (clarification: NonNullable<ClarificationState>) =>
    getQuoteStoreSnapshot().setClarification(clarification),
  clearClarification: () => getQuoteStoreSnapshot().clearClarification(),
});

const readJson = async (response: Response): Promise<unknown> => {
  try {
    return await response.json();
  } catch {
    return undefined;
  }
};

const extractErrorMessage = (payload: unknown): string => {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof payload.error === "string"
  ) {
    return payload.error;
  }

  return "Erreur IA temporaire.";
};

export function useAiConversation() {
  const isSending = useQuoteStore((state) => state.isProcessing);
  const [isResetConfirmationOpen, setIsResetConfirmationOpen] = useState(false);
  const { exportPdf } = usePdfExport();

  const sendMessage = useCallback(async (content: string) => {
    const message = content.trim();

    if (!message) {
      return;
    }

    const store = getQuoteStoreSnapshot();
    const clarification = store.clarification;
    store.addUserMessage(message);
    store.setProcessing(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          quote: getQuoteStoreSnapshot().currentQuote,
          clarification,
        }),
      });
      const payload = await readJson(response);

      if (!response.ok) {
        throw new Error(extractErrorMessage(payload));
      }

      const parsedPayload = aiRouteResponseSchema.safeParse(payload);

      if (!parsedPayload.success) {
        throw new Error("Reponse IA invalide.");
      }

      const execution = executeAiToolCalls(
        parsedPayload.data.toolCalls,
        createExecutorContext(),
      );
      const assistantMessages =
        execution.assistantMessages.length > 0
          ? execution.assistantMessages
          : parsedPayload.data.assistantMessage
            ? [parsedPayload.data.assistantMessage]
            : ["Action appliquee."];

      assistantMessages.forEach((assistantMessage) => {
        getQuoteStoreSnapshot().addAssistantMessage(assistantMessage);
      });

      if (execution.events.includes("quote_reset_requested")) {
        setIsResetConfirmationOpen(true);
      }

      if (execution.events.includes("pdf_export_requested")) {
        const exportSucceeded = await exportPdf();

        if (!exportSucceeded) {
          getQuoteStoreSnapshot().addAssistantMessage("Export PDF impossible.");
        }
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erreur IA temporaire.";
      getQuoteStoreSnapshot().addAssistantMessage(message);
    } finally {
      getQuoteStoreSnapshot().setProcessing(false);
    }
  }, [exportPdf]);

  const confirmReset = useCallback(() => {
    const store = getQuoteStoreSnapshot();
    store.resetQuote();
    store.addAssistantMessage("Devis reinitialise.");
    setIsResetConfirmationOpen(false);
  }, []);

  const cancelReset = useCallback(() => {
    setIsResetConfirmationOpen(false);
    getQuoteStoreSnapshot().addAssistantMessage("Reinitialisation annulee.");
  }, []);

  return {
    isSending,
    isResetConfirmationOpen,
    sendMessage,
    confirmReset,
    cancelReset,
  };
}
