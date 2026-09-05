const pages = document.querySelectorAll(".page");
const navButtons = document.querySelectorAll(".nav-btn");
const searchInput = document.getElementById("searchInput");
const themeBtn = document.getElementById("themeBtn");
const themeSelect = document.getElementById("themeSelect");

let currentTool = "";

const tools = {
    calculator: {
        name: "آلة حاسبة",
        description: "إجراء عمليات حسابية سريعة"
    },
    number: {
        name: "محول الأنظمة",
        description: "تحويل بين Binary و Decimal و Octal و Hex"
    },
    password: {
        name: "مولد كلمات المرور",
        description: "إنشاء كلمات مرور قوية"
    },
    strength: {
        name: "فحص كلمة المرور",
        description: "تحليل قوة كلمة المرور"
    },
    word: {
        name: "عداد النصوص",
        description: "حساب الكلمات والحروف والأسطر"
    },
    json: {
        name: "JSON Formatter",
        description: "تنسيق والتحقق من JSON"
    },
    base64: {
        name: "Base64",
        description: "ترميز وفك ترميز النصوص"
    },
    url: {
        name: "URL Encoder",
        description: "ترميز وفك ترميز النصوص"
    },
    color: {
        name: "Color Converter",
        description: "تحويل HEX إلى RGB"
    },
    uuid: {
        name: "UUID Generator",
        description: "إنشاء UUID جديد"
    },
    random: {
        name: "مولد الأرقام",
        description: "إنشاء رقم عشوائي"
    }
};

function showPage(id) {
    pages.forEach(page => page.classList.remove("active"));

    const targetPage = document.getElementById(id);

    if (!targetPage) return;

    targetPage.classList.add("active");

    navButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.page === id);
    });

    if (id === "favoritesPage") renderFavorites();
    if (id === "recentPage") renderRecent();
    if (id === "settingsPage") updateStats();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        showPage(btn.dataset.page);
    });
});

function showToast(message) {
    const toast = document.getElementById("toast");

    if (!toast) return;

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 2500);
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        showToast("تم النسخ بنجاح 📋");
    } catch {
        showToast("تعذر النسخ");
    }
}

function openTool(tool) {
    if (!tools[tool]) return;

    currentTool = tool;

    const title = document.getElementById("toolTitle");
    const description = document.getElementById("toolDescription");

    if (title) title.textContent = tools[tool].name;
    if (description) description.textContent = tools[tool].description;

    showPage("toolPage");

    addRecent(tool);
    updateFavoriteButton();
    renderTool(tool);
}

document.querySelectorAll("[data-tool]").forEach(button => {
    button.addEventListener("click", () => {
        openTool(button.dataset.tool);
    });
});

const backBtn = document.getElementById("backBtn");

if (backBtn) {
    backBtn.addEventListener("click", () => {
        showPage("homePage");
    });
}

