AI Phone Agent Platform - Runtime Principles

Purpose

This document defines the permanent architectural rules for the AI Runtime.

These principles apply to every runtime-related module and should only change after a major architectural decision.

⸻

1. Runtime First

The AI Runtime is the heart of the platform.

Everything else (Frontend, APIs, Providers, Telephony, Knowledge Base) exists to support the Runtime.

Never design the Runtime around a specific provider or framework.

⸻

2. One Runtime Per Call

Every incoming phone call creates a completely isolated Runtime instance.

Each Runtime owns:

* Call Session
* Runtime Context
* Event Bus
* State Machine
* Conversation
* Memory
* Metrics

No Runtime should share conversation state with another Runtime.

⸻

3. Runtime Owns Everything

The Runtime is the only component responsible for controlling a conversation.

Providers never communicate directly with each other.

All provider interactions must go through the Runtime.

Example:

STT → Runtime → LLM → Runtime → TTS

Never:

STT → LLM

or

LLM → TTS

⸻

4. Event-Driven Architecture

The Runtime must be fully asynchronous and event-driven.

Everything inside the Runtime happens through events.

Examples:

* Call Started
* Audio Received
* Transcript Ready
* User Started Speaking
* User Stopped Speaking
* LLM Started
* LLM Completed
* TTS Started
* TTS Completed
* Tool Started
* Tool Completed
* Call Ended

The Runtime reacts to events instead of following a blocking request/response flow.

An event-driven architecture is the recommended approach for low-latency AI agents and helps decouple producers from consumers while improving responsiveness. (Atlan)

⸻

5. Runtime State Machine

The Runtime always knows its current state.

Typical states include:

* Idle
* Listening
* Thinking
* Speaking
* Interrupted
* Error
* Ended

State transitions must be explicit and controlled by the Runtime.

⸻

6. Session Is the Source of Truth

A Call Session represents one live phone conversation.

The Session owns:

* Session ID
* Agent ID
* Call ID
* Current State
* Conversation History
* Runtime Metadata
* Timing Information
* Active Provider Context

Hot session state belongs in Redis.

Completed call data belongs in PostgreSQL.

⸻

7. Provider Independence

Business logic must never depend on a specific AI provider.

The Runtime communicates only with interfaces.

Examples:

* ILLMProvider
* ISTTProvider
* ITTSProvider
* IVADProvider
* IOrchestrator

Concrete providers implement these interfaces.

Changing providers should not require changes to Runtime logic.

A provider-agnostic runtime is a core architectural pattern for maintainable production AI systems. (C# Corner)

⸻

8. Framework Independence

LangGraph is an implementation detail.

The Runtime must not depend directly on LangGraph.

If LangGraph is replaced in the future, only its adapter should change.

The Runtime should continue working without modification.

⸻

9. Streaming First

Design everything assuming streaming.

Do not design for single request → single response.

Support:

* Streaming audio
* Streaming transcripts
* Streaming LLM responses
* Streaming TTS

Low latency is more important than batch processing.

⸻

10. Conversation Before Knowledge

A working conversation engine is more important than RAG.

Development order:

Conversation

↓

Providers

↓

Streaming

↓

Telephony

↓

Knowledge

↓

Tool Calling

Never let Knowledge Base drive the Runtime architecture.

⸻

11. Runtime Is Stateless Across Calls

The Runtime lives only for one phone call.

When the call ends:

* Persist required data.
* Release resources.
* Destroy the Runtime.

The next phone call creates a completely new Runtime.

⸻

12. Separation of Responsibilities

The Runtime is responsible for:

* Conversation flow
* State transitions
* Event processing
* Provider coordination

Providers are responsible only for their specialized work:

* STT converts audio to text.
* LLM generates responses.
* TTS converts text to audio.

The Runtime decides what happens next.

⸻

13. Business Logic Stays Outside the Runtime

The Runtime should not know whether it is talking as:

* Bank Agent
* College Agent
* Hospital Agent

Business behavior comes from Agent Profiles and future Knowledge/Tools.

The Runtime only executes conversations.

⸻

14. Observability

Every Runtime should produce logs, metrics, and traces.

At minimum, capture:

* Session lifecycle
* State transitions
* Provider latency
* Errors
* Event timeline

This will simplify debugging and performance optimization.

⸻

15. Simplicity Over Complexity

Always choose the simplest architecture that supports future growth.

Avoid premature optimization.

Do not introduce new abstractions unless they clearly improve maintainability.

The Runtime should remain easy to understand, test, and extend.