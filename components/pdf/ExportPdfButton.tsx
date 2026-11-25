"use client";

import { Button } from "@/components/ui/button";
import { usePdfExport } from "@/hooks/usePdfExport";
import { Download, LoaderCircle } from "lucide-react";

export function ExportPdfButton() {
  const { isExporting, error, exportPdf } = usePdfExport();

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        disabled={isExporting}
        onClick={() => void exportPdf()}
      >
        {isExporting ? <LoaderCircle className="animate-spin" /> : <Download />}
        {isExporting ? "Generation" : "Export PDF"}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
