import { DISPUTE_STAGES, type SettlementDispute } from "@/lib/types";
import { StatusPill } from "@/components/status-pill";

/**
 * Inline dispute case summary shown on a settlement page when its status is
 * Disputed (OFS-2400 / Chapter 11's decentralized commit-reveal model).
 * Deliberately compact — a merchant checking a settlement's status needs to
 * know where the case stands, not the full evidence/arbitrator-seat detail
 * a dedicated dispute view would carry.
 */
export function DisputeSummary({ dispute }: { dispute: SettlementDispute }) {
  const stageIndex = DISPUTE_STAGES.indexOf(dispute.stage);

  return (
    <div className="border-t border-white/5 px-1 py-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-600">Dispute</span>
        <span className="font-mono text-xs text-gray-500">{dispute.id}</span>
        <StatusPill status={dispute.outcome ?? dispute.stage} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-gray-400">
        Escrow is frozen until arbitration concludes — neither party can release or reclaim funds
        unilaterally (OFS-2400 §6).
      </p>
      <div className="mt-3 flex flex-wrap gap-x-1 gap-y-1.5 text-[11px] text-gray-600">
        {DISPUTE_STAGES.map((stage, i) => (
          <span key={stage} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>→</span>}
            <span className={i <= stageIndex ? "text-gray-300" : "text-gray-700"}>{stage}</span>
          </span>
        ))}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <div>
          <dt className="text-gray-600">Arbitrators joined</dt>
          <dd className="mt-0.5 tabular-nums text-gray-300">{dispute.arbitratorsJoined}</dd>
        </div>
        <div>
          <dt className="text-gray-600">Seats required</dt>
          <dd className="mt-0.5 tabular-nums text-gray-300">
            {dispute.seatsRequired === null ? "Withheld until case locks" : dispute.seatsRequired}
          </dd>
        </div>
        <div>
          <dt className="text-gray-600">Outcome</dt>
          <dd className="mt-0.5 text-gray-300">{dispute.outcome ?? "Pending"}</dd>
        </div>
      </dl>
    </div>
  );
}
