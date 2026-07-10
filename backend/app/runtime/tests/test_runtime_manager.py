import asyncio
import uuid
from backend.app.runtime.manager import runtime_manager

async def test_runtime_manager_concurrency():
    """
    Simulate a massive concurrency spike:
    1000 phone calls hitting the server at the exact same time.
    """
    num_calls = 1000
    
    # 1. Concurrently spawn 1000 calls
    async def simulate_incoming_call(i: int):
        call_id = f"CA{uuid.uuid4().hex[:10]}"
        # Create and register
        runtime = await runtime_manager.create_runtime(call_id=call_id)
        assert runtime is not None
        assert runtime.session.call_id == call_id
        
        # Start the call
        runtime.start()
        
        return runtime.get_session_id(), call_id
        
    tasks = [simulate_incoming_call(i) for i in range(num_calls)]
    results = await asyncio.gather(*tasks)
    
    assert len(runtime_manager._runtimes_by_session_id) == num_calls
    assert len(runtime_manager._runtimes_by_call_id) == num_calls
    
    # 2. Concurrently lookup 1000 calls
    async def simulate_lookup(session_id: uuid.UUID, call_id: str):
        by_session = await runtime_manager.get_runtime(session_id=session_id)
        by_call = await runtime_manager.get_runtime(call_id=call_id)
        assert by_session is not None
        assert by_call is not None
        assert by_session.get_session_id() == by_call.get_session_id()
        
    lookup_tasks = [simulate_lookup(sid, cid) for sid, cid in results]
    await asyncio.gather(*lookup_tasks)
    
    # 3. Concurrently end 1000 calls
    async def simulate_hangup(session_id: uuid.UUID):
        await runtime_manager.end_runtime(session_id)
        
    hangup_tasks = [simulate_hangup(sid) for sid, cid in results]
    await asyncio.gather(*hangup_tasks)
    
    # Verify exact cleanup
    assert len(runtime_manager._runtimes_by_session_id) == 0
    assert len(runtime_manager._runtimes_by_call_id) == 0
    print("Integration test passed: 1000 concurrent calls successfully managed!")

if __name__ == "__main__":
    asyncio.run(test_runtime_manager_concurrency())
