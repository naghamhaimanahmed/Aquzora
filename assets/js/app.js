(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- state & storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("aqz." + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("aqz." + k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };

  const GAL_PAGE = 12;
  const state = {
    lang: store.get("lang", "en"),
    gal: { f: "all", shown: GAL_PAGE, at: -1 }
  };

  /* ---------- i18n helpers ---------- */
  function t(key, vars = {}) {
    let s = (I18N[state.lang] && I18N[state.lang][key]) ?? I18N.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => { s = s.replaceAll("{" + k + "}", v); });
    return s;
  }
  const L = obj => obj[state.lang] || obj.en;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- image fallback ---------- */
  // A drawn bottle used whenever a photo cannot load.
  const FALLBACK = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7efe4"/><stop offset="1" stop-color="#ead9c3"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/><rect x="170" y="70" width="60" height="40" rx="6" fill="#b98a4e"/><rect x="185" y="105" width="30" height="25" fill="#e9dcc6"/><rect x="120" y="125" width="160" height="190" rx="28" fill="#fff" fill-opacity=".55" stroke="#b98a4e" stroke-width="6"/><rect x="140" y="200" width="120" height="50" rx="6" fill="#b98a4e" fill-opacity=".25"/></svg>`);
  window.__aqzImgFail = img => { img.onerror = null; img.src = FALLBACK; img.classList.add("is-fallback"); };

  // Background photo: try each source in turn, then the drawing.
  function setBg(el, sources) {
    sources = sources.filter(Boolean);
    const tryNext = () => {
      const url = sources.shift();
      if (!url) { el.style.backgroundImage = `url("${FALLBACK}")`; el.classList.add("is-loaded", "is-fallback"); return; }
      const probe = new Image();
      probe.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add("is-loaded"); };
      probe.onerror = tryNext;
      probe.src = url;
    };
    tryNext();
  }

  /* ---------- the collection (your photos) ---------- */
  const galBrand = it => L(GALLERY_BRANDS[it.brand]);
  const galType = it => t("gal.type." + it.type);
  // Title: the product name if known, otherwise the brand.
  const galTitle = it => (state.lang === "ar" ? it.ar || it.en : it.en) || galBrand(it) || galType(it);
  const galSub = it => (it.en ? [galBrand(it), galType(it)] : [galType(it)]).filter(Boolean).join(" · ");
  const galSrc = (it, size) => `assets/img/collection/${size === "thumb" ? "thumb/" : ""}${it.code.toLowerCase()}.jpg`;
  const byCode = code => GALLERY.find(it => it.code === code);

  const filterMatch = (f, it) => (!f.type || it.type === f.type) && (!f.group || GALLERY_BRANDS[it.brand].group === f.group);
  function galList() {
    const f = GALLERY_FILTERS.find(x => x.id === state.gal.f) || GALLERY_FILTERS[0];
    return GALLERY.filter(it => filterMatch(f, it));
  }

  function renderCats() {
    $("#cats").innerHTML = GALLERY_TILES.map(tile => {
      const f = GALLERY_FILTERS.find(x => x.id === tile.filter);
      const n = GALLERY.filter(it => filterMatch(f, it)).length;
      return `<button class="cat" data-gal-link="${f.id}">
        <span class="cat__img" data-tile="${tile.photo}"></span>
        <span class="cat__label"><strong>${esc(L(f))}</strong><small>${n === 1 ? t("cats.item1") : t("cats.items", { n })}</small></span>
      </button>`;
    }).join("");
    $$("[data-tile]").forEach(el => setBg(el, [galSrc(byCode(el.dataset.tile))]));
  }

  function renderBrands() {
    const items = BRANDS.map(b => `<span class="brand">${esc(b)}</span>`).join("");
    $("#brands").innerHTML = `<div class="brands__row">${items}${items}</div>`;
  }

  function renderGalChips() {
    $("#galChips").setAttribute("aria-label", t("gal.filters"));
    $("#galChips").innerHTML = GALLERY_FILTERS.map(f =>
      `<button class="chip ${state.gal.f === f.id ? "is-on" : ""}" role="tab" aria-selected="${state.gal.f === f.id}" data-gal-f="${f.id}">${esc(L(f))}</button>`
    ).join("");
  }

  function renderGallery() {
    const list = galList(), shown = list.slice(0, state.gal.shown);
    $("#gal").innerHTML = shown.map((it, i) => `<button class="gal__item" data-gal="${i}" aria-label="${t("gal.view")}: ${esc(galTitle(it))}">
      <span class="gal__img"><img src="${galSrc(it, "thumb")}" alt="${esc(galTitle(it))}" width="480" height="480" loading="lazy" decoding="async" onerror="__aqzImgFail(this)"></span>
      <span class="gal__cap"><strong>${esc(galTitle(it))}</strong><small>${esc(galSub(it))}</small></span>
    </button>`).join("");
    $("#galCount").textContent = list.length === 1 ? t("gal.count1") : t("gal.count", { n: list.length });
    const left = list.length - shown.length;
    $("#galMore").hidden = left <= 0;
    $("#galMore").textContent = t("gal.more", { n: left });
  }

  function setGalFilter(id) {
    Object.assign(state.gal, { f: id, shown: GAL_PAGE });
    renderGalChips(); renderGallery();
  }

  const chevron = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m15 5-7 7 7 7"/></svg>`;
  function galView(i) {
    const list = galList();
    i = (i + list.length) % list.length;
    state.gal.at = i;
    const it = list[i];
    $("#modalContent").innerHTML = `<div class="qv gv">
      <div class="gv__img"><img src="${galSrc(it)}" alt="${esc(galTitle(it))}" onerror="__aqzImgFail(this)"></div>
      <div class="qv__info">
        <p class="gv__cat">${esc(galSub(it))}</p>
        <h3 id="modalTitle">${esc(galTitle(it))}</h3>
        <p class="gv__ref">${t("gal.ref")} <bdi>${esc(it.code)}</bdi> · ${t("gal.pos", { a: i + 1, b: list.length })}</p>
        <p class="qv__desc">${t("gal.note")}</p>
        <a class="btn btn--wa btn--block" data-gal-ask href="${esc(waHref(waAskText(it)))}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19.2L4 20z"/></svg>${t("gal.ask")}</a>
        <div class="gv__nav">
          <button class="icon-btn" data-gal-step="-1" aria-label="${t("gal.prev")}">${chevron}</button>
          <button class="icon-btn gv__next" data-gal-step="1" aria-label="${t("gal.next")}">${chevron}</button>
        </div>
      </div></div>`;
    // keep the photo in the grid when the viewer moves past the loaded ones
    if (i >= state.gal.shown) { state.gal.shown = Math.ceil((i + 1) / GAL_PAGE) * GAL_PAGE; renderGallery(); }
  }
  const galOpen = () => openEl && openEl.id === "modal" && $("#modalContent .gv");

  function renderReviews() {
    const stars = `<span class="stars" aria-label="5 / 5"><span style="width:100%"></span></span>`;
    $("#reviews").innerHTML = TESTIMONIALS.map(r => `<figure class="review">
      ${stars}
      <blockquote>“${esc(L(r))}”</blockquote>
      <figcaption><span class="avatar">${esc(r.name[0])}</span><span><strong>${esc(r.name)}</strong><small>${esc(L(r.city))}</small></span></figcaption>
    </figure>`).join("");
  }

  /* ---------- WhatsApp ---------- */
  // Real links (not window.open), so they work in every browser and embedded view.
  const waHref = text => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
  const waAskText = it => [t("wa.ask"), [galTitle(it), it.en ? galBrand(it) : ""].filter(Boolean).join(" – "), `${t("gal.ref")} ${it.code}`].join("\n");

  /* ---------- overlays (photo viewer / search) ---------- */
  let lastFocus = null, openEl = null;

  function openLayer(el) {
    closeLayer(true);
    lastFocus = document.activeElement;
    openEl = el;
    el.hidden = false;
    $("#overlay").hidden = false;
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => { el.classList.add("is-open"); $("#overlay").classList.add("is-open"); });
    const f = el.querySelector("input, button:not([data-close]), a") || el.querySelector("button");
    setTimeout(() => f && f.focus(), 60);
  }

  function closeLayer(instant) {
    if (!openEl) return;
    const el = openEl; openEl = null;
    el.classList.remove("is-open"); $("#overlay").classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    const done = () => { el.hidden = true; if (!openEl) $("#overlay").hidden = true; };
    instant === true ? done() : setTimeout(done, 250);
    if (instant !== true && lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }

  /* ---------- search ---------- */
  function searchText(it) {
    const b = GALLERY_BRANDS[it.brand];
    return [it.code, it.en, it.ar, b.en, b.ar, I18N.en["gal.type." + it.type], I18N.ar["gal.type." + it.type]].join(" ").toLowerCase();
  }
  function renderSearch(q) {
    q = q.trim().toLowerCase();
    const res = q ? GALLERY.filter(it => q.split(/\s+/).every(w => searchText(it).includes(w))).slice(0, 12) : [];
    $("#searchResults").innerHTML = !q
      ? `<p class="hint">${t("search.hint")}</p>`
      : res.length
        ? res.map(it => `<button class="s-item" data-gal-code="${it.code}"><img src="${galSrc(it, "thumb")}" alt="" onerror="__aqzImgFail(this)"><span><strong>${esc(galTitle(it))}</strong><small>${esc(galSub(it))}</small></span></button>`).join("")
        : `<p class="hint">${t("search.none")}</p>`;
  }

  /* ---------- page ---------- */
  function applyLang() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = state.lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $("#searchBig").setAttribute("aria-label", t("search.label"));
    $$("[data-wa-contact]").forEach(a => { a.href = waHref(t("wa.contact")); });
    $("#langBtn").textContent = state.lang === "ar" ? "English" : "عربي";
    $("#langBtn").setAttribute("aria-label", state.lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    renderCats(); renderBrands(); renderGalChips(); renderGallery(); renderReviews();
    if (galOpen()) galView(state.gal.at);
    if (openEl && openEl.id === "searchPop") renderSearch($("#searchBig").value);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const el = e.target.closest("button, a");
    if (!el) { if (e.target.id === "modal") closeLayer(); return; }
    const d = el.dataset;

    if ("close" in d) { closeLayer(); return; }
    if (d.galLink) { setGalFilter(d.galLink); closeMenu(); if (el.tagName !== "A") $("#collection").scrollIntoView({ behavior: "smooth" }); return; }
    if (d.galF) { setGalFilter(d.galF); return; }
    if (d.gal) { galView(+d.gal); openLayer($("#modal")); return; }
    if (d.galCode) {
      setGalFilter("all");
      galView(GALLERY.findIndex(it => it.code === d.galCode));
      openLayer($("#modal")); return;
    }
    if (d.galStep) { galView(state.gal.at + +d.galStep); el.focus(); return; }
    if ("search" in d) { closeMenu(); openLayer($("#searchPop")); renderSearch($("#searchBig").value); return; }
    if ("waContact" in d || "galAsk" in d) return; // plain links to WhatsApp
  });

  $("#overlay").addEventListener("click", () => closeLayer());
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeLayer(); closeMenu(); }
    if (galOpen() && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
      const fwd = (e.key === "ArrowRight") !== (state.lang === "ar");
      galView(state.gal.at + (fwd ? 1 : -1));
    }
    if (e.key === "/" && !openEl && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      e.preventDefault(); openLayer($("#searchPop")); renderSearch($("#searchBig").value);
    }
  });

  $("#langBtn").addEventListener("click", () => {
    state.lang = state.lang === "en" ? "ar" : "en";
    store.set("lang", state.lang);
    applyLang();
  });

  $("#searchBig").addEventListener("input", e => renderSearch(e.target.value));
  $("#galMore").addEventListener("click", () => { state.gal.shown += GAL_PAGE; renderGallery(); });

  const menuBtn = $("#menuBtn"), mobileNav = $("#mobileNav");
  function closeMenu() { mobileNav.hidden = true; menuBtn.setAttribute("aria-expanded", "false"); }
  menuBtn.addEventListener("click", () => {
    const open = mobileNav.hidden;
    mobileNav.hidden = !open; menuBtn.setAttribute("aria-expanded", String(open));
  });

  $("#newsForm").addEventListener("submit", e => {
    e.preventDefault();
    const inp = $("#newsEmail"), msg = $("#newsMsg");
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
    msg.textContent = ok ? t("news.ok") : t("news.bad");
    msg.className = "form-msg " + (ok ? "is-ok" : "is-bad");
    inp.setAttribute("aria-invalid", !ok);
    if (ok) inp.value = "";
  });

  // header shadow on scroll
  const header = $(".header");
  addEventListener("scroll", () => header.classList.toggle("is-scrolled", scrollY > 10), { passive: true });

  /* ---------- init ---------- */
  $("#year").textContent = new Date().getFullYear();
  $$("[data-img]").forEach(el => setBg(el, [IMAGES[el.dataset.img].local, IMAGES[el.dataset.img].remote]));
  applyLang();
})();
