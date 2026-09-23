/** US cents as a price label: 199 → "$1.99". */
export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}
