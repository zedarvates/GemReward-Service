# Audit Frontend & Tâches à Effectuer

## Constat

**Aucun frontend n'existe dans ce projet.** Le repository contient uniquement un backend Python/FastAPI microservice (GemReward Service). Aucun fichier HTML, CSS, JavaScript, TypeScript, ni aucun framework frontend (React, Vue, Svelte, etc.) n'est présent.

---

## Stack Backend Existante

- **Framework**: FastAPI (Python 3.10+)
- **Base de données**: SQLAlchemy async (SQLite dev / PostgreSQL prod)
- **API Base URL**: `http://localhost:8001`
- **Documentation auto**: `/docs` (Swagger UI)
- **CORS**: Actuellement ouvert à toutes les origines (`allow_origins=["*"]`)
- **Endpoints principaux**:

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/` | Health check |
| POST | `/v1/apps/register` | Enregistrer une app avec règles |
| GET | `/v1/apps/{app_id}/rules` | Règles d'une app |
| POST | `/v1/webhooks/github/{app_id}` | Webhook GitHub |
| POST | `/v1/gems/ai/analyze-contribution` | Analyse IA d'une contribution |
| POST | `/v1/gems/ai/agent/register` | Enregistrer un agent IA |
| POST | `/v1/gems/ai/agent-contribution` | Soumettre contribution agent |
| GET | `/v1/gems/ai/agents` | Liste des agents avec réputation |
| GET | `/v1/gems/balance/{user_id}` | Solde d'un wallet |
| GET | `/v1/gems/history/{user_id}` | Historique des transactions |
| POST | `/v1/gems/transfer` | Transfert P2P |
| POST | `/v1/gems/escrow/create` | Créer un escrow |
| POST | `/v1/gems/escrow/release/{id}` | Libérer un escrow |
| POST | `/v1/gems/escrow/cancel/{id}` | Annuler un escrow |
| POST | `/v1/gems/worker/register` | Enregistrer un worker |
| POST | `/v1/gems/worker/heartbeat/{id}` | Heartbeat worker |
| GET | `/v1/gems/workers` | Liste des workers |
| GET | `/v1/gems/task-categories` | Catégories de tâches |
| POST | `/v1/gems/tasks/seed` | Seed des catégories |

---

## Tâches à Effectuer

### 1. Choix Technique du Frontend

- [ ] Choisir un framework frontend (React, Vue 3, Svelte, ou autre)
- [ ] Choisir une librairie UI (Tailwind, Material UI, Shadcn, etc.)
- [ ] Définir la structure du projet frontend (monorepo ou dossier séparé)
- [ ] Configurer le build tooling (Vite, Next.js, etc.)

### 2. Pages / Fonctionnalités à Développer

#### 2.1 Dashboard Principal
- [ ] Page d'accueil avec vue d'ensemble du service
- [ ] Statistiques globales (apps enregistrées, workers en ligne, total gems distribués)
- [ ] Graphiques d'activité (transactions par jour, etc.)

#### 2.2 Gestion des Applications
- [ ] Liste des applications enregistrées
- [ ] Formulaire d'enregistrement d'une nouvelle application
- [ ] Détail d'une application (clé API, webhook secret, règles)
- [ ] CRUD des règles de récompense

#### 2.3 Portefeuilles & Transactions
- [ ] Recherche de wallet par user ID
- [ ] Affichage du solde, du tier, du total earned
- [ ] Historique des transactions (filtré, paginé)
- [ ] Vue détaillée d'une transaction

#### 2.4 Agent Economy Dashboard
- [ ] Liste des agents IA enregistrés
- [ ] Scores de réputation, contributions, gems earned
- [ ] Formulaire d'enregistrement d'agent
- [ ] Simulateur de contribution (tester le scoring)

#### 2.5 Escrow & P2P
- [ ] Interface de transfert P2P
- [ ] Création / libération / annulation d'escrow
- [ ] Suivi des escrows en cours

#### 2.6 Worker Mesh (Compute)
- [ ] Vue des workers en ligne/offline/busy
- [ ] Détail d'un worker (VRAM, capabilities, last seen)
- [ ] Carte du mesh computing

#### 2.7 Webhook Tester
- [ ] Interface pour tester/visualiser les webhooks GitHub
- [ ] Simulation d'événements (issue labeled, PR merged)

### 3. Infrastructure & Qualité

- [ ] Gestion des erreurs API (toasts, messages d'erreur)
- [ ] Loading states pour toutes les pages
- [ ] Responsive design (mobile + desktop)
- [ ] Thème clair/sombre
- [ ] Tests frontend (unitaires + intégration)
- [ ] CI/CD pour le déploiement frontend

### 4. Sécurité

- [ ] Gestion des API keys (stockage côté client)
- [ ] Rate limiting awareness (afficher les limites)
- [ ] Validation des entrées côté client

### 5. Documentation

- [ ] README avec instructions de développement frontend
- [ ] Storybook ou équivalent pour la librairie de composants (optionnel)
