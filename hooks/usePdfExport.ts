"use client";

import {
  createPdfFilename,
  createPdfQuoteSnapshot,
} from "@/domain/pdfSnapshot";
import { getQuoteStoreSnapshot } from "@/store/useQuoteStore";
import { useCallback, useRef, useState } from "react";

const triggerBlobDownload = (blob: Blob, filename: string): void => {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
};

export function usePdfExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string>();
  const isExportingRef = useRef(false);

  const exportPdf = useCallback(async (): Promise<boolean> => {
    if (isExportingRef.current) {
      return false;
    }

    isExportingRef.current = true;
    setIsExporting(true);
    setError(undefined);

    try {
      const store = getQuoteStoreSnapshot();
      const snapshot = createPdfQuoteSnapshot({
        quote: store.currentQuote,
        companySettings: store.companySettings,
      });
      const { generateQuotePdfBlob } = await import(
        "@/components/pdf/generateQuotePdf"
      );
      const blob = await generateQuotePdfBlob(snapshot);

      triggerBlobDownload(blob, createPdfFilename(snapshot));
      return true;
    } catch (exportError) {
      if (process.env.NODE_ENV === "development") {
        console.error("PDF export failed", exportError);
      }
      setError("Export PDF impossible.");
      return false;
    } finally {
      isExportingRef.current = false;
      setIsExporting(false);
    }
  }, []);

  return {
    isExporting,
    error,
    exportPdf,
  };
}
