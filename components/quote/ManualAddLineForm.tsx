"use client";

import { catalogArticles, interventionTemplates } from "@/domain/catalogLookup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuoteStore } from "@/store/useQuoteStore";
import { CirclePlus, PackagePlus } from "lucide-react";
import { useMemo, useState } from "react";
import { CatalogPicker } from "./CatalogPicker";

const DEFAULT_ARTICLE_ID = catalogArticles[0]?.id ?? "";
const DEFAULT_TEMPLATE_ID = interventionTemplates[0]?.id ?? "";

export function ManualAddLineForm() {
  const addArticle = useQuoteStore((state) => state.addArticle);
  const addCustomLine = useQuoteStore((state) => state.addCustomLine);
  const applyInterventionTemplate = useQuoteStore(
    (state) => state.applyInterventionTemplate,
  );
  const [sectionName, setSectionName] = useState("Cuisine");
  const [activeTab, setActiveTab] = useState("catalogue");
  const [articleId, setArticleId] = useState(DEFAULT_ARTICLE_ID);
  const [templateId, setTemplateId] = useState(DEFAULT_TEMPLATE_ID);
  const [quantity, setQuantity] = useState("1");
  const [designation, setDesignation] = useState("");
  const [unit, setUnit] = useState("forfait");
  const [price, setPrice] = useState("0");

  const selectedArticle = useMemo(
    () => catalogArticles.find((article) => article.id === articleId),
    [articleId],
  );

  const quantityValue = Number.parseFloat(quantity);
  const priceValue = Number.parseFloat(price);
  const canAddArticle = Boolean(articleId) && quantityValue > 0;
  const canAddCustom =
    designation.trim().length > 0 &&
    unit.trim().length > 0 &&
    quantityValue > 0 &&
    priceValue >= 0;

  const addSelectedArticle = () => {
    if (!canAddArticle) {
      return;
    }

    addArticle({
      articleId,
      quantity: quantityValue,
      sectionName,
    });
  };

  const addSelectedTemplate = () => {
    if (!templateId) {
      return;
    }

    applyInterventionTemplate({
      templateId,
      sectionName,
    });
  };

  const addCustom = () => {
    if (!canAddCustom) {
      return;
    }

    addCustomLine({
      designation,
      unit,
      price: priceValue,
      quantity: quantityValue,
      sectionName,
    });
    setDesignation("");
    setPrice("0");
  };

  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-950">Lignes</h3>
        <Input
          className="mt-3"
          aria-label="Rubrique"
          placeholder="Rubrique"
          value={sectionName}
          onChange={(event) => setSectionName(event.target.value)}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="catalogue">Article</TabsTrigger>
          <TabsTrigger value="template">Pack</TabsTrigger>
          <TabsTrigger value="custom">Libre</TabsTrigger>
        </TabsList>

        <TabsContent value="catalogue" className="space-y-3 pt-3">
          <CatalogPicker
            kind="article"
            value={articleId}
            onValueChange={setArticleId}
            onCreateCustom={() => setActiveTab("custom")}
          />
          <div className="grid grid-cols-[1fr_96px] gap-2">
            <Input
              aria-label="Quantité"
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <Input
              aria-label="Unité"
              value={selectedArticle?.unit ?? ""}
              readOnly
            />
          </div>
          <Button
            type="button"
            className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800"
            disabled={!canAddArticle}
            onClick={addSelectedArticle}
          >
            <CirclePlus />
            Ajouter
          </Button>
        </TabsContent>

        <TabsContent value="template" className="space-y-3 pt-3">
          <CatalogPicker
            kind="template"
            value={templateId}
            onValueChange={setTemplateId}
            onCreateCustom={() => setActiveTab("custom")}
          />
          <Button
            type="button"
            className="w-full gap-2 bg-teal-700 hover:bg-teal-800"
            disabled={!templateId}
            onClick={addSelectedTemplate}
          >
            <PackagePlus />
            Appliquer
          </Button>
        </TabsContent>

        <TabsContent value="custom" className="space-y-3 pt-3">
          <Textarea
            aria-label="Désignation"
            placeholder="Désignation"
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
          />
          <div className="grid grid-cols-3 gap-2">
            <Input
              aria-label="Quantité libre"
              type="number"
              min="0.01"
              step="0.01"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
            />
            <Input
              aria-label="Unité libre"
              value={unit}
              onChange={(event) => setUnit(event.target.value)}
            />
            <Input
              aria-label="Prix unitaire HT"
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
            />
          </div>
          <Button
            type="button"
            className="w-full gap-2 bg-emerald-700 hover:bg-emerald-800"
            disabled={!canAddCustom}
            onClick={addCustom}
          >
            <CirclePlus />
            Ajouter
          </Button>
        </TabsContent>
      </Tabs>
    </section>
  );
}
