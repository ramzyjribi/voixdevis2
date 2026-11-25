"use client";

import { MobileQuoteLineItem } from "@/components/quote/MobileQuoteLineItem";
import { QuoteLineItemRow } from "@/components/quote/QuoteLineItemRow";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { QuoteSection as QuoteSectionType } from "@/domain/quoteTypes";
import { useQuoteStore } from "@/store/useQuoteStore";
import { Trash2 } from "lucide-react";

type QuoteSectionProps = {
  section: QuoteSectionType;
};

export function QuoteSection({ section }: QuoteSectionProps) {
  const deleteSection = useQuoteStore((state) => state.deleteSection);

  return (
    <section className="min-w-0 max-w-full overflow-hidden border border-zinc-200">
      <div className="flex min-h-12 items-center justify-between gap-3 bg-zinc-950 px-4 text-white">
        <h3 className="text-sm font-semibold">{section.name}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label={`Supprimer ${section.name}`}
          title={`Supprimer ${section.name}`}
          onClick={() => deleteSection({ sectionName: section.name })}
        >
          <Trash2 />
        </Button>
      </div>

      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-64">Désignation</TableHead>
              <TableHead className="w-24">Qté</TableHead>
              <TableHead className="w-24">Unité</TableHead>
              <TableHead className="w-32">PU HT</TableHead>
              <TableHead className="w-32 text-right">Total HT</TableHead>
              <TableHead className="w-20" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {section.lineItems.map((lineItem) => (
              <QuoteLineItemRow
                key={lineItem.lineItemId}
                lineItem={lineItem}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="divide-y divide-zinc-200 lg:hidden">
        {section.lineItems.map((lineItem) => (
          <MobileQuoteLineItem key={lineItem.lineItemId} lineItem={lineItem} />
        ))}
      </div>
    </section>
  );
}
