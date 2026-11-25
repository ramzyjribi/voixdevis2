"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { CompanySettings, TvaRate } from "@/domain/quoteTypes";
import { useQuoteStore } from "@/store/useQuoteStore";
import { Save } from "lucide-react";
import { useState } from "react";

type CompanyFormProps = {
  onSaved: () => void;
};

export function CompanyForm({ onSaved }: CompanyFormProps) {
  const companySettings = useQuoteStore((state) => state.companySettings);
  const updateCompanySettings = useQuoteStore(
    (state) => state.updateCompanySettings,
  );
  const [form, setForm] = useState<CompanySettings>(companySettings);

  const updateField = (field: keyof CompanySettings, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const save = () => {
    updateCompanySettings(form);
    onSaved();
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          aria-label="Nom de la société"
          placeholder="Nom de la société"
          value={form.companyName ?? ""}
          onChange={(event) => updateField("companyName", event.target.value)}
        />
        <Input
          aria-label="Nom de l'artisan"
          placeholder="Nom de l'artisan"
          value={form.artisanName ?? ""}
          onChange={(event) => updateField("artisanName", event.target.value)}
        />
        <Input
          aria-label="Adresse entreprise"
          placeholder="Adresse"
          value={form.address ?? ""}
          onChange={(event) => updateField("address", event.target.value)}
        />
        <Input
          aria-label="Code postal"
          placeholder="Code postal"
          value={form.postalCode ?? ""}
          onChange={(event) => updateField("postalCode", event.target.value)}
        />
        <Input
          aria-label="Ville"
          placeholder="Ville"
          value={form.city ?? ""}
          onChange={(event) => updateField("city", event.target.value)}
        />
        <Input
          aria-label="SIRET"
          placeholder="SIRET"
          value={form.siret ?? ""}
          onChange={(event) => updateField("siret", event.target.value)}
        />
        <Input
          aria-label="Téléphone"
          placeholder="Téléphone"
          value={form.phone ?? ""}
          onChange={(event) => updateField("phone", event.target.value)}
        />
        <Input
          aria-label="Email"
          placeholder="Email"
          type="email"
          value={form.email ?? ""}
          onChange={(event) => updateField("email", event.target.value)}
        />
      </div>

      <div className="grid gap-2 sm:max-w-xs">
        <span className="text-sm font-medium">TVA par défaut</span>
        <Select
          value={String(form.defaultTvaRate)}
          onValueChange={(value) =>
            setForm((current) => ({
              ...current,
              defaultTvaRate: Number.parseFloat(value) as TvaRate,
            }))
          }
        >
          <SelectTrigger aria-label="TVA par défaut">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5.5">5.5 %</SelectItem>
            <SelectItem value="10">10 %</SelectItem>
            <SelectItem value="20">20 %</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end">
        <Button type="button" className="gap-2" onClick={save}>
          <Save />
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
