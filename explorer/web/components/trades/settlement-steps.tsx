import { SETTLEMENT_STEPS, type SettlementStatus } from "@/lib/types";

/** Neutral, third-party phrasing — a public explorer observes a trade between two other parties, it isn't one of them. */
const STAGE: Record<string, string> = {
  "Escrow Locked": "The Solana program locked the crypto from the merchant's Liquidity Vault. It cannot move until this settlement resolves.",
  "Awaiting Payment": "The buyer sends fiat off-chain. Nothing on-chain happens until they mark it paid.",
  "Payment Submitted": "The buyer declared payment. The merchant now checks their own account.",
  "Merchant Reviewing": "The merchant is verifying the payment arrived, or has requested more information.",
  Approved: "The merchant confirmed receipt. Escrow release is automatic and next.",
  "Escrow Released": "The program released the crypto to the buyer's wallet.",
  Completed: "Settlement finished. Both parties' reputations were updated.",
};

export function SettlementSteps({
  status,
  terminal,
}: {
  status: SettlementStatus;
  /** Rejected, Cancelled or Disputed — the happy path stopped. */
  terminal: boolean;
}) {
  const stepIndex = SETTLEMENT_STEPS.indexOf(status);
  const complete = status === "Completed";

  return (
    <ol className="mt-5 divide-y divide-white/5 border-t border-white/5">
      {SETTLEMENT_STEPS.map((step, i) => {
        const done = complete || i < stepIndex;
        const current = !complete && !terminal && i === stepIndex;

        return (
          <li key={step} className={`flex gap-3 px-1 py-3 ${current ? "bg-brand/[0.04]" : ""}`}>
            <span
              aria-hidden
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold ${
                done
                  ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300"
                  : current
                    ? "border-brand bg-brand/20 text-brand-hover"
                    : "border-white/15 text-gray-600"
              }`}
            >
              {done ? "✓" : i + 1}
            </span>
            <div className="min-w-0 flex-1">
              <span
                className={`text-sm ${current ? "font-semibold text-white" : done ? "text-gray-300" : "text-gray-600"}`}
              >
                {step}
              </span>
              <p className={`mt-0.5 text-xs leading-relaxed ${current ? "text-gray-300" : "text-gray-500"}`}>
                {STAGE[step]}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
