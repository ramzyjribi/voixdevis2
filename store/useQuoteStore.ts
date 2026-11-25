"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  addArticleToQuote,
  addCustomLineToQuote,
  applyInterventionTemplateToQuote,
  applyQuoteDiscount,
  createDefaultCompanySettings,
  createEmptyQuote,
  deleteQuoteSection,
  removeQuoteLine,
  setClientInfo,
  setQuoteTva,
  updateQuoteLine,
} from "../domain/quoteActions.ts";
import { addClarificationCandidateToQuote } from "../domain/clarification.ts";
import type {
  AddArticleArgs,
  AddCustomLineArgs,
  ApplyDiscountArgs,
  ApplyInterventionTemplateArgs,
  DeleteSectionArgs,
  SetClientInfoArgs,
  SetTvaArgs,
  UpdateArticleArgs,
} from "../domain/toolTypes.ts";
import type {
  ChatMessage,
  ClarificationState,
  CompanySettings,
  Quote,
} from "../domain/quoteTypes.ts";
import { createId } from "../lib/ids.ts";
import { nowIso } from "../lib/dates.ts";
import {
  parsePersistedQuoteState,
  QUOTE_STORE_NAME,
  QUOTE_STORE_VERSION,
  type QuotePersistedState,
} from "./persistConfig.ts";

type QuoteActions = {
  createNewQuote: () => void;
  resetQuote: () => void;
  setClientInfo: (args: SetClientInfoArgs) => void;
  addArticle: (args: AddArticleArgs) => void;
  applyInterventionTemplate: (args: ApplyInterventionTemplateArgs) => void;
  addCustomLine: (args: AddCustomLineArgs) => void;
  updateArticle: (args: UpdateArticleArgs) => void;
  removeArticle: (lineItemId: string) => void;
  deleteSection: (args: DeleteSectionArgs) => void;
  setTva: (args: SetTvaArgs) => void;
  applyDiscount: (args: ApplyDiscountArgs) => void;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string) => void;
  setClarification: (clarification: NonNullable<ClarificationState>) => void;
  clearClarification: () => void;
  selectClarificationCandidate: (articleId: string) => boolean;
  setProcessing: (isProcessing: boolean) => void;
  setLiveTranscript: (liveTranscript: string) => void;
};

type QuoteState = {
  currentQuote: Quote;
  companySettings: CompanySettings;
  messages: ChatMessage[];
  isProcessing: boolean;
  liveTranscript: string;
  clarification: ClarificationState;
};

export type QuoteStore = QuoteState & QuoteActions;

const createInitialState = (): QuoteState => {
  const companySettings = createDefaultCompanySettings();

  return {
    currentQuote: createEmptyQuote(companySettings.defaultTvaRate),
    companySettings,
    messages: [],
    isProcessing: false,
    liveTranscript: "",
    clarification: null,
  };
};

const createMessage = (
  role: ChatMessage["role"],
  content: string,
): ChatMessage => ({
  id: createId("message"),
  role,
  content,
  createdAt: nowIso(),
});

const createNewQuoteGreeting = (): ChatMessage =>
  createMessage(
    "assistant",
    "Nouveau devis pret. Je vous ecoute pour le client ou le premier article.",
  );

export const useQuoteStore = create<QuoteStore>()(
  persist<QuoteStore, [], [], QuotePersistedState>(
    (set, get) => ({
      ...createInitialState(),

      createNewQuote: () =>
        set((state) => ({
          currentQuote: createEmptyQuote(state.companySettings.defaultTvaRate),
          messages: [createNewQuoteGreeting()],
          clarification: null,
          liveTranscript: "",
          isProcessing: false,
        })),

      resetQuote: () =>
        set((state) => ({
          currentQuote: createEmptyQuote(state.companySettings.defaultTvaRate),
          messages: [],
          clarification: null,
          liveTranscript: "",
          isProcessing: false,
        })),

      setClientInfo: (args) =>
        set((state) => ({
          currentQuote: setClientInfo(state.currentQuote, args),
        })),

      addArticle: (args) =>
        set((state) => ({
          currentQuote: addArticleToQuote(state.currentQuote, args),
        })),

      applyInterventionTemplate: (args) =>
        set((state) => ({
          currentQuote: applyInterventionTemplateToQuote(
            state.currentQuote,
            args,
          ),
        })),

      addCustomLine: (args) =>
        set((state) => ({
          currentQuote: addCustomLineToQuote(state.currentQuote, args),
        })),

      updateArticle: (args) =>
        set((state) => ({
          currentQuote: updateQuoteLine(state.currentQuote, args),
        })),

      removeArticle: (lineItemId) =>
        set((state) => ({
          currentQuote: removeQuoteLine(state.currentQuote, lineItemId),
        })),

      deleteSection: (args) =>
        set((state) => ({
          currentQuote: deleteQuoteSection(state.currentQuote, args),
        })),

      setTva: (args) =>
        set((state) => ({
          currentQuote: setQuoteTva(state.currentQuote, args),
        })),

      applyDiscount: (args) =>
        set((state) => ({
          currentQuote: applyQuoteDiscount(state.currentQuote, args),
        })),

      updateCompanySettings: (settings) =>
        set((state) => ({
          companySettings: {
            ...state.companySettings,
            ...settings,
          },
        })),

      addUserMessage: (content) =>
        set((state) => ({
          messages: [...state.messages, createMessage("user", content)],
        })),

      addAssistantMessage: (content) =>
        set((state) => ({
          messages: [...state.messages, createMessage("assistant", content)],
        })),

      setClarification: (clarification) => set({ clarification }),
      clearClarification: () => set({ clarification: null }),
      selectClarificationCandidate: (articleId) => {
        const state = get();

        try {
          const currentQuote = addClarificationCandidateToQuote(
            state.currentQuote,
            state.clarification,
            articleId,
          );

          set({
            currentQuote,
            clarification: null,
            messages: [
              ...state.messages,
              createMessage("assistant", "Article ajoute."),
            ],
          });
          return true;
        } catch {
          return false;
        }
      },
      setProcessing: (isProcessing) => set({ isProcessing }),
      setLiveTranscript: (liveTranscript) => set({ liveTranscript }),
    }),
    {
      name: QUOTE_STORE_NAME,
      version: QUOTE_STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentQuote: state.currentQuote,
        companySettings: state.companySettings,
        messages: state.messages,
        clarification: state.clarification,
      }),
      merge: (persistedState, currentState) => {
        const parsedState = parsePersistedQuoteState(persistedState);

        if (!parsedState) {
          return currentState;
        }

        return {
          ...currentState,
          ...parsedState,
          isProcessing: false,
          liveTranscript: "",
        };
      },
    },
  ),
);

export const getQuoteStoreSnapshot = (): QuoteStore => useQuoteStore.getState();
