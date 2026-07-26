import Link from "next/link";

const LINKS: Array<[string, string]> = [
  ["Overview", "/"],
  ["Advertisements", "/advertisements"],
  ["Settlements", "/settlements"],
  ["Analytics", "/analytics"],
];

export function Sidebar() {
  return (
    <aside className="w-56 shrink-0 border-r border-white/10 p-4">
      <div className="mb-6 text-lg font-semibold text-white">OpenFiat Merchant</div>
      <nav className="space-y-1">
        {LINKS.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            className="block rounded-md px-3 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
