import Link from "next/link";
import { TRADES } from "@/lib/data/trades";
import { formatDate, formatFiat, formatNumber } from "@/lib/format";
import { DataTable, Td, Th, Tr } from "@/components/data-table";
import { StatusPill } from "@/components/status-pill";

export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Trades</h1>
      <p className="mt-1 text-sm text-gray-400">Browse recent OpenFiat trades.</p>

      <div className="mt-6">
        <DataTable
          minWidth={800}
          head={
            <tr>
              <Th>Trade</Th>
              <Th>Merchant</Th>
              <Th>Buyer</Th>
              <Th right>Amount</Th>
              <Th>Created</Th>
              <Th right>Status</Th>
            </tr>
          }
        >
          {TRADES.map((t) => (
            <Tr key={t.id}>
              <Td py="py-4">
                <Link href={`/trades/${t.id}`} className="font-mono text-xs text-brand-hover hover:underline">
                  {t.id}
                </Link>
              </Td>
              <Td py="py-4" className="font-mono text-xs text-gray-400">{t.merchant}</Td>
              <Td py="py-4" className="font-mono text-xs text-gray-400">{t.buyer}</Td>
              <Td py="py-4" right num className="text-gray-300">
                {formatNumber(t.cryptoAmount, 2)} {t.asset} · {formatFiat(t.fiatAmount, t.fiatCurrency, 0)}
              </Td>
              <Td py="py-4" className="text-xs text-gray-500">{formatDate(t.createdAt)}</Td>
              <Td py="py-4" right>
                <StatusPill status={t.status} />
              </Td>
            </Tr>
          ))}
        </DataTable>
      </div>
    </section>
  );
}
