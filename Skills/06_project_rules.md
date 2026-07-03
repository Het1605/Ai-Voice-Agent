# Project Rules

Status: Active

Purpose:
Permanent engineering rules. These rules apply to the entire project.

---

## Core Goal

Build a commercial AI Phone Agent Platform.

Target:
- 90-95% open source
- Self-hostable
- Enterprise-ready
- Multi-tenant
- Multi-channel
- Plugin-based

---

## Architecture Rules

- Never couple business logic to a specific AI provider.
- Every external provider must be replaceable.
- Use interfaces/abstractions for all providers.
- Business logic must not depend on vendor SDKs.

---

## Plugin Rules

Every provider should be implemented as a plugin.

Plugin Types:
- STT
- LLM
- TTS
- Telephony
- Memory
- Vector DB
- Analytics
- Monitoring

Changing a provider should require configuration changes only.

---

## Open Source First

Always prefer:
1. Open source
2. Self-hosted
3. Commercial-friendly license
4. Active community

Paid services are allowed only when they provide a clear production advantage.

---

## Telecom Rule

The only acceptable long-term paid dependency is telecom connectivity (PSTN/SIP) if no practical open-source alternative exists.

Always research cheaper and reliable telecom options.

---

## AI Model Rule

Never lock the platform to:
- OpenAI
- Claude
- Gemini
- Any single vendor

Support multiple LLMs.

---

## Coding Rules

- Modular architecture
- Small reusable modules
- Async where appropriate
- Clean folder structure
- Clear naming
- Avoid unnecessary complexity

---

## Business Logic Rules

Business logic must never directly call:
- STT
- LLM
- TTS
- Telephony

Always communicate through provider interfaces.

---

## Product Rules

The product is NOT a chatbot.

The product IS an AI Phone Agent Platform.

Primary users:
- Banks
- Colleges
- Hospitals
- Schools
- Customer Support
- Enterprises

---

## Research Rules

Before adding any dependency, verify:
- Open source availability
- Self-hosting
- License
- Community
- Maintenance
- Production readiness
- Integration effort

---

## Future Channels

Design for:
- Phone
- Website
- WhatsApp

Business logic should remain the same across channels.

---

## Non-Goals (MVP)

Do not prioritize:
- Mobile app
- Video calls
- Avatars
- Complex multimodal features

Focus on building the phone platform first.

---

## Decision Policy

If multiple options exist:

1. Simpler architecture
2. Lower operational cost
3. Better maintainability
4. Better open-source ecosystem
5. Better production reliability

---

## Golden Rule

Every major component should be replaceable without rewriting the rest of the system.
