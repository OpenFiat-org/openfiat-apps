export interface ProtocolEvent {
  type: string;
  actor: string;
  timestamp: string; // ISO
  summary: string;
}

/** Simulated network-wide activity feed (event-sourced coordination layer — every transition emits a signed event). */
export const RECENT_ACTIVITY: ProtocolEvent[] = [
  { type: "EscrowLocked", actor: "Protocol", timestamp: "2026-07-27T13:59:00Z", summary: "250.00 USDT locked for TRD-7001" },
  { type: "PaymentSubmitted", actor: "buyer", timestamp: "2026-07-27T12:58:00Z", summary: "Buyer marked \"I Paid\" on TRD-7002" },
  { type: "VoteCast", actor: "7xKm…9fQ2", timestamp: "2026-07-27T13:05:00Z", summary: "25,000 OPEN voted For OFIP-0021" },
  { type: "AdvertisementCreated", actor: "WestlandsOTC", timestamp: "2026-07-27T13:21:00Z", summary: "Sell 240.5 SOL for KES (floating +1.5%)" },
  { type: "DisputeOpened", actor: "merchant", timestamp: "2026-07-24T15:53:00Z", summary: "DSP-6020 opened on TRD-6988 — escrow frozen" },
  { type: "SettlementCompleted", actor: "Protocol", timestamp: "2026-07-25T09:25:00Z", summary: "TRD-6994 completed — 800.00 USDT released" },
  { type: "ReservationExpired", actor: "Protocol", timestamp: "2026-07-27T12:40:00Z", summary: "Reservation expired after 30 min timeout" },
  { type: "StakeBonded", actor: "OpenWalletKe", timestamp: "2026-07-27T10:20:00Z", summary: "3,000 OPEN delegated to a Full Node" },
];
