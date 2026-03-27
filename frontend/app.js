const API_BASE = "/api";

const loginScreen = document.getElementById("login-screen");
const chatScreen = document.getElementById("chat-screen");
const usernameInput = document.getElementById("username");
const loginBtn = document.getElementById("login-btn");
const chatMessages = document.getElementById("chat-messages");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-btn");
const workshopSelect = document.getElementById("workshop-select");
const fileUpload = document.getElementById("file-upload");
const previewArea = document.getElementById("preview-area");
const fileNameSpan = document.getElementById("file-name");
const removeFileBtn = document.getElementById("remove-file");
const logoutBtn = document.getElementById("logout-btn");
const clearSessionBtn = document.getElementById("clear-session-btn");
const appContainer = document.getElementById("app");



let allAvailableWorkshops = [];

let currentUser = "";
let currentWorkshop = "";
let selectedFile = null;
const themeToggle = document.getElementById("theme-toggle");
const workshopError = document.getElementById("workshop-error");

// Theme Handling
function initTheme() {
    const savedTheme = localStorage.getItem("theme") || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(savedTheme);
}

function setTheme(theme) {
    if (theme === "dark") {
        document.documentElement.classList.add("dark-theme");
    } else {
        document.documentElement.classList.remove("dark-theme");
    }
    localStorage.setItem("theme", theme);
}

window.toggleTheme = function(e) {
    if (e) e.preventDefault();
    const isDark = document.documentElement.classList.contains("dark-theme");
    console.log("Theme toggle clicked. Switching from", isDark ? "dark" : "light");
    setTheme(isDark ? "light" : "dark");
};

async function loadWorkshops() {
    try {
        const response = await fetch(`${API_BASE}/workshops`);
        allAvailableWorkshops = await response.json();

        if (!Array.isArray(allAvailableWorkshops)) {
            throw new Error("Invalid response format: expected an array");
        }
        
        workshopSelect.innerHTML = '<option value="" disabled selected>Select a course...</option>' + allAvailableWorkshops.map(w =>
            `<option value="${w.id}">${w.name}</option>`
        ).join('');
        
    } catch (error) {
        console.error("Failed to load workshops:", error);
    }
}

// Initial load
initTheme();
loadWorkshops();

// Login Handler
async function login() {
    const name = usernameInput.value.trim();
    const workshop = workshopSelect.value;
    
    // Reset error
    workshopError?.classList.add("hidden");

    if (!name) return alert("Please enter your name");
    
    if (!workshop) {
        workshopError?.classList.remove("hidden");
        workshopSelect.focus();
        return;
    }

    // Disable button to prevent double-clicks
    loginBtn.disabled = true;
    loginBtn.textContent = "Connecting...";

    const formData = new FormData();
    formData.append("name", name);
    formData.append("workshop", workshop);

    try {
        // We don't need to await the response.json() here, just the fetch call
        // The actual greeting will be fetched asynchronously by fetchGreeting
        await fetch(`${API_BASE}/login`, {
            method: "POST",
            body: formData
        });

        currentUser = name;
        currentWorkshop = workshop;

        // Update user display
        const userDisplay = document.getElementById("user-display");
        if (userDisplay) userDisplay.textContent = `User: ${name}`;

        // Immediate UI transition
        const selectedOption = workshopSelect.options[workshopSelect.selectedIndex];
        document.getElementById("workshop-title").textContent = selectedOption.text + " | Google Codelabs";
        loginScreen?.classList.add("hidden");
        chatScreen?.classList.remove("hidden");

        // Start proactive greeting asychronously
        fetchGreeting(name, workshop);

    } catch (error) {
        console.error("Login failed:", error);
        loginBtn.disabled = false;
        loginBtn.textContent = "Start Mission";
        alert("Failed to connect. Please ensure the server is running.");
    }
}

async function fetchGreeting(name, workshop) {
    showTypingIndicator();
    try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("workshop", workshop);

        const response = await fetch(`${API_BASE}/greet`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        hideTypingIndicator();
        if (data.greeting) {
            appendMessage("assistant", data.greeting);
        }
    } catch (error) {
        console.error("Failed to fetch greeting:", error);
        hideTypingIndicator();
        appendMessage("assistant", `Welcome back, ${name}! How can I help you today?`);
    }
}

