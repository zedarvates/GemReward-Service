# 💎 GemReward-Service

GemReward-Service is a scalable, standalone microservice built with **FastAPI** to manage the global Gem Economy across the StoryCore Universe and beyond.

## 🚀 Features

*   **Multi-Tenant Architecture:** Supports multiple "Applications" (clients like StoryCore-Engine). 
*   **Unified Global Wallet:** Connect identities using GitHub or SSO to pool gems across the ecosystem.
*   **Universal Webhooks:** Listen to triggers from GitHub or any registered platform.
*   **Agent Control:** Native tracking and anti-abuse systems for autonomous AI contributors.

## 📦 Getting Started

### Prerequisites

*   Python 3.12+
*   PostgreSQL (or SQLite for local dev)

### Installation

1. Copy `.env.example` to `.env`.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```
*The server will run on port `8001` (to not conflict with StoryCore).*

## 📡 Webhooks Usage

The service exposes a universal webhook URL for client apps:

```
POST /v1/webhooks/{provider}/{app_id}
```

Example for GitHub configuring StoryCore-Engine (app_id: `1234-abcd`):
Target URL: `https://your-domain.com/v1/webhooks/github/1234-abcd`
Secret: *Your unique `app_id` secret generated on setup.*

### Triggering Gems
When a maintainer labels an issue with `gem-awarded`, the Webhook is fired, validated via HMAC-SHA256, and processed by the `GemEngineStandalone` using the client's configured reward rules.
