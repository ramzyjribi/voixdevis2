"use client";

import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { calculateLineTotalHt } from "@/domain/quoteCalculations";
import type { PdfQuoteSnapshot } from "@/domain/pdfSnapshot";
import { formatFrenchDate } from "@/lib/dates";
import { formatCurrency } from "@/lib/money";

type QuotePdfDocumentProps = {
  snapshot: PdfQuoteSnapshot;
};

const colors = {
  ink: "#18181b",
  muted: "#71717a",
  line: "#d4d4d8",
  soft: "#f4f4f5",
  accent: "#047857",
  accentSoft: "#ecfdf5",
  white: "#ffffff",
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 38,
    paddingRight: 38,
    paddingBottom: 46,
    paddingLeft: 38,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  company: {
    width: "55%",
    paddingRight: 18,
  },
  eyebrow: {
    marginBottom: 6,
    fontSize: 8,
    color: colors.accent,
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  companyName: {
    marginBottom: 8,
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
  },
  infoLine: {
    marginBottom: 3,
    color: colors.muted,
    lineHeight: 1.35,
  },
  clientCard: {
    width: "45%",
    paddingTop: 12,
    paddingRight: 14,
    paddingBottom: 12,
    paddingLeft: 14,
    borderLeftWidth: 3,
    borderLeftColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  clientName: {
    marginBottom: 5,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  clientLine: {
    marginBottom: 3,
    color: "#3f3f46",
  },
  metaRow: {
    flexDirection: "row",
    marginTop: 11,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#a7f3d0",
  },
  metaCell: {
    width: "50%",
  },
  metaLabel: {
    marginBottom: 2,
    fontSize: 7,
    color: colors.muted,
    textTransform: "uppercase",
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
  },
  empty: {
    paddingTop: 28,
    paddingBottom: 28,
    borderWidth: 1,
    borderColor: colors.line,
    color: colors.muted,
    textAlign: "center",
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    paddingTop: 7,
    paddingRight: 9,
    paddingBottom: 7,
    paddingLeft: 9,
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: colors.white,
    backgroundColor: colors.ink,
  },
  tableHeader: {
    flexDirection: "row",
    paddingTop: 6,
    paddingRight: 7,
    paddingBottom: 6,
    paddingLeft: 7,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.soft,
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: colors.muted,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    minHeight: 28,
    paddingTop: 6,
    paddingRight: 7,
    paddingBottom: 6,
    paddingLeft: 7,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  designationColumn: {
    flexGrow: 1,
    flexBasis: 0,
    paddingRight: 8,
  },
  quantityColumn: {
    width: 38,
    textAlign: "right",
  },
  unitColumn: {
    width: 38,
    textAlign: "center",
  },
  priceColumn: {
    width: 72,
    textAlign: "right",
  },
  totalColumn: {
    width: 72,
    textAlign: "right",
    fontFamily: "Helvetica-Bold",
  },
  totals: {
    width: 245,
    marginTop: 8,
    marginLeft: "auto",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
    paddingBottom: 4,
    color: "#3f3f46",
  },
  totalValue: {
    fontFamily: "Helvetica-Bold",
    color: colors.ink,
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingTop: 9,
    borderTopWidth: 1.5,
    borderTopColor: colors.ink,
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  footer: {
    position: "absolute",
    right: 38,
    bottom: 20,
    left: 38,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 7,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    fontSize: 7,
    color: colors.muted,
  },
});

const compactText = (values: Array<string | undefined>): string | undefined => {
  const content = values.filter(Boolean).join(" ").trim();
  return content || undefined;
};

const formatQuantity = (quantity: number): string =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 2 }).format(quantity);

const getDiscountLabel = (snapshot: PdfQuoteSnapshot): string => {
  const discount = snapshot.quote.discount;

  if (!discount) {
    return "Remise";
  }

  return discount.type === "percent"
    ? `Remise (${formatQuantity(discount.value)} %)`
    : `Remise (${formatCurrency(discount.value)})`;
};

export function QuotePdfDocument({ snapshot }: QuotePdfDocumentProps) {
  const { quote, companySettings, totals } = snapshot;
  const companyLocation = compactText([
    companySettings.postalCode,
    companySettings.city,
  ]);
  const companyContact = compactText([
    companySettings.phone,
    companySettings.email,
  ]);

  return (
    <Document
      title={quote.quoteNumber ? `Devis ${quote.quoteNumber}` : "Devis"}
      author={companySettings.companyName || companySettings.artisanName}
      subject="Devis de prestations"
      language="fr-FR"
    >
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <View style={styles.company}>
            <Text style={styles.eyebrow}>Devis</Text>
            <Text style={styles.companyName}>
              {companySettings.companyName || "Votre entreprise"}
            </Text>
            {companySettings.artisanName ? (
              <Text style={styles.infoLine}>{companySettings.artisanName}</Text>
            ) : null}
            {companySettings.address ? (
              <Text style={styles.infoLine}>{companySettings.address}</Text>
            ) : null}
            {companyLocation ? (
              <Text style={styles.infoLine}>{companyLocation}</Text>
            ) : null}
            {companySettings.siret ? (
              <Text style={styles.infoLine}>SIRET {companySettings.siret}</Text>
            ) : null}
            {companyContact ? (
              <Text style={styles.infoLine}>{companyContact}</Text>
            ) : null}
          </View>

          <View style={styles.clientCard}>
            <Text style={styles.eyebrow}>Client</Text>
            <Text style={styles.clientName}>
              {quote.client.name || "Client a renseigner"}
            </Text>
            {quote.client.address ? (
              <Text style={styles.clientLine}>{quote.client.address}</Text>
            ) : null}
            {quote.client.city ? (
              <Text style={styles.clientLine}>{quote.client.city}</Text>
            ) : null}
            <View style={styles.metaRow}>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>Date</Text>
                <Text style={styles.metaValue}>
                  {formatFrenchDate(quote.createdAt)}
                </Text>
              </View>
              <View style={styles.metaCell}>
                <Text style={styles.metaLabel}>TVA</Text>
                <Text style={styles.metaValue}>{quote.tvaRate} %</Text>
              </View>
            </View>
          </View>
        </View>

        {quote.sections.length === 0 ? (
          <View style={styles.empty}>
            <Text>Aucune prestation ajoutee.</Text>
          </View>
        ) : (
          quote.sections.map((section) => (
            <View key={section.id} style={styles.section}>
              <Text style={styles.sectionTitle} minPresenceAhead={42}>
                {section.name}
              </Text>
              <View style={styles.tableHeader} wrap={false}>
                <Text style={styles.designationColumn}>Designation</Text>
                <Text style={styles.quantityColumn}>Qte</Text>
                <Text style={styles.unitColumn}>Unite</Text>
                <Text style={styles.priceColumn}>PU HT</Text>
                <Text style={styles.totalColumn}>Total HT</Text>
              </View>
              {section.lineItems.map((lineItem) => (
                <View key={lineItem.lineItemId} style={styles.tableRow} wrap={false}>
                  <Text style={styles.designationColumn}>
                    {lineItem.designation}
                  </Text>
                  <Text style={styles.quantityColumn}>
                    {formatQuantity(lineItem.quantity)}
                  </Text>
                  <Text style={styles.unitColumn}>{lineItem.unit}</Text>
                  <Text style={styles.priceColumn}>
                    {formatCurrency(lineItem.unitPriceHt)}
                  </Text>
                  <Text style={styles.totalColumn}>
                    {formatCurrency(calculateLineTotalHt(lineItem))}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}

        <View style={styles.totals} wrap={false}>
          <TotalRow label="Sous-total HT" value={totals.subtotalHt} />
          <TotalRow
            label={getDiscountLabel(snapshot)}
            value={totals.discountAmount === 0 ? 0 : -totals.discountAmount}
          />
          <TotalRow label="Total HT" value={totals.totalAfterDiscountHt} />
          <TotalRow
            label={`TVA (${quote.tvaRate} %)`}
            value={totals.tvaAmount}
          />
          <View style={styles.grandTotal}>
            <Text>Total TTC</Text>
            <Text>{formatCurrency(totals.totalTtc)}</Text>
          </View>
        </View>

        <View style={styles.footer} fixed>
          <Text>{companySettings.companyName || "VoixDevis"}</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

function TotalRow({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.totalRow}>
      <Text>{label}</Text>
      <Text style={styles.totalValue}>{formatCurrency(value)}</Text>
    </View>
  );
}
