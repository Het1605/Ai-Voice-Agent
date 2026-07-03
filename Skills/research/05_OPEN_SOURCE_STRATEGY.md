# Open Source Strategy

Goal:
Replace every paid dependency where practical.

Target:
90-95% open source.

Matrix

STT
Paid: Deepgram
OSS: faster-whisper, Whisper, SenseVoice, Parakeet
Status: Research

LLM
Paid: GPT, Claude
OSS: GLM, Qwen, DeepSeek, Llama, Mistral
Status: Research

TTS
Paid: ElevenLabs, Cartesia
OSS: Piper, XTTS, Kokoro, OpenVoice
Status: Research

Telephony
Paid: Twilio, Telnyx, Exotel
OSS: Asterisk, FreeSWITCH, Kamailio, OpenSIPS
Status: Research
Note: Telecom connectivity may remain paid.

Vector DB
Paid: Pinecone
OSS: Qdrant, FAISS, Milvus, Weaviate

Monitoring
OSS: Prometheus, Grafana, OpenTelemetry

Rule:
Every layer should be replaceable through plugins.
