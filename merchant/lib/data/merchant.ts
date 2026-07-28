import { pseudoAddress } from "@/lib/format";
import type { MerchantProfile } from "@/lib/types";

/** The dashboard owner. Simulated until wallet-connected to a live node. */
export const MERCHANT: MerchantProfile = {
  name: "SavannahTrades",
  wallet: pseudoAddress("savannah-trades"),
  tier: "Elite",
  nextTier: "Institutional",
  progressToNextTierPct: 62,
  availability: "Online",
  orders: 3842,
  completionRate: 98.9,
  avgResponseTime: "<1 min",
  merchantAge: "11 months",
  identityLevel: "L2",
  stakeOpen: 18000,
};
