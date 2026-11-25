"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { calculateLineTotalHt } from "@/domain/quoteCalculations";
import type { QuoteLineItem } from "@/domain/quoteTypes";
import { formatCurrency } from "@/lib/money";
import { cn } from "@/lib/utils";
import { useQuoteStore } from "@/store/useQuoteStore";
import { Check, ChevronDown, Pencil, Trash2, X } from "lucide-react";
import { useId, useState } from "react";

type MobileQuoteLineItemProps = {
  lineItem: QuoteLineItem;
};

const quantityFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 2,
});

const sourceLabels: Record<QuoteLineItem["source"], string> = {
  catalog: "Catalogue",
  template: "Pack",
  custom: "Ligne libre",
};

export function MobileQuoteLineItem({ lineItem }: MobileQuoteLineItemProps) {
  const updateArticle = useQuoteStore((state) => state.updateArticle);
  const removeArticle = useQuoteStore((state) => state.removeArticle);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [designation, setDesignation] = useState(lineItem.designation);
  const [quantity, setQuantity] = useState(String(lineItem.quantity));
  const [price, setPrice] = useState(String(lineItem.unitPriceHt));
  const panelId = useId();
  const designationId = `${panelId}-designation`;
  const quantityId = `${panelId}-quantity`;
  const priceId = `${panelId}-price`;

  const startEditing = () => {
    setDesignation(lineItem.designation);
    setQuantity(String(lineItem.quantity));
    setPrice(String(lineItem.unitPriceHt));
    setIsEditing(true);
  };

  const save = () => {
    const nextQuantity = Number.parseFloat(quantity);
    const nextPrice = Number.parseFloat(price);
    const nextDesignation = designation.trim();

    if (
      !Number.isFinite(nextQuantity) ||
      !Number.isFinite(nextPrice) ||
      nextQuantity <= 0 ||
      nextPrice < 0 ||
      !nextDesignation
    ) {
      return;
    }

    updateArticle({
      lineItemId: lineItem.lineItemId,
      designation: nextDesignation,
      quantity: nextQuantity,
      price: nextPrice,
    });
    setIsEditing(false);
  };

  const cancel = () => {
    setDesignation(lineItem.designation);
    setQuantity(String(lineItem.quantity));
    setPrice(String(lineItem.unitPriceHt));
    setIsEditing(false);
  };

  return (
    <article className="min-w-0 bg-white">
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={panelId}
        className="grid min-h-20 w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 text-left outline-none transition-colors hover:bg-zinc-50 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-inset"
        onClick={() => setIsExpanded((expanded) => !expanded)}
      >
        <span className="min-w-0">
          <span className="line-clamp-2 break-words text-sm font-medium text-zinc-950">
            {lineItem.designation}
          </span>
          <span className="mt-1 block truncate text-xs text-zinc-500">
            {quantityFormatter.format(lineItem.quantity)} {lineItem.unit} · {sourceLabels[lineItem.source]}
          </span>
        </span>
        <span className="flex min-w-0 items-center gap-2">
          <span className="max-w-24 truncate text-xs font-semibold tabular-nums text-zinc-950">
            {formatCurrency(calculateLineTotalHt(lineItem))}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-zinc-500 transition-transform",
              isExpanded && "rotate-180",
            )}
          />
        </span>
      </button>

      {isExpanded ? (
        <div
          id={panelId}
          role="region"
          aria-label={`Détails de ${lineItem.designation}`}
          className="min-w-0 border-t border-zinc-200 bg-zinc-50 px-3 py-4"
        >
          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor={designationId} className="text-xs font-medium text-zinc-600">
                  Désignation
                </label>
                <Textarea
                  id={designationId}
                  value={designation}
                  onChange={(event) => setDesignation(event.currentTarget.value)}
                  className="min-h-20 resize-y break-words"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="min-w-0 space-y-1.5">
                  <label htmlFor={quantityId} className="text-xs font-medium text-zinc-600">
                    Quantité
                  </label>
                  <Input
                    id={quantityId}
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.01"
                    value={quantity}
                    onChange={(event) => setQuantity(event.currentTarget.value)}
                  />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <label htmlFor={priceId} className="text-xs font-medium text-zinc-600">
                    Prix unitaire HT
                  </label>
                  <Input
                    id={priceId}
                    type="number"
                    inputMode="decimal"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(event) => setPrice(event.currentTarget.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" onClick={save}>
                  <Check />
                  Enregistrer
                </Button>
                <Button type="button" variant="outline" onClick={cancel}>
                  <X />
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="whitespace-pre-wrap break-words text-sm font-medium text-zinc-950">
                {lineItem.designation}
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <MobileDetail label="Quantité" value={quantityFormatter.format(lineItem.quantity)} />
                <MobileDetail label="Unité" value={lineItem.unit} />
                <MobileDetail label="Prix unitaire HT" value={formatCurrency(lineItem.unitPriceHt)} />
                <MobileDetail label="Total HT" value={formatCurrency(calculateLineTotalHt(lineItem))} />
              </dl>
              <div className="grid grid-cols-2 gap-2">
                <Button type="button" variant="outline" onClick={startEditing}>
                  <Pencil />
                  Modifier
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => removeArticle(lineItem.lineItemId)}
                >
                  <Trash2 />
                  Supprimer
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </article>
  );
}

function MobileDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-zinc-500">{label}</dt>
      <dd className="mt-0.5 break-words font-medium tabular-nums text-zinc-950">{value}</dd>
    </div>
  );
}
