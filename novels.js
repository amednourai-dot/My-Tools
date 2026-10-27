(() => {
  "use strict";
  const NOVEL_INDEX = "./novels/novels.json";
  const STORAGE = {
    favorites: "novelFavorites",
    progress: "novelProgress",
    last: "novelLastRead"
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  let catalog = [];
  let activeNovel = null;
  let activeChapter = 0;
  let activeCategory = "الكل";
  let query = "";
  let view = "library";

  function read(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value == null ? fallback : value;
    } catch {
      return fallback;
    }
  }

  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"
    })[ch]);
  }

  function addStyles() {
    if ($("#novelLibraryStyles")) return;
    const style = document.createElement("style");
    style.id = "novelLibraryStyles";
    style.textContent = `
      #novelsPage{padding:16px 14px 100px;min-height:70vh}
      .nl-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
      .nl-head h2{margin:0;font-size:1.35rem}
      .nl-sub{opacity:.72;font-size:.9rem;margin:5px 0 16px}
      .nl-search{width:100%;border:1px solid var(--border,#d8deea);border-radius:14px;padding:13px;background:var(--card,#fff);color:inherit;font:inherit;outline:none}
      .nl-categories{display:flex;gap:8px;overflow-x:auto;padding:10px 0 14px;scrollbar-width:none}
      .nl-chip{border:1px solid var(--border,#d8deea);border-radius:999px;padding:8px 12px;white-space:nowrap;background:var(--card,#fff);color:inherit;font:inherit}
      .nl-chip.active{background:var(--primary,#2563eb);color:white;border-color:transparent}
      .nl-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
      .nl-card{min-width:0;border:1px solid var(--border,#e1e5ee);background:var(--card,#fff);color:inherit;border-radius:16px;padding:13px;text-align:right;display:flex;flex-direction:column;gap:7px;box-shadow:0 4px 16px #00000008}
      .nl-cover{font-size:2.1rem;background:var(--soft,#f2f5fb);border-radius:12px;min-height:76px;display:grid;place-items:center}
      .nl-card h3{font-size:1rem;margin:0;line-height:1.5}
      .nl-card p{font-size:.8rem;opacity:.75;margin:0;line-height:1.6}
      .nl-meta{font-size:.75rem;opacity:.7}
      .nl-actions{display:flex;gap:8px;margin-top:auto}
      .nl-btn{border:0;border-radius:11px;padding:10px 12px;background:var(--primary,#2563eb);color:white;font:inherit;cursor:pointer}
      .nl-btn.secondary{background:var(--soft,#eef2f8);color:inherit}
      .nl-btn.full{width:100%;margin-top:10px}
      .nl-empty{padding:24px 12px;text-align:center;opacity:.7}
      .nl-back{margin-bottom:14px}
      .nl-detail-cover{font-size:3.2rem;text-align:center;padding:20px;background:var(--soft,#f2f5fb);border-radius:18px;margin-bottom:12px}
      .nl-detail h2{margin:8px 0}
      .nl-chapters{display:grid;gap:8px;margin-top:16px}
      .nl-chapter-row{display:flex;align-items:center;gap:8px;text-align:right;border:1px solid var(--border,#e1e5ee);background:var(--card,#fff);color:inherit;border-radius:12px;padding:12px;font:inherit}
      .nl-chapter-row span{opacity:.65;font-size:.8rem;margin-right:auto}
      .nl-reader h2{font-size:1.25rem;line-height:1.6}
      .nl-reader-text{white-space:pre-wrap;line-height:2.05;font-size:1.05rem;overflow-wrap:anywhere}
      .nl-reader-tools{display:flex;gap:8px;flex-wrap:wrap;margin:14px 0}
      .nl-progress{height:5px;background:var(--soft,#eef2f8);border-radius:8px;overflow:hidden;margin:10px 0 16px}
      .nl-progress span{display:block;height:100%;background:var(--primary,#2563eb)}
      .nl-navrow{display:flex;gap:8px;margin-top:18px}
      .nl-navrow button{flex:1}
      body.dark .nl-card,body.dark .nl-chapter-row,body.dark .nl-search{background:var(--card,#1e293b);border-color:var(--border,#334155)}
      body.dark .nl-cover,body.dark .nl-detail-cover,body.dark .nl-chip,body.dark .nl-btn.secondary{background:var(--soft,#273449)}
      @media(min-width:560px){.nl-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
    `;
    document.head.appendChild(style);
  }

  function createPage() {
    if ($("#novelsPage")) return;
    const page = document.createElement("section");
    page.id = "novelsPage";
    page.className = "page";
    page.setAttribute("aria-label", "مكتبة الروايات");
    page.innerHTML = `
      <div class="nl-head"><h2>📚 مكتبة الروايات</h2><button class="nl-btn secondary" id="nlFavoritesBtn">☆ المفضلة</button></div>
      <p class="nl-sub">روايات عربية أصلية، وفصول محفوظة على جهازك للقراءة حتى دون اتصال بعد تحميلها.</p>
      <div id="nlView"></div>`;
    const nav = $(".bottom-nav") || $(".bottom-nav-bar") || $("nav");
    if (nav) {
      const button = document.createElement("button");
      button.className = "nav-btn";
      button.dataset.page = "novelsPage";
      button.id = "novelsNavBtn";
      button.innerHTML = '<span aria-hidden="true">📚</span><span>الروايات</span>';
      button.addEventListener("click", openLibrary);
      nav.appendChild(button);
    } else {
      const button = document.createElement("button");
      button.id = "novelsFloatingBtn";
      button.className = "nl-btn";
      button.textContent = "📚 الروايات";
      button.style.cssText = "position:fixed;z-index:1000;bottom:16px;left:16px";
      button.addEventListener("click", openLibrary);
      document.body.appendChild(button);
    }
    document.body.appendChild(page);
    $("#nlFavoritesBtn").addEventListener("click", () => {
      view = view === "favorites" ? "library" : "favorites";
      renderLibrary();
    });
    document.addEventListener("click", event => {
      if (event.target.closest(".nav-btn") && !event.target.closest("#novelsNavBtn")) {
        page.classList.remove("active");
        $("#novelsNavBtn")?.classList.remove("active");
      }
    });
  }

  async function loadCatalog() {
    try {
      const response = await fetch(NOVEL_INDEX);
      if (!response.ok) throw new Error("catalog");
      catalog = await response.json();
      renderLibrary();
    } catch {
      $("#nlView").innerHTML = '<p class="nl-empty">تعذر تحميل فهرس الروايات. افتح التطبيق مرة واحدة مع الإنترنت ثم أعد المحاولة.</p><button class="nl-btn full" id="nlRetry">إعادة المحاولة</button>';
      $("#nlRetry")?.addEventListener("click", loadCatalog);
    }
  }

  function openLibrary() {
    view = "library";
    $$(".page").forEach(page => page.classList.toggle("active", page.id === "novelsPage"));
    $$(".nav-btn").forEach(button => button.classList.toggle("active", button.id === "novelsNavBtn"));
    window.scrollTo({top:0,behavior:"instant"});
    renderLibrary();
  }

  function isFavorite(id) {
    return read(STORAGE.favorites, []).includes(id);
  }

  function toggleFavorite(id) {
    let list = read(STORAGE.favorites, []);
    if (list.includes(id)) list = list.filter(item => item !== id);
    else list.push(id);
    write(STORAGE.favorites, list);
    renderLibrary();
  }

  function renderLibrary() {
    const root = $("#nlView");
    if (!root) return;
    if (activeNovel) {
      renderNovelDetail(activeNovel);
      return;
    }
    const categories = ["الكل", ...new Set(catalog.map(item => item.category))];
    const visible = catalog.filter(item => {
      const matchesQuery = `${item.title} ${item.author} ${item.description} ${item.category}`.toLocaleLowerCase().includes(query.toLocaleLowerCase());
      const matchesCategory = activeCategory === "الكل" || item.category === activeCategory;
      const matchesFavorites = view !== "favorites" || isFavorite(item.id);
      return matchesQuery && matchesCategory && matchesFavorites;
    });
    $("#nlFavoritesBtn").textContent = view === "favorites" ? "📚 الكل" : `☆ المفضلة (${read(STORAGE.favorites, []).length})`;
    root.innerHTML = `
      <input class="nl-search" id="nlSearch" type="search" placeholder="ابحث عن رواية أو كاتب..." value="${escapeHTML(query)}" aria-label="البحث في الروايات">
      <div class="nl-categories">${categories.map(category => `<button class="nl-chip ${activeCategory===category?"active":""}" data-nl-category="${escapeHTML(category)}">${escapeHTML(category)}</button>`).join("")}</div>
      <div class="nl-grid" id="nlGrid"></div>`;
    const grid = $("#nlGrid");
    if (!visible.length) grid.innerHTML = '<p class="nl-empty">لا توجد روايات مطابقة للبحث.</p>';
    visible.forEach(novel => {
      const card = document.createElement("article");
      card.className = "nl-card";
      card.innerHTML = `
        <div class="nl-cover">${escapeHTML(novel.cover)}</div>
        <h3>${escapeHTML(novel.title)}</h3>
        <p>${escapeHTML(novel.description)}</p>
        <div class="nl-meta">${escapeHTML(novel.category)} · ${novel.chapterCount} فصول</div>
        <div class="nl-actions"><button class="nl-btn" data-open-novel="${escapeHTML(novel.id)}">اقرأ</button><button class="nl-btn secondary" data-fav-novel="${escapeHTML(novel.id)}">${isFavorite(novel.id)?"★":"☆"}</button></div>`;
      grid.appendChild(card);
    });
    $("#nlSearch").addEventListener("input", event => {
      query = event.target.value;
      const start = event.target.selectionStart;
      renderLibrary();
      const input = $("#nlSearch");
      input.focus();
      input.setSelectionRange(start, start);
    });
    $$("[data-nl-category]", root).forEach(button => button.addEventListener("click", () => {
      activeCategory = button.dataset.nlCategory;
      renderLibrary();
    }));
    $$("[data-open-novel]", root).forEach(button => button.addEventListener("click", () => {
      activeNovel = catalog.find(item => item.id === button.dataset.openNovel);
      renderNovelDetail(activeNovel);
    }));
    $$("[data-fav-novel]", root).forEach(button => button.addEventListener("click", () => toggleFavorite(button.dataset.favNovel)));
  }

  async function getNovel(novel) {
    const response = await fetch(novel.file);
    if (!response.ok) throw new Error("novel");
    return response.json();
  }

  async function renderNovelDetail(novel) {
    const root = $("#nlView");
    root.innerHTML = '<p class="nl-empty">جارٍ فتح الرواية...</p>';
    try {
      const data = await getNovel(novel);
      const progress = read(STORAGE.progress, {})[novel.id];
      root.innerHTML = `
        <button class="nl-btn secondary nl-back" id="nlBack">← العودة للمكتبة</button>
        <div class="nl-detail">
          <div class="nl-detail-cover">${escapeHTML(data.cover)}</div>
          <div class="nl-meta">${escapeHTML(data.category)} · ${data.chapters.length} فصول</div>
          <h2>${escapeHTML(data.title)}</h2>
          <p class="nl-meta">الكاتب: ${escapeHTML(data.author)}</p>
          <p>${escapeHTML(data.description)}</p>
          <button class="nl-btn full" id="nlContinue">${progress ? "▶ متابعة القراءة" : "▶ ابدأ القراءة"}</button>
          <button class="nl-btn secondary full" id="nlDetailFav">${isFavorite(novel.id)?"★ إزالة من المفضلة":"☆ إضافة إلى المفضلة"}</button>
          <h3>الفصول</h3><div class="nl-chapters" id="nlChapters"></div>
        </div>`;
      $("#nlBack").addEventListener("click", () => { activeNovel = null; renderLibrary(); });
      $("#nlContinue").addEventListener("click", () => openChapter(data, progress?.chapter || 0));
      $("#nlDetailFav").addEventListener("click", () => toggleFavorite(novel.id));
      data.chapters.forEach((chapter, index) => {
        const row = document.createElement("button");
        row.className = "nl-chapter-row";
        row.innerHTML = `<strong>${index+1}. ${escapeHTML(chapter.title)}</strong><span>قراءة ←</span>`;
        row.addEventListener("click", () => openChapter(data, index));
        $("#nlChapters").appendChild(row);
      });
    } catch {
      root.innerHTML = '<button class="nl-btn secondary nl-back">← العودة للمكتبة</button><p class="nl-empty">تعذر فتح الرواية. افتحها مع الإنترنت مرة واحدة ثم أعد المحاولة.</p>';
      $(".nl-back", root).addEventListener("click", () => { activeNovel = null; renderLibrary(); });
    }
  }

  function openChapter(novel, index) {
    activeNovel = catalog.find(item => item.id === novel.id);
    activeChapter = Math.max(0, Math.min(index, novel.chapters.length - 1));
    view = "reader";
    renderReader(novel);
  }

  function renderReader(novel) {
    const root = $("#nlView");
    const chapter = novel.chapters[activeChapter];
    const progress = read(STORAGE.progress, {});
    progress[novel.id] = {chapter:activeChapter, title:chapter.title, updated:Date.now()};
    write(STORAGE.progress, progress);
    write(STORAGE.last, {novelId:novel.id, chapter:activeChapter});
    const percent = Math.round(((activeChapter+1)/novel.chapters.length)*100);
    root.innerHTML = `
      <button class="nl-btn secondary nl-back" id="nlReaderBack">← فصول الرواية</button>
      <div class="nl-reader">
        <div class="nl-meta">${escapeHTML(novel.title)} · الفصل ${activeChapter+1} من ${novel.chapters.length}</div>
        <div class="nl-progress"><span style="width:${percent}%"></span></div>
        <h2>${escapeHTML(chapter.title)}</h2>
        <div class="nl-reader-tools"><button class="nl-btn secondary" id="nlFontDown">A−</button><button class="nl-btn secondary" id="nlFontUp">A+</button><button class="nl-btn secondary" id="nlShareChapter">مشاركة</button></div>
        <article class="nl-reader-text" id="nlReaderText">${escapeHTML(chapter.content)}</article>
        <div class="nl-navrow"><button class="nl-btn secondary" id="nlPrev" ${activeChapter===0?"disabled":""}>الفصل السابق</button><button class="nl-btn" id="nlNext" ${activeChapter===novel.chapters.length-1?"disabled":""}>الفصل التالي</button></div>
      </div>`;
    $("#nlReaderBack").addEventListener("click", () => renderNovelDetail(activeNovel));
    $("#nlPrev").addEventListener("click", () => { if(activeChapter>0){activeChapter--;renderReader(novel);} });
    $("#nlNext").addEventListener("click", () => { if(activeChapter<novel.chapters.length-1){activeChapter++;renderReader(novel);} });
    $("#nlFontDown").addEventListener("click", () => changeFont(-1));
    $("#nlFontUp").addEventListener("click", () => changeFont(1));
    $("#nlShareChapter").addEventListener("click", async () => {
      const text = `${novel.title} — ${chapter.title}\n\n${chapter.content}`;
      try {
        if (navigator.share) await navigator.share({title:novel.title,text});
        else if (navigator.clipboard) { await navigator.clipboard.writeText(text); alert("تم نسخ الفصل"); }
        else alert("يمكنك تحديد النص ونسخه يدويًا.");
      } catch {}
    });
    window.scrollTo({top:0,behavior:"instant"});
  }

  function changeFont(delta) {
    const article = $("#nlReaderText");
    if (!article) return;
    const current = Number(localStorage.getItem("novelFontSize")) || 17;
    const next = Math.max(14, Math.min(26, current + delta));
    localStorage.setItem("novelFontSize", String(next));
    article.style.fontSize = `${next}px`;
  }

  function init() {
    addStyles();
    createPage();
    loadCatalog();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();