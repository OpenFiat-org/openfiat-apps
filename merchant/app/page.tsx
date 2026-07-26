export default function OverviewPage() {
  return (
    <section>
      <h1 className="text-2xl font-semibold text-white">Overview</h1>
      <p className="mt-1 text-sm text-gray-400">
        Snapshot of your OpenFiat merchant activity. Data below is placeholder
        until the dashboard is wired to a node's RPC surface.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Open advertisements</p>
          <p className="mt-2 text-3xl font-semibold text-white">—</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Pending settlements</p>
          <p className="mt-2 text-3xl font-semibold text-white">—</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/5 p-6">
          <p className="text-sm text-gray-400">Open disputes</p>
          <p className="mt-2 text-3xl font-semibold text-white">—</p>
        </div>
      </div>
    </section>
  );
}
