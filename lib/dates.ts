export const nowIso = (): string => new Date().toISOString();

export const todayIso = (): string => nowIso().slice(0, 10);

export const formatFrenchDate = (isoDate: string): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(isoDate));
