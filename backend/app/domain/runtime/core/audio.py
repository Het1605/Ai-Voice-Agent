from pydantic import BaseModel, Field
import io
import wave

class AudioFrame(BaseModel):
    """
    Universal representation of an audio chunk within the CallRuntime.
    Always standardizes to raw PCM data.
    """
    pcm_data: bytes = Field(..., description="Raw PCM bytes")
    sample_rate: int = Field(..., description="Sample rate of the PCM data (e.g., 16000, 24000)")
    channels: int = Field(default=1, description="Number of channels (1 for mono)")
    sample_width: int = Field(default=2, description="Bytes per sample (2 for 16-bit PCM)")
    
    # Optional metadata
    timestamp: float = Field(default=0.0, description="Timestamp of the audio frame in seconds")
    codec: str = Field(default="pcm", description="Original codec before normalization, or purely 'pcm'")
    metadata: dict = Field(default_factory=dict, description="Additional transport or debugging metadata")

    def get_duration_seconds(self) -> float:
        """Calculate the duration of the audio frame in seconds."""
        # 1 sample = channels * sample_width bytes
        bytes_per_sample = self.channels * self.sample_width
        total_samples = len(self.pcm_data) / bytes_per_sample
        return total_samples / self.sample_rate

    def to_wav_bytes(self) -> bytes:
        """Wrap the raw PCM data in a WAV header."""
        wav_io = io.BytesIO()
        with wave.open(wav_io, 'wb') as wav_file:
            wav_file.setnchannels(self.channels)
            wav_file.setsampwidth(self.sample_width)
            wav_file.setframerate(self.sample_rate)
            wav_file.writeframes(self.pcm_data)
        return wav_io.getvalue()
