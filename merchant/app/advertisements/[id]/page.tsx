import Link from "next/link";
import { notFound } from "next/navigation";
import { adById } from "@/lib/data/advertisements";
import { SETTLEMENTS } from "@/lib/data/settlements";
import { vaultForAsset } from "@/lib/data/vaults";
import { formatDate, formatFiat, formatNumber } from "@/lib/format";
import { DataTable, Td, Th, Tr } from "@/components/data-table";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";

export default async function AdDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ad = adById(id);
  if (!ad) notFound();

  const vault = vaultForAsset(ad.asset);
  const relatedSettlements = SETTLEMENTS.filter((s) => s.adId === ad.id);

  return (
    <section className="max-w-3xl">
      <Link href="/advertisements" className="text-sm text-gray-500 hover:text-white">
        ← Back to Advertisements
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-gray-500">{ad.id}</span>
        <h1 className={`text-xl font-semibold ${ad.direction === "Sell" ? "text-orange-400" : "text-emerald-400"}`}>
          {ad.direction} {ad.asset} for {ad.fiatCurrency}
        </h1>
        <StatusPill status={ad.status} />
      </div>

      <div className="mt-8 space-y-6">
        <Panel title="Terms">
          <dl className="divide-y divide-white/5 px-4">
            {[
              ["Pricing", ad.pricing.type === "Fixed" ? `Fixed ${formatNumber(ad.pricing.price)} ${ad.fiatCurrency}/${ad.asset}` : `Floating oracle mid ${ad.pricing.premiumPct >= 0 ? "+" : ""}${ad.pricing.premiumPct}%`],
              ["Limits", `${formatFiat(ad.minTrade, ad.fiatCurrency, 0)} – ${formatFiat(ad.maxTrade, ad.fiatCurrency, 0)}`],
              ["Payment methods", ad.paymentMethods.join(" · ")],
              ["Created", formatDate(ad.createdAt)],
              ["Last updated", formatDate(ad.updatedAt)],
            ].map(([label, value]) => (
              <div key={label} className="flex items-start justify-between gap-4 py-3 text-sm">
                <dt className="text-gray-500">{label}</dt>
                <dd className="text-right text-gray-200">{value}</dd>
              </div>
            ))}
          </dl>
          {ad.terms && (
            <p className="border-t border-white/5 px-4 py-3 text-sm leading-relaxed text-gray-400">
              <span className="text-gray-500">Advertiser terms: </span>
              {ad.terms}
            </p>
          )}
        </Panel>

        {ad.direction === "Sell" && vault && (
          <Panel title="Backing liquidity vault">
            <div className="px-4 py-4">
              <p className="text-xs leading-relaxed text-gray-500">
                A Sell advertisement can never exceed its vault&apos;s available balance — the deposit
                happens before the ad can go live, not after a reservation (Ch.8, OFS-2100/2200/2300).
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-gray-500">Vault total</p>
                  <p className="mt-0.5 tabular-nums text-white">{formatNumber(vault.total, 0)} {vault.asset}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Reserved</p>
                  <p className="mt-0.5 tabular-nums text-amber-300">{formatNumber(vault.reserved, 0)} {vault.asset}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Available</p>
                  <p className="mt-0.5 tabular-nums text-emerald-300">{formatNumber(vault.available, 0)} {vault.asset}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">This ad&apos;s liquidity</p>
                  <p className="mt-0.5 tabular-nums text-white">{formatNumber(ad.availableLiquidity, 0)} {vault.asset}</p>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {ad.direction === "Buy" && (
          <Panel title="Escrow funding">
            <p className="px-4 py-4 text-xs leading-relaxed text-gray-500">
              This is a Buy advertisement — there is no pre-funded vault backing it. The counterparty
              selling into it deposits stablecoins into a Trade Escrow Vault only after their
              reservation is accepted (Ch.8 §8.10).
            </p>
          </Panel>
        )}

        <Panel title="Recent reservations against this ad">
          {relatedSettlements.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-gray-500">No settlements yet.</p>
          ) : (
            <DataTable
              minWidth={600}
              head={
                <tr>
                  <Th>Settlement</Th>
                  <Th right>Amount</Th>
                  <Th right>Status</Th>
                </tr>
              }
            >
              {relatedSettlements.map((s) => (
                <Tr key={s.id}>
                  <Td py="py-4">
                    <Link href={`/settlements/${s.id}`} className="font-mono text-xs text-brand-hover hover:underline">
                      {s.id}
                    </Link>
                  </Td>
                  <Td py="py-4" right num className="text-gray-300">
                    {formatNumber(s.cryptoAmount, 2)} {s.asset}
                  </Td>
                  <Td py="py-4" right>
                    <StatusPill status={s.status} />
                  </Td>
                </Tr>
              ))}
            </DataTable>
          )}
        </Panel>

        <div className="flex gap-3">
          <button
            type="button"
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            {ad.status === "Online" ? "Pause advertisement" : "Resume advertisement"}
          </button>
          <button
            type="button"
            className="rounded-md border border-white/15 px-4 py-2 text-sm text-gray-300 hover:bg-white/5"
          >
            Enable vacation mode
          </button>
        </div>
        <p className="text-[11px] text-gray-600">Actions are simulated — nothing is persisted.</p>
      </div>
    </section>
  );
}
