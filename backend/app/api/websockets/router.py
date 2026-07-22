from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import logging
from app.api.websockets.session import WebSocketSessionHandler
from app.api.websockets.transcoder import AudioTranscoder
from app.api.websockets.bridge import WebSocketRuntimeBridge
from app.runtime.core.manager import runtime_manager

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/ws",
    tags=["WebSockets"]
)

@router.websocket("/stream")
async def audio_stream_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for bidirectional audio streaming.
    """
    session = WebSocketSessionHandler(websocket)
    await session.accept()
    
    # 1. Setup the CallRuntime via Manager (handles all DI)
    runtime = await runtime_manager.create_runtime()
    session_id = runtime.get_session_id()
    
    # 2. Setup Transcoder
    transcoder = AudioTranscoder(target_sample_rate=16000)
    
    # 3. Setup and start the Bridge
    bridge = WebSocketRuntimeBridge(
        session=session,
        runtime=runtime,
        transcoder=transcoder
    )
    
    try:
        runtime.start()
        await bridge.start()
    except WebSocketDisconnect:
        logger.info(f"Client disconnected from WebSocket (Session {session_id}).")
    except Exception as e:
        logger.error(f"WebSocket error for {session_id}: {e}")
    finally:
        await runtime_manager.end_runtime(session_id)
        await session.close()
