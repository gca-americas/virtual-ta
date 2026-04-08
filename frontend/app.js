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
let currentLanguage = "English";
let selectedFile = null;
const themeToggle = document.getElementById("theme-toggle");
const workshopError = document.getElementById("workshop-error");

const languageSelect = document.getElementById("language-select");

const translations = {
    "English": {
        "title": "Virtual Technical Assistant",
        "subtitle": "Welcome to your AI-powered companion for Google Cloud technical support.",
        "tip_1": "\"Paste the error message from your terminal\"",
        "tip_2": "\"Paste your Python code to fix indentation\"",
        "tip_3": "\"Upload a screenshot to ask what's wrong\"",
        "tip_4": "\"Ask any question about the workshop\"",
        "select_course": "Select a course...",
        "workshop_error": "Please select a workshop",
        "start_btn": "Start",
        "name_placeholder": "What's your name?",
        "clear_session": "Clear Session",
        "main_page": "Main Page",
        "knowledge_point": "💡 Knowledge point",
        "chat_placeholder": "Ask a question about the codelab...",
        "ide_tooling": "IDE Context Tooling",
        "paste_code_context": "Paste Code Context",
        "code_placeholder": "Code Filename (e.g., app.py)",
        "buffer_placeholder": "Paste your raw code buffer here...",
        "terminal_errors": "Terminal Errors",
        "error_placeholder": "Paste command line tracebacks or errors here...",
        "hint_1": "Any active Code or Terminal text entered here will be automatically extracted and bundled securely into your message when you hit the primary SEND button on the left!",
        "hint_2": "Standard conversational questions, or errors from other places, should just be described and copy/pasted directly into the chat box!"
    },
    "Spanish": {
        "title": "Asistente Técnico Virtual",
        "subtitle": "Bienvenido a su compañero impulsado por IA para soporte técnico de Google Cloud.",
        "tip_1": "\"Pega el mensaje de error de tu terminal\"",
        "tip_2": "\"Pega tu código de Python para corregir la indentación\"",
        "tip_3": "\"Sube una captura de pantalla para preguntar qué está mal\"",
        "tip_4": "\"Haz cualquier pregunta sobre el taller\"",
        "select_course": "Seleccione un curso...",
        "workshop_error": "Por favor, seleccione un taller",
        "start_btn": "Iniciar",
        "name_placeholder": "¿Cuál es su nombre?",
        "clear_session": "Borrar Sesión",
        "main_page": "Página Principal",
        "knowledge_point": "💡 Punto de conocimiento",
        "chat_placeholder": "Haz una pregunta sobre el codelab...",
        "ide_tooling": "Herramientas de contexto del IDE",
        "paste_code_context": "Pegar contexto de código",
        "code_placeholder": "Nombre del archivo (ej. app.py)",
        "buffer_placeholder": "Pegue su buffer de código crudo aquí...",
        "terminal_errors": "Errores de Terminal",
        "error_placeholder": "Pegue los rastreos de comandos o errores aquí...",
        "hint_1": "¡Cualquier texto activo de Código o Terminal ingresado aquí se extraerá automáticamente y se agrupará de forma segura en su mensaje al presionar SEND!",
        "hint_2": "¡Las preguntas estándar o errores de otros lugares deben ser simplemente descritos y pegados en el chat!"
    },
    "Portuguese": {
        "title": "Assistente Técnico Virtual",
        "subtitle": "Bem-vindo ao seu companheiro de IA para suporte técnico do Google Cloud.",
        "tip_1": "\"Cole a mensagem de erro do seu terminal\"",
        "tip_2": "\"Cole seu código Python para consertar a indentação\"",
        "tip_3": "\"Envie uma captura de tela para perguntar o que há de errado\"",
        "tip_4": "\"Faça qualquer pergunta sobre o workshop\"",
        "select_course": "Selecione um curso...",
        "workshop_error": "Por favor, selecione um workshop",
        "start_btn": "Iniciar",
        "name_placeholder": "Qual é o seu nome?",
        "clear_session": "Limpar Sessão",
        "main_page": "Página Principal",
        "knowledge_point": "💡 Ponto de conhecimento",
        "chat_placeholder": "Faça uma pergunta sobre o codelab...",
        "ide_tooling": "Ferramentas de Contexto da IDE",
        "paste_code_context": "Colar Contexto de Código",
        "code_placeholder": "Nome do arquivo (ex. app.py)",
        "buffer_placeholder": "Cole o buffer do código bruto aqui...",
        "terminal_errors": "Erros do Terminal",
        "error_placeholder": "Cole os rastreamentos de comandos ou erros aqui...",
        "hint_1": "Qualquer texto ativo de Código ou Terminal inserido aqui será extraído e agrupado com segurança em sua mensagem ao pressionar SEND!",
        "hint_2": "Questões padrão ou erros de outros lugares devem simplesmente ser descritos e colados diretamente no chat!"
    },
    "Chinese (Simplified)": {
        "title": "虚拟助手",
        "subtitle": "欢迎使用由人工智能驱动的 Google Cloud 技术支持。",
        "tip_1": "\"粘贴终端中的错误消息\"",
        "tip_2": "\"粘贴您的 Python 代码\"",
        "tip_3": "\"上传截图以询问问题所在\"",
        "tip_4": "\"提出有关研讨会的任何问题\"",
        "select_course": "选择课程...",
        "workshop_error": "请选择一个课程",
        "start_btn": "开始",
        "name_placeholder": "您的名字是什么？",
        "clear_session": "清除会话",
        "main_page": "主页",
        "knowledge_point": "💡 知识点",
        "chat_placeholder": "询问关于 codelab 的问题...",
        "ide_tooling": "IDE 上下文工具",
        "paste_code_context": "粘贴代码上下文",
        "code_placeholder": "代码文件名 (例如: app.py)",
        "buffer_placeholder": "在此处粘贴原始代码缓冲区...",
        "terminal_errors": "终端错误",
        "error_placeholder": "在此处粘贴命令行回溯或错误...",
        "hint_1": "在这里输入的任何活动的代号或终端文本会被自动提取！",
        "hint_2": "标准的对话问题，或来自其他地方的错误，应该直接粘贴到聊天框中！"
    },
    "Chinese (Traditional)": {
        "title": "虛擬助手",
        "subtitle": "歡迎使用由人工智慧驅動的 Google Cloud 技術支援。",
        "tip_1": "\"貼上終端機中的錯誤訊息\"",
        "tip_2": "\"貼上您的 Python 程式碼\"",
        "tip_3": "\"上傳截圖以詢問問題所在\"",
        "tip_4": "\"提出有關研討會的任何問題\"",
        "select_course": "選擇課程...",
        "workshop_error": "請選擇一個課程",
        "start_btn": "開始",
        "name_placeholder": "您的名字是什麼？",
        "clear_session": "清除會話",
        "main_page": "主頁",
        "knowledge_point": "💡 知識點",
        "chat_placeholder": "詢問關於 codelab 的問題...",
        "ide_tooling": "IDE 上下文工具",
        "paste_code_context": "貼上程式碼上下文",
        "code_placeholder": "程式碼檔名 (例如: app.py)",
        "buffer_placeholder": "在此處貼上原始程式碼緩衝區...",
        "terminal_errors": "終端機錯誤",
        "error_placeholder": "在此處貼上命令列回溯或錯誤...",
        "hint_1": "在這裡輸入的任何活動的代號或終端機文字會被自動擷取！",
        "hint_2": "標準的對話問題，或來自其他地方的錯誤，應該直接貼到聊天框中！"
    },
    "Japanese": {
        "title": "仮想テクニカルアシスタント",
        "subtitle": "Google Cloud テクニカルサポートのAI搭載コンパニオンへようこそ。",
        "tip_1": "\"ターミナルからエラーメッセージを貼り付ける\"",
        "tip_2": "\"インデントを修正するために Python コードを貼り付ける\"",
        "tip_3": "\"スクリーンショットをアップロードして何が間違っているか質問する\"",
        "tip_4": "\"ワークショップについて何でも聞いてください\"",
        "select_course": "コースを選択...",
        "workshop_error": "ワークショップを選択してください",
        "start_btn": "開始",
        "name_placeholder": "あなたの名前は何ですか？",
        "clear_session": "セッションをクリア",
        "main_page": "メインページ",
        "knowledge_point": "💡 知識ポイント",
        "chat_placeholder": "Codelab に関する質問をする...",
        "ide_tooling": "IDE コンテキスト ツール",
        "paste_code_context": "コードコンテキストを貼り付け",
        "code_placeholder": "コードのファイル名 (例: app.py)",
        "buffer_placeholder": "ここに生のコードバッファを貼り付けます...",
        "terminal_errors": "ターミナルエラー",
        "error_placeholder": "ここにコマンドライントレースバックまたはエラーを貼り付けます...",
        "hint_1": "ここに入力されたアクティブなコードまたはターミナルテキストは、左側の送信ボタンを押すと自動的に抽出され、メッセージに安全にバンドルされます。",
        "hint_2": "標準的な会話形式の質問、または他の場所からのエラーについては、説明してチャットボックスに直接コピー＆ペーストしてください。"
    }
}

