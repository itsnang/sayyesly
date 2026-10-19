import { formatUsd } from "./money";

/**
 * What a Theme costs now, and what it normally costs while it's on sale (null
 * when it isn't). Only `priceCents` is ever charged or decides who may use it.
 */
export type ThemePrice = { priceCents: number; regularPriceCents: number | null };

/** On sale: it normally costs more than it does now. */
export function isOnSale(price: ThemePrice): price is ThemePrice & { regularPriceCents: number } {
  return price.regularPriceCents !== null && price.regularPriceCents > price.priceCents;
}

/** How much is taken off, in whole percent: 100 while it's free for now, 0 when it isn't on sale. */
export function percentOff(price: ThemePrice): number {
  return isOnSale(price) ? Math.round((1 - price.priceCents / price.regularPriceCents) * 100) : 0;
}

/** "Free", or the price, e.g. "$1.99". */
export function priceLabel(cents: number): string {
  return cents === 0 ? "Free" : formatUsd(cents);
}
