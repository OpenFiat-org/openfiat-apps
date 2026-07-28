import { RECENT_ACTIVITY } from "@/lib/data/activity";
import { NETWORK_STATS } from "@/lib/data/stats";
import { formatDate } from "@/lib/format";
import { NetworkSearch } from "@/components/search/network-search";
import { Panel } from "@/components/panel";

export default function Home() {
  return (
    <section>
      <h1 className="text-3xl font-bold text-white">Search the OpenFiat network</h1>
      <p className="mt-2 max-w-xl text-gray-400">
        Look up a trade, governance proposal, or node by ID. Simulated against local data until
        this explorer is connected to the indexer API.
      </p>
      <div className="mt-6">
        <NetworkSearch />
      </div>

      <p className="mt-4 text-xs tabular-nums text-gray-600">
        {NETWORK_STATS.nodesOnline} nodes online · block {NETWORK_STATS.blockHeight.toLocaleString()} · epoch{" "}
        {NETWORK_STATS.epoch} · protocol v{NETWORK_STATS.protocolVersion}
      </p>

      <div className="mt-10 max-w-2xl">
        <Panel title="Recent network activity">
          <ul className="divide-y divide-white/5">
            {RECENT_ACTIVITY.map((e, i) => (
              <li key={i} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-xs text-gray-600">{e.type}</span>
                  <span className="shrink-0 text-xs text-gray-600">{formatDate(e.timestamp)}</span>
                </div>
                <p className="mt-1 text-gray-300">{e.summary}</p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </section>
  );
}
