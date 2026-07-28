"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { nodeById, NODES } from "@/lib/data/nodes";
import { proposalById, PROPOSALS } from "@/lib/data/governance";
import { tradeById, TRADES } from "@/lib/data/trades";

type Hit = { href: string; label: string; kind: "Trade" | "Proposal" | "Node" };

/** Client-side prefix search against local mock data — real once wired to the indexer API. */
export function NetworkSearch() {
  const [query, setQuery] = useState("");

  const hits = useMemo<Hit[]>(() => {
    const q = query.trim().toUpperCase();
    if (q.length < 2) return [];
    const results: Hit[] = [];

    if (tradeById(q)) {
      results.push({ href: `/trades/${q}`, label: `${q} — trade`, kind: "Trade" });
    } else {
      for (const t of TRADES) {
        if (t.id.startsWith(q)) results.push({ href: `/trades/${t.id}`, label: `${t.id} — trade`, kind: "Trade" });
      }
    }

    if (proposalById(q)) {
      results.push({ href: `/governance/${q}`, label: `${q} — proposal`, kind: "Proposal" });
    } else {
      for (const p of PROPOSALS) {
        if (p.id.startsWith(q)) results.push({ href: `/governance/${p.id}`, label: `${p.id} — ${p.title}`, kind: "Proposal" });
      }
    }

    const node = nodeById(q) ?? NODES.find((n) => n.id.toUpperCase() === q);
    if (node) {
      results.push({ href: `/nodes/${node.id}`, label: `${node.id} — ${node.role}`, kind: "Node" });
    } else {
      for (const n of NODES) {
        if (n.id.toUpperCase().startsWith(q)) results.push({ href: `/nodes/${n.id}`, label: `${n.id} — ${n.role}`, kind: "Node" });
      }
    }

    return results.slice(0, 8);
  }, [query]);

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full max-w-xl rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 outline-none focus:border-brand/50"
        placeholder="Search by trade ID, proposal ID, or node ID"
      />
      {query.trim().length >= 2 && (
        <div className="mt-2 max-w-xl overflow-hidden rounded-md border border-white/10">
          {hits.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-500">No matches.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {hits.map((h) => (
                <li key={h.href}>
                  <Link href={h.href} className="flex items-center justify-between gap-4 px-4 py-2.5 text-sm hover:bg-white/[0.03]">
                    <span className="text-gray-200">{h.label}</span>
                    <span className="text-xs text-gray-600">{h.kind}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
