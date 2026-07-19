import logging
from typing import Optional
from fastapi import WebSocket

logger = logging.getLogger(__name__)

class WebSocketSessionHandler:
    """
    Manages the lifecycle of a single WebSocket connection.
    Isolated from audio processing and Runtime logic.
    """
    def __init__(self, websocket: WebSocket):
        self.websocket = websocket
        self.stream_id: Optional[str] = None
        self.is_connected = False

    async def accept(self):
        """Accepts the incoming WebSocket connection."""
        await self.websocket.accept()
        self.is_connected = True
        logger.info("WebSocket connection accepted.")

    async def receive_json(self) -> dict:
        """Receives a JSON payload from the WebSocket."""
        if not self.is_connected:
            raise RuntimeError("WebSocket is not connected.")
        return await self.websocket.receive_json()

    async def send_json(self, data: dict):
        """Sends a JSON payload over the WebSocket."""
        if not self.is_connected:
            return
        try:
            await self.websocket.send_json(data)
        except Exception as e:
            logger.error(f"Failed to send JSON over WebSocket: {e}")
            self.is_connected = False

    async def close(self, code: int = 1000):
        """Closes the WebSocket connection."""
        if self.is_connected:
            try:
                await self.websocket.close(code=code)
            except Exception as e:
                logger.debug(f"Error while closing WebSocket: {e}")
            finally:
                self.is_connected = False
                logger.info("WebSocket connection closed.")
