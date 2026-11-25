import type { QuoteTotals } from "@/domain/quoteTypes";
import { formatCurrency } from "@/lib/money";

type MobileQuoteSummaryProps = {
  hidden: boolean;
  totals: QuoteTotals;
};

export function MobileQuoteSummary({ hidden, totals }: MobileQuoteSummaryProps) {
  if (hidden) {
    return null;
  }

  return (
    <aside
      aria-label="Résumé des totaux"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-zinc-200 bg-white/95 px-4 pt-2 shadow-[0_-4px_14px_rgba(0,0,0,0.08)] backdrop-blur-sm lg:hidden"
      style={{ paddingBottom: "max(0.5rem, env(safe-area-inset-bottom))" }}
    >
      <div className="mx-auto grid max-w-lg grid-cols-3 divide-x divide-zinc-200">
        <SummaryValue label="Total HT" value={totals.totalAfterDiscountHt} />
        <SummaryValue label="TVA" value={totals.tvaAmount} />
        <SummaryValue label="Total TTC" value={totals.totalTtc} emphasized />
      </div>
    </aside>
  );
}

function SummaryValue({
  emphasized = false,
  label,
  value,
}: {
  emphasized?: boolean;
  label: string;
  value: number;
}) {
  return (
    <div className="min-w-0 px-2 text-center">
      <p className="text-[10px] font-medium uppercase text-zinc-500">{label}</p>
      <p
        className={
          emphasized
            ? "truncate text-xs font-bold tabular-nums text-emerald-800"
            : "truncate text-xs font-semibold tabular-nums text-zinc-950"
        }
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
