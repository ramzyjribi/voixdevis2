"use client";

import { Button } from "@/components/ui/button";
import { resolveClarificationCandidates } from "@/domain/clarification";
import { useQuoteStore } from "@/store/useQuoteStore";
import { Check } from "lucide-react";

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);

export function ClarificationActions() {
  const clarification = useQuoteStore((state) => state.clarification);
  const selectCandidate = useQuoteStore(
    (state) => state.selectClarificationCandidate,
  );
  const candidates = resolveClarificationCandidates(clarification);

  if (candidates.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Choix de clarification"
      className="border-t border-emerald-100 bg-emerald-50/70 px-4 py-3"
    >
      <p className="mb-2 text-xs font-semibold uppercase text-emerald-900">
        Choisir un article
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {candidates.map((candidate) => (
          <Button
            key={candidate.id}
            type="button"
            variant="outline"
            className="h-auto min-h-11 justify-start whitespace-normal border-emerald-200 bg-white px-3 py-2 text-left hover:bg-emerald-100"
            onClick={() => selectCandidate(candidate.id)}
          >
            <Check className="text-emerald-700" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium leading-5">
                {candidate.designation}
              </span>
              <span className="block text-xs font-normal text-zinc-500">
                {formatPrice(candidate.price)} / {candidate.unit}
              </span>
            </span>
          </Button>
        ))}
      </div>
    </section>
  );
}
