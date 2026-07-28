import type { StablecoinAsset, Vault, VaultEvent } from "@/lib/types";

/**
 * Liquidity Vaults (Ch.8, OFS-2300 §6) — one per stablecoin. `total` is
 * always `reserved + available`; a Sell advertisement's `availableLiquidity`
 * (see lib/data/advertisements.ts) can never exceed a vault's `available`
 * balance, because the deposit happens before the ad can go live, not after
 * a reservation.
 *
 * `reserved` here is the sum of every non-terminal Settlement's
 * `cryptoAmount` for that asset (lib/data/settlements.ts) — including a
 * Disputed settlement, whose escrow stays frozen, not released, until
 * arbitration concludes (OFS-2400 §6). Completed and Cancelled settlements
 * are excluded: their escrow has already left (released or returned).
 */
export const VAULTS: Vault[] = [
  // Reserved: STL-3001 (250) + STL-3003 (400) + STL-2988 (300, Disputed — frozen, not released) = 950.
  { asset: "USDT", total: 17150, reserved: 950, available: 16200, settled: 142300 },
  // Reserved: STL-3002 (620) + STL-3004 (150) = 770.
  { asset: "USDC", total: 9370, reserved: 770, available: 8600, settled: 76400 },
  { asset: "SOL", total: 600, reserved: 0, available: 600, settled: 5200 },
];

export function vaultForAsset(asset: StablecoinAsset): Vault | undefined {
  return VAULTS.find((v) => v.asset === asset);
}

export const VAULT_EVENTS: VaultEvent[] = [
  { time: "2026-07-27T13:52:00Z", type: "VaultBalanceReserved", asset: "USDT", amount: 250, summary: "250.00 USDT reserved against STL-3001" },
  { time: "2026-07-27T09:10:00Z", type: "VaultDeposit", asset: "USDT", amount: 5000, summary: "5,000.00 USDT deposited" },
  { time: "2026-07-26T16:40:00Z", type: "VaultBalanceReleased", asset: "USDC", amount: 400, summary: "400.00 USDC released back to available (settlement cancelled)" },
  { time: "2026-07-25T11:05:00Z", type: "VaultBalanceSettled", asset: "USDC", amount: 620, summary: "620.00 USDC transferred out on settlement completion" },
  { time: "2026-07-24T08:30:00Z", type: "VaultDeposit", asset: "SOL", amount: 200, summary: "200.00 SOL deposited" },
  { time: "2026-07-22T14:15:00Z", type: "VaultWithdrawal", asset: "SOL", amount: 60, summary: "60.00 SOL withdrawn (unreserved only)" },
];
