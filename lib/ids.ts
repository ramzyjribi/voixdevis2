export type IdPrefix = "quote" | "section" | "line" | "message";

const fallbackRandomSegment = (): string =>
  Math.random().toString(36).slice(2, 10);

export const createId = (prefix: IdPrefix): string => {
  const cryptoApi = globalThis.crypto;
  const randomSegment =
    typeof cryptoApi?.randomUUID === "function"
      ? cryptoApi.randomUUID().replaceAll("-", "").slice(0, 12)
      : fallbackRandomSegment();

  return `${prefix}_${randomSegment}`;
};

export type IdFactory = (prefix: IdPrefix) => string;
