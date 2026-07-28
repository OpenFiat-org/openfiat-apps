//! View types shaped to match `explorer/web`'s existing mock contract
//! (`lib/types.ts`'s `Trade`, `Proposal`, `NetworkNode`, `NetworkStats`,
//! `RegionStat`) as closely as the real domain model actually supports —
//! computed on demand from `state::IndexedState`, the same "pure
//! read-side view" pattern `openfiat-trade`/`openfiat-reputation` use.
//!
//! Three deliberate simplifications from the mock contract, each
//! documented at its own field:
//! - `escrowSig`/`settlementSig` (on-chain Solana transaction
//!   signatures) aren't populated — this P2P layer doesn't invoke the
//!   deployed programs yet, the same deferral `openfiat-settlement`'s
//!   own doc comment describes.
//! - `Trade.events` is a coarse 1-3 entry summary derived from the
//!   reservation/settlement's own current-state timestamps, not a full
//!   per-transition audit log — building the latter needs the indexer
//!   to inspect each event payload's correlating ID per event type,
//!   real but out of scope for this phase's exit criterion.
//! - `Proposal`'s category/quorum/threshold/deposit percentages belong
//!   to OFS-4100 (tokenomics), which `openfiat-governance` doesn't
//!   implement (it follows OFS-4000's own simpler category list and
//!   leaves voting-power/quorum weighting unspecified) — this exposes
//!   the real OFS-4000 data as-is rather than fabricating numbers.

use crate::state::IndexedState;
use openfiat_disputes::DisputeStatus;
use openfiat_gossip::GossipService;
use openfiat_governance::ProposalStatus;
use openfiat_registry::HealthState;
use openfiat_settlement::SettlementState;
use openfiat_storage::KvStore;
use openfiat_trade::TradeStatus;
use serde::Serialize;
use std::rc::Rc;

fn peer_id_string(peer_id: &openfiat_types::PeerId) -> String {
    use base64::Engine;
    base64::engine::general_purpose::STANDARD.encode(peer_id.as_bytes())
}

