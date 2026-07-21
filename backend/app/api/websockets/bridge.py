import asyncio
import logging
import base64
from typing import Optional

from backend.app.api.websockets.session import WebSocketSessionHandler
from backend.app.api.websockets.transcoder import AudioTranscoder
from backend.app.api.websockets.schemas import AudioPacket, ControlPacket, PacketType
from backend.app.runtime.core.call_runtime import CallRuntime
from backend.app.runtime.core.audio import AudioFrame

logger = logging.getLogger(__name__)

class WebSocketRuntimeBridge:
    """
    Acts as the async bridge between the WebSocket, Transcoder, and CallRuntime.
    Uses asyncio.TaskGroup to manage bidirectional flow safely.
    """
    def __init__(self, session: WebSocketSessionHandler, runtime: CallRuntime, transcoder: AudioTranscoder):
        self.session = session
        self.runtime = runtime
        self.transcoder = transcoder
        self._is_running = False
        
        # Determine the target codec for outbound network audio (e.g., pcm_mulaw @ 8000Hz)
        self.target_codec = "pcm_mulaw"
        self.target_sample_rate = 8000

    async def start(self):
        """Starts the bidirectional loop until the socket closes or runtime terminates."""
        self._is_running = True
        logger.info(f"[{self.runtime.get_session_id()}] Bridge starting...")
        
        try:
            async with asyncio.TaskGroup() as tg:
                tg.create_task(self._downlink_loop())
                tg.create_task(self._uplink_loop())
        except* Exception as eg:
            for e in eg.exceptions:
                # Disconnect expected exceptions
                if "disconnect" not in str(e).lower():
                    logger.error(f"Bridge error: {e}")
        finally:
            self._is_running = False
            await self._cleanup()

    async def _downlink_loop(self):
        """Reads outgoing AudioFrames from Runtime API, transcodes, and sends over WebSocket."""
        while self._is_running and self.session.is_connected:
            try:
                # Wait for the next audio frame from the AI
                frame: AudioFrame = await self.runtime.get_audio_out()
                
                # Transcode (e.g. 24kHz -> 8kHz pcm_mulaw)
                encoded_bytes = self.transcoder.encode(
                    frame=frame,
                    target_codec=self.target_codec,
                    target_sample_rate=self.target_sample_rate
                )
                
                if encoded_bytes:
                    # Pack it into the generic schema (base64 for JSON websockets)
                    packet = AudioPacket(
                        stream_id=str(self.runtime.get_session_id()),
                        payload=base64.b64encode(encoded_bytes).decode('utf-8'),
                        codec=self.target_codec,
                        sample_rate=self.target_sample_rate
                    )
                    await self.session.send_json(packet.model_dump())
                    
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error(f"Downlink loop error: {e}")
                
    async def _uplink_loop(self):
        """Reads incoming packets from WebSocket, transcodes audio, and pushes to Runtime API."""
        while self._is_running and self.session.is_connected:
            try:
                data = await self.session.receive_json()
                
                packet_type = data.get("packet_type")
                if packet_type == PacketType.AUDIO.value:
                    payload = data.get("payload")
                    if isinstance(payload, str):
                        raw_bytes = base64.b64decode(payload)
                    else:
                        # If the payload came in some other format (or binary), handle it.
                        raw_bytes = bytes(payload)
                        
                    codec = data.get("codec", "pcm_mulaw")
                    sample_rate = data.get("sample_rate", 8000)
                    
                    frame = self.transcoder.decode(
                        payload=raw_bytes,
                        source_codec=codec,
                        source_sample_rate=sample_rate
                    )
                    if frame:
                        self.runtime.receive_audio(frame)
                        
                elif packet_type == PacketType.CONTROL.value:
                    action = data.get("action")
                    if action == "clear":
                        self.runtime.interrupt()
                        
            except asyncio.CancelledError:
                break
            except RuntimeError as e: # Catch websocket disconnected errors
                logger.info(f"WebSocket closed: {e}")
                self._is_running = False
                break
            except Exception as e:
                logger.error(f"Uplink loop error: {e}")
                
    async def _cleanup(self):
        """Ensure runtime shuts down gracefully if socket drops."""
        logger.info(f"[{self.runtime.get_session_id()}] Bridge tearing down...")
        self.runtime.shutdown()
        await self.session.close()
