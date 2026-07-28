import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { nodeById } from "@/lib/data/nodes";
import { formatNumber } from "@/lib/format";
import { Panel } from "@/components/panel";
import { StatusPill } from "@/components/status-pill";

export const metadata: Metadata = { title: "Node" };

export default async function NodeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const node = nodeById(id);
  if (!node) notFound();

  return (
    <section className="max-w-2xl">
      <Link href="/nodes" className="text-sm text-gray-500 hover:text-white">
        ← Back to Nodes
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="font-mono text-sm text-gray-500">{node.id}</span>
        <h1 className="text-xl font-semibold text-white">{node.role}</h1>
        <StatusPill status={node.status} />
      </div>
      <p className="mt-1 text-sm text-gray-500">{node.region}</p>

      <div className="mt-8">
        <Panel title="Details">
          <dl className="divide-y divide-white/5 px-4">
            {[
              ["Role", node.role],
              ["Region", node.region],
              ["Protocol version", node.version],
              ["Latency", node.status === "Offline" ? "—" : `${node.latencyMs} ms`],
              ["Peers", node.status === "Offline" ? "—" : String(node.peers)],
              ["OPEN staked", `${formatNumber(node.stakeOpen, 0)} OPEN`],
            ].map(([label, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 py-3 text-sm">
                <dt className="text-gray-500">{label}</dt>
                <dd className="font-mono tabular-nums text-gray-200">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>
      </div>
    </section>
  );
}
