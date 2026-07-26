export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Settlements</h1>
      <p className="mt-1 text-sm text-gray-400">Track trade settlements and their on-chain status.</p>
      <div className="mt-6 rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-gray-500">
        No data yet — this view will populate once connected to an OpenFiat node.
      </div>
    </section>
  );
}
