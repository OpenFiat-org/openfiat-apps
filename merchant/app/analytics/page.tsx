import { REPUTATION_DIMENSIONS, DISPUTE_RATE_PCT, SETTLEMENT_SUCCESS_RATE_PCT, VOLUME_TREND } from "@/lib/data/analytics";
import { MERCHANT } from "@/lib/data/merchant";
import { formatNumber } from "@/lib/format";
import { MetricStrip } from "@/components/metrics";
import { Panel } from "@/components/panel";

export default function Page() {
  const maxVolume = Math.max(...VOLUME_TREND.map((p) => p.volumeUsdt));

  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Analytics</h1>
      <p className="mt-1 text-sm text-gray-400">Volume, conversion, and reputation trends.</p>

      <div className="mt-6">
        <MetricStrip
          items={[
            { label: "Settlement success rate", value: `${SETTLEMENT_SUCCESS_RATE_PCT}%` },
            { label: "Dispute rate", value: `${DISPUTE_RATE_PCT}%` },
            { label: "Tier", value: MERCHANT.tier, sub: `${MERCHANT.progressToNextTierPct}% to ${MERCHANT.nextTier}` },
          ]}
        />
      </div>

      <div className="mt-8">
        <Panel title="Weekly volume (USDT-equivalent)">
          <div className="flex items-end gap-3 px-4 py-6" style={{ height: 160 }}>
            {VOLUME_TREND.map((p) => (
              <div key={p.label} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className="w-full rounded-t-sm bg-gradient-to-t from-brand to-brand-teal"
                  style={{ height: `${(p.volumeUsdt / maxVolume) * 120}px` }}
                  title={`${formatNumber(p.volumeUsdt, 0)} USDT · ${p.settlements} settlements`}
                />
                <span className="text-[11px] text-gray-500">{p.label}</span>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Reputation breakdown (OFS-3000)">
          <ul className="divide-y divide-white/5">
            {REPUTATION_DIMENSIONS.map((d) => (
              <li key={d.label} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
                <span className="text-gray-400">{d.label}</span>
                <span className="flex items-center gap-3">
                  <span className="h-1.5 w-32 overflow-hidden rounded-full bg-white/10">
                    <span className="block h-full bg-gradient-to-r from-brand to-brand-teal" style={{ width: `${d.score}%` }} />
                  </span>
                  <span className="w-28 text-right tabular-nums text-gray-300">{d.display}</span>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
