export const roundMoney = (amount: number): number =>
  Math.round((amount + Number.EPSILON) * 100) / 100;

export const clampToZero = (amount: number): number =>
  amount < 0 ? 0 : amount;

export const formatCurrency = (amount: number): string =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
