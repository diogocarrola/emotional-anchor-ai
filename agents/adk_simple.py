import os
from google.adk.agents import Agent
from google.adk.runners import InMemoryRunner

class SimpleEmotionAgent:
    """Minimal ADK agent for demonstration"""
    def __init__(self):
        # This is the ABSOLUTE minimum ADK agent
        self.agent = Agent(
            name="simple_emotion_support",
            model="gemini-2.5-flash-lite",  # Using Gemini model
            instruction="You are a kind friend who listens and offers support.",
        )
        self.runner = InMemoryRunner(agent=self.agent)
    
    def get_support_advice(self, situation):
        """Get advice from Gemini for demonstration"""
        # Simple synchronous-like approach
        import asyncio
        async def _get_advice():
            response = await self.runner.run_debug(
                f"Briefly offer support for this situation: {situation}"
            )
            return response.messages[-1].content if response.messages else ""
        
        return asyncio.run(_get_advice())
