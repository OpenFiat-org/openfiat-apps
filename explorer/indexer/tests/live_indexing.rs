//! Phase 8's exit criterion, proven directly: pointed at a live cluster,
//! an event published on one node shows up in the indexer's queryable
//! state — over a real libp2p connection, not a mocked one.

use openfiat_crypto::Keypair;
use openfiat_explorer_indexer::{IndexerConfig, spawn};
use openfiat_gossip::EventStore;
use openfiat_gossip::channel::Subscription;
use openfiat_governance::{GovernanceService, ProposalCategory};
use openfiat_network::Node;
use openfiat_network::identity::{peer_id, to_libp2p_keypair};
use openfiat_storage::mem::MemoryStore;
use std::time::Duration;

#[tokio::test]
async fn a_proposal_published_on_one_node_appears_in_the_indexers_snapshot() {
    let producer_keypair = Keypair::from_seed([7; 32]);
    let producer_peer_id = peer_id(&to_libp2p_keypair(&Keypair::from_seed([7; 32])));

    let (snapshot, indexer_addr) = spawn(
        IndexerConfig {
            keypair_seed: [42; 32],
            listen_addr: "/ip4/127.0.0.1/udp/0/quic-v1".to_string(),
            bootstrap_peers: vec![],
            known_peer_keys: vec![(producer_peer_id, producer_keypair.public_key())],
        },
        MemoryStore::new,
    );

    // A separate node — standing in for a real openfiat-core participant
    // — publishes a governance proposal and dials straight into the
    // indexer.
    let producer_node = Node::new(&producer_keypair).unwrap();
    let event_store = EventStore::new(MemoryStore::new());
    let mut gossip = openfiat_gossip::GossipService::new(
        producer_node,
        event_store,
        producer_keypair,
        vec![],
        Subscription::All,
    );

    let indexer_peer_id = peer_id(&to_libp2p_keypair(&Keypair::from_seed([42; 32])));
    gossip.register_peer_key(indexer_peer_id, Keypair::from_seed([42; 32]).public_key());
    gossip.node.dial(indexer_addr).unwrap();

    let mut service = GovernanceService::new(gossip, MemoryStore::new());

    // Drive the producer's own gossip loop concurrently with waiting for
    // the connection and the eventual snapshot update.
    let drive_and_wait = async {
        loop {
            service.drive_once().await;
            if service.gossip.connected_peer_count() >= 1 {
                break;
            }
        }
    };
    tokio::time::timeout(Duration::from_secs(15), drive_and_wait)
        .await
        .expect("producer never connected to the indexer");

    let proposal_id = service
        .create_proposal(
            "ofp-1",
            "Increase Reservation Timeout",
            "Raise the validation window.",
            ProposalCategory::Protocol,
        )
        .unwrap();

    let wait_for_snapshot = async {
        loop {
            service.drive_once().await;
            if snapshot
                .read()
                .unwrap()
                .proposals
                .iter()
                .any(|p| p.id == proposal_id.as_str())
            {
                break;
            }
        }
    };
    tokio::time::timeout(Duration::from_secs(15), wait_for_snapshot)
        .await
        .expect("the indexer never reflected the published proposal");

    let view = snapshot.read().unwrap();
    let indexed = view
        .proposals
        .iter()
        .find(|p| p.id == proposal_id.as_str())
        .unwrap();
    assert_eq!(indexed.title, "Increase Reservation Timeout");
    assert_eq!(indexed.status, "Voting");
}
