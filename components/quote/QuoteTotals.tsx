"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Quote, QuoteTotals as QuoteTotalsType } from "@/domain/quoteTypes";
import { formatCurrency } from "@/lib/money";
import { useQuoteStore } from "@/store/useQuoteStore";

type QuoteTotalsProps = {
  quote: Quote;
  totals: QuoteTotalsType;
};

export function QuoteTotals({ quote, totals }: QuoteTotalsProps) {
  const setTva = useQuoteStore((state) => state.setTva);
  const applyDiscount = useQuoteStore((state) => state.applyDiscount);
  const discountType = quote.discount?.type ?? "percent";
  const discountValue = quote.discount?.value ?? 0;

  const updateDiscountValue = (rawValue: string) => {
    const parsedValue = Number.parseFloat(rawValue);
    const safeValue = Number.isFinite(parsedValue) ? Math.max(0, parsedValue) : 0;
    const value = discountType === "percent" ? Math.min(100, safeValue) : safeValue;

    applyDiscount({ type: discountType, value });
  };

  const updateDiscountType = (type: string) => {
    if (type !== "percent" && type !== "fixed") {
      return;
    }

    const value = type === "percent" ? Math.min(100, discountValue) : discountValue;

    applyDiscount({ type, value });
  };

  return (
    <div className="mt-8 flex justify-end">
      <div className="w-full max-w-sm space-y-2 text-sm">
        <TotalLine label="Sous-total HT" value={totals.subtotalHt} />
        <div className="grid grid-cols-[1fr_auto] items-center gap-3">
          <span className="text-zinc-600">Remise</span>
          <div className="flex items-center gap-1.5">
            <Input
              type="number"
              inputMode="decimal"
              min="0"
              max={discountType === "percent" ? "100" : undefined}
              step={discountType === "percent" ? "0.1" : "0.01"}
              aria-label="Valeur de remise"
              placeholder="0"
              value={discountValue === 0 ? "" : discountValue}
              onFocus={(event) => event.currentTarget.select()}
              onChange={(event) => updateDiscountValue(event.currentTarget.value)}
              className="w-20 text-right tabular-nums"
            />
            <Select
              value={discountType}
              onValueChange={updateDiscountType}
            >
              <SelectTrigger aria-label="Type de remise" className="w-16">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">%</SelectItem>
                <SelectItem value="fixed">€</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <TotalLine label="Montant remise" value={totals.discountAmount} />
        <TotalLine label="Total HT" value={totals.totalAfterDiscountHt} />
        <div className="grid grid-cols-[1fr_112px] items-center gap-3">
          <span className="text-zinc-600">TVA</span>
          <Select
            value={String(quote.tvaRate)}
            onValueChange={(value) =>
              setTva({ rate: Number.parseFloat(value) as 5.5 | 10 | 20 })
            }
          >
            <SelectTrigger aria-label="TVA">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5.5">5.5 %</SelectItem>
              <SelectItem value="10">10 %</SelectItem>
              <SelectItem value="20">20 %</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <TotalLine label="Montant TVA" value={totals.tvaAmount} />
        <div className="mt-3 grid grid-cols-2 border-t border-zinc-300 pt-3 text-base font-semibold text-zinc-950">
          <span>Total TTC</span>
          <span className="text-right">{formatCurrency(totals.totalTtc)}</span>
        </div>
      </div>
    </div>
  );
}

function TotalLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="grid grid-cols-2 text-zinc-700">
      <span>{label}</span>
      <span className="text-right font-medium text-zinc-950">
        {formatCurrency(value)}
      </span>
    </div>
  );
}
