import { describe, expect, it } from "vitest";
import { CATEGORY_RULES, PROPOSAL_STAKE_DEPOSIT_OPEN } from "@/lib/governance";
import { proposalById, PROPOSALS } from "@/lib/data/governance";
import { nodeById, NODES } from "@/lib/data/nodes";
import { NETWORK_STATS } from "@/lib/data/stats";
import { tradeById, TRADES } from "@/lib/data/trades";
import { RESERVATION_STEPS, SETTLEMENT_STEPS } from "@/lib/types";

describe("sanity", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});

describe("trades", () => {
  it("has unique IDs", () => {
    const ids = TRADES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves by ID case-insensitively", () => {
    expect(tradeById("trd-7001")?.id).toBe("TRD-7001");
    expect(tradeById("unknown")).toBeUndefined();
  });

  it("mentions the 30-minute reservation timeout, not the superseded 20-minute one", () => {
    // OFS-2200 §12/§12a.
    const mentioning = TRADES.flatMap((t) => t.events).filter((e) => /min timeout/i.test(e.summary));
    expect(mentioning.length).toBeGreaterThan(0);
    for (const e of mentioning) {
      expect(e.summary).toMatch(/30 min timeout/);
      expect(e.summary).not.toMatch(/20 min/);
    }
  });

  it("shows only truncated wallets, never a full 44-character address", () => {
    // A public explorer discloses no more identity than an advertisement
    // already does — full addresses would be a strictly bigger disclosure.
    for (const t of TRADES) {
      expect(t.merchant).toMatch(/^\w{4}…\w{4}$/);
      expect(t.buyer).toMatch(/^\w{4}…\w{4}$/);
    }
  });
});

describe("governance", () => {
  it("vote percentages sum to 100", () => {
    for (const p of PROPOSALS) {
      expect(p.votesFor + p.votesAgainst + p.votesAbstain).toBe(100);
    }
  });

  it("uses the OFIP identifier, not the superseded OFP one", () => {
    for (const p of PROPOSALS) {
      expect(p.id).toMatch(/^OFIP-\d{4}$/);
    }
  });

  it("resolves by ID case-insensitively", () => {
    expect(proposalById("ofip-0021")?.id).toBe("OFIP-0021");
    expect(proposalById("unknown")).toBeUndefined();
  });

  it("derives quorum and approval threshold from category, not per-proposal", () => {
    for (const p of PROPOSALS) {
      const rule = CATEGORY_RULES[p.category];
      expect(p.quorumPct).toBe(rule.quorumPct);
      expect(p.approvalThresholdPct).toBe(rule.approvalThresholdPct);
    }
  });

  it("requires a higher bar for Protocol-Upgrade and Constitutional proposals", () => {
    for (const category of ["Protocol-Upgrade", "Constitutional"] as const) {
      expect(CATEGORY_RULES[category].quorumPct).toBe(20);
      expect(CATEGORY_RULES[category].approvalThresholdPct).toBe(66);
    }
    expect(CATEGORY_RULES.Treasury.quorumPct).toBe(10);
    expect(CATEGORY_RULES.Treasury.approvalThresholdPct).toBe(60);
  });

  it("posts the same stake deposit for every proposal", () => {
    expect(PROPOSAL_STAKE_DEPOSIT_OPEN).toBe(5000);
    for (const p of PROPOSALS) {
      expect(p.depositOpen).toBe(PROPOSAL_STAKE_DEPOSIT_OPEN);
    }
  });

  it("refunds the deposit exactly when quorum was met, regardless of outcome", () => {
    for (const p of PROPOSALS) {
      if (p.status === "Active") {
        expect(p.depositRefunded).toBeNull();
      } else {
        expect(p.depositRefunded).toBe(p.turnoutPct >= p.quorumPct);
      }
    }
    const rejectedButQuorate = PROPOSALS.find((p) => p.id === "OFIP-0016");
    expect(rejectedButQuorate?.status).toBe("Rejected");
    expect(rejectedButQuorate?.depositRefunded).toBe(true);
  });
});

describe("reservation/settlement state machines", () => {
  it("shares exactly one state — Escrow Locked — as the handoff between Reservation and Settlement", () => {
    // OFS-2200 §18 vs OFS-2300 §20.
    const overlap = RESERVATION_STEPS.filter((s) => (SETTLEMENT_STEPS as readonly string[]).includes(s));
    expect(overlap).toEqual(["Escrow Locked"]);
    expect(SETTLEMENT_STEPS[0]).toBe("Escrow Locked");
    expect(RESERVATION_STEPS[RESERVATION_STEPS.length - 1]).toBe("Escrow Locked");
  });
});

describe("nodes", () => {
  it("has unique IDs", () => {
    const ids = NODES.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("resolves by exact ID", () => {
    expect(nodeById(NODES[0].id)?.id).toBe(NODES[0].id);
    expect(nodeById("unknown")).toBeUndefined();
  });

  it("shows no latency or peers for an Offline node", () => {
    for (const n of NODES) {
      if (n.status === "Offline") {
        expect(n.latencyMs).toBe(0);
        expect(n.peers).toBe(0);
      }
    }
  });

  it("keeps NETWORK_STATS.nodesOnline in sync with the actual node list", () => {
    const online = NODES.filter((n) => n.status === "Online").length;
    expect(NETWORK_STATS.nodesOnline).toBe(online);
  });
});
