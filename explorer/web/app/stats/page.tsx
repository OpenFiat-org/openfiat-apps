import {
  ACTIVE_MERCHANTS,
  DISPUTE_RATE_PCT,
  GOVERNANCE_PARTICIPATION_PCT,
  NETWORK_STATS,
  OPEN_CIRCULATING,
  OPEN_STAKED,
  OPEN_TOTAL_SUPPLY,
  REGION_STATS,
  TOTAL_VALUE_LOCKED_USDT,
  TRADES_24H,
  VOLUME_24H_USDT,
  VOLUME_30D_USDT,
  VOLUME_7D_USDT,
} from "@/lib/data/stats";
import { formatNumber } from "@/lib/format";
import { DataTable, Td, Th, Tr } from "@/components/data-table";
import { MetricStrip } from "@/components/metrics";
import { Panel } from "@/components/panel";

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Statistics</h1>
      <p className="mt-1 text-sm text-gray-400">Network-wide statistics.</p>

      <div className="mt-6">
        <MetricStrip
          items={[
            { label: "Volume (24h)", value: `${formatNumber(VOLUME_24H_USDT, 0)} USDT` },
            { label: "Volume (7d)", value: `${formatNumber(VOLUME_7D_USDT, 0)} USDT` },
            { label: "Volume (30d)", value: `${formatNumber(VOLUME_30D_USDT, 0)} USDT` },
            { label: "Trades (24h)", value: String(TRADES_24H) },
            { label: "Active merchants", value: String(ACTIVE_MERCHANTS) },
            { label: "Dispute rate", value: `${DISPUTE_RATE_PCT}%` },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Panel title="Network">
          <dl className="divide-y divide-white/5 px-4">
            {[
              ["Nodes online", String(NETWORK_STATS.nodesOnline)],
              ["Peer connections", NETWORK_STATS.peers.toLocaleString()],
              ["Block height", NETWORK_STATS.blockHeight.toLocaleString()],
              ["Epoch", String(NETWORK_STATS.epoch)],
              ["Protocol version", `v${NETWORK_STATS.protocolVersion}`],
              ["Total value locked", `${formatNumber(TOTAL_VALUE_LOCKED_USDT, 0)} USDT-equivalent`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-mono tabular-nums text-gray-200">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="OPEN token (OFS-4100)">
          <dl className="divide-y divide-white/5 px-4">
            {[
              ["Total supply", `${formatNumber(OPEN_TOTAL_SUPPLY, 0)} OPEN`],
              ["Circulating", `${formatNumber(OPEN_CIRCULATING, 0)} OPEN`],
              ["Staked", `${formatNumber(OPEN_STAKED, 0)} OPEN`],
              ["Governance participation", `${GOVERNANCE_PARTICIPATION_PCT}%`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-mono tabular-nums text-gray-200">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="By region">
          <DataTable
            minWidth={600}
            head={
              <tr>
                <Th>Region</Th>
                <Th right>Merchants</Th>
                <Th right>Volume (24h)</Th>
              </tr>
            }
          >
            {REGION_STATS.map((r) => (
              <Tr key={r.region}>
                <Td py="py-4" className="text-gray-300">{r.region}</Td>
                <Td py="py-4" right num className="text-gray-300">{r.merchants}</Td>
                <Td py="py-4" right num className="text-gray-300">{formatNumber(r.volume24hUsdt, 0)} USDT</Td>
              </Tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </section>
  );
}
