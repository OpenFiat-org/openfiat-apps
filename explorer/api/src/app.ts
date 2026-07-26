import express, { type Express } from "express";

/**
 * Builds the Explorer API Express app. Kept separate from `server.ts` so it
 * can be imported directly in tests without binding a port.
 *
 * Endpoints are stubs today — they will be backed by the Rust indexer
 * (`indexer/`) via its own query API once that lands.
 */
export function createApp(): Express {
  const app = express();

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/v1/trades", (_req, res) => {
    res.json({ trades: [], note: "not implemented yet" });
  });

  app.get("/v1/stats", (_req, res) => {
    res.json({ activeNodes: null, tradesLast24h: null, note: "not implemented yet" });
  });

  return app;
}
