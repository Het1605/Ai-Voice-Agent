# AI Phone Agent Platform - Implementation Roadmap (Phase 1)

> Goal: Build the project in small, reviewable tasks.
> Rule: Never implement an entire module in a single prompt.

---

# Module 1 - Foundation Platform

## 1.1 Project Configuration
Centralized configuration (environment variables, settings, project constants).

## 1.2 Logging
Project-wide logging configuration.

## 1.3 Database Foundation
PostgreSQL connection, SQLAlchemy, sessions and base model.

## 1.4 Redis Foundation
Redis connection and manager.

## 1.5 Dependency Injection
Reusable dependency providers.

## 1.6 Common Infrastructure
Common exceptions, constants and shared utilities.

## 1.7 Health & Startup
Health endpoint, startup/shutdown lifecycle and Docker verification.

**Complete when**
- Backend runs
- Frontend runs
- PostgreSQL connected
- Redis connected

---

# Module 2 - Authentication & Authorization

## 2.1 User Model
Database model and schemas.

## 2.2 Password Security
Hashing and verification.

## 2.3 JWT Service
Access and refresh tokens.

## 2.4 Authentication Service
Authentication business logic.

## 2.5 Register API
User registration.

## 2.6 Login API
User login.

## 2.7 Refresh Token API
Refresh access token.

## 2.8 Logout API
Logout functionality.

## 2.9 Roles & Permissions
Basic authorization.

## 2.10 Frontend Authentication
Login, Register and protected routes.

**Complete when**
- User registration works
- Login works
- JWT authentication works

---

# Module 3 - Organization Management

## 3.1 Organization Model
Database structure.

## 3.2 Organization Service
Business logic.

## 3.3 Organization APIs
CRUD operations.

## 3.4 Member Management
Invite and manage members.

## 3.5 Organization Roles
Owner, Admin and Member roles.

## 3.6 Frontend Organization
Organization dashboard.

**Complete when**
- Multi-tenant organizations work

---

# Module 4 - Agent Management

## 4.1 Agent Model
Database model.

## 4.2 Agent Service
Business logic.

## 4.3 Agent APIs
CRUD operations.

## 4.4 Agent Configuration
Prompt, language, status, description.

## 4.5 Frontend Agent Dashboard
Manage agents.

**Complete when**
- Agents can be created and managed

---

# Module 5 - AI Runtime Foundation (COMPLETED)

## 5.1 AI Runtime Architecture Specification
Detailed blueprint of the Runtime Manager, Call Session, Context, and Event Flow.

## 5.2 Core Runtime and Session Foundation
Implement the `CallRuntime`, `CallSession`, and `RuntimeContext` base classes ensuring complete isolation per phone call.

## 5.3 Runtime Context
Implement the isolated temporary execution memory environment for a phone call.

## 5.4 Call Runtime
Establish the master orchestrator, strict 5-stage lifecycle, and dependency injection registry.

## 5.5 Runtime Event Bus
Implement an isolated `asyncio`-based Pub/Sub bus for intra-call event routing.

## 5.6 Session Synchronization (Hot & Cold State)
Implement logic to safely sync live state to Redis and flush completed call records to Postgres.

## 5.7 Runtime Manager
Implement the global registry to track, create, and securely tear down active `CallRuntime` instances.

**Complete when**
- The system can track, manage, and safely isolate concurrent call sessions from start to finish.

---

# Module 6 - Conversation Runtime (The Brain)

# Module 6 - Conversation Runtime

## 6.1 Provider Contracts (Ports)
Define the provider-independent interfaces (Ports) that the Runtime owns.

Create interfaces for:

- ILLMProvider
- ISTTProvider
- ITTSProvider
- IVADProvider
- IOrchestrator

The Runtime defines these contracts. Future providers (Qwen, GLM, DeepSeek, Faster-Whisper, Kokoro, LangGraph, etc.) will implement them.

---

## 6.2 Conversation Engine
Implement the ConversationEngine.

This is the decision-maker of the Runtime.

Responsibilities:

- Manage the conversation lifecycle.
- Decide the next action.
- Coordinate with Provider Contracts.
- Remain completely provider-independent.

