"use client";

import Link from "next/link";
import { useState } from "react";
import type { StablecoinAsset, TradeDirection } from "@/lib/types";
import { VAULTS, vaultForAsset } from "@/lib/data/vaults";
import { formatNumber } from "@/lib/format";

const inputCls =
  "w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm tabular-nums text-white outline-none focus:border-brand/50 [&>option]:bg-[#10151d]";
const labelCls = "mb-1 block text-xs text-gray-500";

/**
 * Single-form advertisement creation, simulated. The one enforced rule that
 * matters for spec accuracy: a Sell ad's liquidity can never exceed the
 * backing vault's available balance (Ch.8, OFS-2100/2200/2300) — everything
 * else here is presentation.
 */
export function NewAdForm() {
  const [direction, setDirection] = useState<TradeDirection>("Sell");
  const [asset, setAsset] = useState<StablecoinAsset>("USDT");
  const [fiat, setFiat] = useState("KES");
  const [pricingType, setPricingType] = useState<"Fixed" | "Floating">("Floating");
  const [price, setPrice] = useState("132.00");
  const [premium, setPremium] = useState("0.8");
  const [min, setMin] = useState("5000");
  const [max, setMax] = useState("100000");
  const [liquidity, setLiquidity] = useState("5000");
  const [published, setPublished] = useState(false);

  const vault = vaultForAsset(asset);
  const vaultAvailable = vault?.available ?? 0;
  const liqNum = Number(liquidity) || 0;
  const minNum = Number(min) || 0;
  const maxNum = Number(max) || 0;

  const liquidityValid = direction === "Buy" || (liqNum > 0 && liqNum <= vaultAvailable);
  const limitsValid = minNum > 0 && maxNum >= minNum;
  const valid = liquidityValid && limitsValid && (pricingType === "Fixed" ? Number(price) > 0 : true);

  if (published) {
    return (
      <div className="border-y border-white/5 py-14 text-center">
        <p className="text-2xl text-emerald-400">✓</p>
        <h2 className="mt-3 text-lg font-semibold text-white">Advertisement published (simulated)</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-400">
          {direction} {asset} for {fiat} — nothing is persisted; on a live node this would emit an
          AdvertisementCreated event (OFS-2100 §23).
        </p>
        <Link
          href="/advertisements"
          className="mt-6 inline-block rounded-md bg-brand px-6 py-2 text-sm font-semibold text-white hover:bg-brand-hover"
        >
          Back to Advertisements
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <p className={labelCls}>Direction</p>
        <div className="grid grid-cols-2 gap-3">
          {(["Sell", "Buy"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                direction === d ? "border-brand/50 bg-brand/10 text-white" : "border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <span className={`font-semibold ${d === "Sell" ? "text-orange-400" : "text-emerald-400"}`}>{d}</span>
              <span className="mt-0.5 block text-xs text-gray-500">
                {d === "Sell" ? "You sell crypto from your vault" : "Counterparty deposits crypto at reservation"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className={labelCls}>Asset</p>
        <div className="flex flex-wrap gap-2">
          {VAULTS.map((v) => (
            <button
              key={v.asset}
              type="button"
              onClick={() => setAsset(v.asset)}
              className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                asset === v.asset ? "border-brand/50 bg-brand/10 text-white" : "border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              {v.asset}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="fiat">Fiat currency</label>
        <input id="fiat" value={fiat} onChange={(e) => setFiat(e.target.value.toUpperCase())} className={inputCls} />
      </div>

      <div>
        <p className={labelCls}>Pricing model</p>
        <div className="grid grid-cols-2 gap-3">
          {(["Floating", "Fixed"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPricingType(p)}
              className={`rounded-md border px-4 py-3 text-left text-sm transition-colors ${
                pricingType === p ? "border-brand/50 bg-brand/10 text-white" : "border-white/10 text-gray-400 hover:text-white"
              }`}
            >
              <span className="font-medium">{p}</span>
              <span className="mt-0.5 block text-xs text-gray-500">
                {p === "Floating" ? "Oracle mid ± your premium" : "One locked price"}
              </span>
            </button>
          ))}
        </div>
        {pricingType === "Fixed" ? (
          <div className="mt-4">
            <label className={labelCls} htmlFor="price">Price ({fiat}/{asset})</label>
            <input id="price" value={price} onChange={(e) => setPrice(e.target.value)} type="number" className={inputCls} />
          </div>
        ) : (
          <div className="mt-4">
            <label className={labelCls} htmlFor="premium">Premium (%)</label>
            <input id="premium" value={premium} onChange={(e) => setPremium(e.target.value)} type="number" step="0.1" className={inputCls} />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="min">Min trade ({fiat})</label>
          <input id="min" value={min} onChange={(e) => setMin(e.target.value)} type="number" className={inputCls} />
        </div>
        <div>
          <label className={labelCls} htmlFor="max">Max trade ({fiat})</label>
          <input id="max" value={max} onChange={(e) => setMax(e.target.value)} type="number" className={inputCls} />
        </div>
      </div>

      {direction === "Sell" && (
        <div>
          <div className="flex items-center justify-between">
            <label className={labelCls} htmlFor="liquidity">Liquidity ({asset})</label>
            <span className="text-xs tabular-nums text-gray-500">
              Vault available {formatNumber(vaultAvailable, 0)} {asset}
            </span>
          </div>
          <input id="liquidity" value={liquidity} onChange={(e) => setLiquidity(e.target.value)} type="number" className={inputCls} />
          {!liquidityValid && (
            <p className="mt-1.5 border-l-2 border-amber-400/50 bg-amber-400/5 px-3 py-1.5 text-xs text-amber-200">
              {liqNum <= 0
                ? "Liquidity must be greater than 0."
                : `Exceeds your ${asset} vault availability (${formatNumber(vaultAvailable, 0)} ${asset}). Deposit more before advertising this much.`}
            </p>
          )}
        </div>
      )}

      {!limitsValid && (
        <p className="border-l-2 border-amber-400/50 bg-amber-400/5 px-3 py-1.5 text-xs text-amber-200">
          Max trade must be ≥ min trade, and both must be greater than 0.
        </p>
      )}

      <div className="flex items-center gap-3 border-t border-white/5 pt-6">
        <button
          type="button"
          onClick={() => valid && setPublished(true)}
          disabled={!valid}
          className="rounded-md bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Publish advertisement
        </button>
        <p className="text-[11px] text-gray-600">Simulated — nothing is persisted.</p>
      </div>
    </div>
  );
}
