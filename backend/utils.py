import os
import json
from datetime import datetime
import uuid
from google.cloud import firestore

LOG_FILE = "backend/logs/interactions.jsonl"


def log_interaction(name, workshop, prompt, response):
    # Local JSONL Fallback
    os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
    log_entry = {
        "timestamp": datetime.now().isoformat(),
        "name": name,
        "workshop": workshop,
        "prompt": prompt,
        "response": response,
    }
    try:
        with open(LOG_FILE, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    except Exception as e:
        print(f"Error writing to local log: {e}")

    # Primary: Firestore
    try:
        log_to_firestore(name, workshop, prompt, response)
    except Exception as e:
        print(f"Error logging to Firestore: {e}")


def log_to_firestore(user_name, workshop_id, prompt, response):
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    database_id = os.environ.get("FIRESTORE_DATABASE_ID", "(default)")

    if not project_id:
        return

    db = firestore.Client(project=project_id, database=database_id)

    # Store in a collection called 'interactions'
    doc_ref = db.collection("interactions").document(str(uuid.uuid4()))
    doc_ref.set(
        {
            "userName": user_name,
            "workshopId": workshop_id,
            "timestamp": firestore.SERVER_TIMESTAMP,
            "prompt": prompt,
            "response": response,
        }
    )


def list_workshop_assets():
    base_path = "assets/workshops"
    if not os.path.exists(base_path):
        return []
    return os.listdir(base_path)


def read_asset(workshop_name, filename):
    path = os.path.join("assets/workshops", workshop_name, filename)
    if os.path.exists(path):
        with open(path, "r") as f:
            return f.read()
    return "Asset not found."