function showTypingIndicator() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing-indicator";
    typingDiv.className = "message assistant typing";
    typingDiv.innerHTML = `
        <div class="msg-icon">🤖</div>
        <div class="msg-bubble">
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) indicator.remove();
}

async function clearSession() {
    if (!confirm("Are you sure you want to clear this session? This will wipe your history for this workshop.")) return;

    showTypingIndicator();
    // Clear display immediately
    chatMessages.innerHTML = "";

    try {
        const formData = new FormData();
        formData.append("name", currentUser);
        formData.append("workshop", currentWorkshop);

        const response = await fetch(`${API_BASE}/clear-session`, {
            method: "POST",
            body: formData
        });
        const data = await response.json();
        hideTypingIndicator();

        if (data.greeting) {
            appendMessage("assistant", data.greeting);
        }
    } catch (error) {
        console.error("Failed to clear session:", error);
        hideTypingIndicator();
        alert("Failed to clear session. Please check your connection.");
    }
}

// Send Message Handler
async function sendMessage() {
    const message = chatInput.value.trim();
    if (!message && !selectedFile) return;

    appendMessage("user", message);
    chatInput.value = "";

    const formData = new FormData();
    formData.append("name", currentUser);
    formData.append("workshop", currentWorkshop);
    formData.append("message", message);
    if (selectedFile) {
        formData.append("file", selectedFile);
    }

    // Reset file selection
    clearFile();
    showTypingIndicator();

    try {
        const response = await fetch(`${API_BASE}/chat`, {
            method: "POST",
            body: formData
        });

        hideTypingIndicator();

        let errorMessage = "Server error";
        if (response.ok) {
            const data = await response.json();
            appendMessage("assistant", data.response);
            return;
        } else {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const data = await response.json();
                errorMessage = data.detail || errorMessage;
            } else {
                errorMessage = `Error ${response.status}: ${response.statusText}`;
            }
        }
        throw new Error(errorMessage);
    } catch (error) {
        hideTypingIndicator();
        console.error("Chat error:", error);
        appendMessage("assistant", `⚠️ **Process Error**: ${error.message}. Please check if your backend server is running correctly.`);
    }
}

function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.className = `message ${sender}`;

    // Create Icon Container
    const iconDiv = document.createElement("div");
    iconDiv.className = "msg-icon";
    iconDiv.innerHTML = sender === "user" ? "👤" : "🤖";

    // Create Bubble Container
    const bubbleDiv = document.createElement("div");
    bubbleDiv.className = "msg-bubble";

    // Custom renderer for marked to open links in new tabs
    const renderer = new marked.Renderer();
    renderer.link = ({ href, title, text }) => {
        return `<a href="${href}" title="${title || ''}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    };

    // Parse markdown for ALL messages to support user code snippets
    const content = text ? marked.parse(text, { renderer }) : "...";
    bubbleDiv.innerHTML = content;

    msgDiv.appendChild(iconDiv);
    msgDiv.appendChild(bubbleDiv);

    // Add copy buttons to all code blocks
    const codeBlocks = bubbleDiv.querySelectorAll('pre');
    codeBlocks.forEach(block => {
        const btn = document.createElement('button');
        btn.className = 'copy-code-btn';
        btn.textContent = 'Copy';

        btn.onclick = (e) => {
            e.stopPropagation();
            const code = block.querySelector('code')?.innerText || block.innerText;
            navigator.clipboard.writeText(code).then(() => {
                btn.textContent = 'Copied!';
                btn.classList.add('copied');
                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.classList.remove('copied');
                }, 2000);
            });
        };

        block.appendChild(btn);
    });

    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Dynamic Monospace Toggle for Chat Input
function toggleCodeMode() {
    const text = chatInput.value;
    if (text.includes("```") || text.includes("\n") || text.includes("def ") || text.includes("import ")) {
        chatInput.classList.add("code-mode");
    } else {
        chatInput.classList.remove("code-mode");
    }
}

function clearFile() {
    selectedFile = null;
    fileUpload.value = "";
    previewArea.classList.add("hidden");
}

// Event Listeners
loginBtn?.addEventListener("click", login);
clearSessionBtn?.addEventListener("click", clearSession);
usernameInput?.addEventListener("keypress", (e) => e.key === "Enter" && login());

sendBtn?.addEventListener("click", sendMessage);

chatInput?.addEventListener("input", () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = (chatInput.scrollHeight) + 'px';
    toggleCodeMode();
});

chatInput?.addEventListener("paste", (e) => {
    // toggleCodeMode will be called by the other paste listener in app.js
    toggleCodeMode();
});

chatInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
        chatInput.style.height = 'auto';
    }
});

fileUpload?.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
        selectedFile = e.target.files[0];
        if (fileNameSpan) fileNameSpan.textContent = selectedFile.name;
        previewArea?.classList.remove("hidden");
    }
});

removeFileBtn?.addEventListener("click", clearFile);

logoutBtn?.addEventListener("click", () => {
    currentUser = "";
    const userDisplay = document.getElementById("user-display");
    if (userDisplay) userDisplay.textContent = "";
    loginBtn.disabled = false;
    loginBtn.textContent = "Start Mission";
    chatScreen?.classList.add("hidden");
    loginScreen?.classList.remove("hidden");
    if (chatMessages) chatMessages.innerHTML = ''; // Clear chat
});
// Suggestions & Hints Handler
const pasteHint = document.getElementById("paste-hint");
const hintText = document.getElementById("hint-text");

document.querySelectorAll('.suggestion-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const suggestion = chip.getAttribute('data-suggestion');
        const text = chip.textContent.toLowerCase();

        if (suggestion && chatInput) {
            chatInput.value = suggestion;
            chatInput.focus();
            chatInput.dispatchEvent(new Event('input'));

            // Show relevant hints
            if (text.includes("python")) {
                hintText.textContent = "// Paste your entire Python file here...\n// (It will be automatically formatted)";
                pasteHint.classList.remove("hidden");
            } else if (text.includes("error")) {
                hintText.textContent = "# Paste your console error logs here...\n# (It will be automatically formatted)";
                pasteHint.classList.remove("hidden");
            } else {
                pasteHint.classList.add("hidden");
            }
        }
    });
});

// Click hint to focus input
pasteHint?.addEventListener("click", () => {
    chatInput.focus();
});

// Auto-wrap pasted code
chatInput?.addEventListener("paste", (e) => {
    const pasteData = e.clipboardData.getData('text');
    // If it looks like code (multiple lines or common keywords) and isn't already wrapped
    if ((pasteData.includes("\n") || pasteData.includes("def ") || pasteData.includes("import ") || pasteData.includes("Traceback"))
        && !pasteData.trim().startsWith("```")) {

        e.preventDefault();
        const lang = pasteData.includes("def ") ? "python" : "bash";
        const wrappedText = `\n\`\`\`${lang}\n${pasteData}\n\`\`\``;

        const start = chatInput.selectionStart;
        const end = chatInput.selectionEnd;
        const currentVal = chatInput.value;

        chatInput.value = currentVal.substring(0, start) + wrappedText + currentVal.substring(end);
        chatInput.dispatchEvent(new Event('input'));

        // Hide hint after paste
        pasteHint.classList.add("hidden");
    }
});
