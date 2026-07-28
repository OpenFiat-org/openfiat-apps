/**
 * OpenFiat protocol entity types, from a public network explorer's point of
 * view: every trade here is anonymized to what's actually public (truncated
 * wallets, no merchant identity beyond what an advertisement already
 * discloses). Everything in `lib/data/` is simulated demo data until the
 * app is connected to the indexer API.
 */

export type StablecoinAsset = "USDT" | "USDC" | "USD1" | "SOL";

/** ISO 4217 code (or local pseudo-code). */
export type FiatCurrency = string;

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

/** Ordered happy-path lifecycle used by the trade-detail stepper. */
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
 * Locked," the handoff point to settlement (OFS-2300 §20). Every `Trade`
 * here already exists past that handoff, so this phase is always fully
 * complete by the time a trade page renders it — drawn anyway, so "Escrow
 * Locked" doesn't read as the start of the trade.
 */
export const RESERVATION_STEPS = [
  "Requested",
  "Validated",
  "Accepted",
  "Escrow Locked",
] as const;

export interface TradeEvent {
  time: string; // ISO
  type: string; // protocol event name, e.g. "EscrowLocked"
  summary: string;
}

/** A settlement, as visible to the public network — no private payment details. */
export interface Trade {
  id: string;
  asset: StablecoinAsset;
  fiatCurrency: FiatCurrency;
  cryptoAmount: number;
  fiatAmount: number;
  price: number;
  /** Truncated wallets — the only identity a public explorer shows. */
  merchant: string;
  buyer: string;
  status: SettlementStatus;
  createdAt: string; // ISO
  escrowSig: string;
  settlementSig: string;
  events: TradeEvent[];
}

export type ProposalStatus = "Active" | "Passed" | "Rejected" | "Executed";

/** OFS-4100 §5's 6-category taxonomy, chosen over OFS-4000's 5-category one. */
export type ProposalCategory =
  | "Informational"
  | "Standards"
  | "Parameter"
  | "Treasury"
  | "Protocol-Upgrade"
  | "Constitutional";

export interface Proposal {
  id: string; // OFIP-####
  category: ProposalCategory;
  title: string;
  description: string;
  status: ProposalStatus;
  votingEnds: string; // static label
  votesFor: number; // percent
  votesAgainst: number; // percent
  votesAbstain: number; // percent
  /** Required quorum, set by category (OFS-4100 §5) — 10% standard, 20% for Protocol-Upgrade/Constitutional. */
  quorumPct: number;
  /** Required For-share to pass, set by category — 50/60/66. */
  approvalThresholdPct: number;
  turnoutPct: number; // current turnout
  /** [PROPOSED — NEEDS SIGN-OFF] OFS-4100 §5: 5,000 OPEN, refunded if quorum is met by the deadline. */
  depositOpen: number;
  /** null while voting is still open; set once the deadline passes. */
  depositRefunded: boolean | null;
}

export const TREASURY = {
  openBalance: 1240000,
  usdcBalance: 386500,
};

export type NodeRole =
  | "Full Node"
  | "Bootstrap Node"
  | "Snapshot Provider"
  | "Notification Gateway"
  | "Oracle Provider"
  | "Risk Intelligence Provider"
  | "Merchant Gateway"
  | "Public API Node";

export type NodeStatus = "Online" | "Syncing" | "Offline";

export interface NetworkNode {
  id: string;
  role: NodeRole;
  region: string;
  version: string;
  status: NodeStatus;
  latencyMs: number;
  peers: number;
  stakeOpen: number;
}

export interface NetworkStats {
  nodesOnline: number;
  peers: number;
  blockHeight: number;
  epoch: number;
  protocolVersion: string;
}

export interface RegionStat {
  region: string;
  merchants: number;
  volume24hUsdt: number;
}
