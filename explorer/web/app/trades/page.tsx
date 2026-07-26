export default function Page() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Trades</h1>
      <p className="mt-1 text-sm text-gray-400">Browse recent OpenFiat trades.</p>
      <div className="mt-6 rounded-lg border border-dashed border-white/15 p-8 text-center text-sm text-gray-500">
        No data yet — connect this explorer to the indexer API.
      </div>
    </section>
  );
}
