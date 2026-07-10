document.addEventListener("DOMContentLoaded", () => {
"use strict";

/* ==========================
   ELEMENTLƏR
========================== */

const $ = (id) => document.getElementById(id);

const wordInput = $("word");
const checkBtn = $("checkBtn");
const result = $("result");
const favoriteBtn = $("favoriteBtn");
const favoritesList = $("favoritesList");
const aiSearchBtn = $("aiSearchBtn");
const aiResult = $("aiResult");

const checkedCount = $("checkedCount");
const checkedCount2 = $("checkedCount2");
const correctCount = $("correctCount");
const wrongCount = $("wrongCount");
const aiCount = $("aiCount");

/* ==========================
   STORAGE
========================== */

const Storage = {
    get(key, def) {
        try {
            return JSON.parse(localStorage.getItem(key)) ?? def;
        } catch {
            return def;
        }
    },

    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

/* ==========================
   STATİSTİKA
========================== */

let stats = Storage.get("stats", {
    checked: 0,
    correct: 0,
    wrong: 0,
    ai: 0
});

function animate(el) {
    if (!el) return;

    el.classList.remove("pulse");

    void el.offsetWidth;

    el.classList.add("pulse");
}

function updateStats() {

    if (checkedCount) {
        checkedCount.textContent = stats.checked;
        animate(checkedCount);
    }

    if (checkedCount2) {
        checkedCount2.textContent = stats.checked;
        animate(checkedCount2);
    }

    if (correctCount) {
        correctCount.textContent = stats.correct;
        animate(correctCount);
    }

    if (wrongCount) {
        wrongCount.textContent = stats.wrong;
        animate(wrongCount);
    }

    if (aiCount) {
        aiCount.textContent = stats.ai;
        animate(aiCount);
    }

    Storage.set("stats", stats);
}

updateStats();

/* ==========================
   KÖMƏKÇİLƏR
========================== */

function showLoading(el, text) {

    if (!el) return;

    el.innerHTML = `
        <div class="loading-box">
            <div class="loader"></div>
            <span>${text}</span>
        </div>
    `;
}

function showSuccess(title, text) {

    result.innerHTML = `
        <div class="success fade">
            <h3>${title}</h3>
            <p>${text}</p>
        </div>
    `;
}

function showError(title, text) {

    result.innerHTML = `
        <div class="error fade">
            <h3>${title}</h3>
            <p>${text}</p>
        </div>
    `;
}

function request(url, body) {

    return fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    }).then(r => r.json());
}
/* ==========================
   SÖZ YOXLAMA (PREMIUM)
========================== */

if (checkBtn) {

    checkBtn.addEventListener("click", async () => {

        const word = wordInput.value.trim();

        if (!word) {
            showError("⚠️ Söz daxil edin", "Yoxlama aparmaq üçün əvvəl söz yazın.");
            return;
        }

        checkBtn.disabled = true;
        showLoading(result, "Söz yoxlanılır...");

        try {

            const data = await request("/yoxla", {
                word: word
            });

            stats.checked++;

            if (data.status === "correct") {

                stats.correct++;

                showSuccess(
                    "✅ Düzgündür",
                    data.word || word
                );

            } else {

                stats.wrong++;

                showError(
                    "❌ Tapılmadı",
                    data.message || "Bu söz lüğətdə yoxdur."
                );

            }

            updateStats();

        } catch (err) {

            console.error(err);

            showError(
                "❌ Server xətası",
                "Serverə qoşulmaq mümkün olmadı."
            );

        } finally {

            checkBtn.disabled = false;

        }

    });

}

/* ==========================
   ENTER İLƏ YOXLAMA
========================== */

if (wordInput) {

    wordInput.addEventListener("keydown", (e) => {

        if (e.key === "Enter") {

            e.preventDefault();

            if (checkBtn && !checkBtn.disabled) {
                checkBtn.click();
            }

        }

    });

}
/* ==========================
   AI ANALİZ (PREMIUM)
========================== */

if (aiSearchBtn) {

    aiSearchBtn.addEventListener("click", async () => {

        const word = wordInput.value.trim();

        if (!word) {

            aiResult.innerHTML = `
                <div class="ai-card-result error fade">
                    <h3>⚠️ Xəbərdarlıq</h3>
                    <p>Əvvəl söz yazın.</p>
                </div>
            `;
            return;
        }

        aiSearchBtn.disabled = true;

        aiResult.innerHTML = `
            <div class="ai-card-result fade">
                <div class="loader"></div>
                <h3>🤖 AI analiz edir...</h3>
            </div>
        `;

        try {

            const data = await request("/ai_axtar", {
                word: word
            });

            stats.ai++;
            updateStats();

            let aiData = null;

            try {
                aiData = JSON.parse(data.result);
            } catch (_) {}

            if (aiData) {

                aiResult.innerHTML = `
                    <div class="ai-card-result fade">

                        <h3>🤖 AI Analizi</h3>

                        <div class="ai-box">
                            <span>✅ Düzgün yazılış</span>
                            <p>${aiData.correct || "-"}</p>
                        </div>

                        <div class="ai-box">
                            <span>📖 Mənası</span>
                            <p>${aiData.meaning || "-"}</p>
                        </div>

                        <div class="ai-box">
                            <span>🔤 Nitq hissəsi</span>
                            <p>${aiData.part || "-"}</p>
                        </div>

                        <div class="ai-box">
                            <span>📝 Nümunə cümlə</span>
                            <p>${aiData.example || "-"}</p>
                        </div>

                    </div>
                `;

            } else {

                aiResult.innerHTML = `
                    <div class="ai-card-result fade">
                        <h3>🤖 AI Cavabı</h3>
                        <p>${data.result || "AI cavabı alınmadı."}</p>
                    </div>
                `;

            }

        } catch (err) {

            console.error(err);

            aiResult.innerHTML = `
                <div class="ai-card-result error fade">
                    <h3>❌ AI Xətası</h3>
                    <p>Serverlə əlaqə qurmaq mümkün olmadı.</p>
                </div>
            `;

        } finally {

            aiSearchBtn.disabled = false;

        }

    });

}

if (aiResult) {
    aiResult.innerHTML = "";
}
/* ==========================
   SEVİMLİLƏR
========================== */

let favorites = Storage.get("favorites", []);

function showFavorites() {

    if (!favoritesList) return;

    if (!favorites.length) {
        favoritesList.innerHTML =
            `<p class="empty-favorite">Hələ sevimli söz yoxdur.</p>`;
        return;
    }

    favoritesList.innerHTML = "";

    favorites.forEach((word, index) => {

        const item = document.createElement("div");
        item.className = "favorite-item fade";

        item.innerHTML = `
            <span>⭐ ${word}</span>
            <button class="delete-favorite" data-index="${index}">
                ✕
            </button>
        `;

        favoritesList.appendChild(item);
    });

    document.querySelectorAll(".delete-favorite").forEach(btn => {

        btn.onclick = () => {

            favorites.splice(btn.dataset.index, 1);

            Storage.set("favorites", favorites);

            showFavorites();

        };

    });

}

showFavorites();

if (favoriteBtn) {

    favoriteBtn.addEventListener("click", () => {

        const word = wordInput.value.trim();

        if (!word) return;

        if (favorites.includes(word)) return;

        favorites.unshift(word);

        if (favorites.length > 100)
            favorites.pop();

        Storage.set("favorites", favorites);

        showFavorites();

    });

}

/* ==========================
   TEMA
========================== */

const themeBtn = document.querySelector(".theme");

const themes = [
    "theme-aurora",
    "theme-gold",
    "theme-emerald",
    "theme-arctic"
];

function changeTheme(theme) {

    document.body.classList.remove(...themes);

    document.body.classList.add(theme);

    localStorage.setItem("theme", theme);

}

const savedTheme = localStorage.getItem("theme");

if (savedTheme && themes.includes(savedTheme)) {
    changeTheme(savedTheme);
}

if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        const current =
            themes.find(t => document.body.classList.contains(t));

        const next =
            themes[(themes.indexOf(current) + 1) % themes.length];

        changeTheme(next);

    });

}

/* ==========================
   AUTO FOCUS
========================== */

wordInput?.focus();

/* ==========================
   END
========================== */

});