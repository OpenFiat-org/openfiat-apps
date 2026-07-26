export default function Home() {
  return (
    <section>
      <h1 className="text-3xl font-bold text-white">Search the OpenFiat network</h1>
      <p className="mt-2 max-w-xl text-gray-400">
        Look up a trade, advertisement, node, or identity by ID once this
        explorer is connected to an indexer.
      </p>
      <input
        className="mt-6 w-full max-w-xl rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500"
        placeholder="Search by trade ID, address, or node ID"
        disabled
      />
    </section>
  );
}
