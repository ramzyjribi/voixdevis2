import { formatFrenchDate } from "@/lib/dates";
import type { Quote } from "@/domain/quoteTypes";
import { useQuoteStore } from "@/store/useQuoteStore";

type QuoteHeaderProps = {
  quote: Quote;
};

export function QuoteHeader({ quote }: QuoteHeaderProps) {
  const companySettings = useQuoteStore((state) => state.companySettings);

  return (
    <header className="grid gap-8 sm:grid-cols-[1fr_280px]">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-emerald-700">
          Devis
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-zinc-950">
          {companySettings.companyName || "Votre entreprise"}
        </h2>
        <div className="mt-4 space-y-1 text-sm text-zinc-600">
          <p>{companySettings.artisanName || "Artisan plombier"}</p>
          <p>{companySettings.address || "Adresse entreprise"}</p>
          <p>
            {[companySettings.postalCode, companySettings.city]
              .filter(Boolean)
              .join(" ") || "Code postal et ville"}
          </p>
          {companySettings.siret ? <p>SIRET {companySettings.siret}</p> : null}
          <p>
            {[companySettings.phone, companySettings.email]
              .filter(Boolean)
              .join(" · ") || "Téléphone · Email"}
          </p>
        </div>
      </div>

      <div className="border-l-4 border-emerald-700 bg-emerald-50/70 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
          Client
        </p>
        <div className="mt-3 space-y-1 text-sm text-zinc-700">
          <p className="font-medium text-zinc-950">
            {quote.client.name || "Client à renseigner"}
          </p>
          <p>{quote.client.address || "Adresse chantier"}</p>
          <p>{quote.client.city || "Code postal et ville"}</p>
        </div>
        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-zinc-500">Date</dt>
            <dd className="font-medium text-zinc-950">
              {formatFrenchDate(quote.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500">TVA</dt>
            <dd className="font-medium text-zinc-950">{quote.tvaRate} %</dd>
          </div>
        </dl>
      </div>
    </header>
  );
}
