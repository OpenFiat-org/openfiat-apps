import Link from "next/link";
import { PROPOSALS } from "@/lib/data/governance";
import { formatNumber } from "@/lib/format";
import { TREASURY } from "@/lib/types";
import { DataTable, Td, Th, Tr } from "@/components/data-table";
import { CategoryBadge } from "@/components/governance/category-badge";
import { VoteStack } from "@/components/governance/vote-bar";
import { MetricStrip } from "@/components/metrics";
import { StatusPill } from "@/components/status-pill";

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Governance</h1>
      <p className="mt-1 text-sm text-gray-400">
        OpenFiat Improvement Proposals (OFIPs) are decided by OPEN-weighted voting; executed
        proposals move the on-chain treasury.
      </p>

      <div className="mt-6">
        <MetricStrip
          items={[
            { label: "Treasury (OPEN)", value: `${formatNumber(TREASURY.openBalance, 0)} OPEN` },
            { label: "Treasury (USDC)", value: `${formatNumber(TREASURY.usdcBalance, 0)} USDC` },
            { label: "Active proposals", value: String(PROPOSALS.filter((p) => p.status === "Active").length) },
          ]}
        />
      </div>

      <div className="mt-6">
        <DataTable
          minWidth={900}
          head={
            <tr>
              <Th>Proposal</Th>
              <Th className="w-28">Category</Th>
              <Th className="w-64">Votes (For / Against / Abstain)</Th>
              <Th className="w-24">Quorum</Th>
              <Th className="w-32">Voting</Th>
              <Th right className="w-24">Status</Th>
            </tr>
          }
        >
          {PROPOSALS.map((p) => (
            <Tr key={p.id}>
              <Td py="py-5">
                <Link href={`/governance/${p.id}`} className="group">
                  <span className="mr-2 font-mono text-xs text-gray-500">{p.id}</span>
                  <span className="font-medium text-white group-hover:text-brand-hover">{p.title}</span>
                </Link>
              </Td>
              <Td py="py-5" className="w-28">
                <CategoryBadge category={p.category} />
              </Td>
              <Td py="py-5" className="w-64">
                <VoteStack proposal={p} />
              </Td>
              <Td py="py-5" className="w-24 text-xs tabular-nums text-gray-500">
                {p.turnoutPct}% / {p.quorumPct}%
                {p.turnoutPct >= p.quorumPct && <span className="text-emerald-400"> ✓</span>}
              </Td>
              <Td py="py-5" className="w-32 text-xs text-gray-500">{p.votingEnds}</Td>
              <Td py="py-5" right className="w-24"><StatusPill status={p.status} /></Td>
            </Tr>
          ))}
        </DataTable>
      </div>
    </section>
  );
}
