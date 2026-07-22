import json
import logging
import httpx
from typing import AsyncGenerator

from app.runtime.ports import ILLMGenerator
from app.runtime.core.context import RuntimeContext
from app.core.config import settings

logger = logging.getLogger(__name__)

class OllamaAdapter(ILLMGenerator):
    """
    Local LLM Adapter using Ollama's HTTP streaming API.
    Bypasses heavy SDKs for zero-dependency, ultra-low latency token generation.
    """
    def __init__(self, system_prompt: str = "You are a helpful AI assistant. Keep responses brief and conversational."):
        self.model_name = settings.LLM_MODEL_NAME
        self.base_url = settings.OLLAMA_BASE_URL
        self.system_prompt = system_prompt
        
    async def generate_response_stream(self, context: RuntimeContext) -> AsyncGenerator[str, None]:
        """
        Connects to Ollama's streaming /api/chat endpoint.
        Reads conversational history directly from the RuntimeContext.
        """
        # 1. Prepare Messages Array
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(context.history)
        
        url = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model_name,
            "messages": messages,
            "stream": True,
            "tools": [
                {
                    "type": "function",
                    "function": {
                        "name": "get_weather",
                        "description": "Get the current weather for a specific location",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "location": {"type": "string", "description": "The city and state, e.g. San Francisco, CA"}
                            },
                            "required": ["location"]
                        }
                    }
                },
                {
                    "type": "function",
                    "function": {
                        "name": "book_appointment",
                        "description": "Book a new appointment",
                        "parameters": {
                            "type": "object",
                            "properties": {
                                "time": {"type": "string", "description": "The time to book, e.g. 2:00 PM"}
                            },
                            "required": ["time"]
                        }
                    }
                }
            ]
        }
        
        logger.debug(f"Connecting to Ollama at {url} (Model: {self.model_name})")
        
        # 2. Open Async HTTP Stream
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", url, json=payload, timeout=30.0) as response:
                    
                    if response.status_code != 200:
                        error_msg = await response.aread()
                        logger.error(f"Ollama API Error ({response.status_code}): {error_msg.decode()}")
                        yield "I'm having trouble thinking right now."
                        return

                    # 3. Stream NDJSON Chunks
                    async for line in response.aiter_lines():
                        if not line:
                            continue
                            
                        try:
                            data = json.loads(line)
                            message = data.get("message", {})
                            content = message.get("content", "")
                            tool_calls = message.get("tool_calls")
                            
                            if tool_calls:
                                # We yield a special prefix so the Orchestrator knows it's a tool call
                                yield f"__TOOL_CALL__:{json.dumps(tool_calls)}"
                                break
                                
                            if content:
                                yield content
                                
                            if data.get("done", False):
                                break
                                
                        except json.JSONDecodeError:
                            logger.warning(f"Failed to parse Ollama chunk: {line}")
                            continue

        except httpx.ConnectError:
            logger.error(f"Could not connect to Ollama at {self.base_url}. Is the service running?")
            yield "I'm offline and cannot connect to my brain."
        except Exception as e:
            logger.error(f"Unexpected error in OllamaAdapter: {e}")
            yield "Sorry, something went wrong with my language center."
