import asyncio
import websockets
import json
import base64
import numpy as np

async def test_websocket():
    uri = "ws://127.0.0.1:8000/ws/stream"
    print(f"Connecting to Gateway at {uri}...")
    
    try:
        # Provide an Origin header to satisfy FastAPI's CORSMiddleware
        headers = {"Origin": "http://localhost:3000"}
        async with websockets.connect(uri, additional_headers=headers) as websocket:
            print("Connected to WebSocket successfully!")
            
            import wave
            
            # Read real speech from a .wav file (16kHz PCM)
            wav_path = "assets/test_speech.wav"
            print(f"Reading {wav_path}...")
            
            with wave.open(wav_path, "rb") as wf:
                sample_rate = wf.getframerate()
                pcm_bytes = wf.readframes(wf.getnframes())
                
            packet = {
                "packet_type": "AUDIO",
                "stream_id": "test_stream_123",
                "payload": base64.b64encode(pcm_bytes).decode('utf-8'),
                "codec": "pcm_s16le", # Matches the WAV format
                "sample_rate": sample_rate
            }
            
            print("Sending AUDIO packet with real speech...")
            await websocket.send(json.dumps(packet))
            print("AUDIO packet sent.")
            
            print("Sending silence packets to trigger VAD end-of-speech...")
            # Send 25 silence packets (approx 2.5 seconds of silence)
            silence_bytes = bytes(4096)
            for _ in range(25):
                silence_packet = {
                    "packet_type": "AUDIO",
                    "stream_id": "test_stream_123",
                    "payload": base64.b64encode(silence_bytes).decode('utf-8'),
                    "codec": "pcm_s16le",
                    "sample_rate": sample_rate
                }
                await websocket.send(json.dumps(silence_packet))
                await asyncio.sleep(0.1)
            
            # Now let's wait for a response from the AI
            print("Waiting for AI response... (This might take up to 60 seconds as the AI wakes up)")
            
            # The AI might send multiple packets. We'll listen for a few seconds.
            while True:
                try:
                    response_str = await asyncio.wait_for(websocket.recv(), timeout=60.0)
                    response_json = json.loads(response_str)
                    packet_type = response_json.get("packet_type")
                    
                    if packet_type == "AUDIO":
                        payload = response_json.get("payload")
                        raw_bytes = base64.b64decode(payload)
                        print(f"Received AUDIO packet from AI: {len(raw_bytes)} bytes!")
                        # We could write it to a file or play it, but receiving it proves the bridge works!
                        break
                        
                except asyncio.TimeoutError:
                    print("Timeout waiting for AI response.")
                    break
                    
    except ConnectionRefusedError:
        print("Connection refused. Is the FastAPI server running?")
        print("Run 'uvicorn app.main:app --reload' in a separate terminal first.")

if __name__ == "__main__":
    asyncio.run(test_websocket())
