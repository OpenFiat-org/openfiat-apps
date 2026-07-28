//! `openfiat-explorer-indexer` — consumes `openfiat-core`'s gossip
//! events live and produces the queryable state `explorer/api` serves.
//!
//! `state::IndexedState` composes the domain registries the explorer's
//! views actually need; `views` computes those views (`Trade`,
//! `Proposal`, provider/node listings, network stats, region stats) on
//! demand, shaped to match `explorer/web`'s existing mock contract as
//! closely as the real domain model supports — see `views`'s own doc
//! for the handful of deliberate simplifications. `node` wires a real
//! `GossipService` to `IndexedState` and republishes a fresh snapshot
//! of every view after each event it processes; `server` exposes that
//! snapshot over HTTP.

pub mod node;
pub mod server;
pub mod state;
pub mod views;

pub use node::{IndexerConfig, SharedSnapshot, spawn};
pub use views::{IndexedProposal, IndexedProvider, IndexedTrade, NetworkStats, RegionStat};

/// Crate version, re-exported for diagnostics.
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
