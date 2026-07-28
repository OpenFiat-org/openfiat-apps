//! The indexer's own query surface — a small internal HTTP/JSON API
//! `explorer/api` (Phase 9, Node.js/Express — a different language and
//! process) consumes and adapts into the public explorer contract.

use crate::node::SharedSnapshot;
use axum::Router;
use axum::extract::{Path, State};
use axum::response::{IntoResponse, Response};
use axum::routing::get;

pub fn router(snapshot: SharedSnapshot) -> Router {
    Router::new()
        .route("/health", get(handle_health))
        .route("/trades", get(handle_trades))
        .route("/trades/{id}", get(handle_trade))
        .route("/proposals", get(handle_proposals))
        .route("/proposals/{id}", get(handle_proposal))
        .route("/providers", get(handle_providers))
        .route("/regions", get(handle_regions))
        .route("/stats", get(handle_stats))
        .with_state(snapshot)
}

async fn handle_health() -> &'static str {
    "ok"
}

async fn handle_trades(
    State(snapshot): State<SharedSnapshot>,
) -> axum::Json<Vec<crate::IndexedTrade>> {
    axum::Json(
        snapshot
            .read()
            .expect("indexer snapshot lock poisoned")
            .trades
            .clone(),
    )
}

async fn handle_trade(State(snapshot): State<SharedSnapshot>, Path(id): Path<String>) -> Response {
    let view = snapshot.read().expect("indexer snapshot lock poisoned");
    match view.trades.iter().find(|trade| trade.id == id) {
        Some(trade) => axum::Json(trade.clone()).into_response(),
        None => axum::http::StatusCode::NOT_FOUND.into_response(),
    }
}

async fn handle_proposals(
    State(snapshot): State<SharedSnapshot>,
) -> axum::Json<Vec<crate::IndexedProposal>> {
    axum::Json(
        snapshot
            .read()
            .expect("indexer snapshot lock poisoned")
            .proposals
            .clone(),
    )
}

async fn handle_proposal(
    State(snapshot): State<SharedSnapshot>,
    Path(id): Path<String>,
) -> Response {
    let view = snapshot.read().expect("indexer snapshot lock poisoned");
    match view.proposals.iter().find(|proposal| proposal.id == id) {
        Some(proposal) => axum::Json(proposal.clone()).into_response(),
        None => axum::http::StatusCode::NOT_FOUND.into_response(),
    }
}

async fn handle_providers(
    State(snapshot): State<SharedSnapshot>,
) -> axum::Json<Vec<crate::IndexedProvider>> {
    axum::Json(
        snapshot
            .read()
            .expect("indexer snapshot lock poisoned")
            .providers
            .clone(),
    )
}

async fn handle_regions(
    State(snapshot): State<SharedSnapshot>,
) -> axum::Json<Vec<crate::RegionStat>> {
    axum::Json(
        snapshot
            .read()
            .expect("indexer snapshot lock poisoned")
            .regions
            .clone(),
    )
}

async fn handle_stats(State(snapshot): State<SharedSnapshot>) -> axum::Json<crate::NetworkStats> {
    axum::Json(
        snapshot
            .read()
            .expect("indexer snapshot lock poisoned")
            .stats
            .clone(),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::views::ViewSnapshot;
    use http_body_util::BodyExt;
    use std::sync::{Arc, RwLock};
    use tower::ServiceExt;

    #[tokio::test]
    async fn health_returns_ok() {
        let snapshot: SharedSnapshot = Arc::new(RwLock::new(ViewSnapshot::default()));
        let response = router(snapshot)
            .oneshot(
                axum::http::Request::builder()
                    .uri("/health")
                    .body(axum::body::Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), axum::http::StatusCode::OK);
    }

    #[tokio::test]
    async fn trades_reflects_the_current_snapshot() {
        let snapshot: SharedSnapshot = Arc::new(RwLock::new(ViewSnapshot::default()));
        snapshot.write().unwrap().trades.push(crate::IndexedTrade {
            id: "res-1".to_string(),
            asset: "USDC".to_string(),
            fiat_currency: "KES".to_string(),
            amount: "2.000000".to_string(),
            price: None,
            merchant: "m".to_string(),
            buyer: "b".to_string(),
            status: "EscrowLocked".to_string(),
            created_at_ms: 0,
            events: vec![],
        });

        let response = router(snapshot)
            .oneshot(
                axum::http::Request::builder()
                    .uri("/trades")
                    .body(axum::body::Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        let body = response.into_body().collect().await.unwrap().to_bytes();
        let trades: Vec<serde_json::Value> = serde_json::from_slice(&body).unwrap();
        assert_eq!(trades.len(), 1);
        assert_eq!(trades[0]["id"], serde_json::Value::from("res-1"));
    }

    #[tokio::test]
    async fn a_missing_trade_is_a_404() {
        let snapshot: SharedSnapshot = Arc::new(RwLock::new(ViewSnapshot::default()));
        let response = router(snapshot)
            .oneshot(
                axum::http::Request::builder()
                    .uri("/trades/does-not-exist")
                    .body(axum::body::Body::empty())
                    .unwrap(),
            )
            .await
            .unwrap();
        assert_eq!(response.status(), axum::http::StatusCode::NOT_FOUND);
    }
}
