//! `openfiat-explorer-indexer` — consumes OpenFiat gossip events live and
//! serves the queryable state `explorer/api` (Phase 9) reads.
//!
//! Configured entirely by environment variables for now — a proper CLI
//! (config file, persisted keypair) is `openfiat-cli`'s composition-root
//! concern (Phase 12 territory), not something to duplicate here ahead
//! of that design settling.

use openfiat_explorer_indexer::{IndexerConfig, server, spawn};
use openfiat_storage::mem::MemoryStore;

#[tokio::main]
async fn main() {
    let listen_addr = std::env::var("INDEXER_LISTEN_ADDR").unwrap_or_else(|_| "/ip4/0.0.0.0/udp/4001/quic-v1".to_string());
    let bootstrap_peers = std::env::var("INDEXER_BOOTSTRAP_PEERS").unwrap_or_default().split(',').filter(|s| !s.is_empty()).map(str::to_string).collect();
    let http_addr = std::env::var("INDEXER_HTTP_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".to_string());

    let mut keypair_seed = [0u8; 32];
    if let Ok(seed_str) = std::env::var("INDEXER_KEYPAIR_SEED") {
        let bytes = seed_str.as_bytes();
        keypair_seed[..bytes.len().min(32)].copy_from_slice(&bytes[..bytes.len().min(32)]);
    } else {
        // A fresh random identity each run is fine for an indexer (it's
        // not a service other nodes need to reconnect to by identity).
        keypair_seed = openfiat_crypto::Keypair::generate().seed();
    }

    println!("openfiat-explorer-indexer {} — listening for gossip on {listen_addr}, serving HTTP on {http_addr}", openfiat_explorer_indexer::version());

    // TODO(rocksdb): swap `MemoryStore` for `openfiat_database::Database`
    // once this binary's deployment story (a persistent data directory)
    // is settled — the `KvStore` abstraction this crate is built against
    // makes that a one-line change wherever `MemoryStore::new` is called.
    //
    // TODO(discovery): known_peer_keys is empty here, so this indexer
    // will reject every event until openfiat-discovery's peer exchange
    // (not wired into this binary yet) or an explicit allowlist populates
    // it — see IndexerConfig's own doc.
    let (snapshot, actual_listen_addr) = spawn(IndexerConfig { keypair_seed, listen_addr, bootstrap_peers, known_peer_keys: vec![] }, MemoryStore::new);
    println!("openfiat-explorer-indexer listening at {actual_listen_addr}");

    let listener = tokio::net::TcpListener::bind(&http_addr).await.expect("failed to bind the indexer's HTTP listener");
    axum::serve(listener, server::router(snapshot)).await.expect("indexer HTTP server failed");
}
