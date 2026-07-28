<div align="center">

# openfiat-apps

**OpenFiat applications: wallet (deferred), merchant dashboard, and network explorer.**

[![CI](https://github.com/OpenFiat-org/openfiat-apps/actions/workflows/ci.yml/badge.svg)](https://github.com/OpenFiat-org/openfiat-apps/actions/workflows/ci.yml)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Discussions](https://img.shields.io/github/discussions/OpenFiat-org/openfiat-apps)](https://github.com/orgs/OpenFiat-org/discussions)

[Website](https://openfiat.network) · [Docs](https://docs.openfiat.network) · [Specs](https://github.com/OpenFiat-org/openfiat-specs) · [Contributing](CONTRIBUTING.md)

</div>

---

## About

`openfiat-apps` is part of the [OpenFiat](https://github.com/OpenFiat-org)
ecosystem — an open, decentralized peer-to-peer protocol for exchanging
stablecoins for local fiat currency. Solana secures asset settlement through
audited smart contracts; OpenFiat coordinates the peer-to-peer marketplace
layer (discovery, advertisements, reputation, governance, notifications, and
more) without centralized infrastructure.

This repository (Application) — openfiat applications: wallet (deferred), merchant dashboard, and network explorer.

For the full protocol motivation and design, see the
[whitepaper](https://github.com/OpenFiat-org/openfiat-specs) and the
[protocol specifications](https://github.com/OpenFiat-org/openfiat-specs/tree/main/Whitepaper/Specifications).

## Repository layout

```
.
├── wallet/               # deferred (Flutter) — see wallet/README.md
├── merchant/             # Next.js merchant dashboard
├── explorer/
│   ├── web/               # Next.js explorer frontend
│   ├── api/               # Express backend serving indexed data
│   └── indexer/           # Rust indexer (consumes network events)
├── docs/
└── examples/
```


## Quick start

```bash
pnpm install
pnpm --filter @openfiat/explorer-api dev &   # explorer backend on :8080
pnpm --filter @openfiat/explorer-web dev &   # explorer frontend on :3000
pnpm --filter openfiat-merchant dev          # merchant dashboard on :3000 (pick a free port)
```


## Development

Node apps (merchant, explorer/web, explorer/api) share one pnpm workspace at
the repo root. The explorer indexer is an independent Rust crate.

```bash
pnpm lint && pnpm typecheck && pnpm build
(cd explorer/indexer && cargo fmt --all -- --check && cargo clippy --all-targets --all-features -- -D warnings)
```


## Testing

```bash
pnpm test
(cd explorer/indexer && cargo test)
```


## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) and
our [Code of Conduct](CODE_OF_CONDUCT.md) before opening a pull request.
Security issues should be reported per [SECURITY.md](SECURITY.md), not as
public issues.

See [ROADMAP.md](ROADMAP.md) for current priorities and
[CHANGELOG.md](CHANGELOG.md) for release history.

## License

Licensed under the [Apache License, Version 2.0](LICENSE).
