import type { Market } from "@prisma/client";

const VALID_MARKETS: Market[] = ["WHITE", "BLACK", "BOTH"];

export function normalizeMarketParam(marketParam?: string | null): Market {
  const normalized = (marketParam ?? "").toUpperCase();
  return VALID_MARKETS.includes(normalized as Market)
    ? (normalized as Market)
    : "BOTH";
}

export function buildMarketFilters(market: Market): Market[] {
  switch (market) {
    case "WHITE":
      return ["WHITE", "BOTH"];
    case "BLACK":
      return ["BLACK", "BOTH"];
    default:
      return VALID_MARKETS;
  }
}
