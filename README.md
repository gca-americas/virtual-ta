# Virtual TA Core Application

## How to Contribute

To contribute to the Virtual TA, you provide a **SKILL** for the Virtual TA to load and help it answer questions based on your specific domain. You can find loads of examples in the `virtual-ta-skills` repository.

### Writing a Skill

When providing a skill, ensure you include:
1. **`SKILL.md`**: This is the core driving file for the agent. It should contain:
   - **Procedural Rules**: Mandatory instructions (e.g., forcing the TA to read lab instructions or referencing specific error protocols).
   - **Core Workflow**: Step-by-step logic detailing how the TA should interpret the user's question, search references, and provide grounded solutions.
   - **Debugging Rules & FAQ**: Common errors, exact solutions, and rules for validating user python code/snippets.
   - **Fallback Preparation**: Instructions on how the TA should formulate a precise search query if it can't find an answer in the resources.
2. **Solution Files / References**: Provide the solution files (e.g., `instructions.lab.md`) and any scripts under the `references/` directory.
3. **Other Materials**: Any additional data, materials, or context needed for the skill to operate.

See https://github.com/gca-americas/virtual-ta-skills for reference 

### How to test it locally

1. Pull the `virtual-ta` repository.
2. Create a folder named `skills` under `virtual-ta/backend`.
3. Create a folder and add the course materials under `skills/<course-name>`.
4. Add a `.env` file under `backend/` with the following configuration:
   ```env
   GOOGLE_CLOUD_PROJECT=YOUR PROJECT
   GOOGLE_CLOUD_LOCATION=global
   GOOGLE_GENAI_USE_VERTEXAI=True
   TEST_LOCAL=True
   ```
5. Run the application:
   ```bash
   # This requires the specific artifact registry in workshop-ta requirements
   pip install -r requirements.txt 
   uvicorn backend.main:app --reload --port 8080
   ```

### How to add the course to production

Go to https://virtual-ta-admin.gca-americas.dev/ and make sure you have course admin access. Enter your course details here, and it will be available. However, our recommendation is to wait for the first evaluation before you officially publish it.

---

Welcome to the **Virtual TA** student application codebase! This repository (`virtual-ta`) serves as the active student-facing generative AI learning platform completely deployed into isolated Google Cloud Sandboxes for scheduled laboratory events.

---

## 🏗️ Ecosystem Relationship

This repository operates securely as an ephemeral baseline template natively coupled inside the ecosystem architecture:

- **Virtual TA Admin portal (`virtual-ta-admin`)**: Instructors define course parameters and schedule upcoming workshops internally.
- **Virtual TA Jobs (`virtual-ta-job`)**: The infrastructure orchestrator scanning the Admin Database and triggering deployment hooks securely on the hour.
- **Virtual TA (`virtual-ta`)**: *(You are here)*. The active executable frontend and LLM routing layer. When an Event officially launches natively, the Job Orchestrator dynamically clones this exact codebase, iteratively maps the instructor's custom syllabus documents straight into the internal engine, and compiles it as an active ephemeral Cloud Run URL URL!
- **Virtual TA IDE   (`virtual-ta-ide`)**: The IDE version of the Virtual TA frontend. 

--
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
3. **Course Overrides (`sparse-checkout`)**: It selectively downloads just the exact folder paths containing class material into the interior `backend/skills/` directory intelligently! 
4. **Isolated Construction**: The native `Dockerfile` compiles the hybrid codebase (Base Web App + Injected Syllabus) securely into an identical Google Artifact Registry container identically.
5. **Student Inference**: The execution URL is generated. Students visit the classroom link, authorize their session natively using an "Event ID," and begin heavily prompting the AI dynamically! All chat context is securely serialized directly into Firestore for audit execution natively!
