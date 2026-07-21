# 10 — Future Roadmap

## Phase 1: Authentication & Organizations

**Goal:** Working login, registration, organization management, and session handling.

### Dependencies
- Phase 0 (architecture, shell, design system, routing)
- Backend: Auth endpoints (scaffolded)
- Frontend: Auth pages (scaffolded)

### Deliverables
- [ ] Complete JWT auth flow (login, register, logout, refresh)
- [ ] Session persistence (token refresh on app load)
- [ ] Organization creation and management
- [ ] Organization switcher in the sidebar (extension)
- [ ] RouteGuard wired to actual auth state
- [ ] User menu with profile, settings, sign out
- [ ] Login error states (invalid credentials, network error)
- [ ] Registration validation (email format, password strength)

### Definition of Done
- User can register, verify email, login, and logout
- User can create and switch between organizations
- Auth tokens are refreshed transparently on expiry
- Unauthenticated users are redirected to login
- Protected routes redirect unauthorized users

---

## Phase 2: Agent Management

**Goal:** Full CRUD for AI voice agents with configuration.

### Dependencies
- Phase 1 (auth, organizations)
- Backend: Agent endpoints (scaffolded)
- Frontend: Agent pages (scaffolded)

### Deliverables
- [ ] Agent list with search, filter, pagination
- [ ] Agent creation wizard (name, language, basic config)
- [ ] Agent detail view with tab navigation
- [ ] Agent settings (name, description, language)
- [ ] Agent status management (active/inactive)
- [ ] Agent deletion with confirmation
- [ ] Empty state → populated state transitions

### Definition of Done
- Users can create, view, edit, and delete agents
- Agent list supports search and pagination
- Agent workspace tabs render correct content per tab
- Loading/error/empty states handled for all views

---

## Phase 3: Knowledge Base

**Goal:** Upload, manage, and query knowledge documents for agents.

### Dependencies
- Phase 2 (agents)
- Backend: Knowledge endpoints + document parsing + vector search

### Deliverables
- [ ] Knowledge base list with document counts
- [ ] Document upload (PDF, text, markdown)
- [ ] Document content extraction and chunking
- [ ] Vector embedding generation and storage
- [ ] Knowledge base → agent assignment
- [ ] Search over knowledge bases
- [ ] Document management (delete, update)

### Definition of Done
- Users can upload documents to a knowledge base
- Documents are parsed, chunked, and embedded
- Agents can be assigned knowledge bases
- RAG query returns relevant document chunks

---

## Phase 4: Runtime Core

**Goal:** Working voice pipeline with local AI models.

### Dependencies
- Phase 0 runtime architecture (ports, orchestrator skeleton)
- Local models: Whisper, Ollama, Kokoro, Silero

### Deliverables
- [ ] VAD integration (Silero) — speech/noise detection
- [ ] STT integration (Whisper) — audio → text
- [ ] LLM integration (Ollama/Qwen) — text → response
- [ ] TTS integration (Kokoro) — text → audio
- [ ] Orchestrator loop (VAD → STT → LLM → TTS)
- [ ] Conversation context management
- [ ] Barge-in interruption handling
- [ ] Session lifecycle (create, active, end)

### Definition of Done
- End-to-end voice conversation with a local AI agent
- System prompt controls agent behavior
- Barge-in interrupts AI response
- Conversations are recorded and stored

---

## Phase 5: Voice Providers

**Goal:** Connect the runtime to telephony and browser audio sources.

### Dependencies
- Phase 4 (runtime core)
- Determined by first provider integration

### Deliverables
- [ ] Abstract telephony provider interface
- [ ] Browser audio capture (WebRTC/microphone)
- [ ] Browser audio playback
- [ ] Audio frame normalization between providers
- [ ] Provider configuration UI

### Definition of Done
- Users can speak to an AI agent from the browser
- Audio flows through the full pipeline
- Provider can be configured per agent

---

## Phase 6: Browser Voice

**Goal:** Full browser-based voice experience without telephony.

### Dependencies
- Phase 5 (voice providers base)

### Deliverables
- [ ] Browser mic capture with VAD
- [ ] Real-time audio streaming to runtime
- [ ] Audio playback with buffering
- [ ] Connection status indicators
- [ ] Microphone permission handling
- [ ] Multi-turn conversation in browser

### Definition of Done
- Users can have a full voice conversation through the browser
- No telephony provider required
- Conversation history is preserved

---

## Phase 7: Calls

**Goal:** Call history, live monitoring, recording playback.

### Dependencies
- Phase 4 (runtime core)
- Phase 2 (agents)

### Deliverables
- [ ] Call list with filters (agent, date, duration, status)
- [ ] Call detail view (transcript, recording, metadata)
- [ ] Live call monitoring (real-time transcript)
- [ ] Call recording storage and playback
- [ ] Call analytics (duration, count, trends)
- [ ] Call export (transcript, audio)

### Definition of Done
- Users can view call history
- Users can listen to call recordings
- Users can read call transcripts
- Live calls show real-time transcription

---

## Phase 8: Analytics

**Goal:** Usage metrics, dashboards, and reporting.

### Dependencies
- Phase 7 (calls)
- Phase 2 (agents)

### Deliverables
- [ ] Dashboard metrics (calls today, avg duration, active agents)
- [ ] Usage trends (daily/weekly/monthly)
- [ ] Agent performance metrics
- [ ] Call quality metrics (transcription confidence, latency)
- [ ] Exportable reports (CSV, PDF)
- [ ] Custom date range selection

### Definition of Done
- Dashboard shows key metrics with historical trends
- Reports can be exported
- Data is accurate and matches raw call records

---

## Phase 9: Billing

**Goal:** Subscription management, usage-based billing, invoices.

### Dependencies
- Feature flag: `enableStripeBilling`
- Phase 1 (organizations)

### Deliverables
- [ ] Plan selection UI
- [ ] Stripe subscription integration
- [ ] Usage tracking (call minutes, agents, storage)
- [ ] Invoice generation and history
- [ ] Payment method management
- [ ] Plan upgrade/downgrade
- [ ] Overage handling

### Definition of Done
- Organizations can subscribe to a plan
- Usage is tracked and billed
- Invoices are generated and viewable
- Payment methods can be managed

---

## Phase 10: Integrations

**Goal:** Twilio, SIP, webhooks, custom API access.

### Dependencies
- Phase 2 (agents)
- Phase 5 (voice providers)

### Deliverables
- [ ] Twilio telephony provider adapter
- [ ] Incoming call handling (Twilio Voice Webhooks)
- [ ] Outbound calling from platform
- [ ] SIP trunk integration
- [ ] Webhook event notifications (call started, ended, etc.)
- [ ] API key management for programmatic access
- [ ] Integration configuration UI

### Definition of Done
- Users can connect Twilio phone numbers to agents
- Incoming calls are answered by configured agents
- Webhooks fire on call events
- API access works with generated keys

---

## Future Considerations

### Multi-Region Deployment
- Runtime scaling (multiple orchestrator instances)
- Regional voice provider endpoints
- Data residency compliance

### Enterprise Features
- SSO/SAML authentication
- Role-based access control (custom roles)
- Audit logging (exportable)
- SOC2 compliance tooling
- SLA monitoring and alerting

### Advanced AI Features
- LangGraph orchestrator (multi-step reasoning)
- Tool/function calling
- Emotion/sentiment detection
- Language detection and routing
- Custom fine-tuned voice models

### Developer Platform
- Public API with rate limiting
- Webhook retry and delivery guarantees
- SDK/API client libraries
- Webhook testing tools
- API documentation portal
