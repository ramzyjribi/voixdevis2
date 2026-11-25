"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { calculateLineTotalHt } from "@/domain/quoteCalculations";
import type { QuoteLineItem } from "@/domain/quoteTypes";
import { formatCurrency } from "@/lib/money";
import { useQuoteStore } from "@/store/useQuoteStore";
import { Check, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";

type QuoteLineItemRowProps = {
  lineItem: QuoteLineItem;
};

export function QuoteLineItemRow({ lineItem }: QuoteLineItemRowProps) {
  const updateArticle = useQuoteStore((state) => state.updateArticle);
  const removeArticle = useQuoteStore((state) => state.removeArticle);
  const [isEditing, setIsEditing] = useState(false);
  const [designation, setDesignation] = useState(lineItem.designation);
  const [quantity, setQuantity] = useState(String(lineItem.quantity));
  const [price, setPrice] = useState(String(lineItem.unitPriceHt));

  const save = () => {
    const nextQuantity = Number.parseFloat(quantity);
    const nextPrice = Number.parseFloat(price);

    if (nextQuantity <= 0 || nextPrice < 0 || !designation.trim()) {
      return;
    }

    updateArticle({
      lineItemId: lineItem.lineItemId,
      designation,
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
    <TableRow>
      <TableCell>
        {isEditing ? (
          <Input
            aria-label="Désignation ligne"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
          />
        ) : (
          <div>
            <p className="font-medium text-zinc-950">{lineItem.designation}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.12em] text-zinc-500">
              {lineItem.source}
            </p>
          </div>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            aria-label="Quantité ligne"
            type="number"
            min="0.01"
            step="0.01"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        ) : (
          lineItem.quantity
        )}
      </TableCell>
      <TableCell>{lineItem.unit}</TableCell>
      <TableCell>
        {isEditing ? (
          <Input
            aria-label="Prix ligne"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(event) => setPrice(event.target.value)}
          />
        ) : (
          formatCurrency(lineItem.unitPriceHt)
        )}
      </TableCell>
      <TableCell className="text-right font-medium">
        {formatCurrency(calculateLineTotalHt(lineItem))}
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-1">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Valider"
                title="Valider"
                onClick={save}
              >
                <Check />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Annuler"
                title="Annuler"
                onClick={cancel}
              >
                <X />
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Modifier"
                title="Modifier"
                onClick={() => setIsEditing(true)}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="Supprimer"
                title="Supprimer"
                onClick={() => removeArticle(lineItem.lineItemId)}
              >
                <Trash2 />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
