import logging
import asyncio
from typing import Any, Dict

from app.runtime.ports import IWorkflowEngine
from app.runtime.core.context import RuntimeContext

logger = logging.getLogger(__name__)

class MockWorkflowAdapter(IWorkflowEngine):
    """
    A mock workflow engine that simulates executing a complex task like
    booking an appointment or checking the weather, to validate the Orchestrator's
    tool call routing before we integrate LangGraph.
    """
    
    async def execute_tool(self, tool_name: str, tool_args: Dict[str, Any], context: RuntimeContext) -> str:
        logger.info(f"MockWorkflowAdapter executing tool '{tool_name}' with args {tool_args}...")
        
        # Simulate an external API call or long-running reasoning task
        await asyncio.sleep(1.0)
        
        if tool_name == "get_weather":
            location = tool_args.get("location", "Unknown")
            return f"The weather in {location} is currently 72 degrees and sunny."
            
        elif tool_name == "book_appointment":
            time = tool_args.get("time", "Unknown")
            return f"I have successfully booked your appointment for {time}."
            
        else:
            return f"I performed the action '{tool_name}' successfully."
