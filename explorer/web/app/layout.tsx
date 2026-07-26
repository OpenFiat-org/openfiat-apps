import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "OpenFiat Explorer", template: "%s · OpenFiat Explorer" },
  description: "Browse OpenFiat trades, governance proposals, and network statistics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-white/10 px-6 py-4">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 text-sm">
            <Link href="/" className="font-semibold text-white">
              OpenFiat Explorer
            </Link>
            <Link href="/trades" className="text-gray-300 hover:text-cyan-400">
              Trades
            </Link>
            <Link href="/governance" className="text-gray-300 hover:text-cyan-400">
              Governance
            </Link>
            <Link href="/stats" className="text-gray-300 hover:text-cyan-400">
              Statistics
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
