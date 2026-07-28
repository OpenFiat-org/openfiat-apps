import Link from "next/link";
import { ADVERTISEMENTS } from "@/lib/data/advertisements";
import { vaultForAsset } from "@/lib/data/vaults";
import { formatFiat, formatNumber } from "@/lib/format";
import { DataTable, Td, Th, Tr } from "@/components/data-table";
import { StatusPill } from "@/components/status-pill";

function priceLabel(ad: (typeof ADVERTISEMENTS)[number]): string {
  return ad.pricing.type === "Fixed"
    ? `Fixed ${formatNumber(ad.pricing.price)}`
    : `Floating ${ad.pricing.premiumPct >= 0 ? "+" : ""}${ad.pricing.premiumPct}%`;
}

export default function Page() {
  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Advertisements</h1>
          <p className="mt-1 text-sm text-gray-400">Manage published advertisements.</p>
        </div>
        <Link
          href="/advertisements/new"
          className="rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          New advertisement
        </Link>
      </div>

      <div className="mt-6">
        <DataTable
          minWidth={800}
          head={
            <tr>
              <Th>Advertisement</Th>
              <Th>Market</Th>
              <Th>Pricing</Th>
              <Th right>Liquidity</Th>
              <Th right>Status</Th>
            </tr>
          }
        >
          {ADVERTISEMENTS.map((ad) => {
            const vault = vaultForAsset(ad.asset);
            return (
              <Tr key={ad.id}>
                <Td py="py-5">
                  <Link href={`/advertisements/${ad.id}`} className="group">
                    <span className="mr-2 font-mono text-xs text-gray-500">{ad.id}</span>
                    <span
                      className={`font-medium group-hover:text-brand-hover ${
                        ad.direction === "Sell" ? "text-orange-400" : "text-emerald-400"
                      }`}
                    >
                      {ad.direction}
                    </span>
                  </Link>
                </Td>
                <Td py="py-5" className="text-gray-300">
                  {ad.asset}/{ad.fiatCurrency}
                </Td>
                <Td py="py-5" className="text-gray-400">
                  {priceLabel(ad)}
                </Td>
                <Td py="py-5" right num className="text-gray-300">
                  {ad.direction === "Sell"
                    ? `${formatNumber(ad.availableLiquidity, 0)} ${ad.asset}`
                    : `${formatFiat(ad.maxTrade, ad.fiatCurrency, 0)} cap`}
                  {ad.direction === "Sell" && vault && (
                    <span className="ml-1.5 text-[11px] text-gray-600">
                      / {formatNumber(vault.available, 0)} vault
                    </span>
                  )}
                </Td>
                <Td py="py-5" right>
                  <StatusPill status={ad.status} />
                </Td>
              </Tr>
            );
          })}
        </DataTable>
      </div>
    </section>
  );
}
