import os
from google import genai
from google.genai import types
from google.adk.agents import Agent

class EmotionalAnchorADK:
    def __init__(self):
        # Minimal ADK integration
        self.agent = Agent(
            name="emotional_anchor_adk",
            model="gemini-2.5-flash-lite",
            description="ADK version of emotional anchor",
            instruction="You are an emotional support companion. Respond empathetically.",
        )
        
    async def get_response(self, user_message):
        # This shows ADK usage
        from google.adk.runners import InMemoryRunner
        runner = InMemoryRunner(agent=self.agent)
        response = await runner.run_debug(user_message)
        return response.messages[-1].content if response.messages else "I'm here for you."
