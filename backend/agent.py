import os
import pathlib
import logging

from google.adk.agents import LlmAgent, Agent
from google.adk.skills import load_skill_from_dir
from google.adk.tools import skill_toolset
from google.adk.models.google_llm import Gemini
from google.adk.tools import google_search, AgentTool
from google.genai import types

logger = logging.getLogger(__name__)

# Default skills directory
_skills_dir = pathlib.Path(__file__).parent / "skills"


def get_loaded_skills(skills_dir=None):
    if skills_dir is None:
        skills_dir = _skills_dir

    loaded_skills = []
    if skills_dir.exists():
        for skill_folder in os.listdir(skills_dir):
            skill_path = skills_dir / skill_folder
            if skill_path.is_dir() and (skill_path / "SKILL.md").exists():
                try:
                    skill = load_skill_from_dir(skill_path)
                    loaded_skills.append(skill)
                    logger.info(f"Loaded skill: {skill_folder}")
                except Exception as e:
                    logger.error(f"Failed to load skill {skill_folder}: {e}")
    return loaded_skills


workshop_skill_toolset = skill_toolset.SkillToolset(skills=get_loaded_skills())

model = Gemini(
    model="gemini-2.5-flash-lite",
    retry_options=types.HttpRetryOptions(
        attempts=3, exp_base=5, initial_delay=1, http_status_codes=[429, 500, 503, 504]
    ),
)

# Define the Technical Assistant Agent


search_agent = Agent(
    name="SearchAgent",
    model=model,
    description="A specialist tool that searches the internet for technical information not found in the local workshop files.",
    instruction="""
    You are a Search Specialist. Your task is to use the `google_search` tool to find answers to technical questions.
    
    1. If you receive a "SEARCH_QUERY" from the manager, use it word-for-word in the tool.
    2. Ensure the results you provide are technical and relevant to the workshop's technologies (Python, FastAPI, Google Cloud, AI).
    3. If the query is out-of-scope, politely inform the user that you can only help with workshop-related technical questions.
    """,
    tools=[google_search],
)

root_agent = Agent(
    name="TechnicalAssistant",
    model=model,
    instruction="""
    You are a Technical Assistant for different workshop levels. 
    Check the initial message for a [SYSTEM CONTEXT] block which may contain the user's name and selected workshop ID (e.g., 'level-0-skill').
    If the workshop level is already provided in the context, do NOT ask the user which level they are in. Instead, use the corresponding skill immediately to assist them.
    
    CRITICAL: You are an instruction-following agent. You MUST strictly adhere to the **Procedural Rules**, **FAQ solutions**, and **FALLBACK** logic defined within the loaded skill.
    
    1. If a matching error is found in the skill's FAQ, you MUST provide the EXACT solution documented there. 
    2. Project-specific solutions in the skill MUST override your general technical knowledge.
    3. If the skill mandates a specific tool call (like reading lab instructions) for certain queries, you MUST perform it.
    4. If the skill mandates SearchAgent, you MUST perform it.
    
    CRITICAL: Keep your initial greeting extremely concise. Just confirm the workshop is loaded and ask how you can help. 
    Avoid long summaries unless explicitly asked. Example: "Hi [Name]! How can I help you today?"
    
    You can ask users for screenshots or to paste files if they are stuck.
    Always be professional, encouraging, and helpful.
    And ask verify the user's question to provide more information if you are not sure.

    CRITICAL: If the user's question is not related to the workshop, politely inform them that you can only help with workshop-related technical questions. 
    

    **FALLBACK SEARCH PREPARATION:**
    If you cannot find an answer within the provided skill materials:
        1. Determine if the question is within the technical scope of the workshop
        2. If it is in-scope, instead of answering "I don't know", you MUST call SearchAgent.
        3. Use the avalible google search tool to search for the answer and provide it to the user.

    """,
    tools=[workshop_skill_toolset, AgentTool(search_agent)],
)
