//! Bridges `state::IndexedState` (`Rc`-based, like every registry in
//! this workspace) into a form safe to query from axum's multi-threaded
//! handlers — the same actor-thread pattern `openfiat-rpc` uses, except
//! instead of a request/response channel per query, the actor
//! republishes a fresh [`views::ViewSnapshot`] (plain owned data, safe
//! to share across threads) into a shared `RwLock` after every gossip
//! event it processes. That fits an indexer's read-heavy, eventually-
//! consistent workload better than a round-trip per read.

use crate::state::IndexedState;
use crate::views::{self, ViewSnapshot};
use openfiat_crypto::Keypair;
use openfiat_gossip::EventStore;
use openfiat_gossip::channel::Subscription;
use openfiat_network::{Multiaddr, Node};
use openfiat_storage::KvStore;
use std::rc::Rc;
use std::sync::{Arc, RwLock};

pub type SharedSnapshot = Arc<RwLock<ViewSnapshot>>;

pub struct IndexerConfig {
    /// Deterministic for now — a real deployment would load/generate and
    /// persist a keypair the same way `openfiat-cli`'s composition root
    /// will (Phase 12 territory), not something this indexer invents.
    pub keypair_seed: [u8; 32],
    pub listen_addr: String,
    pub bootstrap_peers: Vec<String>,
    /// `GossipService` rejects any event from a peer whose public key it
    /// doesn't already have (§9's signature check needs it) — real peer-
    /// key learning belongs to `openfiat-discovery`'s peer exchange,
    /// which isn't wired into this indexer yet, so for now every peer it
    /// needs to accept events from must be listed here upfront, the same
    /// simplification every crate's own integration test in
    /// `openfiat-core` already makes.
    pub known_peer_keys: Vec<(openfiat_types::PeerId, openfiat_types::PublicKey)>,
}

/// Spawns the indexer's actor thread and returns the shared snapshot
/// handle plus the actual listen address the node bound (useful when
/// `listen_addr` uses port `0` and the OS picks one — this blocks
/// briefly on that one startup handshake, not on anything ongoing).
/// `build_store` runs *inside* that thread — `S` never needs to be
/// `Send`, only the construction closure does (see `openfiat-rpc`'s
/// `actor` module for the same reasoning in full).
pub fn spawn<S>(
    config: IndexerConfig,
    build_store: impl FnOnce() -> S + Send + 'static,
) -> (SharedSnapshot, Multiaddr)
where
    S: KvStore + 'static,
{
    let snapshot: SharedSnapshot = Arc::new(RwLock::new(ViewSnapshot::default()));
    let snapshot_for_thread = Arc::clone(&snapshot);
    let (listen_addr_tx, listen_addr_rx) = std::sync::mpsc::channel();

    std::thread::spawn(move || {
        let runtime = tokio::runtime::Builder::new_current_thread()
            .enable_all()
            .build()
            .expect("failed to start the indexer's runtime");
        runtime.block_on(async move {
            let keypair = Keypair::from_seed(config.keypair_seed);
            let mut node = Node::new(&keypair).expect("failed to construct the libp2p node");
            let requested_addr = config
                .listen_addr
                .parse()
                .expect("invalid listen_addr multiaddr");
            node.listen_on(requested_addr)
                .expect("failed to start listening");

            let actual_addr = loop {
                if let libp2p::swarm::SwarmEvent::NewListenAddr { address, .. } =
                    node.next_event().await
                {
                    break address;
                }
            };
            let _ = listen_addr_tx.send(actual_addr);

            let store = Rc::new(build_store());
            let event_store = EventStore::new(Rc::clone(&store));
            let mut gossip = openfiat_gossip::GossipService::new(
                node,
                event_store,
                keypair,
                vec![],
                Subscription::All,
            );
            for (peer_id, public_key) in config.known_peer_keys {
                gossip.register_peer_key(peer_id, public_key);
            }

            let state = IndexedState::new(Rc::clone(&store));
            state.attach_to(&mut gossip);

            for addr in &config.bootstrap_peers {
                if let Ok(addr) = addr.parse() {
                    let _ = gossip.node.dial(addr);
                }
            }

            publish(&snapshot_for_thread, &state, &gossip);
            loop {
                gossip.drive_once().await;
                publish(&snapshot_for_thread, &state, &gossip);
            }
        });
    });

    let listen_addr = listen_addr_rx
        .recv()
        .expect("indexer actor thread stopped before it started listening");
    (snapshot, listen_addr)
}

fn publish<S: KvStore>(
    snapshot: &SharedSnapshot,
    state: &IndexedState<S>,
    gossip: &openfiat_gossip::GossipService<Rc<S>>,
) {
    let fresh = ViewSnapshot {
        trades: views::trades(state),
        proposals: views::proposals(state),
        providers: views::providers(state),
        regions: views::regions(state),
        stats: views::stats(state, gossip),
    };
    *snapshot.write().expect("indexer snapshot lock poisoned") = fresh;
}

#[cfg(test)]
mod tests {
    use super::*;
    use openfiat_storage::mem::MemoryStore;

    #[tokio::test]
    async fn spawns_and_publishes_an_initial_empty_snapshot() {
        let (snapshot, _listen_addr) = spawn(
            IndexerConfig {
                keypair_seed: [1; 32],
                listen_addr: "/ip4/127.0.0.1/udp/0/quic-v1".to_string(),
                bootstrap_peers: vec![],
                known_peer_keys: vec![],
            },
            MemoryStore::new,
        );

        // Give the actor thread a moment to publish its first snapshot.
        tokio::time::sleep(std::time::Duration::from_millis(50)).await;
        let view = snapshot.read().unwrap();
        assert!(view.trades.is_empty());
        assert!(view.proposals.is_empty());
    }
}
