import { NODES } from "@/lib/data/nodes";
import type { NetworkStats, RegionStat } from "@/lib/types";

export const NETWORK_STATS: NetworkStats = {
  nodesOnline: NODES.filter((n) => n.status === "Online").length,
  peers: NODES.reduce((sum, n) => sum + n.peers, 0),
  blockHeight: 284_991_402,
  epoch: 612,
  protocolVersion: "1.4.2",
};

export const VOLUME_24H_USDT = 412_800;
export const VOLUME_7D_USDT = 2_741_600;
export const VOLUME_30D_USDT = 11_284_900;
export const TRADES_24H = 918;
export const ACTIVE_MERCHANTS = 264;
/** Sum of every registered merchant's Liquidity Vault `available` + `reserved` (Ch.8, OFS-2300 §6). */
export const TOTAL_VALUE_LOCKED_USDT = 3_184_200;
export const DISPUTE_RATE_PCT = 1.1;

/** [CONFIRMED] OFS-4100 §1. */
export const OPEN_TOTAL_SUPPLY = 1_000_000_000;
export const OPEN_CIRCULATING = 214_000_000;
export const OPEN_STAKED = 96_400_000;
/** Share of circulating-staked-for-governance supply that has voted on the most recent Active proposal. */
export const GOVERNANCE_PARTICIPATION_PCT = 8.4;

export const REGION_STATS: RegionStat[] = [
  { region: "Nairobi, KE", merchants: 78, volume24hUsdt: 142_300 },
  { region: "Lagos, NG", merchants: 64, volume24hUsdt: 118_900 },
  { region: "Kampala, UG", merchants: 29, volume24hUsdt: 41_200 },
  { region: "Accra, GH", merchants: 22, volume24hUsdt: 33_800 },
  { region: "Frankfurt, DE", merchants: 11, volume24hUsdt: 52_100 },
  { region: "Singapore, SG", merchants: 18, volume24hUsdt: 24_500 },
];
