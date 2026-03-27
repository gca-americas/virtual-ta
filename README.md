# Virtual TA Core Application

Welcome to the **Virtual TA** student application codebase! This repository (`virtual-ta`) serves as the active student-facing generative AI learning platform completely deployed into isolated Google Cloud Sandboxes for scheduled laboratory events.

---

## 🏗️ Ecosystem Relationship

This repository operates securely as an ephemeral baseline template natively coupled inside the ecosystem architecture:

- **Virtual TA Admin portal (`virtual-ta-admin`)**: Instructors define course parameters and schedule upcoming workshops internally.
- **Virtual TA Jobs (`virtual-ta-job`)**: The infrastructure orchestrator scanning the Admin Database and triggering deployment hooks securely on the hour.
- **Virtual TA (`virtual-ta`)**: *(You are here)*. The active executable frontend and LLM routing layer. When an Event officially launches natively, the Job Orchestrator dynamically clones this exact codebase, iteratively maps the instructor's custom syllabus documents straight into the internal engine, and compiles it as an active ephemeral Cloud Run URL URL!

---

## 📂 Architecture of this Repository

The `virtual-ta` container purposefully encapsulates Google's Vertex AI platform directly inside a secure lightweight Python interface flawlessly.

### Codebase Structure
```text
virtual-ta/
├── backend/
│   ├── main.py          # The core FastAPI router processing streaming Vertex AI chat
│   ├── prompts.py       # (or agents/) Advanced LLM logic, system tuning variables
│   ├── utils.py         # Firestore interaction hooks tracking student chat history securely
│   └── skills/          # *DYNAMIC DIR*: Empty baseline where Git Sparse-Checkouts inject Instructor syllabus files!
├── frontend/
│   ├── index.html       # Single-page classroom chat GUI actively prompting Event Join Codes
│   ├── style.css        # Premium native dark-mode learning interfaces explicitly generated 
│   └── app.js           # Secure REST API fetch architecture bridging Vanilla JS to FastAPI
├── requirements.txt     # Native deployment boundaries 
└── Dockerfile           # The physical Cloud Run execution wrapper provisioning the container entirely
```

---

## ☁️ Execution Environment & Workflow

Because this system mathematically functions as a cloned instance strictly tied to active execution queues, developers rarely physically deploy this codebase manually. Here is the operational architecture:

1. **Pipeline Instantiation**: When a workshop starts, the Google Cloud Build agent connects locally directly to this specific GitHub repository.
2. **Context Synchronization**: Using precise JSON payload mapping from the Admin Portal, the Bash compiler natively identifies GitHub repository locations containing instructor documentation.
3. **Syllabus Overrides (`sparse-checkout`)**: It selectively downloads just the exact folder paths containing class material into the interior `backend/skills/` directory intelligently! 
4. **Isolated Construction**: The native `Dockerfile` compiles the hybrid codebase (Base Web App + Injected Syllabus) securely into an identical Google Artifact Registry container identically.
5. **Student Inference**: The execution URL is generated. Students visit the classroom link, authorize their session natively using an "Event ID," and begin heavily prompting the AI dynamically! All chat context is securely serialized directly into Firestore for audit execution natively!