#[derive(Debug, Clone, Serialize)]
pub struct TradeEvent {
    pub time_ms: u64,
    pub event_type: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct IndexedTrade {
    pub id: String,
    pub asset: String,
    pub fiat_currency: String,
    pub amount: String,
    /// `None` unless the advertisement uses a fixed price — a floating/
    /// oracle-referenced price has no single number to report here.
    pub price: Option<String>,
    pub merchant: String,
    pub buyer: String,
    pub status: String,
    pub created_at_ms: u64,
    pub events: Vec<TradeEvent>,
}

pub fn trades<S: KvStore>(state: &IndexedState<S>) -> Vec<IndexedTrade> {
    state
        .trades
        .all()
        .into_iter()
        .map(|trade| {
            let advertisement = state.advertisements.get(&trade.reservation.advertisement_id);
            let (asset, fiat_currency, price) = match &advertisement {
                Some(ad) => {
                    let price = match ad.pricing {
                        openfiat_advertisements::PricingModel::Fixed { price } => Some(price.to_string()),
                        openfiat_advertisements::PricingModel::Floating { .. } => None,
                    };
                    (ad.asset.clone(), ad.fiat_currency.clone(), price)
                }
                None => (String::new(), String::new(), None),
            };

            let mut events = vec![TradeEvent { time_ms: trade.reservation.requested_at.as_millis(), event_type: "ReservationRequested".to_string() }];
            let (merchant, buyer, amount) = match &trade.settlement {
                Some(settlement) => {
                    events.push(TradeEvent { time_ms: settlement.created_at.as_millis(), event_type: "SettlementInitiated".to_string() });
                    if settlement.state != SettlementState::AwaitingPayment {
                        events.push(TradeEvent { time_ms: settlement.updated_at.as_millis(), event_type: format!("Settlement{:?}", settlement.state) });
                    }
                    (peer_id_string(&settlement.seller), peer_id_string(&settlement.buyer), settlement.amount.to_string())
                }
                None => (advertisement.map(|ad| peer_id_string(&ad.merchant)).unwrap_or_default(), peer_id_string(&trade.reservation.requester), trade.reservation.amount.to_string()),
            };

            IndexedTrade {
                id: trade.reservation.id.as_str().to_string(),
                asset,
                fiat_currency,
                amount,
                price,
                merchant,
                buyer,
                status: format!("{:?}", trade.status()),
                created_at_ms: trade.reservation.requested_at.as_millis(),
                events,
            }
        })
        .collect()
}

#[derive(Debug, Clone, Serialize)]
pub struct IndexedProposal {
    pub id: String,
    pub title: String,
    pub summary: String,
    pub category: String,
    pub status: String,
    pub votes_for: u64,
    pub votes_against: u64,
    pub votes_abstain: u64,
    pub voting_closes_at_ms: u64,
}

pub fn proposals<S: KvStore>(state: &IndexedState<S>) -> Vec<IndexedProposal> {
    state
        .governance
        .all()
        .into_iter()
        .map(|proposal| {
            let (mut votes_for, mut votes_against, mut votes_abstain) = (0u64, 0u64, 0u64);
            for vote in &proposal.votes {
                match vote.choice {
                    openfiat_governance::VoteChoice::Approve => votes_for += vote.weight,
                    openfiat_governance::VoteChoice::Reject => votes_against += vote.weight,
                    openfiat_governance::VoteChoice::Abstain => votes_abstain += vote.weight,
                }
            }
            IndexedProposal {
                id: proposal.id.as_str().to_string(),
                title: proposal.title.clone(),
                summary: proposal.summary.clone(),
                category: format!("{:?}", proposal.category),
                status: format!("{:?}", proposal.status),
                votes_for,
                votes_against,
                votes_abstain,
                voting_closes_at_ms: proposal.voting_closes_at.as_millis(),
            }
        })
        .collect()
}

#[derive(Debug, Clone, Serialize)]
pub struct IndexedProvider {
    pub id: String,
    pub service_type: String,
    pub provider: String,
    pub region: Option<String>,
    pub health: String,
    pub endpoints: Vec<String>,
    pub registered_at_ms: u64,
}

pub fn providers<S: KvStore>(state: &IndexedState<S>) -> Vec<IndexedProvider> {
    state
        .services
        .all()
        .into_iter()
        .map(|service| IndexedProvider {
            id: service.service_id.as_str().to_string(),
            service_type: format!("{:?}", service.service_type),
            provider: peer_id_string(&service.provider),
            region: service.region.clone(),
            health: format!("{:?}", service.health),
            endpoints: service.endpoints.clone(),
            registered_at_ms: service.registered_at.as_millis(),
        })
        .collect()
}

/// A region's registered-provider distribution — the closest real
/// signal available (see the module doc: advertisements/merchants
/// don't carry a region field today).
#[derive(Debug, Clone, Serialize)]
pub struct RegionStat {
    pub region: String,
    pub provider_count: usize,
}

pub fn regions<S: KvStore>(state: &IndexedState<S>) -> Vec<RegionStat> {
    let mut counts: std::collections::BTreeMap<String, usize> = std::collections::BTreeMap::new();
    for service in state.services.all() {
        if let Some(region) = service.region {
            *counts.entry(region).or_default() += 1;
        }
    }
    counts.into_iter().map(|(region, provider_count)| RegionStat { region, provider_count }).collect()
}

#[derive(Debug, Clone, Default, Serialize)]
pub struct NetworkStats {
    pub connected_peers: usize,
    pub providers_online: usize,
    pub providers_total: usize,
    pub open_trades: usize,
    pub open_disputes: usize,
    pub open_proposals: usize,
    pub protocol_version: String,
}

pub fn stats<S: KvStore>(state: &IndexedState<S>, gossip: &GossipService<Rc<S>>) -> NetworkStats {
    let providers = state.services.all();
    NetworkStats {
        connected_peers: gossip.connected_peer_count(),
        providers_online: providers.iter().filter(|p| p.health == HealthState::Online).count(),
        providers_total: providers.len(),
        open_trades: state.trades.all().iter().filter(|t| !matches!(t.status(), TradeStatus::Completed | TradeStatus::Rejected | TradeStatus::Cancelled)).count(),
        open_disputes: state.disputes.all().iter().filter(|d| d.status != DisputeStatus::Resolved).count(),
        open_proposals: state.governance.all().iter().filter(|p| p.status == ProposalStatus::Voting).count(),
        protocol_version: env!("CARGO_PKG_VERSION").to_string(),
    }
}

/// Every view computed together, republished as one unit by `node::spawn`
/// after each gossip event this indexer processes — see that module's
/// doc for why a snapshot rather than a per-query round trip.
#[derive(Debug, Clone, Default, Serialize)]
pub struct ViewSnapshot {
    pub trades: Vec<IndexedTrade>,
    pub proposals: Vec<IndexedProposal>,
    pub providers: Vec<IndexedProvider>,
    pub regions: Vec<RegionStat>,
    pub stats: NetworkStats,
}
