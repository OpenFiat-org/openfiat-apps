import Link from "next/link";
import { MERCHANT } from "@/lib/data/merchant";
import { ADVERTISEMENTS } from "@/lib/data/advertisements";
import { SETTLEMENTS } from "@/lib/data/settlements";
import { VAULTS } from "@/lib/data/vaults";
import { formatNumber } from "@/lib/format";
import { MetricStrip } from "@/components/metrics";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";

export default function OverviewPage() {
  const openAds = ADVERTISEMENTS.filter((a) => a.status === "Online").length;
  const pendingSettlements = SETTLEMENTS.filter(
    (s) => !["Completed", "Rejected", "Cancelled"].includes(s.status),
  ).length;
  const openDisputes = SETTLEMENTS.filter((s) => s.status === "Disputed").length;
  const recent = [...SETTLEMENTS]
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, 5);

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Overview</h1>
          <p className="mt-1 text-sm text-gray-400">
            {MERCHANT.name} · {MERCHANT.tier} tier · {MERCHANT.availability}
          </p>
        </div>
        <Link
          href="/advertisements/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          New advertisement
        </Link>
      </div>

      <div className="mt-6">
        <MetricStrip
          items={[
            { label: "Completion rate", value: `${MERCHANT.completionRate}%`, sub: `${MERCHANT.orders.toLocaleString()} orders` },
            { label: "Avg response", value: MERCHANT.avgResponseTime },
            { label: "OPEN staked", value: `${formatNumber(MERCHANT.stakeOpen, 0)} OPEN`, sub: "bond + delegation" },
            { label: "Identity level", value: MERCHANT.identityLevel },
          ]}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          href="/advertisements"
          className="rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
        >
          <p className="text-sm text-gray-400">Open advertisements</p>
          <p className="mt-2 text-3xl font-semibold text-white">{openAds}</p>
        </Link>
        <Link
          href="/settlements"
          className="rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
        >
          <p className="text-sm text-gray-400">Pending settlements</p>
          <p className="mt-2 text-3xl font-semibold text-white">{pendingSettlements}</p>
        </Link>
        <Link
          href="/settlements?status=Disputed"
          className="rounded-lg border border-white/10 bg-white/5 p-6 transition-colors hover:border-white/20"
        >
          <p className="text-sm text-gray-400">Open disputes</p>
          <p className={`mt-2 text-3xl font-semibold ${openDisputes > 0 ? "text-red-300" : "text-white"}`}>
            {openDisputes}
          </p>
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Recent settlements">
          <ul className="divide-y divide-white/5">
            {recent.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/settlements/${s.id}`}
                  className="flex items-center justify-between gap-4 px-4 py-3 text-sm hover:bg-white/[0.03]"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="font-mono text-xs text-gray-500">{s.id}</span>
                    <span className="text-gray-300">
                      {s.direction} {formatNumber(s.cryptoAmount, 2)} {s.asset}
                    </span>
                  </span>
                  <StatusPill status={s.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Liquidity vaults">
          <ul className="divide-y divide-white/5">
            {VAULTS.map((v) => (
              <li key={v.asset} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-white">{v.asset}</span>
                  <span className="tabular-nums text-gray-400">
                    {formatNumber(v.available, 0)} / {formatNumber(v.total, 0)} available
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-brand to-brand-teal"
                    style={{ width: `${v.total > 0 ? (v.available / v.total) * 100 : 0}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
