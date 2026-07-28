# explorer/web (`@openfiat/explorer-web`)

A Next.js network explorer frontend: Trades, Governance, Stats, and Nodes
pages, currently rendering `lib/data/*.ts` mock data against the shapes
defined in `lib/types.ts` — the closest thing to a real API contract that
exists today, and what `explorer/api`/`explorer/indexer` are meant to
eventually serve for real.

## How it connects to other services

- **Depends on:** `explorer/api` — the intended real data source, once
  built out (see that package's README for current status).
- **Used by:** nobody else in this repository — this is a leaf frontend.

## Status

Built out with real pages/components against mock data; not yet wired to
a live backend. This whole `openfiat-apps` repository is not under active
development right now — see the repository root README. `openfiat-app`
(a separate, actively developed repository) is where this session's
frontend/design work is concentrated instead.
