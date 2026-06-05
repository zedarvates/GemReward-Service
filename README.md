# GemReward Service 💎

[![Python](https://img.shields.io/badge/python-3.11+-blue.svg)]()
[![License](https://img.shields.io/badge/license-MIT-green.svg)]()
[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)]()

Token reward system for the NexRealm ecosystem — proof-of-Contribution Chain, Closed Gem Economy, Cross-Project Gems.

## Architecture

```
GemReward Service
├── Contribution Chain    — Proof-of-Contribution tracking
├── Gem Ledger           — Token accounting
├── Voting Power         — Roadmap priority voting
└── Marketplace API      — NexRealm marketplace bridge
```

## API Endpoints

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/balance` | GET | Solde de gems |
| `/api/transfer` | POST | Transfert de gems |
| `/api/contribute` | POST | Enregistrer une contribution |
| `/api/vote` | POST | Voter sur la roadmap |
| `/api/leaderboard` | GET | Classement des contributeurs |

## Concepts

- **Proof-of-Contribution** — Chaque contribution traçable donne du pouvoir de vote
- **Closed Gem Economy** — Les gems sont la monnaie du NexRealm Marketplace
- **Cross-Project Gems** — Les gems sont portables entre écosystèmes créatifs

## Projets liés

- [hermes-brain](https://github.com/zedarvates/hermes-brain) — Architecture cognitive
- [gardemanger](https://github.com/zedarvates/gardemanger) — Food autonomy system
- [ElectroClaw](https://github.com/zedarvates/ElectroClaw) — Mesh multi-node

## Licence MIT
