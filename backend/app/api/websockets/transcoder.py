import logging
import io
from typing import Optional
import av

from backend.app.runtime.core.audio import AudioFrame

logger = logging.getLogger(__name__)

class AudioTranscoder:
    """
    A strictly transport-independent audio transcoder.
    Uses PyAV (FFmpeg) to decode arbitrary codecs (e.g., G.711 mu-law, Opus, PCM) 
    into a normalized 16kHz PCM AudioFrame, and vice-versa for encoding.
    """
    
    def __init__(self, target_sample_rate: int = 16000):
        """
        :param target_sample_rate: The internal PCM sample rate expected by the Runtime (usually 16kHz for STT/VAD).
        """
        self.target_sample_rate = target_sample_rate
        self.target_channels = 1
        self.target_format = 's16'  # 16-bit signed integer PCM
        
        # We create a generic resampler that outputs to our target format
        self.decode_resampler = av.AudioResampler(
            format=self.target_format,
            layout='mono',
            rate=self.target_sample_rate
        )

    def decode(self, payload: bytes, source_codec: str, source_sample_rate: int, source_channels: int = 1, timestamp: float = 0.0) -> Optional[AudioFrame]:
        """
        Decodes raw encoded bytes from a specific codec into a normalized PCM AudioFrame.
        
        :param payload: The raw encoded audio bytes.
        :param source_codec: FFmpeg codec name (e.g., 'pcm_mulaw', 'opus', 'pcm_s16le').
        :param source_sample_rate: Sample rate of the incoming audio (e.g., 8000).
        :param source_channels: Number of channels in the incoming audio.
        :return: A normalized PCM AudioFrame, or None if decoding failed/empty.
        """
        if not payload:
            return None
            
        try:
            # Create a PyAV CodecContext for decoding
            codec = av.CodecContext.create(source_codec, 'r')
            codec.sample_rate = source_sample_rate
            codec.layout = 'mono' if source_channels == 1 else 'stereo'
            
            # Create a packet from the raw bytes
            packet = av.Packet(payload)
            
            # Decode the packet into AVFrames
            frames = codec.decode(packet)
            
            pcm_bytes = bytearray()
            for frame in frames:
                # Resample and convert format to target (16kHz, s16, mono)
                resampled_frames = self.decode_resampler.resample(frame)
                for r_frame in resampled_frames:
                    # to_ndarray() returns shape (channels, samples). We want flat bytes.
                    pcm_bytes.extend(r_frame.to_ndarray().tobytes())
                    
            if not pcm_bytes:
                return None
                
            return AudioFrame(
                pcm_data=bytes(pcm_bytes),
                sample_rate=self.target_sample_rate,
                channels=self.target_channels,
                sample_width=2,  # s16 is 2 bytes
                timestamp=timestamp,
                codec=source_codec
            )
            
        except Exception as e:
            logger.error(f"Failed to decode audio payload ({source_codec} @ {source_sample_rate}Hz): {e}")
            return None

    def encode(self, frame: AudioFrame, target_codec: str, target_sample_rate: int, target_channels: int = 1) -> Optional[bytes]:
        """
        Encodes a normalized PCM AudioFrame into a specific output codec.
        
        :param frame: The normalized AudioFrame (e.g., from TTS).
        :param target_codec: FFmpeg codec name (e.g., 'pcm_mulaw').
        :param target_sample_rate: Sample rate of the output audio (e.g., 8000).
        :param target_channels: Number of channels in the output audio.
        :return: Raw encoded bytes ready to be sent over the transport.
        """
        if not frame or not frame.pcm_data:
            return None
            
        try:
            # PyAV encoding can be slightly tricky for raw streams.
            # We must create an AVFrame from the PCM bytes, resample it to the target format,
            # and then encode it using the target codec.
            
            # 1. Reconstruct the AVFrame from the internal AudioFrame
            input_frame = av.AudioFrame(
                format='s16', 
                layout='mono', 
                samples=len(frame.pcm_data) // (frame.channels * frame.sample_width)
            )
            input_frame.sample_rate = frame.sample_rate
            
            # Copy bytes into the AVFrame planes
            for i, plane in enumerate(input_frame.planes):
                plane.update(frame.pcm_data)
                
            # 2. Setup output codec
            output_codec = av.CodecContext.create(target_codec, 'w')
            output_codec.sample_rate = target_sample_rate
            output_codec.layout = 'mono' if target_channels == 1 else 'stereo'
            
            # Let PyAV choose the best format for the codec if not set
            if output_codec.format is None:
                if output_codec.codec.audio_formats:
                    output_codec.format = output_codec.codec.audio_formats[0]
                else:
                    output_codec.format = 's16'
            
            # 3. Resample to match the output codec's requirements
            encode_resampler = av.AudioResampler(
                format=output_codec.format.name,
                layout='mono' if target_channels == 1 else 'stereo',
                rate=target_sample_rate
            )
            
            encoded_bytes = bytearray()
            
            # Resample
            resampled_frames = encode_resampler.resample(input_frame)
            
            # Encode
            for r_frame in resampled_frames:
                packets = output_codec.encode(r_frame)
                for p in packets:
                    encoded_bytes.extend(bytes(p))
                    
            # Flush encoder
            packets = output_codec.encode(None)
            for p in packets:
                encoded_bytes.extend(bytes(p))
                
            return bytes(encoded_bytes) if encoded_bytes else None
            
        except Exception as e:
            logger.error(f"Failed to encode AudioFrame to {target_codec}: {e}")
            return None
