import type { ReputationDimension, VolumePoint } from "@/lib/types";

/** Last 8 weeks of settlement volume. */
export const VOLUME_TREND: VolumePoint[] = [
  { label: "Wk 1", volumeUsdt: 18200, settlements: 41 },
  { label: "Wk 2", volumeUsdt: 21400, settlements: 47 },
  { label: "Wk 3", volumeUsdt: 19800, settlements: 44 },
  { label: "Wk 4", volumeUsdt: 24100, settlements: 53 },
  { label: "Wk 5", volumeUsdt: 26700, settlements: 58 },
  { label: "Wk 6", volumeUsdt: 23900, settlements: 51 },
  { label: "Wk 7", volumeUsdt: 28300, settlements: 62 },
  { label: "Wk 8", volumeUsdt: 30150, settlements: 66 },
];

/**
 * OFS-3000's reputation factors, as they apply to a merchant: completion
 * rate, settlement speed, dispute rate, and response time all feed the
 * tier calculation shown on the Overview page.
 */
export const REPUTATION_DIMENSIONS: ReputationDimension[] = [
  { label: "Completion rate", score: 99, display: "98.9%" },
  { label: "Settlement speed", score: 92, display: "4.1 min median" },
  { label: "Response time", score: 97, display: "<1 min avg" },
  { label: "Dispute rate", score: 88, display: "1.2% of settlements" },
  { label: "Protocol age", score: 55, display: "11 months" },
];

export const SETTLEMENT_SUCCESS_RATE_PCT = 97.4;
export const DISPUTE_RATE_PCT = 1.2;
