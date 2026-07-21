import re
from typing import AsyncGenerator, List, Tuple

class SentenceChunker:
    """
    Utility for chunking a stream of LLM tokens into complete sentences.
    This enables ultra-low latency TTS by synthesizing sentences as soon as 
    they are formed, rather than waiting for the entire paragraph.
    """
    
    # Matches common sentence-ending punctuation, including newlines
    # Use standard \n in the raw string, or a separate group to be safe
    SENTENCE_END_PATTERN = re.compile(r'([.?!]+|\n+)')
    
    @classmethod
    async def chunk_stream(cls, token_stream: AsyncGenerator[str, None]) -> AsyncGenerator[str, None]:
        """
        Takes an async generator of string tokens and yields full sentences.
        """
        buffer = ""
        
        async for token in token_stream:
            # Pass through tool calls immediately without chunking
            if token.startswith("__TOOL_CALL__:"):
                yield token
                continue
                
            buffer += token
            
            # Check if there is a sentence boundary in the buffer
            while True:
                match = cls.SENTENCE_END_PATTERN.search(buffer)
                if not match:
                    break
                    
                # The boundary includes the punctuation itself
                end_idx = match.end()
                
                sentence = buffer[:end_idx].strip()
                buffer = buffer[end_idx:]
                
                if sentence:
                    # Filter out purely punctuation sentences
                    if not all(c in ".?!\\n " for c in sentence):
                        yield sentence
                        
        # Yield any remaining text in the buffer that didn't end with punctuation
        final_sentence = buffer.strip()
        if final_sentence and not all(c in ".?!\\n " for c in final_sentence):
            yield final_sentence
