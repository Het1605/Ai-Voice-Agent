import os
import sys
import wave
import asyncio
import logging

# Setup absolute paths
backend_dir = os.path.join(os.path.dirname(__file__), "..")
sys.path.append(os.path.abspath(backend_dir))
sys.path.append(os.path.abspath(os.path.join(backend_dir, "..")))

from app.voice_engine.core.call_runtime import CallRuntime
from app.voice_engine.events.models import RuntimeEvent, EventType
from app.infrastructure.ai.ollama import OllamaAdapter
from app.infrastructure.ai.kokoro import KokoroAdapter
from app.voice_engine.orchestrators.hybrid import HybridOrchestrator
from app.core.config import settings

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("DemoConversation")

async def main():
    logger.info("=== E2E Local AI Conversation Demo ===")
    
    # 1. Initialize Adapters
    logger.info("Loading Models... (This takes a few seconds)")
    llm_adapter = OllamaAdapter()
    tts_adapter = KokoroAdapter()
    logger.info("Models loaded successfully!")
    
    # 2. Create the Call Runtime
    runtime = CallRuntime()
    session_id = runtime.get_session_id()
    
    # 3. Create the Orchestrator and wire it up
    orchestrator = HybridOrchestrator(
        llm=llm_adapter,
        tts=tts_adapter,
        event_bus=runtime.event_bus,
        session_id=session_id
    )
    # Inject orchestrator into the engine
    runtime.conversation_engine.orchestrator = orchestrator
    
    # We will accumulate audio bytes fired by the Orchestrator
    audio_buffer = bytearray()
    
    async def capture_audio(event: RuntimeEvent):
        audio_bytes = event.payload.get("audio_bytes")
        if audio_bytes:
            audio_buffer.extend(audio_bytes)
            
    runtime.event_bus.subscribe(EventType.AUDIO_OUT, capture_audio)
    
    # 4. Start the Call
    runtime.start()
    
    print("\n" + "="*50)
    print("Welcome to the AI Voice Agent Local Demo!")
    print("Type your message below and press ENTER to talk to the AI.")
    print("Type 'quit' or 'exit' to end the conversation.")
    print("="*50 + "\n")
    
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["quit", "exit"]:
            break
            
        if not user_input.strip():
            continue
            
        # Reset the audio buffer for the new turn
        audio_buffer.clear()
        
        # 5. Fire TRANSCRIPT_READY event to simulate STT finishing
        runtime.event_bus.publish(RuntimeEvent(
            event_type=EventType.TRANSCRIPT_READY,
            session_id=session_id,
            payload={"text": user_input}
        ))
        
        # Wait a small bit for the orchestrator to kick off asynchronously
        await asyncio.sleep(0.5)
        
        # Wait until the AI is done speaking
        while runtime.context.get_metadata("conversation_state") in ["THINKING", "SPEAKING"]:
            await asyncio.sleep(0.1)
            
        # The turn is over! Check if we got any audio.
        if audio_buffer:
            output_file = os.path.join(os.path.dirname(__file__), "response.wav")
            with wave.open(output_file, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(settings.TTS_SAMPLE_RATE)
                wf.writeframes(audio_buffer)
            logger.info(f"AI response audio saved to: {output_file}")
            print("\n[AI Finished Speaking - Audio Saved]\n")

    runtime.shutdown()
    logger.info("Demo concluded safely.")

if __name__ == "__main__":
    asyncio.run(main())
