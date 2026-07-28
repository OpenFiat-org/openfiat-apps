import Link from "next/link";
import { notFound } from "next/navigation";
import { adById } from "@/lib/data/advertisements";
import { settlementById } from "@/lib/data/settlements";
import { formatDate, formatFiat, formatNumber, shortSig } from "@/lib/format";
import { DisputeSummary } from "@/components/settlements/dispute-summary";
import { ReservationSteps } from "@/components/settlements/reservation-steps";
import { SettlementSteps } from "@/components/settlements/settlement-steps";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";

const TERMINAL: string[] = ["Rejected", "Cancelled", "Disputed"];

export default async function SettlementDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const settlement = settlementById(id);
  if (!settlement) notFound();

  const ad = adById(settlement.adId);
  const terminal = TERMINAL.includes(settlement.status);
  // Merchant's role in the crypto leg: "Buy" ad direction means the merchant
  // is buying crypto (paying fiat), same semantics as SettlementSteps' `buy`.
  const buy = ad?.direction === "Buy";

  return (
    <section className="max-w-3xl">
      <Link href="/settlements" className="text-sm text-gray-500 hover:text-white">
        ← Back to Settlements
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-gray-500">{settlement.id}</span>
        <h1 className="text-xl font-semibold text-white">
          {settlement.direction} {formatNumber(settlement.cryptoAmount, 2)} {settlement.asset}
        </h1>
        <StatusPill status={settlement.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">
        {formatDate(settlement.createdAt)} · {settlement.counterparty}
      </p>

      <div className="mt-8 space-y-6">
        <Panel title="Settlement progress">
          <div className="px-1">
            <ReservationSteps />
            <SettlementSteps status={settlement.status} buy={buy} terminal={terminal} />
            {settlement.dispute && <DisputeSummary dispute={settlement.dispute} />}
          </div>
        </Panel>

        <Panel title="Payment details">
          <dl className="divide-y divide-white/5 px-4">
            {settlement.paymentFields.map((f) => (
              <div key={f.label} className="flex items-start justify-between gap-4 py-3 text-sm">
                <dt className="text-gray-500">{f.label}</dt>
                <dd className="font-mono text-gray-200">{f.value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Trade session">
          <ul className="space-y-3 px-4 py-4">
            {settlement.events.map((e, i) => (
              <li key={i} className="flex gap-3 text-sm">
                <span className="w-12 shrink-0 font-mono text-xs text-gray-600">{e.time}</span>
                <span className="min-w-0 flex-1">
                  {e.kind === "event" ? (
                    <>
                      <span className="font-mono text-xs text-gray-500">{e.actor}</span>{" "}
                      <span className="text-gray-300">{e.text}</span>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-white">{e.actor}</span>{" "}
                      <span className="text-gray-300">{e.text}</span>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Summary">
          <dl className="divide-y divide-white/5 px-4">
            {[
              ["Advertisement", ad ? ad.id : settlement.adId],
              ["Amount", `${formatNumber(settlement.cryptoAmount, 2)} ${settlement.asset}`],
              ["Fiat total", formatFiat(settlement.fiatAmount, settlement.fiatCurrency, 2)],
              ["Price", `${formatNumber(settlement.price)} ${settlement.fiatCurrency}/${settlement.asset}`],
              ["Payment method", settlement.paymentMethod],
              ["Escrow signature", settlement.escrowSig ? shortSig(settlement.escrowSig) : "—"],
              ["Settlement signature", settlement.txSig ? shortSig(settlement.txSig) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-3 text-sm">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-right font-mono text-gray-200">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </section>
  );
}
