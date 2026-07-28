import Link from "next/link";
import type { Metadata } from "next";
import { NewAdForm } from "@/components/advertisements/new-ad-form";

export const metadata: Metadata = { title: "New advertisement" };

export default function NewAdPage() {
  return (
    <section className="max-w-2xl">
      <Link href="/advertisements" className="text-sm text-gray-500 hover:text-white">
        ← Back to Advertisements
      </Link>
      <h1 className="mt-3 text-2xl font-semibold text-white">New advertisement</h1>
      <p className="mt-1 text-sm text-gray-400">
        A Sell advertisement can never exceed your Liquidity Vault&apos;s available balance — deposit
        happens before the ad can go live, not after a reservation (Ch.8, OFS-2100/2200/2300).
      </p>
      <div className="mt-8">
        <NewAdForm />
      </div>
    </section>
  );
}
