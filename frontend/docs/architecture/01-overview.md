# 01 — Architecture Overview

## Product Vision

**VoiceGateway** is an enterprise-grade AI Voice Agent SaaS platform. It enables organizations to build, deploy, and monitor conversational AI voice agents that can handle phone calls in real time.

The platform provides:
- **Agent Builder** — Configure voice agents with system prompts, knowledge bases, voice settings, and tool integrations
- **Runtime Engine** — Real-time voice pipeline (STT → LLM → TTS) with telephony integration
- **Call Management** — Live call monitoring, recording, and analytics
- **Multi-tenant Organization** — Organization-scoped agents, team roles, and billing

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js 16)                    │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────────────┐ │
│  │  Auth   │ │  Shell   │ │  Modules │ │   Design System     │ │
│  │  Pages  │ │  Layout  │ │ (Agents, │ │   (Tokens + UI)     │ │
│  │         │ │  + Nav   │ │  Calls…) │ │                     │ │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────────────┘ │
│         │              │           │              │             │
│         ▼              ▼           ▼              ▼             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Service Layer (React Query Hooks → Services → apiClient) │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────┬───────────────────────────┘
                                      │ HTTP / WebSocket
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Backend (FastAPI + Python)                     │
│  ┌──────────┐ ┌──────────┐ ┌────────────┐ ┌──────────────────┐ │
│  │  API     │ │  Domain  │ │Infrastructure│ │    Runtime       │ │
│  │  Layer   │ │  Layer   │ │(DB, Redis,  │ │(STT/LLM/TTS/VAD) │ │
│  │          │ │          │ │  Adapters)  │ │                  │ │
│  └──────────┘ └──────────┘ └────────────┘ └──────────────────┘ │
│         │              │              │              │          │
│         ▼              ▼              ▼              ▼          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Core (Config, Security, Exceptions, Response Models)     │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Backend Overview

The backend is a **FastAPI** application organized by **clean architecture / domain-driven design** principles.

**Layers (outside→in):**

| Layer | Directory | Role |
|---|---|---|
| **API** | `app/api/` | HTTP endpoints, WebSocket routes, DI wiring |
| **Domain** | `app/domain/` | Business logic (currently scaffold) |
| **Infrastructure** | `app/infrastructure/` | Database, Redis, external adapters |
| **Runtime** | `app/runtime/` | Voice pipeline engine (STT/LLM/TTS/VAD) |
| **Core** | `app/core/` | Config, security, exceptions, response models |

**Dependency direction:**
- API → Domain → Infrastructure (never reverse)
- Runtime → Core (Runtime never imports Domain)
- Infrastructure → Core
- Core has no dependencies on other application layers

**Key technologies:**
- FastAPI (Python 3.14)
- SQLAlchemy 2.0 (async, PostgreSQL)
- Redis for caching and real-time messaging
- Alembic for database migrations
- JWT for authentication (access + refresh tokens)

## Frontend Overview

The frontend is a **Next.js 16** application using the **App Router** with a strongly-typed React architecture.

**Layer architecture:**

```
Component (presentational)
    │
    ▼
React Query Hook (useAgent, useOrganization)
    │
    ▼
Service (authService, agentService, organizationService)
    │
    ▼
API Client (Axios instance with JWT + activity tracking)
    │
    ▼
Backend (HTTP / WebSocket)
```

**Route groups:**

| Group | Layout | Shell |
|---|---|---|
| `(auth)` | AuthLayout (centered card) | Minimal |
| `(client)` | AppShell + Sidebar + Header | Full application shell |
| `(admin)` | AdminLayout (header-only) | Minimal shell |

**Key technologies:**
- Next.js 16 (App Router)
- @base-ui/react v1.6 (UI primitives)
- @tanstack/react-query v5 (server state)
- Zustand v5 (client state)
- Tailwind CSS v4 + CSS variables (theming)
- next-themes (dark/light mode)
- Lucide React (icons)
- class-variance-authority (component variants)

**State management:**
- **React Query** — Server state (data from API): agents, organizations, auth
- **Zustand** — Client state: auth tokens (persisted), UI state, shell state, activity tracking

## Runtime Overview

The Runtime is a **provider-agnostic voice pipeline** that orchestrates real-time conversation:

```
User Audio → VAD (Voice Activity Detection)
                ↓  (on speech end)
           STT (Speech-to-Text)
                ↓  (text transcript)
           LLM (Language Model)
                ↓  (AI response text)
           TTS (Text-to-Speech)
                ↓  (audio frames)
           Playback to Caller
```

**Key design principle:** The Runtime communicates with providers via **abstract ports** (interfaces), never concrete implementations. This means STT, LLM, TTS, and VAD providers can be swapped without changing Runtime logic.

**Provider adapters** implement the port contracts:
- STT: Whisper (local), future cloud APIs
- LLM: Ollama (local Qwen), future OpenAI, Anthropic
- TTS: Kokoro (local), future ElevenLabs, Azure
- VAD: Silero (local)

## Infrastructure Overview

- **PostgreSQL** — Primary data store
- **Redis** — Caching, session store, pub/sub for real-time events
- **Docker** — Local development via docker-compose
- **Alembic** — Database migrations

## Folder Philosophy

```
frontend/
├── src/
│   ├── app/          ← Next.js App Router pages (thin, delegates to components)
│   ├── components/   ← Reusable React components
│   │   ├── ui/       ← Design system primitives (generic, reusable)
│   │   ├── layout/   ← Layout primitives (PageContainer, Grid, Section)
│   │   └── shell/    ← Application shell (sidebar, header, nav)
│   ├── hooks/        ← React Query hooks (server state bridge)
│   ├── services/     ← API call functions (one per domain)
│   ├── store/        ← Zustand stores (client state)
│   ├── navigation/   ← Route registry, permissions, navigation hooks
│   ├── config/       ← Environment, feature flags, constants
│   ├── contexts/     ← React contexts (auth, etc.)
│   ├── lib/          ← Utilities (API client, cn())
│   ├── types/        ← Shared TypeScript types
│   ├── theme/        ← Design tokens
│   └── styles/       ← Global CSS
├── docs/
│   └── architecture/ ← This documentation
└── public/           ← Static assets

backend/
├── app/
│   ├── api/          ← FastAPI routers, dependencies, websockets
│   ├── domain/       ← Business logic (models, services, repositories)
│   ├── infrastructure/ ← Database, cache, external adapters
│   ├── runtime/      ← Voice pipeline engine (ports + core)
│   └── core/         ← Config, security, exceptions, response models
├── migrations/       ← Alembic migration scripts
└── scripts/          ← Demo and utility scripts
```
