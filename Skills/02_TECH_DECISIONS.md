# Technical Decisions

## Backend
FastAPI

Reason:
- Async
- Python AI ecosystem
- Easy API development

## Frontend
Next.js + React

Reason:
- SaaS dashboard
- SSR support
- Large ecosystem

## Database
PostgreSQL

## Cache
Redis

## Vector Database
Qdrant (primary)
FAISS for local experiments

## Real-time Layer
LiveKit

## Voice Pipeline
Custom implementation inspired by Pipecat

## Conversation Management
LangGraph + Custom State Manager
Inspired by Vocode

## Plugin System
Inspired by TEN Framework

## Dashboard Ideas
Inspired by Bolna

## LLM (Research Candidates)
- GLM
- Qwen
- DeepSeek
- Llama
- Gemma
- Mistral

## STT Candidates
- faster-whisper
- Whisper
- SenseVoice
- NVIDIA Parakeet

## TTS Candidates
- Piper
- XTTS
- Kokoro
- OpenVoice

## Telephony
Research:
- Asterisk
- FreeSWITCH
- Kamailio
- OpenSIPS
- Twilio
- Exotel
- Telnyx

Goal:
Keep telecom as the only unavoidable paid dependency if possible.
