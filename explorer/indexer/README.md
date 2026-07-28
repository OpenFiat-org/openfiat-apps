# explorer/indexer

A real Rust service that participates in OpenFiat's P2P gossip network live
and produces the queryable state `explorer/api` reads. Depends on
[`openfiat-core`](https://github.com/OpenFiat-org/openfiat-core) via a
pinned git dependency (both repos are pre-1.0 and co-evolving) for the
domain crates the explorer's views need: advertisements, reservations,
settlement, trade, disputes, governance, and the service registry.

- `state.rs` composes those registries against one shared store.
- `node.rs` wires a real `GossipService` to that state — every registry's
  `apply_event` is attached as a handler on one shared gossip channel,
  genuine live network participation, not a poll loop against an RPC
  node — running on a dedicated actor thread that republishes a fresh
  view snapshot after every event it processes.
- `views.rs` shapes that state into `Trade`/`Proposal`/provider-node/
  `NetworkStats`/`RegionStat`, matching `explorer/web`'s existing mock
  contract (`lib/types.ts`) as closely as the real domain model supports.
- `server.rs` exposes that snapshot over a small internal HTTP/JSON API.

Node identity is loaded from a Solana CLI-format `wallet.json`
(`INDEXER_WALLET_PATH`, defaulting to `~/.config/solana/id.json`) via
`openfiat-wallet`'s `solana_keyfile` loader.

## How it connects to other services

- **Depends on:** `openfiat-core` (git dependency) for domain state and
  gossip participation.
- **Used by:** `explorer/api` reads this crate's HTTP surface and adapts
  it into the public explorer contract.

## Status

Real and tested (see `tests/live_indexing.rs` for a genuine multi-node
gossip proof), but this whole `openfiat-apps` repository is not under
active development right now — see the repository root README.
