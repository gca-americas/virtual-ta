from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import os
import shutil
import traceback
import logging
from dotenv import load_dotenv

from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from .runner import runner_manager
from .utils import log_interaction
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Load environment variables from .env file BEFORE importing agent
load_dotenv()

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Enable CORS for frontend interaction
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/workshops")
@limiter.limit("20/minute")
async def get_workshops(request: Request):
    workshops = []
    skills_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "skills"))
    if not os.path.isdir(skills_dir):
        return workshops

    for skill_folder in os.listdir(skills_dir):
        skill_path = os.path.join(skills_dir, skill_folder, "SKILL.md")
        if os.path.isfile(skill_path):
            try:
                with open(skill_path, "r") as f:
                    content = f.read()
                    # Basic YAML frontmatter parsing
                    if content.startswith("---"):
                        parts = content.split("---")
                        if len(parts) >= 3:
                            yaml_content = parts[1]
                            workshop_id = skill_folder
                            name = ""
                            description = ""
                            for line in yaml_content.split("\n"):
                                if line.startswith("name:"):
                                    name = line.split("name:")[1].strip()
                                elif line.startswith("description:"):
                                    description = line.split("description:")[1].strip()

                            workshops.append(
                                {
                                    "id": workshop_id,
                                    "name": name or workshop_id,
                                    "description": description,
                                }
                            )
            except Exception as e:
                logger.error(f"Error parsing {skill_path}: {e}")

    # Sort by name for consistency
    workshops.sort(key=lambda x: x["name"])
    return workshops


class EventRequest(BaseModel):
    event_name: str
    start_date: str
    end_date: str
    language: str
    country: str
    courses: list[str]


@app.post("/api/login")
async def login(name: str = Form(...), workshop: str = Form(...)):
    # Fast login, greeting will be requested separately
    print(f"DEBUG: Fast login for {name} in {workshop}")
    return {"status": "success"}


@app.post("/api/greet")
@limiter.limit("20/minute")
async def greet_user(
    request: Request,
    name: str = Form(...),
    workshop: str = Form(...),
    language: str = Form("English"),
):
    # Trigger an initial greeting from the LLM asynchronously
    try:
        greeting = await runner_manager.run(
            name,
            workshop,
            f"I am {name}. I have just joined the {workshop} workshop. Briefly greet me, confirm you have the instructions, and ask for my first question. Keep it under 2 sentences.",
            language=language,
        )
        return {"greeting": greeting}
    except Exception as e:
        logger.error(f"Error during async greeting: {e}")
        return {"greeting": f"Welcome, {name}! How can I help you today?"}


@app.post("/api/clear-session")
@limiter.limit("10/minute")
async def clear_session(
    request: Request,
    name: str = Form(...),
    workshop: str = Form(...),
    language: str = Form("English"),
):
    try:
        await runner_manager.clear_session(name, workshop)
        # Also trigger a fresh greeting
        greeting = await runner_manager.run(
            name,
            workshop,
            f"I am {name}. I have just cleared my session for the {workshop} workshop. Please greet me again as if it's a fresh start.",
            language=language,
        )
        return {"status": "success", "greeting": greeting}
    except Exception as e:
        logger.error(f"Error clearing session: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
@limiter.limit("20/minute")
async def chat(
    request: Request,
    name: str = Form(...),
    workshop: str = Form(...),
    message: str = Form(...),
    interface: str = Form("web"),
    language: str = Form("English"),
    file: Optional[UploadFile] = File(None),
):
    file_path = None
    if file:
        temp_dir = "backend/temp_uploads"
        os.makedirs(temp_dir, exist_ok=True)
        file_path = os.path.join(temp_dir, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

    try:
        abs_file_path = os.path.abspath(file_path) if file_path else None
        response_text = await runner_manager.run(
            name, workshop, message, attachment=abs_file_path, language=language
        )
        if os.environ.get("TEST_LOCAL") == "True":
            print(
                f"TEST_LOCAL is True. Skipping Firestore. Interaction logged locally - User: {name}, Workshop: {workshop}"
            )
        else:
            log_interaction(name, workshop, message, response_text, interface)
        return {"response": response_text}
    except Exception as e:
        # Print full traceback to terminal for debugging
        print("\n" + "=" * 50)
        print(f"ERROR IN /chat ENDPOINT (User: {name}, Workshop: {workshop})")
        traceback.print_exc()
        print("=" * 50 + "\n")

        raise HTTPException(status_code=500, detail=str(e))


# Serve Static Files
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../frontend"))
if os.path.isdir(frontend_dir):
    app.mount("/", StaticFiles(directory=frontend_dir, html=True), name="static")
    print(f"Serving static files from: {frontend_dir}")
else:
    print(f"Warning: Frontend directory not found at {frontend_dir}")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
