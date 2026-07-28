import type { Advertisement } from "@/lib/types";

/**
 * The merchant's own advertisements. Sell-ad `availableLiquidity` figures
 * are checked against `lib/data/vaults.ts` in tests/data.test.ts — the sum
 * of same-asset Sell ads must never exceed that vault's `available` balance
 * (Ch.8, OFS-2100/2200/2300). Buy ads draw no liquidity from a vault at all;
 * the counterparty deposits at reservation time instead (Ch.8 §8.10).
 */
export const ADVERTISEMENTS: Advertisement[] = [
  {
    id: "AD-2001",
    asset: "USDT",
    direction: "Sell",
    fiatCurrency: "KES",
    pricing: { type: "Fixed", price: 132.1 },
    minTrade: 5000,
    maxTrade: 50000,
    availableLiquidity: 12000,
    paymentMethods: ["M-Pesa Kenya (Safaricom)", "Bank Transfer (Equity Bank)"],
    terms: "Name on the transfer must match your OpenFiat identity claim. Reference must include the reservation ID.",
    status: "Online",
    createdAt: "2026-04-02T09:00:00Z",
    updatedAt: "2026-07-27T08:00:00Z",
  },
  {
    id: "AD-2002",
    asset: "USDC",
    direction: "Sell",
    fiatCurrency: "KES",
    pricing: { type: "Floating", premiumPct: 1.2 },
    minTrade: 10000,
    maxTrade: 100000,
    availableLiquidity: 8600,
    paymentMethods: ["M-Pesa Kenya (Safaricom)"],
    status: "Online",
    createdAt: "2026-05-14T11:30:00Z",
    updatedAt: "2026-07-26T16:40:00Z",
  },
  {
    id: "AD-2003",
    asset: "SOL",
    direction: "Buy",
    fiatCurrency: "KES",
    pricing: { type: "Fixed", price: 24800 },
    minTrade: 20000,
    maxTrade: 300000,
    availableLiquidity: 0,
    paymentMethods: ["Bank Transfer (Equity Bank)"],
    terms: "Seller deposits SOL into escrow after acceptance — no pre-funded vault for a Buy ad (Ch.8 §8.10).",
    status: "Paused",
    createdAt: "2026-06-01T07:45:00Z",
    updatedAt: "2026-07-20T10:00:00Z",
  },
  {
    id: "AD-2004",
    asset: "USDT",
    direction: "Sell",
    fiatCurrency: "UGX",
    pricing: { type: "Floating", premiumPct: 0.8 },
    minTrade: 200000,
    maxTrade: 4000000,
    availableLiquidity: 4000,
    paymentMethods: ["Mobile Money (MTN Uganda)"],
    status: "Online",
    createdAt: "2026-06-18T13:10:00Z",
    updatedAt: "2026-07-25T09:20:00Z",
  },
  {
    id: "AD-2005",
    asset: "USDC",
    direction: "Buy",
    fiatCurrency: "KES",
    pricing: { type: "Fixed", price: 129.4 },
    minTrade: 15000,
    maxTrade: 150000,
    availableLiquidity: 0,
    paymentMethods: ["M-Pesa Kenya (Safaricom)"],
    status: "Online",
    createdAt: "2026-07-01T08:00:00Z",
    updatedAt: "2026-07-24T12:00:00Z",
  },
];

export function adById(id: string): Advertisement | undefined {
  return ADVERTISEMENTS.find((a) => a.id === id.toUpperCase());
}