function renderTool(tool) {
    const content = document.getElementById("toolContent");

    if (!content) return;

    if (tool === "calculator") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">
                <input id="calcInput" placeholder="مثال: 10 + 5 × 2">
                <button class="primary-btn" id="calcBtn">احسب</button>
                <div class="result-box" id="calcResult">أدخل عملية حسابية</div>
            </div>
        </div>
        `;

        document.getElementById("calcBtn").onclick = () => {
            let value = document.getElementById("calcInput").value
                .replace(/×/g, "*")
                .replace(/÷/g, "/");

            if (!/^[0-9+\-*/().\s]+$/.test(value)) {
                showToast("العملية غير صحيحة");
                return;
            }

            try {
                const result = Function(`"use strict"; return (${value})`)();
                document.getElementById("calcResult").textContent = result;
            } catch {
                showToast("عملية غير صحيحة");
            }
        };
    }

    if (tool === "number") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">
                <input id="numberInput" placeholder="أدخل الرقم">

                <select id="numberBase">
                    <option value="2">Binary</option>
                    <option value="8">Octal</option>
                    <option value="10" selected>Decimal</option>
                    <option value="16">Hexadecimal</option>
                </select>

                <button class="primary-btn" id="convertBtn">تحويل</button>

                <div class="result-grid">
                    <div class="result-item">
                        <strong>Binary</strong>
                        <span id="binary">-</span>
                    </div>

                    <div class="result-item">
                        <strong>Decimal</strong>
                        <span id="decimal">-</span>
                    </div>

                    <div class="result-item">
                        <strong>Octal</strong>
                        <span id="octal">-</span>
                    </div>

                    <div class="result-item">
                        <strong>Hex</strong>
                        <span id="hex">-</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        document.getElementById("convertBtn").onclick = () => {
            const input = document.getElementById("numberInput").value.trim();
            const base = Number(document.getElementById("numberBase").value);

            const patterns = {
                2: /^[01]+$/,
                8: /^[0-7]+$/,
                10: /^[0-9]+$/,
                16: /^[0-9a-fA-F]+$/
            };

            if (!input || !patterns[base].test(input)) {
                showToast("الرقم غير صالح");
                return;
            }

            const number = parseInt(input, base);

            document.getElementById("binary").textContent = number.toString(2);
            document.getElementById("decimal").textContent = number.toString(10);
            document.getElementById("octal").textContent = number.toString(8);
            document.getElementById("hex").textContent = number.toString(16).toUpperCase();
        };
    }

    if (tool === "password") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <select id="passwordLength">
                    <option value="8">8 أحرف</option>
                    <option value="12" selected>12 حرفًا</option>
                    <option value="16">16 حرفًا</option>
                    <option value="20">20 حرفًا</option>
                </select>

                <button class="primary-btn" id="generatePassword">
                    إنشاء كلمة مرور
                </button>

                <div class="result-box" id="passwordResult">
                    اضغط على إنشاء
                </div>

                <button class="secondary-btn" id="copyPassword">
                    📋 نسخ
                </button>

            </div>
        </div>
        `;

        document.getElementById("generatePassword").onclick = () => {
            const length = Number(document.getElementById("passwordLength").value);
            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
            const random = new Uint32Array(length);

            crypto.getRandomValues(random);

            let password = "";

            random.forEach(value => {
                password += chars[value % chars.length];
            });

            document.getElementById("passwordResult").textContent = password;
        };

        document.getElementById("copyPassword").onclick = () => {
            copyText(document.getElementById("passwordResult").textContent);
        };
    }

    if (tool === "strength") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">
                <input type="password" id="strengthInput" placeholder="أدخل كلمة المرور">
                <div class="result-box" id="strengthResult">
                    أدخل كلمة المرور للفحص
                </div>
            </div>
        </div>
        `;

        document.getElementById("strengthInput").addEventListener("input", e => {
            const password = e.target.value;

            let score = 0;

            if (password.length >= 8) score++;
            if (/[A-Z]/.test(password)) score++;
            if (/[a-z]/.test(password)) score++;
            if (/[0-9]/.test(password)) score++;
            if (/[^A-Za-z0-9]/.test(password)) score++;

            let result = "ضعيفة 🔴";

            if (score === 3) result = "متوسطة 🟡";
            if (score >= 4) result = "قوية 🟢";

            if (!password) result = "أدخل كلمة المرور للفحص";

            document.getElementById("strengthResult").textContent = result;
        });
    }

    if (tool === "word") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <textarea id="wordInput" placeholder="اكتب النص هنا..."></textarea>

                <div class="result-grid">
                    <div class="result-item">
                        <strong>الكلمات</strong>
                        <span id="wordCount">0</span>
                    </div>

                    <div class="result-item">
                        <strong>الحروف</strong>
                        <span id="charCount">0</span>
                    </div>

                    <div class="result-item">
                        <strong>الأسطر</strong>
                        <span id="lineCount">0</span>
                    </div>

                    <div class="result-item">
                        <strong>بدون مسافات</strong>
                        <span id="noSpaceCount">0</span>
                    </div>
                </div>

            </div>
        </div>
        `;

        document.getElementById("wordInput").addEventListener("input", e => {
            const text = e.target.value;

            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const chars = text.length;
            const lines = text ? text.split("\n").length : 0;
            const noSpaces = text.replace(/\s/g, "").length;

            document.getElementById("wordCount").textContent = words;
            document.getElementById("charCount").textContent = chars;
            document.getElementById("lineCount").textContent = lines;
            document.getElementById("noSpaceCount").textContent = noSpaces;
        });
    }

    if (tool === "json") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <textarea id="jsonInput" placeholder='{"name":"Ahmed"}'></textarea>

                <button class="primary-btn" id="formatJson">
                    تنسيق JSON
                </button>

                <button class="secondary-btn" id="minifyJson">
                    ضغط JSON
                </button>

                <textarea id="jsonOutput" readonly placeholder="النتيجة"></textarea>

                <button class="secondary-btn" id="copyJson">
                    📋 نسخ
                </button>

            </div>
        </div>
        `;

        document.getElementById("formatJson").onclick = () => {
            try {
                const data = JSON.parse(document.getElementById("jsonInput").value);

                document.getElementById("jsonOutput").value =
                    JSON.stringify(data, null, 4);

                showToast("JSON صحيح وتم تنسيقه");
            } catch {
                showToast("JSON غير صحيح");
            }
        };

        document.getElementById("minifyJson").onclick = () => {
            try {
                const data = JSON.parse(document.getElementById("jsonInput").value);

                document.getElementById("jsonOutput").value =
                    JSON.stringify(data);
            } catch {
                showToast("JSON غير صحيح");
            }
        };

        document.getElementById("copyJson").onclick = () => {
            copyText(document.getElementById("jsonOutput").value);
        };
    }

    if (tool === "base64") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <textarea id="baseInput" placeholder="أدخل النص"></textarea>

                <button class="primary-btn" id="encodeBase">
                    Encode
                </button>

                <button class="secondary-btn" id="decodeBase">
                    Decode
                </button>

                <textarea id="baseOutput" readonly placeholder="النتيجة"></textarea>

                <button class="secondary-btn" id="copyBase">
                    📋 نسخ
                </button>

            </div>
        </div>
        `;

        document.getElementById("encodeBase").onclick = () => {
            try {
                const text = document.getElementById("baseInput").value;

                document.getElementById("baseOutput").value =
                    btoa(unescape(encodeURIComponent(text)));
            } catch {
                showToast("حدث خطأ");
            }
        };

        document.getElementById("decodeBase").onclick = () => {
            try {
                const text = document.getElementById("baseInput").value;

                document.getElementById("baseOutput").value =
                    decodeURIComponent(escape(atob(text)));
            } catch {
                showToast("النص غير صالح");
            }
        };

        document.getElementById("copyBase").onclick = () => {
            copyText(document.getElementById("baseOutput").value);
        };
    }

    if (tool === "url") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <textarea id="urlInput" placeholder="أدخل النص أو الرابط"></textarea>

                <button class="primary-btn" id="encodeUrl">
                    Encode
                </button>

                <button class="secondary-btn" id="decodeUrl">
                    Decode
                </button>

                <textarea id="urlOutput" readonly placeholder="النتيجة"></textarea>

                <button class="secondary-btn" id="copyUrl">
                    📋 نسخ
                </button>

            </div>
        </div>
        `;

        document.getElementById("encodeUrl").onclick = () => {
            document.getElementById("urlOutput").value =
                encodeURIComponent(document.getElementById("urlInput").value);
        };

        document.getElementById("decodeUrl").onclick = () => {
            try {
                document.getElementById("urlOutput").value =
                    decodeURIComponent(document.getElementById("urlInput").value);
            } catch {
                showToast("النص غير صالح");
            }
        };

        document.getElementById("copyUrl").onclick = () => {
            copyText(document.getElementById("urlOutput").value);
        };
    }

    if (tool === "color") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <input id="colorInput" placeholder="#2563EB">

                <button class="primary-btn" id="convertColor">
                    تحويل
                </button>

                <div class="result-box" id="colorResult">
                    أدخل لون HEX
                </div>

            </div>
        </div>
        `;

        document.getElementById("convertColor").onclick = () => {
            let hex = document.getElementById("colorInput").value
                .trim()
                .replace("#", "");

            if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
                showToast("أدخل HEX صحيح");
                return;
            }

            const r = parseInt(hex.substring(0, 2), 16);
            const g = parseInt(hex.substring(2, 4), 16);
            const b = parseInt(hex.substring(4, 6), 16);

            document.getElementById("colorResult").innerHTML = `
            <div style="width:100%;height:50px;border-radius:10px;background:#${hex};margin-bottom:12px"></div>
            HEX: #${hex.toUpperCase()}<br>
            RGB: rgb(${r}, ${g}, ${b})
            `;
        };
    }

    if (tool === "uuid") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <button class="primary-btn" id="generateUuid">
                    إنشاء UUID
                </button>

                <div class="result-box" id="uuidResult">
                    اضغط على إنشاء
                </div>

                <button class="secondary-btn" id="copyUuid">
                    📋 نسخ
                </button>

            </div>
        </div>
        `;

        document.getElementById("generateUuid").onclick = () => {
            document.getElementById("uuidResult").textContent =
                crypto.randomUUID();
        };

        document.getElementById("copyUuid").onclick = () => {
            copyText(document.getElementById("uuidResult").textContent);
        };
    }

    if (tool === "random") {
        content.innerHTML = `
        <div class="tool-box">
            <div class="tool-form">

                <input type="number" id="minRandom" value="1">
                <input type="number" id="maxRandom" value="100">

                <button class="primary-btn" id="generateRandom">
                    إنشاء رقم
                </button>

                <div class="result-box" id="randomResult">
                    🎲
                </div>

            </div>
        </div>
        `;

        document.getElementById("generateRandom").onclick = () => {
            const min = Number(document.getElementById("minRandom").value);
            const max = Number(document.getElementById("maxRandom").value);

            if (!Number.isFinite(min) || !Number.isFinite(max) || min > max) {
                showToast("أدخل نطاقًا صحيحًا");
                return;
            }

            const random =
                Math.floor(Math.random() * (max - min + 1)) + min;

            document.getElementById("randomResult").textContent = random;
        };
    }
}

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const value = searchInput.value.toLowerCase();

        document.querySelectorAll(".tool-card").forEach(card => {
            const text = card.textContent.toLowerCase();

            card.style.display = text.includes(value) ? "flex" : "none";
        });
    });
}

document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".category").forEach(btn => {
            btn.classList.remove("active");
        });

        button.classList.add("active");

        const category = button.dataset.category;

        document.querySelectorAll(".tool-card").forEach(card => {
            const show =
                category === "all" ||
                card.dataset.category === category;

            card.style.display = show ? "flex" : "none";
        });
    });
});

function getRecent() {
    return JSON.parse(localStorage.getItem("recentTools") || "[]");
}

function addRecent(tool) {
    let recent = getRecent();

    recent = recent.filter(item => item !== tool);

    recent.unshift(tool);

    recent = recent.slice(0, 10);

    localStorage.setItem("recentTools", JSON.stringify(recent));

    const total = Number(localStorage.getItem("totalUsage") || 0);

    localStorage.setItem("totalUsage", total + 1);
}

function createToolCard(tool) {
    const button = document.createElement("button");

    button.className = "tool-card";

    button.innerHTML = `
    <div class="tool-icon">🧰</div>

    <div>
        <h3>${tools[tool].name}</h3>
        <p>${tools[tool].description}</p>
    </div>

    <span>←</span>
    `;

    button.onclick = () => openTool(tool);

    return button;
}

function renderRecent() {
    const container = document.getElementById("recentList");

    if (!container) return;

    const recent = getRecent();

    container.innerHTML = "";

    if (!recent.length) {
        container.innerHTML = "<p>لم تستخدم أي أداة بعد.</p>";
        return;
    }

    recent.forEach(tool => {
        if (tools[tool]) {
            container.appendChild(createToolCard(tool));
        }
    });
}

const clearRecent = document.getElementById("clearRecent");

if (clearRecent) {
    clearRecent.onclick = () => {
        localStorage.removeItem("recentTools");

        renderRecent();

        showToast("تم مسح السجل");
    };
}

function getFavorites() {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function updateFavoriteButton() {
    const favoriteBtn = document.getElementById("favoriteBtn");

    if (!favoriteBtn) return;

    const favorites = getFavorites();

    favoriteBtn.textContent =
        favorites.includes(currentTool) ? "★" : "☆";
}

const favoriteBtn = document.getElementById("favoriteBtn");

if (favoriteBtn) {
    favoriteBtn.onclick = () => {
        if (!currentTool) return;

        let favorites = getFavorites();

        if (favorites.includes(currentTool)) {
            favorites = favorites.filter(tool => tool !== currentTool);

            showToast("تمت الإزالة من المفضلة");
        } else {
            favorites.push(currentTool);

            showToast("تمت الإضافة إلى المفضلة ⭐");
        }

        localStorage.setItem("favorites", JSON.stringify(favorites));

        updateFavoriteButton();
    };
}

function renderFavorites() {
    const container = document.getElementById("favoritesList");

    if (!container) return;

    const favorites = getFavorites();

    container.innerHTML = "";

    if (!favorites.length) {
        container.innerHTML =
            "<p>لا توجد أدوات في المفضلة حتى الآن ⭐</p>";
        return;
    }

    favorites.forEach(tool => {
        if (tools[tool]) {
            container.appendChild(createToolCard(tool));
        }
    });
}

const shareBtn = document.getElementById("shareBtn");

if (shareBtn) {
    shareBtn.onclick = async () => {
        if (!currentTool) return;

        const data = {
            title: tools[currentTool].name,
            text: tools[currentTool].description,
            url: location.href
        };

        try {
            if (navigator.share) {
                await navigator.share(data);
            } else {
                copyText(location.href);
            }
        } catch {}
    };
}

function applyTheme(mode) {
    document.body.classList.remove("dark");

    if (mode === "dark") {
        document.body.classList.add("dark");
    }

    if (mode === "auto") {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
            document.body.classList.add("dark");
        }
    }

    if (themeBtn) {
        themeBtn.textContent =
            document.body.classList.contains("dark") ? "☀️" : "🌙";
    }
}

function setTheme(mode) {
    localStorage.setItem("theme", mode);

    if (themeSelect) {
        themeSelect.value = mode;
    }

    applyTheme(mode);
}

if (themeBtn) {
    themeBtn.onclick = () => {
        const isDark = document.body.classList.contains("dark");

        setTheme(isDark ? "light" : "dark");
    };
}

if (themeSelect) {
    themeSelect.addEventListener("change", () => {
        setTheme(themeSelect.value);

        showToast("تم تغيير المظهر 🎨");
    });
}

const savedTheme = localStorage.getItem("theme") || "auto";

applyTheme(savedTheme);

if (themeSelect) {
    themeSelect.value = savedTheme;
}

function updateStats() {
    const total = Number(localStorage.getItem("totalUsage") || 0);
    const recent = getRecent();
    const statsText = document.getElementById("statsText");

    if (!statsText) return;

    statsText.textContent =
        `استخدمت الأدوات ${total} مرة. لديك ${getFavorites().length} أدوات في المفضلة. عدد الأدوات الأخيرة: ${recent.length}`;
}

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("service-worker.js")
            .catch(() => {});
    });
               }