The ConversationEngine decides **what should happen**, not **how providers execute it**.

---

## 6.3 Conversation Flow Controller
Implement the event-driven Conversation Flow Controller.

Responsibilities:

- Turn-taking
- Interruption (Barge-in)
- Conversation transitions
- Runtime state coordination
- Event-driven conversation flow

The controller reacts to Runtime events and determines how the conversation progresses.

---

## 6.4 Runtime Simulation & Integration Validation
Validate the complete Runtime before integrating real AI providers.

Create lightweight mock implementations for:

- Mock LLM
- Mock STT
- Mock TTS
- Mock VAD
- Mock Orchestrator

Verify:

- Runtime lifecycle
- Conversation flow
- Event flow
- Runtime isolation
- Multiple concurrent Runtime instances

No external APIs should be used.

**Complete when**

- The Runtime can execute a complete conversation using mock providers.
- The Runtime is fully validated and ready for real provider integration.


# Module 7 - Orchestrator & Provider Adapters

## 7.1 Local VAD Adapter
Implement `SileroAdapter` for robust, on-device silence detection.

## 7.2 Local STT Adapter
Implement `FasterWhisperAdapter` using endpoint-based pseudo-streaming.

## 7.3 Local LLM Adapter
Implement `OllamaAdapter` for streaming text generation from local models (Qwen/Llama).

## 7.4 Local TTS Adapter
Implement `KokoroAdapter` (or `PiperAdapter`) for lightning-fast local speech synthesis.

## 7.5 Router Orchestrator (Hybrid)
Implement a `HybridOrchestrator` to fulfill the `IOrchestrator` interface. Pipes directly to the LLM for standard conversation, and includes stubs to route to a Workflow Engine when tool calls are generated.

## 7.6 Workflow Engine Hooks (LangGraph)
Prepare the hooks for future LangGraph execution of complex multi-step reasoning.

## 7.7 Real Provider Integration Validation
Test the actual M3-local adapters against the CallRuntime.

**Complete when**
- The core runtime can successfully execute a real voice conversation using fully self-hosted, local M3 AI models.

---

# Module 8 - Audio Streaming Gateway

## 8.1 Audio Gateway Foundation & Schemas
Set up the `websockets` module, strictly typed Pydantic models for WebSocket payloads (e.g., Twilio Media messages), and the `WebSocketSessionHandler` state manager.

## 8.2 Audio Processing & Transcoding Pipeline
Implement an `AudioTranscoder` to handle payload decoding, G.711 µ-law <-> PCM translation, and sample rate conversions (8kHz <-> 16kHz/24kHz).

## 8.3 Runtime Event Routing (The Bridge)
Create the bridging coroutines to safely pipe raw audio bytes between the WebSocket (network layer) and the `CallRuntime`'s asynchronous `EventBus` without blocking the event loop.

## 8.4 WebSocket Audio Transport
Implement the FastAPI WebSocket endpoint, inject dependencies, and wire the transport layer to the audio pipeline and event router.

## 8.5 End-to-End Gateway Demo
Build a local client script to connect to the WebSocket and verify bi-directional audio latency and stability before integrating external telephony providers.

**Complete when**
- Audio bytes can flow in and out of the runtime bi-directionally with low latency over a WebSocket connection.

---

# Module 9 - Telephony Integration

## 9.1 Twilio Webhooks
Implement endpoints for Twilio Voice to connect live phone calls via Media Streams.

## 9.2 WebRTC Integration (Optional)
LiveKit or browser mic integration for web-based testing.

**Complete when**
- A user can dial a phone number and have a successful voice conversation with the AI.

---

# Module 10 - Knowledge Base & Tools (Post-Call Optimization)

## 10.1 File Storage & Vector DB
Upload, chunk, and embed documents for RAG.

## 10.2 Context Injection
Allow the LLM adapter to query the vector DB during a call.

## 10.3 Tool Calling
Enable the agent to execute actions (book appointments, lookup orders).

**Complete when**
- The agent can answer questions based on custom uploaded documents.
