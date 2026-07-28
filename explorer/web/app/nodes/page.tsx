import type { Metadata } from "next";
import Link from "next/link";
import { NODES } from "@/lib/data/nodes";
import { formatNumber } from "@/lib/format";
import { DataTable, Td, Th, Tr } from "@/components/data-table";
import { MetricStrip } from "@/components/metrics";
import { StatusPill } from "@/components/status-pill";

export const metadata: Metadata = {
  title: "Nodes",
  description: "OpenFiat network node registry — role, region, status, and stake.",
};

export default function Page() {
  const online = NODES.filter((n) => n.status === "Online").length;

  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Nodes</h1>
      <p className="mt-1 text-sm text-gray-400">
        Network node registry (OFS-1000 series) — role, region, status, and OPEN stake.
      </p>

      <div className="mt-6">
        <MetricStrip
          items={[
            { label: "Nodes online", value: `${online} / ${NODES.length}` },
            { label: "Total stake", value: `${formatNumber(NODES.reduce((s, n) => s + n.stakeOpen, 0), 0)} OPEN` },
            { label: "Total peers", value: String(NODES.reduce((s, n) => s + n.peers, 0)) },
          ]}
        />
      </div>

      <div className="mt-6">
        <DataTable
          minWidth={800}
          head={
            <tr>
              <Th>Node</Th>
              <Th>Role</Th>
              <Th>Region</Th>
              <Th right>Latency</Th>
              <Th right>Stake</Th>
              <Th right>Status</Th>
            </tr>
          }
        >
          {NODES.map((n) => (
            <Tr key={n.id}>
              <Td py="py-4">
                <Link href={`/nodes/${n.id}`} className="font-mono text-xs text-brand-hover hover:underline">
                  {n.id}
                </Link>
              </Td>
              <Td py="py-4" className="text-gray-300">{n.role}</Td>
              <Td py="py-4" className="text-gray-400">{n.region}</Td>
              <Td py="py-4" right num className="text-gray-400">
                {n.status === "Offline" ? "—" : `${n.latencyMs} ms`}
              </Td>
              <Td py="py-4" right num className="text-gray-300">{formatNumber(n.stakeOpen, 0)} OPEN</Td>
              <Td py="py-4" right>
                <StatusPill status={n.status} />
              </Td>
            </Tr>
          ))}
        </DataTable>
      </div>
    </section>
  );
}
