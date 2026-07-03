# High-Level Architecture

## Core Philosophy

Separate every provider behind an interface.

Phone/Web/WhatsApp
        |
   Telephony Layer
        |
 Real-time Media Layer
        |
 Voice Pipeline
        |
+-------------------------------+
| STT | LLM | Memory | Tools |
| TTS | Analytics | Monitoring|
+-------------------------------+
        |
 Business Logic
        |
 Dashboard/API

## Major Components

1. Dashboard
2. Organization Manager
3. Agent Manager
4. Conversation Manager
5. Knowledge Base
6. Plugin Manager
7. Analytics
8. Monitoring
9. Deployment Layer

## Inspiration Sources

Pipecat
- Modular pipeline

LiveKit
- Media streaming
- SIP
- Plugins

Bolna
- Product workflow
- Dashboard concepts

Vocode
- Conversation manager

TEN Framework
- Extension architecture
- VAD ideas

## Long-term Vision

One AI agent should be usable through:
- Phone
- Website
- WhatsApp
- Future channels

without changing business logic.
