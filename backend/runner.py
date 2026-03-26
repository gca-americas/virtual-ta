import mimetypes
import pathlib
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from google.api_core import exceptions
from .agent import root_agent


class WorkshopRunner:
    def __init__(self):
        # Initialize session service and runner as per user example
        self.session_service = InMemorySessionService()
        self.runner = Runner(
            app_name="WorkshopTA",
            agent=root_agent,
            session_service=self.session_service,
        )

    async def run(self, name: str, workshop_id: str, message: str, attachment=None):
        parts = [types.Part.from_text(text=message)]

        # Add attachment if present
        if attachment:
            file_path = pathlib.Path(attachment)
            if file_path.exists():
                mime_type, _ = mimetypes.guess_type(attachment)
                with open(attachment, "rb") as f:
                    file_bytes = f.read()
                parts.append(
                    types.Part.from_bytes(
                        data=file_bytes,
                        mime_type=mime_type or "application/octet-stream",
                    )
                )

        # Ensure session exists as per user pattern
        # Use a composite ID to isolate sessions across different workshops for the same user
        isolated_user_id = f"{name}-{workshop_id}"
        session_id = "workshop_session"
        session = await self.session_service.get_session(
            app_name="WorkshopTA", user_id=isolated_user_id, session_id=session_id
        )
        is_new_session = False
        if not session:
            is_new_session = True
            await self.session_service.create_session(
                app_name="WorkshopTA", user_id=isolated_user_id, session_id=session_id
            )

        if is_new_session:
            sys_msg = f"[SYSTEM CONTEXT: The user name is '{name}'. The selected workshop ID is '{workshop_id}'. DO NOT ask the user which workshop they are in, as it is already set to '{workshop_id}'. Use the skill tool matching this ID to help them. Greet them by name.]"
            # Prepend system context to the first text part
            for part in parts:
                if part.text:
                    part.text = f"{sys_msg}\n\n{part.text}"
                    break

        content = types.Content(role="user", parts=parts)

        try:
            # Runner.run returns a generator of events in this version
            response = self.runner.run(
                user_id=isolated_user_id, session_id=session_id, new_message=content
            )

            full_text = ""
            if hasattr(response, "__aiter__"):
                async for event in response:
                    full_text += self._extract_text(event)
            # Check for regular generator
            elif hasattr(response, "__iter__") and not isinstance(
                response, (str, list, dict)
            ):
                for event in response:
                    full_text += self._extract_text(event)
            else:
                full_text = self._extract_text(response)

            return full_text or "No response from assistant."
        except exceptions.ResourceExhausted:
            return (
                "Sorry the assistance is too busy helping others, can you try it again"
            )

    async def clear_session(self, name: str, workshop_id: str):
        """Wipes the session history for the given user and workshop."""
        isolated_user_id = f"{name}-{workshop_id}"
        session_id = "workshop_session"
        await self.session_service.delete_session(
            app_name="WorkshopTA", user_id=isolated_user_id, session_id=session_id
        )

    def _extract_text(self, event) -> str:
        """Helper to extract text from various ADK event structures."""
        text = ""
        if hasattr(event, "model_turn") and event.model_turn:
            for part in event.model_turn.parts:
                if hasattr(part, "text") and part.text:
                    text += part.text
        elif hasattr(event, "text") and event.text:
            text += event.text
        elif hasattr(event, "content") and event.content:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    text += part.text
        return text


# Singleton instance
runner_manager = WorkshopRunner()
