//! `openfiat-explorer-indexer` — consumes OpenFiat network/gossip events and
//! produces the queryable state served by `apps/api`.
//!
//! This is architecture scaffolding only: no indexing logic is implemented
//! yet. It will subscribe to `openfiat-core`'s gossip/snapshot crates once
//! their client interfaces stabilize.

fn main() {
    println!(
        "openfiat-explorer-indexer {} (scaffold only)",
        env!("CARGO_PKG_VERSION")
    );
}
