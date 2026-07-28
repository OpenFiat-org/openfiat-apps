import { pseudoAddress, pseudoSignature, shortAddress } from "@/lib/format";
import type { Trade } from "@/lib/types";

function addr(seed: string): string {
  return shortAddress(pseudoAddress(seed));
}

/** Public, network-wide settlements (OFS-2300) — no private payment details. */
export const TRADES: Trade[] = [
  {
    id: "TRD-7001",
    asset: "USDT",
    fiatCurrency: "KES",
    cryptoAmount: 250,
    fiatAmount: 33025,
    price: 132.1,
    merchant: addr("merchant-kenyastar"),
    buyer: addr("buyer-7001"),
    status: "Escrow Locked",
    createdAt: "2026-07-27T13:58:00Z",
    escrowSig: pseudoSignature("TRD-7001-escrow"),
    settlementSig: "",
    events: [
      { time: "2026-07-27T13:58:00Z", type: "ReservationRequested", summary: "Reservation created (first-come-first-served, 30 min timeout)." },
      { time: "2026-07-27T13:59:00Z", type: "EscrowLocked", summary: "250.00 USDT locked from the merchant's Liquidity Vault." },
    ],
  },
  {
    id: "TRD-7002",
    asset: "USDC",
    fiatCurrency: "KES",
    cryptoAmount: 620,
    fiatAmount: 81034,
    price: 130.7,
    merchant: addr("merchant-nairobihub"),
    buyer: addr("buyer-7002"),
    status: "Payment Submitted",
    createdAt: "2026-07-27T12:40:00Z",
    escrowSig: pseudoSignature("TRD-7002-escrow"),
    settlementSig: "",
    events: [
      { time: "2026-07-27T12:40:00Z", type: "ReservationRequested", summary: "Reservation created (first-come-first-served, 30 min timeout)." },
      { time: "2026-07-27T12:41:00Z", type: "EscrowLocked", summary: "620.00 USDC locked from the merchant's Liquidity Vault." },
      { time: "2026-07-27T12:58:00Z", type: "PaymentSubmitted", summary: "Buyer marked \"I Paid\"." },
    ],
  },
  {
    id: "TRD-7003",
    asset: "SOL",
    fiatCurrency: "NGN",
    cryptoAmount: 18,
    fiatAmount: 4324000,
    price: 240222,
    merchant: addr("merchant-lagosfx"),
    buyer: addr("buyer-7003"),
    status: "Merchant Reviewing",
    createdAt: "2026-07-27T11:20:00Z",
    escrowSig: pseudoSignature("TRD-7003-escrow"),
    settlementSig: "",
    events: [
      { time: "2026-07-27T11:20:00Z", type: "ReservationRequested", summary: "Reservation created (first-come-first-served, 30 min timeout)." },
      { time: "2026-07-27T11:21:00Z", type: "EscrowLocked", summary: "18.00 SOL locked from the merchant's Liquidity Vault." },
      { time: "2026-07-27T11:35:00Z", type: "PaymentSubmitted", summary: "Buyer marked \"I Paid\"." },
    ],
  },
  {
    id: "TRD-6994",
    asset: "USDT",
    fiatCurrency: "KES",
    cryptoAmount: 800,
    fiatAmount: 105680,
    price: 132.1,
    merchant: addr("merchant-kenyastar"),
    buyer: addr("buyer-6994"),
    status: "Completed",
    createdAt: "2026-07-25T09:00:00Z",
    escrowSig: pseudoSignature("TRD-6994-escrow"),
    settlementSig: pseudoSignature("TRD-6994-settle"),
    events: [
      { time: "2026-07-25T09:00:00Z", type: "ReservationRequested", summary: "Reservation created." },
      { time: "2026-07-25T09:01:00Z", type: "EscrowLocked", summary: "800.00 USDT locked from the merchant's Liquidity Vault." },
      { time: "2026-07-25T09:18:00Z", type: "PaymentSubmitted", summary: "Buyer marked \"I Paid\"." },
      { time: "2026-07-25T09:25:00Z", type: "SettlementApproved", summary: "Merchant confirmed receipt." },
      { time: "2026-07-25T09:25:00Z", type: "EscrowReleased", summary: "800.00 USDT released to the buyer." },
      { time: "2026-07-25T09:25:00Z", type: "SettlementCompleted", summary: "Reputations updated." },
    ],
  },
  {
    id: "TRD-6988",
    asset: "USDT",
    fiatCurrency: "UGX",
    cryptoAmount: 300,
    fiatAmount: 1188000,
    price: 3960,
    merchant: addr("merchant-kampalapay"),
    buyer: addr("buyer-6988"),
    status: "Disputed",
    createdAt: "2026-07-24T15:10:00Z",
    escrowSig: pseudoSignature("TRD-6988-escrow"),
    settlementSig: "",
    events: [
      { time: "2026-07-24T15:10:00Z", type: "ReservationRequested", summary: "Reservation created." },
      { time: "2026-07-24T15:11:00Z", type: "EscrowLocked", summary: "300.00 USDT locked from the merchant's Liquidity Vault." },
      { time: "2026-07-24T15:40:00Z", type: "PaymentSubmitted", summary: "Buyer marked \"I Paid\"." },
      { time: "2026-07-24T15:52:00Z", type: "SettlementRejected", summary: "Merchant rejected the payment claim." },
      { time: "2026-07-24T15:53:00Z", type: "DisputeOpened", summary: "DSP-6020 opened. Escrow frozen; funds move only per arbitration outcome (OFS-2400 §6)." },
    ],
  },
  {
    id: "TRD-6979",
    asset: "USDC",
    fiatCurrency: "KES",
    cryptoAmount: 90,
    fiatAmount: 11826,
    price: 131.4,
    merchant: addr("merchant-nairobihub"),
    buyer: addr("buyer-6979"),
    status: "Cancelled",
    createdAt: "2026-07-23T08:20:00Z",
    escrowSig: pseudoSignature("TRD-6979-escrow"),
    settlementSig: "",
    events: [
      { time: "2026-07-23T08:20:00Z", type: "ReservationRequested", summary: "Reservation created." },
      { time: "2026-07-23T08:21:00Z", type: "EscrowLocked", summary: "90.00 USDC locked from the merchant's Liquidity Vault." },
      { time: "2026-07-23T08:50:00Z", type: "SettlementCancelled", summary: "Payment window expired with no payment marked sent; escrow returned to the Liquidity Vault." },
    ],
  },
];

export function tradeById(id: string): Trade | undefined {
  return TRADES.find((t) => t.id === id.toUpperCase());
}
