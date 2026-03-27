# Workshop Technical Assistant Setup

The Virtual TA platform is split into two applications:
1. **`workshop-ta`**: The student-facing LLM chat interface.
2. **`workshop-ta-admin`**: The organizer-facing dashboard to create events and isolate courses.

This guide provides the step-by-step commands to configure the Google Cloud resources required by both services.

---

## 🗄️ 1. Firestore Database Setup

Both services use Firestore to store configuration data (`events` collection) and chat history (`interactions` collection).

**A. Enable the Firestore API**
```bash
gcloud services enable firestore.googleapis.com
```

**B. Create the Database**
You must create a Firestore Native database. We recommend a custom database ID for organization.
```bash
# Example: creating a database named 'virtual-ta-interaction' in us-central1
gcloud firestore databases create --database=virtual-ta-interaction --location=us-central1 --type=firestore-native
```

*Note: The applications will automatically scaffold the required collections (`events`, `interactions`) upon first use.*

---


## 🚀 3. Environment Configuration

You must configure the `.env` variables for **both** backend services.

**In `workshop-ta/backend/.env`:**
```text
GOOGLE_CLOUD_PROJECT=your-google-project-id
FIRESTORE_DATABASE_ID=virtual-ta-interaction
```

**In `workshop-ta-admin/backend/.env`:**
```text
GOOGLE_CLOUD_PROJECT=your-google-project-id
FIRESTORE_DATABASE_ID=virtual-ta-interaction
GOOGLE_CLIENT_ID=your_client_id_from_step_2_here.apps.googleusercontent.com
ROOT_ADMIN_EMAILS=your.email@example.com,another.admin@example.com
```
*(The `ROOT_ADMIN_EMAILS` variable allows specified users to see all events created by anyone in the admin dashboard).*

---

```bash
# This requires the specific artifact registry in workshop-ta requirements
pip install -r requirements.txt 
uvicorn backend.main:app --reload --port 8080
```

Open `http://localhost:8080` to log in as a student using the Event Code you just created!

---
