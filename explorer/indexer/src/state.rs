//! Composes the domain registries this indexer actually needs to back
//! the explorer's views — advertisements/reservations/settlement (→
//! trades), disputes, governance (→ proposals), and the service
//! registry (→ providers/nodes). Deliberately narrower than
//! `openfiat-rpc`'s `NodeState`: identity/reputation/wallet/
//! notifications/oracles/risk/snapshot/sessions have no corresponding
//! explorer view yet, so indexing them here would just be dead weight.

use openfiat_advertisements::AdvertisementRegistry;
use openfiat_disputes::DisputeRegistry;
use openfiat_gossip::GossipService;
use openfiat_governance::GovernanceRegistry;
use openfiat_registry::Registry as ServiceRegistry;
use openfiat_reservations::ReservationRegistry;
use openfiat_settlement::SettlementRegistry;
use openfiat_storage::KvStore;
use openfiat_trade::TradeView;
use std::rc::Rc;

pub struct IndexedState<S> {
    pub advertisements: Rc<AdvertisementRegistry<Rc<S>>>,
    pub reservations: Rc<ReservationRegistry<Rc<S>>>,
    pub settlements: Rc<SettlementRegistry<Rc<S>>>,
    pub trades: TradeView<Rc<S>>,
    pub disputes: Rc<DisputeRegistry<Rc<S>>>,
    pub governance: Rc<GovernanceRegistry<Rc<S>>>,
    pub services: Rc<ServiceRegistry<Rc<S>>>,
}

impl<S: KvStore + 'static> IndexedState<S> {
    /// Takes an already-`Rc`-wrapped store rather than wrapping one
    /// internally, so the caller can share the exact same instance with
    /// `GossipService`'s own event log — one physical store, one column
    /// family per concern, matching how every domain crate in
    /// `openfiat-core` itself expects to be composed against a real node.
    pub fn new(store: Rc<S>) -> Self {
        let services = Rc::new(ServiceRegistry::new(Rc::clone(&store)));
        let advertisements = Rc::new(AdvertisementRegistry::new(Rc::clone(&store)));
        let reservations = Rc::new(ReservationRegistry::new(
            Rc::clone(&store),
            Rc::clone(&advertisements),
        ));
        let settlements = Rc::new(SettlementRegistry::new(Rc::clone(&store)));
        let disputes = Rc::new(DisputeRegistry::new(
            Rc::clone(&store),
            Rc::clone(&settlements),
        ));
        let trades = TradeView::new(Rc::clone(&reservations), Rc::clone(&settlements));
        let governance = Rc::new(GovernanceRegistry::new(Rc::clone(&store)));

        Self {
            advertisements,
            reservations,
            settlements,
            trades,
            disputes,
            governance,
            services,
        }
    }

    /// Registers every registry's `apply_event` as a handler on the
    /// shared gossip channel — this is what makes indexing "live":
    /// every event this node's `GossipService` stores (self-originated
    /// or received) is immediately applied to whichever registry owns
    /// its `ofs_spec`. Sound because `add_event_handler` appends rather
    /// than replacing (see `openfiat-gossip`'s own doc on why).
    pub fn attach_to(&self, gossip: &mut GossipService<Rc<S>>) {
        let advertisements = Rc::clone(&self.advertisements);
        gossip.add_event_handler(move |event| advertisements.apply_event(event));
        let reservations = Rc::clone(&self.reservations);
        gossip.add_event_handler(move |event| reservations.apply_event(event));
        let settlements = Rc::clone(&self.settlements);
        gossip.add_event_handler(move |event| settlements.apply_event(event));
        let disputes = Rc::clone(&self.disputes);
        gossip.add_event_handler(move |event| disputes.apply_event(event));
        let governance = Rc::clone(&self.governance);
        gossip.add_event_handler(move |event| governance.apply_event(event));
        let services = Rc::clone(&self.services);
        gossip.add_event_handler(move |event| services.apply_event(event));
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use openfiat_storage::mem::MemoryStore;

    #[test]
    fn composes_without_panicking_and_starts_empty() {
        let state = IndexedState::new(Rc::new(MemoryStore::new()));
        assert!(state.advertisements.all().is_empty());
        assert!(state.trades.all().is_empty());
        assert!(state.services.all().is_empty());
    }
}
