document.addEventListener("DOMContentLoaded", () => {
"use strict";

/*======================================
  DOM ELEMENTLƏRİ
======================================*/

const $ = (id) => document.getElementById(id);

const elements = {

    wordInput: $("word"),
    checkBtn: $("checkBtn"),
    result: $("result"),

    favoriteBtn: $("favoriteBtn"),
    favoritesList: $("favoritesList"),

    aiSearchBtn: $("aiSearchBtn"),
    aiResult: $("aiResult"),

    checkedCount: $("checkedCount"),
    checkedCount2: $("checkedCount2"),
    correctCount: $("correctCount"),
    wrongCount: $("wrongCount"),
    aiCount: $("aiCount")

};

/*======================================
  STORAGE
======================================*/

const Storage = {

    get(key, defaultValue){

        try{

            const value = localStorage.getItem(key);

            return value
                ? JSON.parse(value)
                : defaultValue;

        }catch(error){

            console.warn("Storage read error:", error);

            return defaultValue;

        }

    },

    set(key,value){

        try{

            localStorage.setItem(
                key,
                JSON.stringify(value)
            );

        }catch(error){

            console.warn("Storage write error:", error);

        }

    }

};

/*======================================
  STATİSTİKA
======================================*/

let stats = Storage.get("stats",{

    checked:0,
    correct:0,
    wrong:0,
    ai:0

});

/*======================================
  ANİMASİYA
======================================*/

function pulse(element){

    if(!element) return;

    element.classList.remove("pulse");

    void element.offsetWidth;

    element.classList.add("pulse");

}

/*======================================
  STATİSTİKANI YENİLƏ
======================================*/

function updateStats(){

    const mapping = [

        [elements.checkedCount, stats.checked],
        [elements.checkedCount2, stats.checked],
        [elements.correctCount, stats.correct],
        [elements.wrongCount, stats.wrong],
        [elements.aiCount, stats.ai]

    ];

    mapping.forEach(([element,value])=>{

        if(!element) return;

        element.textContent = value;

        pulse(element);

    });

    Storage.set("stats",stats);

}

/*======================================
  LOADING
======================================*/

function showLoading(container,text){

    if(!container) return;

    container.innerHTML = `
        <div class="loading-box">

            <div class="loader"></div>

            <span>${text}</span>

        </div>
    `;

}

/*======================================
  SUCCESS
======================================*/

function showSuccess(title,text){

    if(!elements.result) return;

    elements.result.innerHTML=`

        <div class="success fade">

            <h3>${title}</h3>

            <p>${text}</p>

        </div>

    `;

}

/*======================================
  ERROR
======================================*/

function showError(title,text){

    if(!elements.result) return;

    elements.result.innerHTML=`

        <div class="error fade">

            <h3>${title}</h3>

            <p>${text}</p>

        </div>

    `;

}

/*======================================
  REQUEST
======================================*/

async function request(url,data){

    const response = await fetch(url,{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(data)

    });

    if(!response.ok){

        throw new Error(
            `HTTP ${response.status}`
        );

    }

    return await response.json();

}

/*======================================
  TOAST
======================================*/

function toast(message){

    let box = document.querySelector(".toast");

    if(!box){

        box=document.createElement("div");

        box.className="toast";

        document.body.appendChild(box);

    }

    box.textContent=message;

    box.classList.add("show");

    clearTimeout(box.timer);

    box.timer=setTimeout(()=>{

        box.classList.remove("show");

    },2200);

}

/*======================================
  İLK YÜKLƏNMƏ
======================================*/

updateStats();
/*======================================
  SÖZ YOXLAMA
======================================*/

if (elements.checkBtn) {

    elements.checkBtn.addEventListener("click", async () => {

        const word = elements.wordInput?.value
            .trim()
            .replace(/\s+/g, " ");

        if (!word) {

            showError(
                "⚠️ Söz daxil edin",
                "Yoxlama aparmaq üçün əvvəl söz yazın."
            );

            return;
        }

        elements.checkBtn.disabled = true;
        elements.checkBtn.classList.add("loading");

        showLoading(
            elements.result,
            "Söz yoxlanılır..."
        );

        try {

            const data = await request(
                "/yoxla",
                { word }
            );

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
                    data.message ||
                    "Bu söz lüğətdə yoxdur."
                );

            }

            updateStats();

        } catch (error) {

            console.error(error);

            showError(
                "❌ Server xətası",
                "Serverə qoşulmaq mümkün olmadı."
            );

        } finally {

            elements.checkBtn.disabled = false;
            elements.checkBtn.classList.remove("loading");

        }

    });

}

/*======================================
  ENTER İLƏ YOXLAMA
======================================*/

if (elements.wordInput) {

    elements.wordInput.addEventListener("keydown", (e) => {

        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {

            e.preventDefault();

            elements.checkBtn?.click();

        }

    });

}

/*======================================
  AI ANALİZ
======================================*/

