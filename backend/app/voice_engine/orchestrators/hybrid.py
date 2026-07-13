import logging
import asyncio
from enum import Enum
import uuid

from backend.app.voice_engine.ports import IOrchestrator
from backend.app.voice_engine.ports import ILLMGenerator
from backend.app.voice_engine.ports import IAudioSynthesizer
from backend.app.voice_engine.core.context import RuntimeContext
from backend.app.voice_engine.core.event_bus import EventBus
from backend.app.voice_engine.events.models import EventType, RuntimeEvent
from backend.app.voice_engine.utils.chunker import SentenceChunker

logger = logging.getLogger(__name__)

class OrchestratorState(Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    INTERRUPTING = "INTERRUPTING"
    CANCELLED = "CANCELLED"
    COMPLETED = "COMPLETED"
    ERROR = "ERROR"

class HybridOrchestrator(IOrchestrator):
    """
    The Hybrid Orchestrator manages conversational memory, streams text from the LLM, 
    chunks it into sentences, and pipes it immediately into the TTS for ultra-low latency.
    """
    def __init__(
        self, 
        llm: ILLMGenerator, 
        tts: IAudioSynthesizer, 
        event_bus: EventBus, 
        session_id: uuid.UUID,
        workflow_engine: "IWorkflowEngine" = None
    ):
        self.llm = llm
        self.tts = tts
        self.event_bus = event_bus
        self.session_id = session_id
        self.workflow_engine = workflow_engine
        self.state = OrchestratorState.IDLE

    async def process_turn(self, context: RuntimeContext) -> None:
        if self.state == OrchestratorState.RUNNING:
            logger.warning(f"[{self.session_id}] Orchestrator is already running. Ignoring request.")
            return
            
        self.state = OrchestratorState.RUNNING
        logger.info(f"[{self.session_id}] HybridOrchestrator starting turn processing...")
        
        full_response = ""
        
        try:
            # 1. Start generating the raw text stream from LLM
            llm_stream = self.llm.generate_response_stream(context)
            
            # 2. Pipe the LLM token stream into the Sentence Chunker
            sentence_stream = SentenceChunker.chunk_stream(llm_stream)
            
            # 3. For each complete sentence, synthesize audio immediately
            async for sentence in sentence_stream:
                if self.state == OrchestratorState.INTERRUPTING:
                    logger.warning(f"[{self.session_id}] Orchestrator interrupted during generation!")
                    self.state = OrchestratorState.CANCELLED
                    break
                    
                if sentence.startswith("__TOOL_CALL__:"):
                    # Extract tool call JSON
                    import json
                    try:
                        tool_calls = json.loads(sentence.split("__TOOL_CALL__:", 1)[1])
                        for tc in tool_calls:
                            func = tc.get("function", {})
                            name = func.get("name")
                            args = func.get("arguments", {})
                            
                            # Execute via generic Workflow Engine
                            if hasattr(self, 'workflow_engine') and self.workflow_engine:
                                result = await self.workflow_engine.execute_tool(name, args, context)
                                # Append the tool call and result to history
                                context.history.append({"role": "assistant", "content": f"I decided to use the '{name}' tool."})
                                context.history.append({"role": "system", "content": f"Tool '{name}' result: {result}"})
                                
                                # Inform the user that the tool executed
                                full_response += result + " "
                                async for audio_chunk in self.tts.generate_audio_stream(result):
                                    if self.state == OrchestratorState.INTERRUPTING:
                                        self.state = OrchestratorState.CANCELLED
                                        break
                                    self.event_bus.publish(RuntimeEvent(
                                        event_type=EventType.AUDIO_OUT,
                                        session_id=self.session_id,
                                        payload={"audio_bytes": audio_chunk}
                                    ))
                            else:
                                logger.warning(f"[{self.session_id}] Tool call received but no Workflow Engine configured!")
                    except Exception as e:
                        logger.error(f"Failed to parse or execute tool call: {e}")
                    
                    continue
                    
                full_response += sentence + " "
                logger.debug(f"[{self.session_id}] Synthesizing chunk: {sentence}")
                
                # Stream audio chunks for this specific sentence
                async for audio_chunk in self.tts.generate_audio_stream(sentence):
                    if self.state == OrchestratorState.INTERRUPTING:
                        logger.warning(f"[{self.session_id}] Orchestrator interrupted during synthesis!")
                        self.state = OrchestratorState.CANCELLED
                        break
                        
                    # Here we publish AUDIO_OUT event for the gateway or demo script
                    self.event_bus.publish(RuntimeEvent(
                        event_type=EventType.AUDIO_OUT,
                        session_id=self.session_id,
                        payload={"audio_bytes": audio_chunk}
                    ))
                    
                if self.state == OrchestratorState.CANCELLED:
                    break

            if self.state == OrchestratorState.RUNNING:
                self.state = OrchestratorState.COMPLETED
                logger.info(f"[{self.session_id}] Orchestrator completed turn successfully.")

        except Exception as e:
            logger.error(f"[{self.session_id}] Orchestrator encountered an error: {e}")
            self.state = OrchestratorState.ERROR
            
        finally:
            # 4. Clean up state and memory regardless of success, interruption, or failure
            if full_response.strip():
                logger.info(f"[{self.session_id}] AI Full Response: {full_response.strip()}")
                context.history.append({"role": "assistant", "content": full_response.strip()})
                
            # If we completed successfully, signal that the AI finished speaking
            if self.state == OrchestratorState.COMPLETED:
                self.event_bus.publish(RuntimeEvent(
                    event_type=EventType.AI_SPEAKING_COMPLETED,
                    session_id=self.session_id
                ))
                
            # Reset state for next turn if we were interrupted or errored
            if self.state in [OrchestratorState.CANCELLED, OrchestratorState.ERROR]:
                self.state = OrchestratorState.IDLE
                
    async def handle_interruption(self) -> None:
        if self.state == OrchestratorState.RUNNING:
            logger.warning(f"[{self.session_id}] Orchestrator received INTERRUPTION signal.")
            self.state = OrchestratorState.INTERRUPTING
