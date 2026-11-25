"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  searchCatalogArticles,
  searchInterventionTemplates,
} from "@/domain/catalogSearch";
import { catalogArticles, interventionTemplates } from "@/domain/catalogLookup";
import { cn } from "@/lib/utils";
import { Check, PencilLine, Search, X } from "lucide-react";
import { useId, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";

type CatalogPickerKind = "article" | "template";

type CatalogPickerProps = {
  kind: CatalogPickerKind;
  value: string;
  onValueChange: (value: string) => void;
  onCreateCustom: () => void;
};

type PickerOption = {
  id: string;
  title: string;
  detail: string;
};

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);

const getPickerOptions = (
  kind: CatalogPickerKind,
  query: string,
): PickerOption[] => {
  if (kind === "article") {
    return searchCatalogArticles(query).map((article) => ({
      id: article.id,
      title: article.designation,
      detail: `${formatPrice(article.price)} / ${article.unit}`,
    }));
  }

  return searchInterventionTemplates(query).map((template) => ({
    id: template.id,
    title: template.title,
    detail: `${template.items.length} ligne${template.items.length > 1 ? "s" : ""}`,
  }));
};

export function CatalogPicker({
  kind,
  value,
  onValueChange,
  onCreateCustom,
}: CatalogPickerProps) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const listId = useId();
  const options = useMemo(() => getPickerOptions(kind, query), [kind, query]);
  const isArticle = kind === "article";
  const totalCount = isArticle
    ? catalogArticles.length
    : interventionTemplates.length;
  const itemLabel = isArticle ? "article" : "pack";
  const activeOption = options[activeIndex];

  const updateQuery = (nextQuery: string) => {
    const nextOptions = getPickerOptions(kind, nextQuery);

    if (value && !nextOptions.some((option) => option.id === value)) {
      onValueChange("");
    }

    setQuery(nextQuery);
    setActiveIndex(0);
  };

  const moveActiveOption = (nextIndex: number) => {
    setActiveIndex(nextIndex);
    optionRefs.current[nextIndex]?.scrollIntoView({ block: "nearest" });
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (options.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActiveOption((activeIndex + 1) % options.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActiveOption((activeIndex - 1 + options.length) % options.length);
    } else if (event.key === "Enter" && activeOption) {
      event.preventDefault();
      onValueChange(activeOption.id);
    } else if (event.key === "Escape" && query) {
      event.preventDefault();
      updateQuery("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-zinc-400" />
        <Input
          aria-label={`Rechercher un ${itemLabel}`}
          aria-autocomplete="list"
          aria-controls={listId}
          aria-expanded="true"
          aria-activedescendant={
            activeOption ? `${listId}-${activeOption.id}` : undefined
          }
          role="combobox"
          className="h-10 pl-9 pr-9"
          placeholder={`Rechercher un ${itemLabel}`}
          value={query}
          onChange={(event) => updateQuery(event.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {query ? (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-1.5 top-1/2 -translate-y-1/2"
            aria-label="Effacer la recherche"
            title="Effacer la recherche"
            onClick={() => updateQuery("")}
          >
            <X />
          </Button>
        ) : null}
      </div>

      <div className="flex min-h-6 items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          {query ? `${options.length} sur ${totalCount}` : `${totalCount}`} {itemLabel}
          {totalCount > 1 ? "s" : ""}
        </span>
        {query ? (
          <Button
            type="button"
            variant="link"
            size="xs"
            className="h-6 px-0 text-emerald-700"
            onClick={() => updateQuery("")}
          >
            Tout afficher
          </Button>
        ) : null}
      </div>

      <div
        id={listId}
        role="listbox"
        aria-label={isArticle ? "Articles du catalogue" : "Packs du catalogue"}
        className="max-h-64 overflow-y-auto rounded-lg border bg-white p-1"
      >
        {options.length > 0 ? (
          options.map((option, index) => {
            const isSelected = option.id === value;
            const isActive = index === activeIndex;

            return (
              <Button
                key={option.id}
                id={`${listId}-${option.id}`}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                type="button"
                role="option"
                aria-selected={isSelected}
                variant="ghost"
                className={cn(
                  "h-auto min-h-12 w-full justify-start gap-2 whitespace-normal px-2 py-2 text-left",
                  isSelected && "bg-emerald-50 text-emerald-950",
                  isActive && "ring-1 ring-emerald-300",
                )}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => onValueChange(option.id)}
              >
                <span className="flex size-5 shrink-0 items-center justify-center">
                  {isSelected ? <Check className="text-emerald-700" /> : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium leading-5">
                    {option.title}
                  </span>
                  <span className="block text-xs font-normal text-zinc-500">
                    {option.detail}
                  </span>
                </span>
              </Button>
            );
          })
        ) : (
          <div className="flex flex-col items-center gap-3 px-3 py-6 text-center">
            <p className="text-sm text-zinc-600">
              Aucun {itemLabel} ne correspond.
            </p>
            <Button type="button" variant="outline" onClick={onCreateCustom}>
              <PencilLine />
              Saisir une ligne libre
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
