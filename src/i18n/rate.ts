import { KHR_PER_USD } from "@/i18n/config";

const SOURCE = "https://open.er-api.com/v6/latest/USD";
/** A rate outside this range is treated as a bad response, not a real move. */
const SANE = { min: 3500, max: 4700 };

const sane = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= SANE.min && n <= SANE.max;

/**
 * Riel per US dollar, for showing prices in KHR. Order of preference:
 * 1. `KHR_PER_USD` in the environment, to pin a rate (for example the National Bank's).
 * 2. A free market-rate feed, cached by Next for 12 hours so most requests never call it.
 * 3. The fixed fallback in config, if the feed is down or returns something odd.
 * Only the currency pair is sent. Nothing about the visitor.
 */
export async function getKhrRate(): Promise<number> {
  const pinned = Number(process.env.KHR_PER_USD);
  if (sane(pinned)) return pinned;
  try {
    const res = await fetch(SOURCE, { next: { revalidate: 60 * 60 * 12 }, signal: AbortSignal.timeout(3000) });
    if (!res.ok) return KHR_PER_USD;
    const json = (await res.json()) as { rates?: { KHR?: unknown } };
    return sane(json.rates?.KHR) ? json.rates.KHR : KHR_PER_USD;
  } catch {
    return KHR_PER_USD;
  }
}