if (elements.aiSearchBtn) {

    elements.aiSearchBtn.addEventListener("click", async () => {

        const word = elements.wordInput?.value
            .trim()
            .replace(/\s+/g, " ");

        if (!word) {

            elements.aiResult.innerHTML = `

            <div class="ai-card-result error fade">

                <h3>⚠️ Xəbərdarlıq</h3>

                <p>Əvvəl söz yazın.</p>

            </div>

            `;

            return;

        }

        elements.aiSearchBtn.disabled = true;

        elements.aiSearchBtn.innerHTML = `
            ⏳ Analiz edilir...
        `;

        elements.aiResult.innerHTML = `

            <div class="ai-card-result fade">

                <div class="loader"></div>

                <h3>🤖 AI analiz edir...</h3>

            </div>

        `;

        try {

            const data = await request(
                "/ai_axtar",
                { word }
            );

            stats.ai++;

            updateStats();

            let aiData = null;

            try {

                aiData = JSON.parse(
                    data.result
                );

            } catch {

                aiData = null;

            }

            if (aiData) {

                elements.aiResult.innerHTML = `

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
                        <span>📝 Nümunə</span>
                        <p>${aiData.example || "-"}</p>
                    </div>

                </div>

                `;

            } else {

                elements.aiResult.innerHTML = `

                <div class="ai-card-result fade">

                    <h3>🤖 AI Cavabı</h3>

                    <p>${data.result}</p>

                </div>

                `;

            }

        } catch (error) {

            console.error(error);

            elements.aiResult.innerHTML = `

            <div class="ai-card-result error fade">

                <h3>❌ AI Xətası</h3>

                <p>Serverlə əlaqə qurmaq mümkün olmadı.</p>

            </div>

            `;

        } finally {

            elements.aiSearchBtn.disabled = false;

            elements.aiSearchBtn.innerHTML =
                "🤖 AI ilə analiz et";

        }

    });

}

/*======================================
  AI TƏMİZLƏ
======================================*/

if (elements.aiResult) {

    elements.aiResult.innerHTML = "";

}
/*======================================
  SEVİMLİLƏR
======================================*/

let favorites = Storage.get("favorites", []);

function renderFavorites() {

    if (!elements.favoritesList) return;

    if (!favorites.length) {

        elements.favoritesList.innerHTML = `
            <p class="empty-favorite">
                Hələ sevimli söz yoxdur.
            </p>
        `;

        return;

    }

    elements.favoritesList.innerHTML = "";

    favorites.forEach((word, index) => {

        const item = document.createElement("div");

        item.className = "favorite-item fade";

        item.innerHTML = `

            <span>⭐ ${word}</span>

            <button
                class="delete-favorite"
                data-index="${index}"
                title="Sil">

                ✕

            </button>

        `;

        elements.favoritesList.appendChild(item);

    });

}

/*======================================
  FAVORİT ƏLAVƏ ET
======================================*/

if (elements.favoriteBtn) {

    elements.favoriteBtn.addEventListener("click", () => {

        const word = elements.wordInput?.value
            .trim()
            .replace(/\s+/g, " ");

        if (!word) {

            toast("⚠️ Əvvəl söz daxil edin");

            return;

        }

        const exists = favorites.some(
            x => x.toLowerCase() === word.toLowerCase()
        );

        if (exists) {

            toast("⭐ Bu söz artıq sevimlilərdədir");

            return;

        }

        favorites.unshift(word);

        if (favorites.length > 50) {

            favorites.pop();

        }

        Storage.set("favorites", favorites);

        renderFavorites();

        toast("✅ Sevimlilərə əlavə edildi");

    });

}

/*======================================
  FAVORİT SİL
======================================*/

document.addEventListener("click", (e) => {

    if (!e.target.classList.contains("delete-favorite"))
        return;

    const index = Number(
        e.target.dataset.index
    );

    favorites.splice(index, 1);

    Storage.set("favorites", favorites);

    renderFavorites();

    toast("🗑️ Silindi");

});

renderFavorites();

/*======================================
  TEMA
======================================*/

const themeBtn = document.querySelector(".theme");

const themes = [

    "theme-aurora",
    "theme-gold",
    "theme-emerald",
    "theme-arctic"

];

function applyTheme(theme){

    document.body.classList.remove(...themes);

    document.body.classList.add(theme);

    Storage.set("theme", theme);

}

const savedTheme = Storage.get(
    "theme",
    "theme-aurora"
);

applyTheme(savedTheme);

if(themeBtn){

    themeBtn.addEventListener("click",()=>{

        const current = themes.find(theme=>
            document.body.classList.contains(theme)
        );

        const index = themes.indexOf(current);

        const next = themes[
            (index+1)%themes.length
        ];

        applyTheme(next);

        toast("🎨 Mövzu dəyişdirildi");

    });

}

/*======================================
  AUTO FOCUS
======================================*/

elements.wordInput?.focus();

/*======================================
  PAGE ANIMATION
======================================*/

const observer = new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

},{
    threshold:.15
});

document.querySelectorAll(

    ".feature,.stat-card,.hero-right,.favorites-section"

).forEach(el=>{

    el.classList.add("hidden");

    observer.observe(el);

});

/*======================================
  END
======================================*/

});