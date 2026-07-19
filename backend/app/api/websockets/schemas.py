from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, Union
from enum import Enum

class PacketType(str, Enum):
    CONNECTION = "CONNECTION"
    AUDIO = "AUDIO"
    CONTROL = "CONTROL"

class BasePacket(BaseModel):
    """Base class for all internal network packets."""
    packet_type: PacketType

class ConnectionPacket(BasePacket):
    """
    Indicates a new connection or disconnection.
    """
    packet_type: PacketType = PacketType.CONNECTION
    stream_id: str
    event: str  # e.g., "start", "stop"
    metadata: Optional[Dict[str, Any]] = None

class AudioPacket(BasePacket):
    """
    Represents an audio chunk transmitted over the WebSocket.
    The payload format depends on the codec (e.g., base64 string or raw bytes).
    """
    packet_type: PacketType = PacketType.AUDIO
    stream_id: str
    payload: Union[str, bytes]
    codec: str = "pcmu"  # e.g., "pcmu", "pcm16", "opus"
    sample_rate: int = 8000

class ControlPacket(BasePacket):
    """
    Represents a control event (e.g., clearing the buffer, marking a timestamp).
    """
    packet_type: PacketType = PacketType.CONTROL
    stream_id: str
    action: str  # e.g., "clear", "mark"
    metadata: Optional[Dict[str, Any]] = None
