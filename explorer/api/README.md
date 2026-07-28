# explorer/api

An Express (Node.js/TypeScript) backend intended to adapt `explorer/
indexer`'s HTTP query surface into the exact response shapes `explorer/
web`'s existing mock data (`lib/types.ts`) already established, so
swapping the frontend's data source is a data-source change, not a
rewrite.

## How it connects to other services

- **Depends on:** `explorer/indexer` — the Rust service this API is meant
  to proxy/adapt data from (not implemented yet — see Status below).
- **Used by:** `explorer/web` — the frontend this API is meant to serve.

## Status

Scaffolding only (`/health`, and two stub routes — `/v1/trades` and
`/v1/stats` — that return empty/null placeholders). Real implementation
is deferred: this whole `openfiat-apps` repository is not under active
development right now — see the repository root README. `openfiat-app`
(a separate, actively developed repository) is where this session's
frontend/design work is concentrated instead.
