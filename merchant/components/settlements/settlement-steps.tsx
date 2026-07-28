import { SETTLEMENT_STEPS, type SettlementStatus } from "@/lib/types";

type Actor = "you" | "counterparty" | "protocol";

interface StageMeta {
  actor: Actor;
  /** From the perspective of the merchant buying crypto (ad direction "Buy"). */
  buyer: string;
  /** From the perspective of the merchant selling crypto (ad direction "Sell"). */
  seller: string;
}

const STAGE: Record<string, StageMeta> = {
  "Escrow Locked": {
    actor: "protocol",
    buyer: "The Solana program locked the crypto. It cannot move until this settlement resolves.",
    seller: "Your crypto is locked in the Solana program, drawn from your Liquidity Vault.",
  },
  "Awaiting Payment": {
    actor: "you",
    buyer: "Send the fiat using the details below, then mark it paid and attach your receipt.",
    seller: "The counterparty sends the fiat. Nothing for you to do until they mark it paid.",
  },
  "Payment Submitted": {
    actor: "counterparty",
    buyer: "You have declared payment. The seller now checks their own account.",
    seller: "The counterparty says they have paid. Check your own account before approving.",
  },
  "Merchant Reviewing": {
    actor: "you",
    buyer: "The seller is verifying the money arrived. If they do not respond, you can open a dispute.",
    seller: "Confirm the money arrived, or reject if it did not.",
  },
  Approved: {
    actor: "protocol",
    buyer: "Receipt confirmed. Release is next and happens automatically.",
    seller: "You confirmed receipt. The program takes it from here.",
  },
  "Escrow Released": {
    actor: "protocol",
    buyer: "The program sent the crypto to your wallet.",
    seller: "The program sent the crypto to the counterparty.",
  },
  Completed: {
    actor: "protocol",
    buyer: "Done. Both reputations have been updated.",
    seller: "Done. Both reputations have been updated.",
  },
};

function actorLabel(actor: Actor, isYou: boolean): string {
  if (actor === "protocol") return "Automatic";
  if (actor === "you") return isYou ? "Your turn" : "Waiting on counterparty";
  return isYou ? "Waiting on counterparty" : "Your turn";
}

export function SettlementSteps({
  status,
  /** True when the merchant's role in this settlement is buying crypto (ad direction "Buy"). */
  buy,
  terminal,
}: {
  status: SettlementStatus;
  buy: boolean;
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
        const meta = STAGE[step];
        const body = buy ? meta.buyer : meta.seller;
        // "you" here always means the merchant; STAGE.actor "you"/"counterparty"
        // is expressed from the buyer's perspective, so it flips when the
        // merchant is the seller.
        const isYouActing = meta.actor === "you" ? buy : meta.actor === "counterparty" ? !buy : false;

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
              <div className="flex flex-wrap items-baseline gap-x-2.5">
                <span
                  className={`text-sm ${
                    current ? "font-semibold text-white" : done ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {step}
                </span>
                {(current || (!done && !current)) && meta.actor !== "protocol" && (
                  <span
                    className={`rounded-full border px-1.5 text-[10px] uppercase tracking-wide ${
                      current
                        ? "border-brand/40 text-brand-hover"
                        : "border-white/10 text-gray-600"
                    }`}
                  >
                    {actorLabel(meta.actor, isYouActing)}
                  </span>
                )}
                {(current || (!done && !current)) && meta.actor === "protocol" && (
                  <span className="rounded-full border border-white/10 px-1.5 text-[10px] uppercase tracking-wide text-gray-600">
                    Automatic
                  </span>
                )}
              </div>
              <p className={`mt-0.5 text-xs leading-relaxed ${current ? "text-gray-300" : "text-gray-500"}`}>
                {body}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
