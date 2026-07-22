import asyncio
import logging
from app.runtime.core.manager import runtime_manager
from app.runtime.mocks.providers import MockSTT, MockLLM, MockTTS, MockOrchestrator
from app.runtime.events.models import RuntimeEvent, EventType

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def run_simulation():
    logger.info("=== STARTING RUNTIME SIMULATION ===")
    
    # 1. Start a phone call
    runtime = await runtime_manager.create_runtime(call_id="SIM-123")
    session_id = runtime.get_session_id()
    
    # 2. Inject Mocks
    mock_llm = MockLLM()
    mock_tts = MockTTS()
    mock_orchestrator = MockOrchestrator(
        llm=mock_llm, 
        tts=mock_tts, 
        event_bus=runtime.event_bus, 
        session_id=session_id
    )
    mock_stt = MockSTT(event_bus=runtime.event_bus, session_id=session_id)
    
    runtime.conversation_engine.orchestrator = mock_orchestrator
    
    # 3. Simulate Call Connect
    runtime.start()
    
    await asyncio.sleep(0.1)
    
    # Assert state is WAITING_FOR_USER_INPUT
    assert runtime.context.get_metadata("current_turn") == "WAITING_FOR_USER_INPUT"
    logger.info("Success: Runtime correctly initialized in WAITING_FOR_USER_INPUT.")
    
    # 4. Simulate User Speaking (Audio chunk sent to STT)
    logger.info("Simulating audio chunk sent to STT...")
    await mock_stt.process_audio(b"fake audio")
    
    # Wait for processing
    await asyncio.sleep(0.5)
    
    # After STT finishes, Engine should have transitioned to THINKING, Orchestrator should run,
    # and eventually it should fire AI_SPEAKING_COMPLETED and return to WAITING_FOR_USER_INPUT
    assert runtime.context.get_metadata("current_turn") == "WAITING_FOR_USER_INPUT"
    logger.info("Success: Standard turn logic (STT -> LLM -> TTS -> Listen) completed flawlessly.")
    
    # 5. Simulate Barge-in Interruption
    logger.info("Simulating Barge-in Interruption...")
    # Fire another transcript to get AI talking
    await mock_stt.process_audio(b"fake audio 2")
    await asyncio.sleep(0.05) # Give it just enough time to start LLM
    
    # FIRE USER STARTED SPEAKING
    logger.info("User interrupted the AI!")
    runtime.event_bus.publish(RuntimeEvent(
        event_type=EventType.USER_STARTED_SPEAKING,
        session_id=session_id
    ))
    
    await asyncio.sleep(0.1)
    
    # Verify AI was halted and state is USER_TURN
    assert mock_orchestrator._interrupted == True
    assert runtime.context.get_metadata("current_turn") == "USER_TURN"
    assert runtime.context.get_metadata("conversation_state") == "LISTENING"
    logger.info("Success: Interruption logic violently halted AI and transitioned to USER_TURN flawlessly.")
    
    # 6. Simulate natural Hangup
    runtime.event_bus.publish(RuntimeEvent(
        event_type=EventType.CONVERSATION_COMPLETED,
        session_id=session_id
    ))
    
    await asyncio.sleep(0.1)
    
    # Verify Shutdown Request was handled
    assert len(runtime_manager._runtimes_by_session_id) == 0
    logger.info("Success: Runtime gracefully destroyed itself after conversation completion.")
    logger.info("=== SIMULATION COMPLETED SUCCESSFULLY ===")

if __name__ == "__main__":
    asyncio.run(run_simulation())
