import type { NetworkNode } from "@/lib/types";

/**
 * Simulated network node registry (OFS-1000 series). IDs are plain
 * role-prefixed sequence numbers rather than hashed — a short hash slice
 * collided across only 12 entries in an earlier version of this file.
 */
export const NODES: NetworkNode[] = [
  { id: "node-full-1", role: "Full Node", region: "Nairobi, KE", version: "1.4.2", status: "Online", latencyMs: 12, peers: 84, stakeOpen: 12000 },
  { id: "node-full-2", role: "Full Node", region: "Lagos, NG", version: "1.4.2", status: "Online", latencyMs: 19, peers: 71, stakeOpen: 9500 },
  { id: "node-full-3", role: "Full Node", region: "Kampala, UG", version: "1.4.1", status: "Syncing", latencyMs: 44, peers: 22, stakeOpen: 6000 },
  { id: "node-boot-1", role: "Bootstrap Node", region: "Frankfurt, DE", version: "1.4.2", status: "Online", latencyMs: 8, peers: 210, stakeOpen: 40000 },
  { id: "node-boot-2", role: "Bootstrap Node", region: "Singapore, SG", version: "1.4.2", status: "Online", latencyMs: 11, peers: 198, stakeOpen: 38000 },
  { id: "node-snap-1", role: "Snapshot Provider", region: "Nairobi, KE", version: "1.4.2", status: "Online", latencyMs: 14, peers: 33, stakeOpen: 8000 },
  { id: "node-notify-1", role: "Notification Gateway", region: "Lagos, NG", version: "1.3.9", status: "Online", latencyMs: 22, peers: 47, stakeOpen: 5000 },
  { id: "node-oracle-1", role: "Oracle Provider", region: "Nairobi, KE", version: "1.4.2", status: "Online", latencyMs: 9, peers: 55, stakeOpen: 15000 },
  { id: "node-oracle-2", role: "Oracle Provider", region: "Accra, GH", version: "1.4.0", status: "Offline", latencyMs: 0, peers: 0, stakeOpen: 15000 },
  { id: "node-risk-1", role: "Risk Intelligence Provider", region: "Frankfurt, DE", version: "1.4.2", status: "Online", latencyMs: 16, peers: 29, stakeOpen: 20000 },
  { id: "node-mgw-1", role: "Merchant Gateway", region: "Kampala, UG", version: "1.4.1", status: "Online", latencyMs: 27, peers: 18, stakeOpen: 5000 },
  { id: "node-api-1", role: "Public API Node", region: "Singapore, SG", version: "1.4.2", status: "Online", latencyMs: 13, peers: 62, stakeOpen: 10000 },
];

export function nodeById(id: string): NetworkNode | undefined {
  return NODES.find((n) => n.id === id.toLowerCase());
}
