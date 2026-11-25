"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuoteStore } from "@/store/useQuoteStore";
import { UserRoundCheck } from "lucide-react";
import { useState } from "react";

export function ClientInfoForm() {
  const client = useQuoteStore((state) => state.currentQuote.client);
  const setClientInfo = useQuoteStore((state) => state.setClientInfo);
  const [name, setName] = useState(client.name ?? "");
  const [address, setAddress] = useState(client.address ?? "");
  const [city, setCity] = useState(client.city ?? "");

  const saveClient = () => {
    setClientInfo({ name, address, city });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-zinc-950">Client</h3>
        <Button type="button" size="sm" onClick={saveClient}>
          <UserRoundCheck />
          Enregistrer
        </Button>
      </div>
      <div className="grid gap-3">
        <Input
          aria-label="Nom du client"
          placeholder="Nom du client"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          aria-label="Adresse du chantier"
          placeholder="Adresse du chantier"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
        />
        <Input
          aria-label="Code postal et ville"
          placeholder="Code postal et ville"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
      </div>
    </section>
  );
}
