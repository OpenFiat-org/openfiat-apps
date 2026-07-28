import Link from "next/link";
import { notFound } from "next/navigation";
import { tradeById } from "@/lib/data/trades";
import { formatDate, formatFiat, formatNumber, shortSig } from "@/lib/format";
import { ReservationSteps } from "@/components/trades/reservation-steps";
import { SettlementSteps } from "@/components/trades/settlement-steps";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";

const TERMINAL: string[] = ["Rejected", "Cancelled", "Disputed"];

export default async function TradeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trade = tradeById(id);
  if (!trade) notFound();

  const terminal = TERMINAL.includes(trade.status);

  return (
    <section className="max-w-3xl">
      <Link href="/trades" className="text-sm text-gray-500 hover:text-white">
        ← Back to Trades
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-gray-500">{trade.id}</span>
        <h1 className="text-xl font-semibold text-white">
          {formatNumber(trade.cryptoAmount, 2)} {trade.asset} for {formatFiat(trade.fiatAmount, trade.fiatCurrency, 0)}
        </h1>
        <StatusPill status={trade.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">{formatDate(trade.createdAt)}</p>

      <div className="mt-8 space-y-6">
        <Panel title="Settlement progress">
          <div className="px-1">
            <ReservationSteps />
            <SettlementSteps status={trade.status} terminal={terminal} />
          </div>
        </Panel>

        <Panel title="Network events">
          <ul className="space-y-3 px-4 py-4 text-sm">
            {trade.events.map((e, i) => (
              <li key={i}>
                <span className="font-mono text-xs text-gray-600">{e.type}</span>
                <p className="mt-0.5 text-gray-300">{e.summary}</p>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Summary">
          <dl className="divide-y divide-white/5 px-4">
            {[
              ["Merchant", trade.merchant],
              ["Buyer", trade.buyer],
              ["Amount", `${formatNumber(trade.cryptoAmount, 2)} ${trade.asset}`],
              ["Fiat total", formatFiat(trade.fiatAmount, trade.fiatCurrency, 2)],
              ["Price", `${formatNumber(trade.price)} ${trade.fiatCurrency}/${trade.asset}`],
              ["Escrow signature", trade.escrowSig ? shortSig(trade.escrowSig) : "—"],
              ["Settlement signature", trade.settlementSig ? shortSig(trade.settlementSig) : "—"],
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
