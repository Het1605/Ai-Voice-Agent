import logging
import asyncio
from typing import Optional
from enum import Enum

from backend.app.runtime.core.event_bus import EventBus
from backend.app.runtime.events.models import EventType, RuntimeEvent
from backend.app.runtime.core.audio import AudioFrame
from backend.app.runtime.ports import IVoiceActivityDetector, IAudioTranscriber, VadState

logger = logging.getLogger(__name__)

class PipelineState(Enum):
    IDLE = "IDLE"             # AI is speaking or not ready; ignoring audio
    LISTENING = "LISTENING"   # Monitoring for voice activity
    BUFFERING = "BUFFERING"   # Actively accumulating user speech
    TRANSCRIBING = "TRANSCRIBING" # STT is running

class AudioPipeline:
    """
    The Audio Processing Pipeline.
    Responsible for ingesting AUDIO_IN events from the network bridge,
    processing them through VAD, buffering speech, and running STT.
    
    Modeled as a small state machine.
    """
    def __init__(
        self, 
        session_id: str,
        event_bus: EventBus,
        vad: IVoiceActivityDetector,
        stt: IAudioTranscriber
    ):
        self.session_id = session_id
        self.event_bus = event_bus
        self.vad = vad
        self.stt = stt
        
        self.state = PipelineState.LISTENING
        
        # Buffering state
        self.speech_buffer = bytearray()
        self.silence_frames = 0
        self.max_silence_frames = 20  # Approx 2 seconds of silence
        
        # Subscribe to relevant events
        self.event_bus.subscribe(EventType.AUDIO_IN, self.handle_audio_in)
        self.event_bus.subscribe(EventType.STATE_CHANGED, self.handle_state_change)
        
    async def handle_state_change(self, event: RuntimeEvent):
        """
        Pauses listening if the Conversation Engine is in a state where user shouldn't be heard,
        or resets the pipeline if we return to LISTENING.
        """
        new_state = event.payload.get("state")
        
        # If the overall Runtime is LISTENING, we should be LISTENING
        if new_state == "LISTENING":
            if self.state in [PipelineState.IDLE, PipelineState.TRANSCRIBING]:
                self.reset_buffer()
                self.state = PipelineState.LISTENING
                
        # If the AI is SPEAKING or THINKING, we might want to continue listening for Barge-in!
        # Barge-in requires VAD to keep running. So we actually don't go IDLE during SPEAKING.
        # But for now, we'll just keep the pipeline active to allow barge-in detection.

    async def handle_audio_in(self, event: RuntimeEvent):
        """
        Receives an AudioFrame from the Gateway (via the Bridge).
        """
        if self.state == PipelineState.IDLE or self.state == PipelineState.TRANSCRIBING:
            return
            
        frame: AudioFrame = event.payload.get("audio_frame")
        if not frame:
            return

        # 1. Run Voice Activity Detection
        # VAD adapter handles state internally
        vad_state = await self.vad.process_audio(frame)
        
        if vad_state == VadState.SPEAKING:
            if self.state == PipelineState.LISTENING:
                # Transition: LISTENING -> BUFFERING
                logger.info(f"[{self.session_id}] User started speaking (VAD triggered)")
                self.state = PipelineState.BUFFERING
                
                # Notify the rest of the system (e.g. to interrupt TTS)
                self.event_bus.publish(RuntimeEvent(
                    event_type=EventType.USER_STARTED_SPEAKING,
                    session_id=self.session_id
                ))
            
            # Reset silence counter and append audio
            self.silence_frames = 0
            self.speech_buffer.extend(frame.pcm_data)
            
        else:
            if self.state == PipelineState.BUFFERING:
                # Silence detected while buffering
                self.silence_frames += 1
                self.speech_buffer.extend(frame.pcm_data) # Keep trailing silence for better STT context
                
                if self.silence_frames >= self.max_silence_frames:
                    # Transition: BUFFERING -> TRANSCRIBING
                    logger.info(f"[{self.session_id}] User stopped speaking. Beginning STT...")
                    self.state = PipelineState.TRANSCRIBING
                    
                    self.event_bus.publish(RuntimeEvent(
                        event_type=EventType.USER_STOPPED_SPEAKING,
                        session_id=self.session_id
                    ))
                    
                    # Offload STT to background task to avoid blocking the EventBus
                    asyncio.create_task(self._run_transcription())

    async def _run_transcription(self):
        """Runs STT on the buffered speech."""
        audio_data = bytes(self.speech_buffer)
        frame_to_transcribe = AudioFrame(pcm_data=audio_data, sample_rate=16000)
        
        try:
            result = await self.stt.process_audio(frame_to_transcribe)
            
            if result and result.text.strip():
                # Publish the transcript
                self.event_bus.publish(RuntimeEvent(
                    event_type=EventType.TRANSCRIPT_READY,
                    session_id=self.session_id,
                    payload={"text": result.text.strip()}
                ))
            else:
                # Empty transcript, go back to listening
                logger.debug(f"[{self.session_id}] STT returned empty transcript. Resetting.")
                self.state = PipelineState.LISTENING
                
        except Exception as e:
            logger.error(f"[{self.session_id}] Error in STT pipeline: {e}")
            self.state = PipelineState.LISTENING
            
        finally:
            self.reset_buffer()
            
    def reset_buffer(self):
        self.speech_buffer.clear()
        self.silence_frames = 0
