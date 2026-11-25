"use client";

import { Composer } from "@/components/chat/Composer";
import { ClarificationActions } from "@/components/chat/ClarificationActions";
import { MessageList } from "@/components/chat/MessageList";
import { ClientInfoForm } from "@/components/quote/ClientInfoForm";
import { ManualAddLineForm } from "@/components/quote/ManualAddLineForm";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useQuoteStore } from "@/store/useQuoteStore";
import { Wrench } from "lucide-react";

export function ChatPanel() {
  const quote = useQuoteStore((state) => state.currentQuote);
  const messages = useQuoteStore((state) => state.messages);
  const isProcessing = useQuoteStore((state) => state.isProcessing);

  return (
    <div className="flex h-full min-h-0 flex-col bg-zinc-50">
      <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-4">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-zinc-500">
            Conversation
          </p>
          <h2 className="mt-1 truncate text-xl font-semibold text-zinc-950">
            {quote.client.name || "Nouveau client"}
          </h2>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button type="button" variant="outline" size="icon-lg" aria-label="Outils">
              <Wrench />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[92vw] overflow-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Outils devis</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <ClientInfoForm />
              <Separator className="my-5" />
              <ManualAddLineForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <MessageList messages={messages} isProcessing={isProcessing} />

      <ClarificationActions />

      <Composer />
    </div>
  );
}
