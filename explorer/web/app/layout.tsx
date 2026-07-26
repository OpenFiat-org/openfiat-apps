import type { Metadata } from "next";
import "./globals.css";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "OpenFiat Explorer", template: "%s · OpenFiat Explorer" },
  description: "Browse OpenFiat trades, governance proposals, and network statistics.",
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <header className="border-b border-white/10 px-6 py-4">
          <nav className="mx-auto flex max-w-6xl items-center gap-6 text-sm">
            <Link href="/" className="flex items-center gap-2 font-semibold text-white">
              <Image src="/logo.png" alt="" width={24} height={24} priority />
              OpenFiat Explorer
            </Link>
            <Link href="/trades" className="text-gray-300 hover:text-brand-hover">
              Trades
            </Link>
            <Link href="/governance" className="text-gray-300 hover:text-brand-hover">
              Governance
            </Link>
            <Link href="/stats" className="text-gray-300 hover:text-brand-hover">
              Statistics
            </Link>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
