# merchant (`openfiat-merchant`)

A Next.js merchant dashboard: Overview, Advertisements, Settlements, and
Analytics pages (plus detail routes), currently rendering mock data
against locally defined types — not yet wired to a live OpenFiat node.

## How it connects to other services

Nothing in this repository yet — this app has no backend of its own built
out; it would eventually talk to a running node's `openfiat-rpc`/
`openfiat-api` JSON-RPC surface (from
[`openfiat-core`](https://github.com/OpenFiat-org/openfiat-core)) the way
`explorer/api` is meant to.

## Status

Built out with real pages/components against mock data; not yet wired to
a live backend. This whole `openfiat-apps` repository is not under active
development right now — see the repository root README. `openfiat-app`
(a separate, actively developed repository) is where this session's
frontend/design work is concentrated instead.
