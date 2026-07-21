import os
import sys
import time
import queue
import asyncio
import logging
import numpy as np

# Resolve path
backend_dir = os.path.join(os.path.dirname(__file__), "..")
sys.path.append(os.path.abspath(backend_dir))
sys.path.append(os.path.abspath(os.path.join(backend_dir, "..")))

from app.voice_engine.core.call_runtime import CallRuntime
from app.voice_engine.events.models import RuntimeEvent, EventType
from app.voice_engine.core.audio import AudioFrame
from app.infrastructure.ai.faster_whisper import FasterWhisperAdapter
from app.infrastructure.ai.silero import SileroVadAdapter
from app.infrastructure.ai.ollama import OllamaAdapter
from app.infrastructure.ai.kokoro import KokoroAdapter
from app.voice_engine.orchestrators.hybrid import HybridOrchestrator
from app.infrastructure.workflows.mock import MockWorkflowAdapter
from app.core.config import settings

import sounddevice as sd

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(message)s")
logger = logging.getLogger("FullRuntimeDemo")

async def main():
    logger.info("=== Loading Models (This will take a moment) ===")
    
    # 1. Initialize Adapters
    vad_adapter = SileroVadAdapter()
    stt_adapter = FasterWhisperAdapter()
    await stt_adapter.start_stream()
    llm_adapter = OllamaAdapter()
    tts_adapter = KokoroAdapter()
    workflow_engine = MockWorkflowAdapter()
    
    # 2. Setup Runtime
    runtime = CallRuntime()
    session_id = runtime.get_session_id()
    
    orchestrator = HybridOrchestrator(
        llm=llm_adapter,
        tts=tts_adapter,
        event_bus=runtime.event_bus,
        session_id=session_id,
        workflow_engine=workflow_engine
    )
    runtime.conversation_engine.orchestrator = orchestrator
    
    # 3. Setup Audio Playback queue
    audio_out_queue = queue.Queue()
    playback_buffer = bytearray()
    
    async def handle_audio_out(event: RuntimeEvent):
        audio_frame = event.payload.get("audio_frame")
        if audio_frame and isinstance(audio_frame, AudioFrame):
            audio_out_queue.put(audio_frame.pcm_data)
            
    runtime.event_bus.subscribe(EventType.AUDIO_OUT, handle_audio_out)
    
    # Metrics tracking variables
    metrics = {}
    
    # Audio callback for playback
    def out_callback(outdata, frames, time_info, status):
        # Empty the queue into our continuous playback buffer
        while not audio_out_queue.empty():
            playback_buffer.extend(audio_out_queue.get_nowait())
            
        bytes_needed = frames * 2 # 16-bit mono = 2 bytes per frame
        
        if len(playback_buffer) >= bytes_needed:
            # We have enough data to fill the entire block
            chunk = playback_buffer[:bytes_needed]
            del playback_buffer[:bytes_needed]
            data = np.frombuffer(chunk, dtype=np.int16)
            outdata[:, 0] = data
        else:
            # Not enough data, play what we have and pad with zeros
            available_bytes = len(playback_buffer)
            if available_bytes >= 2:
                frames_available = available_bytes // 2
                valid_bytes = frames_available * 2
                chunk = playback_buffer[:valid_bytes]
                del playback_buffer[:valid_bytes]
                
                data = np.frombuffer(chunk, dtype=np.int16)
                outdata[:frames_available, 0] = data
                outdata[frames_available:, 0] = 0
            else:
                outdata.fill(0)

    output_stream = sd.OutputStream(
        samplerate=settings.TTS_SAMPLE_RATE,
        channels=1,
        dtype='int16',
        callback=out_callback,
        blocksize=4096
    )
    output_stream.start()

    logger.info("=== Microphone active! Start speaking. Say 'quit' to exit. ===")
    
    # VAD Loop Setup
    speech_buffer = bytearray()
    is_speaking = False
    silence_start_time = 0
    SILENCE_TOLERANCE = 1.0 # Wait 1 sec of silence before processing
    
    audio_in_queue = queue.Queue()
    def in_callback(indata, frames, time_info, status):
        audio_in_queue.put(indata.copy())
        
    input_stream = sd.InputStream(
        samplerate=settings.VAD_SAMPLE_RATE,
        channels=1,
        dtype='int16',
        callback=in_callback
    )
    input_stream.start()

    runtime.start()

    try:
        while True:
            # Check for AI speaking
            if runtime.context.get_metadata("conversation_state") in ["THINKING", "SPEAKING"]:
                await asyncio.sleep(0.1)
                continue
                
            try:
                # Get audio from mic
                indata = audio_in_queue.get_nowait()
                audio_bytes = indata.tobytes()
                
                # Run VAD
                vad_start = time.time()
                vad_frame = AudioFrame(
                    pcm_data=audio_bytes,
                    sample_rate=settings.VAD_SAMPLE_RATE,
                    channels=1,
                    sample_width=2
                )
                vad_state = await vad_adapter.process_audio(vad_frame)
                metrics["VAD_Detection_Time"] = time.time() - vad_start
                
                if vad_state.name == "SPEAKING":
                    if not is_speaking:
                        is_speaking = True
                        print("\n[VAD] User started speaking...")
                        metrics["Turn_Start"] = time.time()
                    speech_buffer.extend(audio_bytes)
                    silence_start_time = 0
                else:
                    if is_speaking:
                        speech_buffer.extend(audio_bytes)
                        if silence_start_time == 0:
                            silence_start_time = time.time()
                        elif time.time() - silence_start_time > SILENCE_TOLERANCE:
                            # Finished speaking
                            is_speaking = False
                            print("[VAD] User stopped speaking. Processing...")
                            
                            # 1. STT Phase
                            stt_start = time.time()
                            stt_frame = AudioFrame(
                                pcm_data=bytes(speech_buffer),
                                sample_rate=settings.VAD_SAMPLE_RATE, # STT uses 16kHz like VAD
                                channels=1,
                                sample_width=2
                            )
                            stt_result = await stt_adapter.process_audio(stt_frame)
                            metrics["STT_Latency"] = time.time() - stt_start
                            
                            transcript = stt_result.text.strip()
                            print(f"[STT] Transcript: '{transcript}'")
                            
                            if transcript.lower() in ["quit", "quit.", "exit", "exit."]:
                                break
                                
                            if len(transcript) > 2:
                                metrics["LLM_TTS_Start"] = time.time()
                                # 2. Trigger Orchestrator
                                runtime.event_bus.publish(RuntimeEvent(
                                    event_type=EventType.TRANSCRIPT_READY,
                                    session_id=session_id,
                                    payload={"text": transcript}
                                ))
                                
                                # Wait for AI to finish speaking
                                while runtime.context.get_metadata("conversation_state") in ["THINKING", "SPEAKING"]:
                                    if "TTFB" not in metrics and not audio_out_queue.empty():
                                        metrics["TTFB"] = time.time() - metrics["LLM_TTS_Start"]
                                    await asyncio.sleep(0.05)
                                    
                                # Print Metrics
                                print("\n--- Turn Performance Metrics ---")
                                print(f"VAD Frame Time: {metrics.get('VAD_Detection_Time', 0)*1000:.1f}ms")
                                print(f"STT Latency:    {metrics.get('STT_Latency', 0):.2f}s")
                                print(f"TTFB (LLM+TTS): {metrics.get('TTFB', 0):.2f}s")
                                total_latency = metrics.get('STT_Latency', 0) + metrics.get('TTFB', 0)
                                print(f"Total Latency:  {total_latency:.2f}s")
                                print("--------------------------------\n")
                                
                            # Reset
                            speech_buffer.clear()
                            metrics.clear()
                            
            except queue.Empty:
                await asyncio.sleep(0.01)
                
    except KeyboardInterrupt:
        pass
    finally:
        print("\nShutting down...")
        input_stream.stop()
        output_stream.stop()
        await stt_adapter.close_stream()
        runtime.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
