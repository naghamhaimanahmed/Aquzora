(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- state & storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("aqz." + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("aqz." + k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };

  const state = {
    lang: store.get("lang", "en"),
    cat: "all",
    q: "",
    sort: "featured",
    sale: false,
    cart: store.get("cart", {}),
    wish: new Set(store.get("wish", [])),
    quiz: { step: 0, answers: [] }
  };
  // drop items that no longer exist in the catalogue
  Object.keys(state.cart).forEach(id => { if (!byId(+id)) delete state.cart[id]; });

  function byId(id) { return PRODUCTS.find(p => p.id === id); }
  const saveCart = () => store.set("cart", state.cart);
  const saveWish = () => store.set("wish", [...state.wish]);

  /* ---------- i18n helpers ---------- */
  function t(key, vars = {}) {
    let s = (I18N[state.lang] && I18N[state.lang][key]) ?? I18N.en[key] ?? key;
    Object.entries(vars).forEach(([k, v]) => { s = s.replaceAll("{" + k + "}", v); });
    return s;
  }
  const L = obj => obj[state.lang] || obj.en;
  const money = n => state.lang === "ar" ? `${n.toLocaleString("en")} ${STORE.currency.ar}` : `${STORE.currency.en} ${n.toLocaleString("en")}`;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------- image fallback ---------- */
  // A drawn illustration used whenever a photo cannot load.
  function fallbackImg(cat) {
    const tint = (CATEGORIES.find(c => c.id === cat) || CATEGORIES[0]).tint;
    const shapes = {
      perfume: `<rect x="170" y="70" width="60" height="40" rx="6" fill="${tint}"/><rect x="185" y="105" width="30" height="25" fill="#e9dcc6"/><rect x="120" y="125" width="160" height="190" rx="28" fill="#fff" fill-opacity=".55" stroke="${tint}" stroke-width="6"/><rect x="140" y="200" width="120" height="50" rx="6" fill="${tint}" fill-opacity=".25"/>`,
      oud: `<path d="M200 60c-18 0-26 14-26 26v24h52V86c0-12-8-26-26-26z" fill="${tint}"/><path d="M150 120h100l20 50v120a24 24 0 0 1-24 24h-92a24 24 0 0 1-24-24V170z" fill="#fff" fill-opacity=".55" stroke="${tint}" stroke-width="6"/><circle cx="200" cy="225" r="34" fill="${tint}" fill-opacity=".25"/>`,
      makeup: `<rect x="165" y="80" width="70" height="90" rx="10" fill="${tint}"/><path d="M175 80l20-40h10l20 40z" fill="${tint}" fill-opacity=".7"/><rect x="155" y="165" width="90" height="150" rx="12" fill="#fff" fill-opacity=".6" stroke="${tint}" stroke-width="6"/>`,
      skincare: `<rect x="130" y="110" width="140" height="40" rx="10" fill="${tint}"/><rect x="120" y="145" width="160" height="160" rx="30" fill="#fff" fill-opacity=".6" stroke="${tint}" stroke-width="6"/><rect x="150" y="205" width="100" height="40" rx="6" fill="${tint}" fill-opacity=".25"/>`
    };
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7efe4"/><stop offset="1" stop-color="#ead9c3"/></linearGradient></defs><rect width="400" height="400" fill="url(#g)"/>${shapes[cat] || shapes.perfume}</svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  // Try the local photo first, then Unsplash, then the drawing.
  window.__aqzImgFail = (img, cat) => {
    if (img.dataset.remote) { img.src = img.dataset.remote; delete img.dataset.remote; return; }
    img.onerror = null; img.src = fallbackImg(cat); img.classList.add("is-fallback");
  };

  function setBg(el, photo, cat = "perfume") {
    const sources = [photo.local, photo.remote];
    const tryNext = () => {
      const url = sources.shift();
      if (!url) { el.style.backgroundImage = `url("${fallbackImg(cat)}")`; el.classList.add("is-loaded", "is-fallback"); return; }
      const probe = new Image();
      probe.onload = () => { el.style.backgroundImage = `url("${url}")`; el.classList.add("is-loaded"); };
      probe.onerror = tryNext;
      probe.src = url;
    };
    tryNext();
  }
  const imgTag = (p, cls = "") =>
    `<img class="${cls}" src="${p.img.local}" data-remote="${p.img.remote}" alt="${esc(L(p).name)}" loading="lazy" decoding="async" onerror="__aqzImgFail(this,'${p.cat}')">`;

  /* ---------- static text ---------- */
  function applyLang() {
    const html = document.documentElement;
    html.lang = state.lang;
    html.dir = state.lang === "ar" ? "rtl" : "ltr";
    $$("[data-i18n]").forEach(el => { el.textContent = t(el.dataset.i18n); });
    $$("[data-i18n-ph]").forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
    $("#langBtn").textContent = state.lang === "ar" ? "English" : "عربي";
    $("#langBtn").setAttribute("aria-label", state.lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    renderAll();
  }

  /* ---------- sections ---------- */
  function renderCats() {
    $("#cats").innerHTML = CATEGORIES.map(c => {
      const n = PRODUCTS.filter(p => p.cat === c.id).length;
      return `<button class="cat" data-cat="${c.id}">
        <span class="cat__img" data-cat-img="${c.id}"></span>
        <span class="cat__label"><strong>${esc(L(c))}</strong><small>${t("cats.items", { n })}</small></span>
      </button>`;
    }).join("");
    $$("[data-cat-img]").forEach(el => setBg(el, IMAGES.cat[el.dataset.catImg], el.dataset.catImg));
  }

  function renderBrands() {
    const items = BRANDS.map(b => `<span class="brand">${esc(b)}</span>`).join("");
    $("#brands").innerHTML = `<div class="brands__row">${items}${items}</div>`;
  }

  function renderChips() {
    const cats = [{ id: "all" }, ...CATEGORIES];
    $("#chips").innerHTML = cats.map(c =>
      `<button class="chip ${state.cat === c.id ? "is-on" : ""}" role="tab" aria-selected="${state.cat === c.id}" data-chip="${c.id}">${esc(c.id === "all" ? t("cat.all") : L(c))}</button>`
    ).join("");
  }

  function matches(p, q) {
    if (!q) return true;
    const hay = [p.en.name, p.ar.name, p.en.notes, p.ar.notes, p.en.desc, p.ar.desc,
      L(CATEGORIES.find(c => c.id === p.cat)), CATEGORIES.find(c => c.id === p.cat).en].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  }

  function filtered() {
    let list = PRODUCTS.filter(p => (state.cat === "all" || p.cat === state.cat) && (!state.sale || p.old) && matches(p, state.q));
    const sorters = {
      low: (a, b) => a.price - b.price,
      high: (a, b) => b.price - a.price,
      rating: (a, b) => b.rating - a.rating,
      featured: (a, b) => (b.badge === "best") - (a.badge === "best") || a.id - b.id
    };
    return list.sort(sorters[state.sort]);
  }

  const stars = r => `<span class="stars" aria-label="${r} / 5"><span style="width:${(r / 5) * 100}%"></span></span>`;

  function badge(p) {
    if (p.old) return `<span class="badge badge--sale">${t("badge.sale", { n: Math.round((1 - p.price / p.old) * 100) })}</span>`;
    if (p.badge) return `<span class="badge badge--${p.badge}">${t("badge." + p.badge)}</span>`;
    return "";
  }

  function heartBtn(p, cls = "") {
    const on = state.wish.has(p.id);
    return `<button class="heart ${cls} ${on ? "is-on" : ""}" data-wish="${p.id}" aria-pressed="${on}" aria-label="${on ? t("p.unwish") : t("p.wish")}">
      <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg></button>`;
  }

  function card(p) {
    const d = L(p);
    return `<article class="card">
      <div class="card__media">
        <button class="card__img" data-quick="${p.id}" aria-label="${t("p.quick")}: ${esc(d.name)}">${imgTag(p)}</button>
        ${badge(p)}
        ${heartBtn(p)}
        <button class="card__quick" data-quick="${p.id}">${t("p.quick")}</button>
      </div>
      <div class="card__body">
        <p class="card__cat">${esc(L(CATEGORIES.find(c => c.id === p.cat)))} · ${esc(d.size)}</p>
        <h3 class="card__title"><button data-quick="${p.id}">${esc(d.name)}</button></h3>
        <p class="card__notes">${esc(d.notes)}</p>
        <div class="card__rating">${stars(p.rating)}<span>${p.rating} (${p.reviews})</span></div>
        <div class="card__foot">
          <p class="price">${money(p.price)}${p.old ? ` <s>${money(p.old)}</s>` : ""}</p>
          <button class="btn btn--dark btn--sm" data-add="${p.id}">${t("p.add")}</button>
        </div>
      </div>
    </article>`;
  }

  function renderGrid() {
    const list = filtered();
    $("#grid").innerHTML = list.map(card).join("");
    $("#empty").hidden = list.length > 0;
    $("#results").textContent = list.length === 1 ? t("shop.result1") : t("shop.results", { n: list.length });
  }

  function renderReviews() {
    $("#reviews").innerHTML = TESTIMONIALS.map(r => `<figure class="review">
      ${stars(5)}
      <blockquote>“${esc(L(r))}”</blockquote>
      <figcaption><span class="avatar">${esc(r.name[0])}</span><span><strong>${esc(r.name)}</strong><small>${esc(L(r.city))}</small></span></figcaption>
    </figure>`).join("");
  }

  /* ---------- cart ---------- */
  const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.entries(state.cart).reduce((s, [id, q]) => s + byId(+id).price * q, 0);
  const shipping = () => (subtotal() === 0 || subtotal() >= STORE.freeShippingFrom ? 0 : STORE.shippingFee);

  function addToCart(id, qty = 1, btn) {
    state.cart[id] = (state.cart[id] || 0) + qty;
    saveCart();
    renderCounts(); renderCart();
    toast(t("toast.added", { name: L(byId(id)).name }));
    if (btn) {
      const old = btn.textContent;
      btn.textContent = "✓ " + t("p.added"); btn.classList.add("is-done");
      setTimeout(() => { btn.textContent = old; btn.classList.remove("is-done"); }, 1300);
    }
    bump($$('[data-count="cart"]'));
  }

  function setQty(id, qty) {
    if (qty <= 0) delete state.cart[id]; else state.cart[id] = Math.min(qty, 20);
    saveCart(); renderCounts(); renderCart();
  }

  function renderCounts() {
    const c = cartCount(), w = state.wish.size;
    $$('[data-count="cart"]').forEach(el => { el.textContent = c; el.hidden = !c; });
    $$('[data-count="wish"]').forEach(el => { el.textContent = w; el.hidden = !w; });
  }

  function renderCart() {
    const items = Object.entries(state.cart);
    const sub = subtotal();
    const left = STORE.freeShippingFrom - sub;
    const pct = Math.min(100, (sub / STORE.freeShippingFrom) * 100);
    $("#shipBar").innerHTML = items.length
      ? `<p>${left > 0 ? t("cart.toFree", { n: left }) : "✓ " + t("cart.gotFree")}</p><div class="ship-bar__track"><span style="width:${pct}%"></span></div>`
      : "";
    $("#shipBar").hidden = !items.length;

    if (!items.length) {
      $("#cartItems").innerHTML = `<div class="drawer__empty">
        <svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
        <p><strong>${t("cart.empty")}</strong></p><p>${t("cart.emptySub")}</p>
        <a href="#shop" class="btn btn--dark" data-close>${t("cart.browse")}</a></div>`;
      $("#cartFoot").innerHTML = "";
      return;
    }
    $("#cartItems").innerHTML = items.map(([id, q]) => {
      const p = byId(+id), d = L(p);
      return `<div class="line">
        ${imgTag(p, "line__img")}
        <div class="line__info">
          <p class="line__name">${esc(d.name)}</p>
          <p class="line__meta">${esc(d.size)} · ${money(p.price)}</p>
          <div class="qty" aria-label="${t("p.qty")}">
            <button data-qty="${id}" data-d="-1" aria-label="−">−</button><span>${q}</span><button data-qty="${id}" data-d="1" aria-label="+">+</button>
          </div>
        </div>
        <div class="line__end">
          <strong>${money(p.price * q)}</strong>
          <button class="link" data-remove="${id}">${t("cart.remove")}</button>
        </div>
      </div>`;
    }).join("");
    $("#cartFoot").innerHTML = `
      <div class="sum"><span>${t("cart.subtotal")}</span><span>${money(sub)}</span></div>
      <div class="sum"><span>${t("cart.shipping")}</span><span>${shipping() ? money(shipping()) : t("cart.free")}</span></div>
      <div class="sum sum--total"><span>${t("cart.total")}</span><span>${money(sub + shipping())}</span></div>
      <button class="btn btn--gold btn--block" data-checkout>${t("cart.checkout")}</button>
      <button class="btn btn--wa btn--block" data-wa-order><svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19.2L4 20z"/></svg>${t("cart.wa")}</button>`;
  }

  function waLink(text) {
    return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
  }
  function waOrderText() {
    const lines = Object.entries(state.cart).map(([id, q]) => `• ${L(byId(+id)).name} × ${q} = ${money(byId(+id).price * q)}`);
    return [t("wa.hello"), ...lines, `${t("wa.total")}: ${money(subtotal() + shipping())}`].join("\n");
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id) {
    if (state.wish.has(id)) { state.wish.delete(id); toast(t("toast.unwish")); }
    else { state.wish.add(id); toast(t("toast.wish")); bump($$('[data-count="wish"]')); }
    saveWish(); renderCounts(); renderWish();
    $$(`[data-wish="${id}"]`).forEach(b => {
      const on = state.wish.has(id);
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on);
      b.setAttribute("aria-label", on ? t("p.unwish") : t("p.wish"));
    });
  }

  function renderWish() {
    if (!state.wish.size) {
      $("#wishItems").innerHTML = `<div class="drawer__empty">
        <svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>
        <p>${t("wish.empty")}</p></div>`;
      return;
    }
    $("#wishItems").innerHTML = [...state.wish].map(byId).filter(Boolean).map(p => `<div class="line">
      ${imgTag(p, "line__img")}
      <div class="line__info"><p class="line__name">${esc(L(p).name)}</p><p class="line__meta">${money(p.price)}</p>
        <button class="btn btn--dark btn--sm" data-add="${p.id}">${t("wish.move")}</button></div>
      <div class="line__end"><button class="link" data-wish="${p.id}">${t("cart.remove")}</button></div>
    </div>`).join("");
  }

  /* ---------- overlays (drawers / modal / search) ---------- */
  let lastFocus = null, openEl = null;

  function openLayer(el) {
    closeLayer(true);
    lastFocus = document.activeElement;
    openEl = el;
    el.hidden = false;
    $("#overlay").hidden = false;
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => { el.classList.add("is-open"); $("#overlay").classList.add("is-open"); });
    const f = el.querySelector("input, button:not([data-close]), a, select") || el.querySelector("button");
    setTimeout(() => f && f.focus(), 60);
  }

  function closeLayer(instant) {
    if (!openEl) return;
    const el = openEl; openEl = null;
    el.classList.remove("is-open"); $("#overlay").classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    const done = () => { el.hidden = true; if (!openEl) $("#overlay").hidden = true; };
    instant === true ? done() : setTimeout(done, 250);
    if (instant !== true && lastFocus) lastFocus.focus({ preventScroll: true });
  }

  function quickView(id) {
    const p = byId(id), d = L(p);
    $("#modalContent").innerHTML = `<div class="qv">
      <div class="qv__img">${imgTag(p)}${badge(p)}</div>
      <div class="qv__info">
        <p class="card__cat">${esc(L(CATEGORIES.find(c => c.id === p.cat)))}</p>
        <h3 id="modalTitle">${esc(d.name)}</h3>
        <div class="card__rating">${stars(p.rating)}<span>${p.rating} · ${t("p.reviews", { n: p.reviews })}</span></div>
        <p class="price price--lg">${money(p.price)}${p.old ? ` <s>${money(p.old)}</s>` : ""}</p>
        <p class="qv__desc">${esc(d.desc)}</p>
        <dl class="qv__specs"><div><dt>${t("p.notes")}</dt><dd>${esc(d.notes)}</dd></div><div><dt>${t("p.size")}</dt><dd>${esc(d.size)}</dd></div></dl>
        <div class="qv__buy">
          <div class="qty qty--lg" aria-label="${t("p.qty")}"><button data-qv-d="-1" aria-label="−">−</button><span id="qvQty">1</span><button data-qv-d="1" aria-label="+">+</button></div>
          <button class="btn btn--dark" data-qv-add="${p.id}">${t("p.add")}</button>
          ${heartBtn(p, "heart--box")}
        </div>
        <button class="btn btn--gold btn--block" data-qv-buy="${p.id}">${t("p.buyNow")}</button>
        <p class="qv__note">🚚 ${t("p.delivery")}</p>
      </div></div>`;
    openLayer($("#modal"));
  }

  function checkout() {
    const emirates = t("emirates").split("|");
    const lines = Object.entries(state.cart).map(([id, q]) => `<li><span>${esc(L(byId(+id)).name)} × ${q}</span><span>${money(byId(+id).price * q)}</span></li>`).join("");
    $("#modalContent").innerHTML = `<form class="co" id="coForm" novalidate>
      <h3 id="modalTitle">${t("co.title")}</h3>
      <div class="co__grid">
        <div class="co__fields">
          <label class="field"><span>${t("co.name")}</span><input name="name" autocomplete="name" required></label>
          <label class="field"><span>${t("co.phone")}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="05X XXX XXXX" required dir="ltr"></label>
          <label class="field"><span>${t("co.emirate")}</span><select name="emirate">${emirates.map(e => `<option>${esc(e)}</option>`).join("")}</select></label>
          <label class="field"><span>${t("co.address")}</span><textarea name="address" rows="2" autocomplete="street-address" required></textarea></label>
          <fieldset class="field"><legend>${t("co.pay")}</legend>
            <div class="pay-opts">
              ${["cod", "card", "apple"].map((m, i) => `<label class="pay-opt"><input type="radio" name="pay" value="${m}" ${i === 0 ? "checked" : ""}><span>${t("co." + m)}</span></label>`).join("")}
            </div>
          </fieldset>
        </div>
        <aside class="co__summary">
          <h4>${t("co.summary")}</h4>
          <ul>${lines}</ul>
          <div class="sum"><span>${t("cart.shipping")}</span><span>${shipping() ? money(shipping()) : t("cart.free")}</span></div>
          <div class="sum sum--total"><span>${t("cart.total")}</span><span>${money(subtotal() + shipping())}</span></div>
          <button class="btn btn--gold btn--block" type="submit">${t("co.place")}</button>
        </aside>
      </div></form>`;
    openLayer($("#modal"));
  }

  function submitCheckout(form) {
    let ok = true;
    $$(".field__err", form).forEach(e => e.remove());
    $$("[required]", form).forEach(inp => {
      let msg = "";
      const v = inp.value.trim();
      if (!v) msg = t("co.required");
      else if (inp.name === "phone" && !/^(\+?971|0)?5\d{8}$/.test(v.replace(/[\s-]/g, ""))) msg = t("co.phoneBad");
      inp.setAttribute("aria-invalid", !!msg);
      if (msg) {
        ok = false;
        inp.insertAdjacentHTML("afterend", `<small class="field__err">${msg}</small>`);
      }
    });
    if (!ok) { $("[aria-invalid=true]", form).focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    const id = "#AQZ" + Math.floor(10000 + Math.random() * 89999);
    state.cart = {}; saveCart(); renderCounts(); renderCart();
    $("#modalContent").innerHTML = `<div class="done">
      <div class="done__icon"><svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></div>
      <h3 id="modalTitle">${t("co.done", { name: esc(data.name.split(" ")[0]) })}</h3>
      <p>${t("co.doneSub", { id, phone: `<span dir="ltr">${esc(data.phone)}</span>` })}</p>
      <button class="btn btn--dark" data-close>${t("co.continue")}</button></div>`;
  }

  /* ---------- scent finder ---------- */
  const QUIZ = [
    { key: "q1", opts: ["oriental", "floral", "fresh", "woody"], icons: ["🔥", "🌸", "🍋", "🪵"] },
    { key: "q2", opts: ["day", "evening", "any"], icons: ["☀️", "🌙", "✨"] },
    { key: "q3", opts: ["low", "mid", "high"], icons: ["💛", "💎", "👑"] }
  ];

  function renderQuiz() {
    const { step, answers } = state.quiz;
    if (step >= QUIZ.length) return renderQuizResult();
    const q = QUIZ[step];
    $("#quiz").innerHTML = `
      <div class="quiz__top"><span>${t("q.step", { a: step + 1, b: QUIZ.length })}</span>
        <div class="quiz__dots">${QUIZ.map((_, i) => `<i class="${i <= step ? "on" : ""}"></i>`).join("")}</div></div>
      <h3>${t(q.key)}</h3>
      <div class="quiz__opts">${q.opts.map((o, i) => `<button class="quiz__opt ${answers[step] === o ? "is-on" : ""}" data-answer="${o}"><span>${q.icons[i]}</span>${t(q.key + "." + o)}</button>`).join("")}</div>
      ${step ? `<button class="link" data-quiz-back>← ${t("q.back")}</button>` : ""}`;
  }

  function renderQuizResult() {
    const [family, time, budget] = state.quiz.answers;
    const max = { low: 200, mid: 350, high: Infinity }[budget];
    const scents = PRODUCTS.filter(p => p.family);
    const scored = scents.map(p => ({
      p,
      s: (p.family.includes(family) ? 3 : 0) + (time === "any" || p.family.includes(time) ? 1 : 0) + (p.price <= max ? 2 : -3)
    })).filter(x => x.s >= 3).sort((a, b) => b.s - a.s || b.p.rating - a.p.rating).slice(0, 3).map(x => x.p);
    const list = scored.length ? scored : scents.sort((a, b) => b.rating - a.rating).slice(0, 3);
    $("#quiz").innerHTML = `<h3>${t("q.result")}</h3>
      ${scored.length ? "" : `<p class="quiz__none">${t("q.none")}</p>`}
      <div class="quiz__results">${list.map(p => `<div class="mini">
        <button class="mini__img" data-quick="${p.id}">${imgTag(p)}</button>
        <div><p class="mini__name">${esc(L(p).name)}</p><p class="mini__notes">${esc(L(p).notes)}</p><p class="price">${money(p.price)}</p></div>
        <button class="btn btn--dark btn--sm" data-add="${p.id}">${t("p.add")}</button></div>`).join("")}</div>
      <button class="link" data-quiz-restart>↺ ${t("q.restart")}</button>`;
  }

  /* ---------- search popup ---------- */
  function renderSearch(q) {
    const res = q.trim() ? PRODUCTS.filter(p => matches(p, q.trim())).slice(0, 6) : [];
    $("#searchResults").innerHTML = !q.trim()
      ? `<p class="hint">${t("search.hint")}</p>`
      : res.length
        ? res.map(p => `<button class="s-item" data-quick="${p.id}">${imgTag(p)}<span><strong>${esc(L(p).name)}</strong><small>${esc(L(p).notes)}</small></span><b>${money(p.price)}</b></button>`).join("")
        : `<p class="hint">${t("search.none")}</p>`;
  }

  /* ---------- misc ui ---------- */
  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg; el.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("is-on"), 2200);
  }
  function bump(els) { els.forEach(el => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }); }

  function setCat(cat, scroll) {
    state.cat = cat;
    renderChips(); renderGrid();
    if (scroll) $("#shop").scrollIntoView({ behavior: "smooth" });
  }

  function renderAll() {
    renderCats(); renderBrands(); renderChips(); renderGrid(); renderReviews();
    renderCart(); renderWish(); renderCounts(); renderQuiz();
    if (openEl && openEl.id === "searchPop") renderSearch($("#searchBig").value);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const el = e.target.closest("button, a");
    if (!el) { if (e.target.id === "overlay" || e.target.id === "modal") closeLayer(); return; }
    const d = el.dataset;

    if ("close" in d) { if (el.tagName === "A") closeLayer(true); else { closeLayer(); return; } }
    if (d.add) { addToCart(+d.add, 1, el); return; }
    if (d.wish) { toggleWish(+d.wish); return; }
    if (d.quick) { quickView(+d.quick); return; }
    if (d.open) { openLayer($("#" + d.open)); return; }
    if (d.cat) { setCat(d.cat, true); return; }
    if (d.catLink) { setCat(d.catLink); closeMenu(); return; }
    if (d.chip) { setCat(d.chip); return; }
    if (d.qty) { setQty(+d.qty, state.cart[d.qty] + +d.d); return; }
    if (d.remove) { setQty(+d.remove, 0); return; }
    if ("checkout" in d) { checkout(); return; }
    if ("waOrder" in d) { window.open(waLink(waOrderText()), "_blank", "noopener"); return; }
    if (d.qvD) { const s = $("#qvQty"); s.textContent = Math.max(1, Math.min(20, +s.textContent + +d.qvD)); return; }
    if (d.qvAdd) { addToCart(+d.qvAdd, +$("#qvQty").textContent, el); return; }
    if (d.qvBuy) { addToCart(+d.qvBuy, +$("#qvQty").textContent); checkout(); return; }
    if (d.answer) {
      state.quiz.answers[state.quiz.step] = d.answer; state.quiz.step++;
      renderQuiz(); return;
    }
    if ("quizBack" in d) { state.quiz.step--; renderQuiz(); return; }
    if ("quizRestart" in d) { state.quiz = { step: 0, answers: [] }; renderQuiz(); return; }
  });

  $("#overlay").addEventListener("click", () => closeLayer());
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeLayer(); closeMenu(); }
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#searchOpen").click(); }
  });
  document.addEventListener("submit", e => {
    if (e.target.id === "coForm") { e.preventDefault(); submitCheckout(e.target); }
  });

  $("#langBtn").addEventListener("click", () => {
    state.lang = state.lang === "en" ? "ar" : "en";
    store.set("lang", state.lang);
    applyLang();
  });

  let searchTimer;
  $("#search").addEventListener("input", e => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { state.q = e.target.value.trim(); renderGrid(); }, 150);
  });
  $("#sort").addEventListener("change", e => { state.sort = e.target.value; renderGrid(); });
  $("#onSale").addEventListener("change", e => { state.sale = e.target.checked; renderGrid(); });
  $("#clearFilters").addEventListener("click", () => {
    Object.assign(state, { cat: "all", q: "", sale: false, sort: "featured" });
    $("#search").value = ""; $("#onSale").checked = false; $("#sort").value = "featured";
    renderChips(); renderGrid();
  });

  $("#searchOpen").addEventListener("click", () => { openLayer($("#searchPop")); renderSearch($("#searchBig").value); });
  $("#searchBig").addEventListener("input", e => renderSearch(e.target.value));
  $("#searchBig").addEventListener("keydown", e => {
    if (e.key === "Enter") {
      state.q = e.target.value.trim(); $("#search").value = state.q;
      closeLayer(); setCat("all", true);
    }
  });

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

  $("#waContact").addEventListener("click", () => window.open(waLink(t("wa.contact")), "_blank", "noopener"));

  // header shadow on scroll
  const header = $(".header");
  addEventListener("scroll", () => header.classList.toggle("is-scrolled", scrollY > 10), { passive: true });

  /* ---------- init ---------- */
  $("#year").textContent = new Date().getFullYear();
  $$("[data-img]").forEach(el => setBg(el, IMAGES[el.dataset.img]));
  applyLang();
})();
