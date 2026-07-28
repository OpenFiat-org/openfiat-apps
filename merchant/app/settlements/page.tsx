import Link from "next/link";
import { SETTLEMENTS } from "@/lib/data/settlements";
import { formatDate, formatFiat, formatNumber } from "@/lib/format";
import { DataTable, Td, Th, Tr } from "@/components/data-table";
import { StatusPill } from "@/components/status-pill";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filtered = status ? SETTLEMENTS.filter((s) => s.status === status) : SETTLEMENTS;

  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Settlements</h1>
      <p className="mt-1 text-sm text-gray-400">Track trade settlements and their on-chain status.</p>

      {status && (
        <p className="mt-4 text-xs text-gray-500">
          Filtered to <StatusPill status={status} /> ·{" "}
          <Link href="/settlements" className="text-brand-hover hover:underline">
            Clear filter
          </Link>
        </p>
      )}

      <div className="mt-6">
        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-gray-500">
            No settlements match this filter.
          </div>
        ) : (
          <DataTable
            minWidth={800}
            head={
              <tr>
                <Th>Settlement</Th>
                <Th>Counterparty</Th>
                <Th right>Amount</Th>
                <Th>Created</Th>
                <Th right>Status</Th>
              </tr>
            }
          >
            {filtered.map((s) => (
              <Tr key={s.id}>
                <Td py="py-4">
                  <Link href={`/settlements/${s.id}`} className="group">
                    <span className="mr-2 font-mono text-xs text-gray-500">{s.id}</span>
                    <span className="font-medium text-white group-hover:text-brand-hover">
                      {s.direction} {s.asset}
                    </span>
                  </Link>
                </Td>
                <Td py="py-4" className="font-mono text-xs text-gray-400">{s.counterparty}</Td>
                <Td py="py-4" right num className="text-gray-300">
                  {formatNumber(s.cryptoAmount, 2)} {s.asset} · {formatFiat(s.fiatAmount, s.fiatCurrency, 0)}
                </Td>
                <Td py="py-4" className="text-xs text-gray-500">{formatDate(s.createdAt)}</Td>
                <Td py="py-4" right>
                  <StatusPill status={s.status} />
                </Td>
              </Tr>
            ))}
          </DataTable>
        )}
      </div>
    </section>
  );
}
