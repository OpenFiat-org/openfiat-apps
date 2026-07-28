//! `openfiat-explorer-indexer` — consumes OpenFiat gossip events live and
//! serves the queryable state `explorer/api` (Phase 9) reads.
//!
//! Configured entirely by environment variables for now — a proper CLI
//! (config file) is `openfiat-cli`'s composition-root concern (Phase 12
//! territory), not something to duplicate here ahead of that design
//! settling.

use openfiat_explorer_indexer::{IndexerConfig, server, spawn};
use openfiat_storage::mem::MemoryStore;
use openfiat_wallet::Wallet;

/// This node's identity: a Solana CLI-format wallet.json, the same file
/// `solana-keygen new` produces, at `INDEXER_WALLET_PATH` (defaulting to
/// Solana CLI's own convention, `~/.config/solana/id.json`) — so an
/// operator authenticates this node with the same wallet they already
/// use for Solana tooling, rather than a second, separate identity.
fn load_or_generate_wallet() -> Wallet {
    let path = std::env::var("INDEXER_WALLET_PATH").unwrap_or_else(|_| {
        let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
        format!("{home}/.config/solana/id.json")
    });

    match openfiat_wallet::solana_keyfile::load(&path) {
        Ok(wallet) => {
            println!("openfiat-explorer-indexer: loaded node identity from {path}");
            wallet
        }
        Err(err) => {
            // Falling back rather than failing hard: an indexer isn't a
            // service other nodes need to reconnect to by a stable
            // identity, so a missing wallet file is a warning, not fatal
            // — but if the operator *did* mean to authenticate with a
            // real wallet, this is loud enough to notice.
            eprintln!("openfiat-explorer-indexer: no usable wallet at {path} ({err}), generating a fresh identity for this run");
            Wallet::generate()
        }
    }
}

#[tokio::main]
async fn main() {
    let listen_addr = std::env::var("INDEXER_LISTEN_ADDR").unwrap_or_else(|_| "/ip4/0.0.0.0/udp/4001/quic-v1".to_string());
    let bootstrap_peers = std::env::var("INDEXER_BOOTSTRAP_PEERS").unwrap_or_default().split(',').filter(|s| !s.is_empty()).map(str::to_string).collect();
    let http_addr = std::env::var("INDEXER_HTTP_ADDR").unwrap_or_else(|_| "0.0.0.0:8081".to_string());
    let keypair_seed = load_or_generate_wallet().seed();

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
