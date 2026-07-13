import os
import sys
import time
import asyncio
import logging

# Add backend AND workspace root to path
backend_dir = os.path.join(os.path.dirname(__file__), "..")
workspace_root = os.path.join(backend_dir, "..")
sys.path.append(os.path.abspath(backend_dir))
sys.path.append(os.path.abspath(workspace_root))

from app.infrastructure.ai.ollama import OllamaAdapter
from app.voice_engine.core.context import RuntimeContext

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger("LLM_Demo")

async def main():
    logger.info("=== Ollama Local LLM Adapter Demo ===")
    
    adapter = OllamaAdapter(
        system_prompt="You are a snarky, highly intelligent voice assistant. Keep it to one short paragraph."
    )
    
    # 1. Create a fake context with some history
    context = RuntimeContext()
    context.history = [
        {"role": "user", "content": "Hello, I am testing the local LLM integration."},
        {"role": "assistant", "content": "I see. And what exactly are you trying to test?"},
        {"role": "user", "content": "I want to see how fast you can stream tokens on my Mac."}
    ]
    
    logger.info(f"Model: {adapter.model_name}")
    logger.info("Connecting to Ollama... waiting for first token...")
    
    # Metrics
    start_time = time.time()
    first_token_time = None
    total_tokens = 0
    full_response = ""
    
    # 2. Stream generation
    try:
        async for token in adapter.generate_response_stream(context):
            if first_token_time is None:
                first_token_time = time.time()
                ttft = first_token_time - start_time
                logger.info(f"⚡ [TTFT] Time to First Token: {ttft:.3f} seconds ⚡")
                print("--- RESPONSE STREAM ---")
                
            # Print token instantly without newline
            print(token, end="", flush=True)
            
            full_response += token
            total_tokens += 1
            
    except Exception as e:
        logger.error(f"Failed to stream from Ollama: {e}")
        return
        
    print("\n-----------------------")
    
    # 3. Calculate final metrics
    end_time = time.time()
    total_time = end_time - start_time
    
    # If we got tokens, generation time is from first token to end time
    if total_tokens > 0:
        generation_time = end_time - first_token_time
        tokens_per_second = total_tokens / generation_time if generation_time > 0 else 0
        
        logger.info("=== Advanced Metrics ===")
        logger.info(f"Total Response Time : {total_time:.3f} seconds")
        logger.info(f"Time to First Token : {ttft:.3f} seconds")
        logger.info(f"Total Tokens Yielded: {total_tokens} tokens")
        logger.info(f"Inference Speed     : {tokens_per_second:.1f} tokens/second")
    else:
        logger.warning("No tokens were generated. Is Ollama running?")

if __name__ == "__main__":
    asyncio.run(main())
