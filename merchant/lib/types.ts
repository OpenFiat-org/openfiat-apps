/**
 * OpenFiat protocol entity types, from the merchant's own point of view.
 *
 * This app is one merchant's dashboard, not a marketplace-wide view — so
 * unlike a public explorer, entities here don't carry a `merchantId`: every
 * advertisement, vault, and settlement below already belongs to "you."
 * Everything in `lib/data/` is simulated demo data until the app is
 * connected to a live OpenFiat node.
 */

export type StablecoinAsset = "USDT" | "USDC" | "USD1" | "SOL";

/** ISO 4217 code (or local pseudo-code). */
export type FiatCurrency = string;

/** Buy/Sell from the merchant's own stated direction on the ad. */
export type TradeDirection = "Buy" | "Sell";

export type MerchantTier =
  | "Explorer"
  | "Verified"
  | "Professional"
  | "Elite"
  | "Institutional";

export type MerchantAvailability =
  | "Online"
  | "Busy"
  | "Away"
  | "Offline"
  | "Vacation";

/** The dashboard owner's own merchant identity. */
export interface MerchantProfile {
  name: string;
  wallet: string;
  tier: MerchantTier;
  nextTier: MerchantTier;
  progressToNextTierPct: number;
  availability: MerchantAvailability;
  orders: number;
  completionRate: number; // 0–100
  avgResponseTime: string;
  merchantAge: string;
  identityLevel: "L0" | "L1" | "L2" | "L3";
  stakeOpen: number; // OPEN bonded (OFS-2100 §7)
}

export type PricingModel =
  | { type: "Fixed"; price: number }
  | { type: "Floating"; premiumPct: number };

export type AdStatus = "Online" | "Paused";

export interface Advertisement {
  id: string;
  asset: StablecoinAsset;
  direction: TradeDirection;
  fiatCurrency: FiatCurrency;
  pricing: PricingModel;
  minTrade: number; // fiat
  maxTrade: number; // fiat
  /** Backed by, and never greater than, the matching Vault's `available` balance (OFS-2100/2200/2300). */
  availableLiquidity: number;
  paymentMethods: string[];
  terms?: string;
  status: AdStatus;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

/**
 * Per-merchant, per-stablecoin Liquidity Vault (Ch.8, OFS-2300 §6). A Sell
 * advertisement cannot exceed `available` — deposit happens before the ad
 * can go live, not after a reservation.
 */
export interface Vault {
  asset: StablecoinAsset;
  total: number;
  reserved: number;
  available: number;
  settled: number;
}

export interface VaultEvent {
  time: string; // ISO
  type: string; // protocol event name, e.g. "VaultBalanceReserved"
  asset: StablecoinAsset;
  amount: number;
  summary: string;
}

/** Settlement lifecycle (escrow-enforced on Solana) — OFS-2300 §20. */
export type SettlementStatus =
  | "Escrow Locked"
  | "Awaiting Payment"
  | "Payment Submitted"
  | "Merchant Reviewing"
  | "Approved"
  | "Escrow Released"
  | "Completed"
  | "Rejected"
  | "Cancelled"
  | "Disputed";

/** Ordered happy-path lifecycle used by the settlement-detail stepper. */
export const SETTLEMENT_STEPS: SettlementStatus[] = [
  "Escrow Locked",
  "Awaiting Payment",
  "Payment Submitted",
  "Merchant Reviewing",
  "Approved",
  "Escrow Released",
  "Completed",
];

/**
 * OFS-2200 §18, in order — a separate state machine from settlement, not a
 * prefix of it. Reservation owns everything up to and including "Escrow
 * Locked," the handoff point to settlement (OFS-2300 §20). Every
 * `Settlement` here already exists past that handoff, so this phase is
 * always fully complete by the time a settlement page renders it — drawn
 * anyway, so "Escrow Locked" doesn't read as the start of the trade.
 */
export const RESERVATION_STEPS = [
  "Requested",
  "Validated",
  "Accepted",
  "Escrow Locked",
] as const;

export interface PaymentField {
  label: string;
  value: string;
}

export interface SettlementEvent {
  time: string; // static label, e.g. "14:02"
  kind: "event" | "message";
  actor: string;
  text: string;
}

/**
 * A settlement from the merchant's own side of the trade — `direction`
 * is the merchant's role, so "Sell" means the merchant is the one
 * providing stablecoins, regardless of which party opened the reservation.
 */
export interface Settlement {
  id: string;
  adId: string;
  direction: TradeDirection;
  counterparty: string; // truncated wallet
  asset: StablecoinAsset;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  fiatCurrency: FiatCurrency;
  paymentMethod: string;
  paymentFields: PaymentField[];
  txSig: string;
  escrowSig: string;
  status: SettlementStatus;
  createdAt: string; // ISO
  updatedAt: string; // static relative label
  events: SettlementEvent[];
  /** Set once status is "Disputed". */
  dispute?: SettlementDispute;
}

/**
 * Inline dispute summary shown on a settlement page when its status is
 * Disputed — OFS-2400 / Chapter 11's decentralized commit-reveal model.
 * A lighter shape than a full case view: enough to see where the case
 * stands without duplicating openfiat-app's dedicated dispute pages.
 */
export const DISPUTE_STAGES = [
  "Opened",
  "Escrow Frozen",
  "Evidence Submitted",
  "Investigation",
  "Arbitrators Joining",
  "Case Locked",
  "Evidence Released",
  "Commit Phase",
  "Reveal Phase",
  "Decision",
  "Escrow Released",
  "Reputation Updated",
  "Closed",
] as const;

export type DisputeStage = (typeof DISPUTE_STAGES)[number];

export type DisputeOutcome =
  | "Buyer Wins"
  | "Merchant Wins"
  | "Mutual Settlement"
  | "Invalid Dispute";

export interface SettlementDispute {
  id: string;
  stage: DisputeStage;
  openedAt: string; // ISO
  arbitratorsJoined: number;
  /** Withheld from public view until the case locks (OFS-2400 §9) — null before then. */
  seatsRequired: number | null;
  outcome?: DisputeOutcome;
}

// ── Analytics ──────────────────────────────────────────────────────────────

export interface VolumePoint {
  label: string; // e.g. "Mon", "Wk 1"
  volumeUsdt: number;
  settlements: number;
}

export interface ReputationDimension {
  label: string;
  score: number; // 0–100
  display: string;
}