function changeLanguage(lang) {
    currentLanguage = lang;
    const dict = translations[lang] || translations["English"];

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        if (dict[key]) {
            el.innerHTML = dict[key];
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
        const key = el.getAttribute("data-i18n-placeholder");
        if (dict[key]) {
            el.placeholder = dict[key];
        }
    });
}

languageSelect?.addEventListener("change", (e) => {
    changeLanguage(e.target.value);
});

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

window.toggleTheme = function (e) {
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
    formData.append("language", currentLanguage);

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
        formData.append("language", currentLanguage);

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
        formData.append("language", currentLanguage);

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
    let baseMessage = chatInput.value.trim();

    // Extract Context Tools natively
    const codeFileName = document.getElementById('code-filename-input').value.trim();
    const codeContent = document.getElementById('code-content-input').value.trim();
    const terminalError = document.getElementById('terminal-error-input').value.trim();

    // Aggregating logical fail-state
    if (!baseMessage && !selectedFile && !codeContent && !terminalError) return;

    // Construct the explicit Payload String organically
    let aggregatedMessage = baseMessage;

    if (codeContent) {
        aggregatedMessage += `\n\n[Active Code Context: ${codeFileName || 'Unknown File'}]\nPlease verify this code and also check indentation:\n\`\`\`\n${codeContent}\n\`\`\``;
    }

    if (terminalError) {
        aggregatedMessage += `\n\n[Terminal Error]\n\`\`\`\n${terminalError}\n\`\`\``;
    }

    // Visual trace proxy mirroring what we physically send
    const displayMessage = aggregatedMessage.trim();
    appendMessage("user", displayMessage);

    // Clear out GUI states organically
    chatInput.value = "";
    document.getElementById('code-filename-input').value = "";
    document.getElementById('code-content-input').value = "";
    document.getElementById('terminal-error-input').value = "";

    const formData = new FormData();
    formData.append("name", currentUser);
    formData.append("workshop", currentWorkshop);
    formData.append("message", displayMessage);
    formData.append("language", currentLanguage);

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
