import { describe, expect, it } from "vitest";
import { adById, ADVERTISEMENTS } from "@/lib/data/advertisements";
import { REPUTATION_DIMENSIONS, VOLUME_TREND } from "@/lib/data/analytics";
import { MERCHANT } from "@/lib/data/merchant";
import { settlementById, SETTLEMENTS } from "@/lib/data/settlements";
import { VAULTS, vaultForAsset } from "@/lib/data/vaults";
import { RESERVATION_STEPS, SETTLEMENT_STEPS } from "@/lib/types";

describe("sanity", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});

describe("vaults", () => {
  it("total always equals reserved + available", () => {
    for (const v of VAULTS) {
      expect(v.total).toBe(v.reserved + v.available);
    }
  });

  it("has no negative balances", () => {
    for (const v of VAULTS) {
      expect(v.total).toBeGreaterThanOrEqual(0);
      expect(v.reserved).toBeGreaterThanOrEqual(0);
      expect(v.available).toBeGreaterThanOrEqual(0);
      expect(v.settled).toBeGreaterThanOrEqual(0);
    }
  });

  it("has a unique vault per asset", () => {
    const assets = VAULTS.map((v) => v.asset);
    expect(new Set(assets).size).toBe(assets.length);
  });

  it("reserves exactly the sum of non-terminal settlements' amounts, per asset", () => {
    // A Disputed settlement's escrow stays frozen, not released, until
    // arbitration concludes (OFS-2400 §6) — it still counts as reserved.
    const RELEASED: string[] = ["Completed", "Rejected", "Cancelled"];
    const reservedByAsset = new Map<string, number>();
    for (const s of SETTLEMENTS) {
      if (RELEASED.includes(s.status)) continue;
      reservedByAsset.set(s.asset, (reservedByAsset.get(s.asset) ?? 0) + s.cryptoAmount);
    }
    for (const v of VAULTS) {
      expect(v.reserved).toBe(reservedByAsset.get(v.asset) ?? 0);
    }
  });
});

describe("advertisements", () => {
  it("has unique IDs", () => {
    const ids = ADVERTISEMENTS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves by ID case-insensitively", () => {
    expect(adById("ad-2001")?.id).toBe("AD-2001");
    expect(adById("unknown")).toBeUndefined();
  });

  it("never advertises more Sell-side liquidity, per asset, than the vault holds available", () => {
    // Ch.8, OFS-2100/2200/2300: a merchant cannot sell what they don't hold
    // deposited. Deposit happens before the ad can go live, not after a
    // reservation — this is the single invariant that matters for spec
    // accuracy here.
    const soldByAsset = new Map<string, number>();
    for (const ad of ADVERTISEMENTS) {
      if (ad.direction !== "Sell") continue;
      soldByAsset.set(ad.asset, (soldByAsset.get(ad.asset) ?? 0) + ad.availableLiquidity);
    }
    for (const [asset, sold] of soldByAsset) {
      const vault = vaultForAsset(asset as never);
      expect(vault).toBeDefined();
      expect(sold).toBeLessThanOrEqual(vault!.available);
    }
  });

  it("draws no vault liquidity for Buy ads", () => {
    // The counterparty deposits into a Trade Escrow Vault after acceptance
    // (Ch.8 §8.10) — a Buy ad has nothing pre-funded to check.
    for (const ad of ADVERTISEMENTS) {
      if (ad.direction === "Buy") {
        expect(ad.availableLiquidity).toBe(0);
      }
    }
  });

  it("keeps max trade at or above min trade", () => {
    for (const ad of ADVERTISEMENTS) {
      expect(ad.maxTrade).toBeGreaterThanOrEqual(ad.minTrade);
    }
  });
});

describe("settlements", () => {
  it("has unique IDs", () => {
    const ids = SETTLEMENTS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves by ID case-insensitively", () => {
    expect(settlementById("stl-3001")?.id).toBe("STL-3001");
    expect(settlementById("unknown")).toBeUndefined();
  });

  it("references an advertisement that exists", () => {
    for (const s of SETTLEMENTS) {
      expect(adById(s.adId)).toBeDefined();
    }
  });

  it("carries a dispute record only when status is Disputed, and vice versa", () => {
    for (const s of SETTLEMENTS) {
      if (s.status === "Disputed") {
        expect(s.dispute).toBeDefined();
      } else {
        expect(s.dispute).toBeUndefined();
      }
    }
  });

  it("mentions the 30-minute reservation timeout, not the superseded 20-minute one", () => {
    // OFS-2200 §12/§12a.
    const mentioning = SETTLEMENTS.flatMap((s) => s.events).filter((e) => /min timeout/i.test(e.text));
    expect(mentioning.length).toBeGreaterThan(0);
    for (const e of mentioning) {
      expect(e.text).toMatch(/30 min timeout/);
      expect(e.text).not.toMatch(/20 min/);
    }
  });
});

describe("reservation/settlement state machines", () => {
  it("shares exactly one state — Escrow Locked — as the handoff between Reservation and Settlement", () => {
    // OFS-2200 §18 vs OFS-2300 §20 — Reservation ends at Escrow Locked, and
    // that same state opens Settlement; it's the one deliberate overlap, not
    // an accidental duplication of two otherwise-distinct machines.
    const overlap = RESERVATION_STEPS.filter((s) => (SETTLEMENT_STEPS as readonly string[]).includes(s));
    expect(overlap).toEqual(["Escrow Locked"]);
    expect(SETTLEMENT_STEPS[0]).toBe("Escrow Locked");
    expect(RESERVATION_STEPS[RESERVATION_STEPS.length - 1]).toBe("Escrow Locked");
  });
});

describe("merchant profile", () => {
  it("has a completion rate in range and a positive stake", () => {
    expect(MERCHANT.completionRate).toBeGreaterThan(0);
    expect(MERCHANT.completionRate).toBeLessThanOrEqual(100);
    expect(MERCHANT.stakeOpen).toBeGreaterThan(0);
  });
});

describe("analytics", () => {
  it("keeps every reputation dimension score in 0-100", () => {
    for (const d of REPUTATION_DIMENSIONS) {
      expect(d.score).toBeGreaterThanOrEqual(0);
      expect(d.score).toBeLessThanOrEqual(100);
    }
  });

  it("has a non-empty volume trend with non-negative figures", () => {
    expect(VOLUME_TREND.length).toBeGreaterThan(0);
    for (const p of VOLUME_TREND) {
      expect(p.volumeUsdt).toBeGreaterThanOrEqual(0);
      expect(p.settlements).toBeGreaterThanOrEqual(0);
    }
  });
});
