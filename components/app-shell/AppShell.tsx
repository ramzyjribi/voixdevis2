"use client";

import { DesktopSplit } from "@/components/app-shell/DesktopSplit";
import { MobileTabs } from "@/components/app-shell/MobileTabs";
import { QuotePreview } from "@/components/quote/QuotePreview";
import { QuoteWorkspace } from "@/components/quote/QuoteWorkspace";
import { ResetQuoteDialog } from "@/components/quote/ResetQuoteDialog";
import { SettingsDialog } from "@/components/settings/SettingsDialog";
import { Button } from "@/components/ui/button";
import { useQuoteStore } from "@/store/useQuoteStore";
import { FilePlus2, Settings } from "lucide-react";
import { useState } from "react";

export function AppShell() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNewQuoteConfirmationOpen, setIsNewQuoteConfirmationOpen] =
    useState(false);
  const createNewQuote = useQuoteStore((state) => state.createNewQuote);

  const confirmNewQuote = () => {
    createNewQuote();
    setIsNewQuoteConfirmationOpen(false);
  };

  const controls = (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Paramètres"
        title="Paramètres"
        onClick={() => setIsSettingsOpen(true)}
      >
        <Settings />
      </Button>
      <Button
        type="button"
        variant="outline"
        className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        onClick={() => setIsNewQuoteConfirmationOpen(true)}
      >
        <FilePlus2 />
        Nouveau devis
      </Button>
    </div>
  );

  return (
    <main className="min-h-svh bg-[#f7f8f4] text-foreground">
      <div className="mx-auto flex min-h-svh w-full max-w-[1600px] flex-col">
        <header className="flex min-h-16 items-center justify-between border-b bg-white px-4 sm:px-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-700">
              VoixDevis
            </p>
            <h1 className="text-lg font-semibold leading-tight text-zinc-950">
              Devis plomberie
            </h1>
          </div>
          {controls}
        </header>

        <div className="hidden flex-1 lg:block">
          <DesktopSplit left={<QuoteWorkspace />} right={<QuotePreviewSlot />} />
        </div>

        <div className="flex flex-1 lg:hidden">
          <MobileTabs
            workspace={<QuoteWorkspace />}
            quote={<QuotePreviewSlot />}
          />
        </div>
      </div>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
      <ResetQuoteDialog
        open={isNewQuoteConfirmationOpen}
        confirmLabel="Creer le devis"
        onConfirm={confirmNewQuote}
        onCancel={() => setIsNewQuoteConfirmationOpen(false)}
      />
    </main>
  );
}

function QuotePreviewSlot() {
  return <QuotePreview />;
}
