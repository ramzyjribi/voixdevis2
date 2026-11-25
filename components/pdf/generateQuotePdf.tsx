"use client";

import { pdf } from "@react-pdf/renderer";
import type { PdfQuoteSnapshot } from "@/domain/pdfSnapshot";
import { QuotePdfDocument } from "./QuotePdfDocument";

export const generateQuotePdfBlob = async (
  snapshot: PdfQuoteSnapshot,
): Promise<Blob> => pdf(<QuotePdfDocument snapshot={snapshot} />).toBlob();
