export function quoteShipment(items, rate) {
  if (rate < 0 || items.some(({ weight }) => weight < 0)) {
    throw new Error("invalid quote input");
  }

  const total = items.reduce((sum, { weight }) => sum + weight * rate, 0);
  return Number(total.toFixed(2));
}
