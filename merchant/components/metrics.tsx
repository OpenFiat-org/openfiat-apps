/** Slim inline metrics strip — label-over-value pairs with vertical dividers, no boxes. */
export function MetricStrip({
  items,
}: {
  items: Array<{ label: string; value: string; sub?: string }>;
}) {
  return (
    <div className="flex items-stretch gap-y-4 overflow-x-auto pb-1">
      {items.map((m, i) => (
        <div
          key={m.label}
          className={`shrink-0 pr-6 ${i > 0 ? "border-l border-white/10 pl-6" : ""}`}
        >
          <p className="text-xs text-gray-500">{m.label}</p>
          <p className="mt-0.5 text-lg font-semibold tabular-nums text-white">{m.value}</p>
          {m.sub && <p className="text-[11px] text-gray-600">{m.sub}</p>}
        </div>
      ))}
    </div>
  );
}
