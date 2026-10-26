(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- state & storage ---------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("aqz." + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem("aqz." + k, JSON.stringify(v)); } catch { /* storage unavailable */ } }
  };

  const browserLang = (navigator.language || "en").toLowerCase().startsWith("ar") ? "ar" : "en";
  const PRICE_MAX = Math.max(...PRODUCTS.map(p => p.price));
  const govById = id => GOVERNORATES.find(g => g.id === id);

  const state = {
    lang: store.get("lang", browserLang),
    cat: "all",
    q: "",
    sort: "featured",
    sale: false,
    maxPrice: PRICE_MAX,
    cart: store.get("cart", {}),
    wish: new Set(store.get("wish", [])),
    gov: store.get("gov", "cairo"),
    promo: store.get("promo", null),
    recent: store.get("recent", []),
    orders: store.get("orders", []),
    profile: store.get("profile", {}),
    reviews: store.get("reviews", {}),
    quiz: { step: 0, answers: [] }
  };
  if (!govById(state.gov)) state.gov = "cairo";
  if (state.promo && !PROMOS[state.promo]) state.promo = null;

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
  const catOf = p => CATEGORIES.find(c => c.id === p.cat);

  /* ---------- products & options ---------- */
  const optOf = (p, o) => p.options ? p.options.list[o] : null;
  const priceOf = (p, o = 0) => (optOf(p, o) && optOf(p, o).price) || p.price;
  const maxQty = p => Math.min(20, p.stock ?? 20);
  const isShade = p => p.options && p.options.type === "shade";
  const sizeOf = (p, o = 0) => p.options && p.options.type === "size" ? L(optOf(p, o)) : L(p).size;

  function lineOf(key) {
    const [id, o] = key.split(":").map(Number);
    const p = byId(id);
    if (!p || (p.options ? !p.options.list[o] : o !== 0)) return null;
    return { key, p, o, opt: optOf(p, o), price: priceOf(p, o) };
  }

  // Cart keys are "productId:optionIndex". Older carts used the bare product id.
  state.cart = Object.fromEntries(Object.entries(state.cart)
    .map(([k, q]) => [k.includes(":") ? k : k + ":0", q])
    .filter(([k]) => lineOf(k)));
  state.recent = state.recent.filter(byId);

  function priceHtml(p, o = 0) {
    return `${money(priceOf(p, o))}${p.old && o === 0 ? ` <s>${money(p.old)}</s>` : ""}`;
  }

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
  // Try the local photo first, then Pexels, then the drawing.
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
    $$("[data-i18n-label]").forEach(el => { el.setAttribute("aria-label", t(el.dataset.i18nLabel)); });
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

  function renderPriceFilter() {
    const r = $("#maxPrice");
    const min = Math.min(...PRODUCTS.map(p => p.price));
    Object.assign(r, { min: Math.floor(min / 50) * 50, max: PRICE_MAX, step: 50 });
    r.value = state.maxPrice;
    $("#priceOut").textContent = state.maxPrice >= PRICE_MAX ? t("shop.any") : money(+state.maxPrice);
  }

  function matches(p, q) {
    if (!q) return true;
    const opts = p.options ? p.options.list.map(o => o.en + " " + o.ar).join(" ") : "";
    const hay = [p.en.name, p.ar.name, p.en.notes, p.ar.notes, p.en.desc, p.ar.desc, opts,
      L(catOf(p)), catOf(p).en].join(" ").toLowerCase();
    return q.toLowerCase().split(/\s+/).every(w => hay.includes(w));
  }

  function filtered() {
    let list = PRODUCTS.filter(p => (state.cat === "all" || p.cat === state.cat) && (!state.sale || p.old) &&
      p.price <= state.maxPrice && matches(p, state.q));
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

  // Shade products need a shade picked first, so their button opens the product.
  const addBtn = (p, label = t("p.add")) => isShade(p)
    ? `<button class="btn btn--dark btn--sm" data-quick="${p.id}">${t("p.choose")}</button>`
    : `<button class="btn btn--dark btn--sm" data-add="${p.id}">${label}</button>`;

  const swatches = p => isShade(p)
    ? `<span class="dots" aria-hidden="true">${p.options.list.map(o => `<i style="background:${o.color}"></i>`).join("")}</span>` : "";

  function card(p) {
    const d = L(p);
    const many = p.options && p.options.type === "size";
    return `<article class="card">
      <div class="card__media">
        <button class="card__img" data-quick="${p.id}" aria-label="${t("p.quick")}: ${esc(d.name)}">${imgTag(p)}</button>
        ${badge(p)}
        ${heartBtn(p)}
        <button class="card__quick" data-quick="${p.id}">${t("p.quick")}</button>
      </div>
      <div class="card__body">
        <p class="card__cat">${esc(L(catOf(p)))} · ${esc(many ? p.options.list.map(L).join(" / ") : d.size)}</p>
        <h3 class="card__title"><button data-quick="${p.id}">${esc(d.name)}</button></h3>
        <p class="card__notes">${esc(d.notes)}</p>
        <div class="card__rating">${stars(p.rating)}<span>${p.rating} (${p.reviews})</span>${swatches(p)}</div>
        ${p.stock ? `<p class="stock-low">${t("p.low", { n: p.stock })}</p>` : ""}
        <div class="card__foot">
          <p class="price">${priceHtml(p)}</p>
          ${addBtn(p)}
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

  function renderFaq() {
    $("#faqList").innerHTML = [1, 2, 3, 4, 5, 6, 7].map(n => `<details class="faq__item">
      <summary>${t("faq.q" + n)}<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary>
      <p>${t("faq.a" + n)}</p></details>`).join("");
  }

  function renderRecent() {
    const list = state.recent.map(byId).filter(Boolean);
    $("#recentWrap").hidden = !list.length;
    $("#recent").innerHTML = list.map(p => `<button class="r-item" data-quick="${p.id}">${imgTag(p)}
      <span><strong>${esc(L(p).name)}</strong><small>${money(p.price)}</small></span></button>`).join("");
  }

  /* ---------- cart ---------- */
  const cartLines = () => Object.entries(state.cart).map(([k, q]) => ({ ...lineOf(k), q })).filter(l => l.p);
  const cartCount = () => Object.values(state.cart).reduce((a, b) => a + b, 0);
  const subtotal = () => cartLines().reduce((s, l) => s + l.price * l.q, 0);
  const qtyOfProduct = id => Object.entries(state.cart).filter(([k]) => +k.split(":")[0] === id).reduce((s, [, q]) => s + q, 0);

  // Returns why the current promo does not apply, or "" when it does.
  function promoProblem(code = state.promo, sub = subtotal()) {
    const pr = PROMOS[code];
    if (!pr) return t("promo.bad");
    if (pr.min && sub < pr.min) return t("promo.min", { n: money(pr.min) });
    return "";
  }
  function discount() {
    if (!state.promo || promoProblem()) return 0;
    const pr = PROMOS[state.promo], sub = subtotal();
    if (pr.type === "pct") return Math.round(sub * pr.value / 100);
    if (pr.type === "off") return Math.min(pr.value, sub);
    return 0;
  }
  function shipping() {
    const sub = subtotal();
    if (!sub || sub >= STORE.freeShippingFrom) return 0;
    if (state.promo && PROMOS[state.promo].type === "ship" && !promoProblem()) return 0;
    return govById(state.gov).fee;
  }
  const total = (extra = 0) => subtotal() - discount() + shipping() + extra;

  function addToCart(id, qty = 1, btn, o = 0, quiet = false) {
    const p = byId(id), key = `${id}:${o}`;
    const room = maxQty(p) - qtyOfProduct(id);
    if (room <= 0) { toast(t("cart.max", { n: maxQty(p) })); return false; }
    state.cart[key] = (state.cart[key] || 0) + Math.min(qty, room);
    saveCart();
    renderCounts(); renderCart();
    const name = L(p).name + (p.options ? ` (${L(optOf(p, o))})` : "");
    if (!quiet) toast(t("toast.added", { name }), { label: t("toast.view"), fn: () => openLayer($("#cart")) });
    if (btn) {
      flyToBag(btn);
      if (btn.dataset.add) {
        const old = btn.textContent;
        btn.textContent = "✓ " + t("p.added"); btn.classList.add("is-done");
        setTimeout(() => { btn.textContent = old; btn.classList.remove("is-done"); }, 1300);
      }
    }
    bump($$('[data-count="cart"]'));
    return true;
  }

  function setQty(key, qty) {
    const l = lineOf(key);
    if (!l) return;
    const others = qtyOfProduct(l.p.id) - (state.cart[key] || 0);
    if (qty > maxQty(l.p) - others) { toast(t("cart.max", { n: maxQty(l.p) })); qty = maxQty(l.p) - others; }
    if (qty <= 0) delete state.cart[key]; else state.cart[key] = qty;
    saveCart(); renderCounts(); renderCart();
  }

  function removeLine(key) {
    const l = lineOf(key), q = state.cart[key];
    setQty(key, 0);
    toast(t("cart.removed", { name: L(l.p).name }), { label: t("cart.undo"), fn: () => { state.cart[key] = q; saveCart(); renderCounts(); renderCart(); } });
  }

  function renderCounts() {
    const c = cartCount(), w = state.wish.size;
    $$('[data-count="cart"]').forEach(el => { el.textContent = c; el.hidden = !c; });
    $$('[data-count="wish"]').forEach(el => { el.textContent = w; el.hidden = !w; });
  }

  const govOptions = sel => GOVERNORATES.map(g => `<option value="${g.id}" ${g.id === sel ? "selected" : ""}>${esc(L(g))}</option>`).join("");

  function sumsHtml(extra = 0, extraLabel = "") {
    const d = discount(), ship = shipping();
    return `<div class="sum"><span>${t("cart.subtotal")}</span><span>${money(subtotal())}</span></div>
      ${d ? `<div class="sum sum--off"><span>${t("promo.off", { c: state.promo })}</span><span>− ${money(d)}</span></div>` : ""}
      <div class="sum"><span>${t("cart.shipping")}</span><span>${ship ? money(ship) : t("cart.free")}</span></div>
      ${extra ? `<div class="sum"><span>${extraLabel}</span><span>${money(extra)}</span></div>` : ""}
      <div class="sum sum--total"><span>${t("cart.total")}</span><span>${money(total(extra))}</span></div>`;
  }

  function promoHtml() {
    if (state.promo) {
      const problem = promoProblem();
      const pr = PROMOS[state.promo];
      return `<div class="promo-on ${problem ? "is-bad" : ""}">
        <span><span>🏷️ ${t("promo.ok", { c: `<b>${state.promo}</b>` })}${pr.type === "ship" && !problem ? ` · ${t("promo.ship")}` : ""}</span>${problem ? `<small>${problem}</small>` : ""}</span>
        <button class="link" data-promo-remove>${t("promo.remove")}</button></div>`;
    }
    return `<form class="promo" id="promoForm" novalidate>
      <input id="promoInput" autocomplete="off" autocapitalize="characters" placeholder="${t("promo.ph")}" aria-label="${t("promo.ph")}">
      <button class="btn btn--line btn--sm" type="submit">${t("promo.apply")}</button>
      <p class="form-msg is-bad" id="promoMsg" role="status"></p></form>`;
  }

  function renderCart() {
    const lines = cartLines();
    const sub = subtotal();
    const left = STORE.freeShippingFrom - sub;
    const pct = Math.min(100, (sub / STORE.freeShippingFrom) * 100);
    $("#shipBar").innerHTML = lines.length
      ? `<p>${left > 0 ? t("cart.toFree", { n: money(left) }) : "🎉 " + t("cart.gotFree")}</p><div class="ship-bar__track"><span style="width:${pct}%"></span></div>`
      : "";
    $("#shipBar").hidden = !lines.length;

    if (!lines.length) {
      $("#cartItems").innerHTML = `<div class="drawer__empty">
        <svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
        <p><strong>${t("cart.empty")}</strong></p><p>${t("cart.emptySub")}</p>
        <a href="#shop" class="btn btn--dark" data-close>${t("cart.browse")}</a></div>`;
      $("#cartFoot").innerHTML = "";
      return;
    }
    $("#cartItems").innerHTML = lines.map(l => {
      const d = L(l.p);
      return `<div class="line">
        <button data-quick="${l.p.id}" tabindex="-1" aria-hidden="true">${imgTag(l.p, "line__img")}</button>
        <div class="line__info">
          <p class="line__name">${esc(d.name)}</p>
          <p class="line__meta">${l.opt && l.opt.color ? `<i class="swatch-dot" style="background:${l.opt.color}"></i>` : ""}${esc(l.opt ? L(l.opt) : d.size)} · ${money(l.price)}</p>
          <div class="qty" aria-label="${t("p.qty")}">
            <button data-qty="${l.key}" data-d="-1" aria-label="−">−</button><span>${l.q}</span><button data-qty="${l.key}" data-d="1" aria-label="+">+</button>
          </div>
        </div>
        <div class="line__end">
          <strong>${money(l.price * l.q)}</strong>
          <button class="link" data-remove="${l.key}">${t("cart.remove")}</button>
        </div>
      </div>`;
    }).join("");
    const g = govById(state.gov);
    $("#cartFoot").innerHTML = `
      ${promoHtml()}
      <label class="deliver"><span>🚚 ${t("cart.deliverTo")}</span>
        <select data-gov aria-label="${t("cart.deliverTo")}">${govOptions(state.gov)}</select></label>
      <p class="deliver__eta">${t("cart.eta", { d: g.days })}</p>
      ${sumsHtml()}
      <button class="btn btn--gold btn--block" data-checkout>${t("cart.checkout")}</button>
      <button class="btn btn--wa btn--block" data-wa-order><svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19.2L4 20z"/></svg>${t("cart.wa")}</button>`;
  }

  function applyPromo(raw) {
    const code = raw.trim().toUpperCase();
    const msg = $("#promoMsg");
    if (!PROMOS[code]) { msg.textContent = t("promo.bad"); return; }
    const problem = promoProblem(code);
    if (problem) { msg.textContent = problem; return; }
    state.promo = code; store.set("promo", code);
    renderCart();
    toast(t("promo.ok", { c: code }));
  }

  function setGov(id) {
    if (!govById(id)) return;
    state.gov = id; store.set("gov", id);
    renderCart();
    if ($("#coSummary")) renderCoSummary();
    if ($("#qvDeliver")) $("#qvDeliver").textContent = deliverText();
  }

  function deliverText() {
    const g = govById(state.gov);
    return subtotal() >= STORE.freeShippingFrom
      ? t("p.deliverFree", { gov: L(g), d: g.days })
      : t("p.deliver", { gov: L(g), fee: money(g.fee), d: g.days });
  }

  function waLink(text) {
    return `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(text)}`;
  }
  function waOrderText() {
    const lines = cartLines().map(l => `• ${L(l.p).name}${l.opt ? ` (${L(l.opt)})` : ""} × ${l.q} = ${money(l.price * l.q)}`);
    return [t("wa.hello"), ...lines, `${t("wa.to")}: ${L(govById(state.gov))}`,
      ...(state.promo && discount() ? [`${t("promo.off", { c: state.promo })}: − ${money(discount())}`] : []),
      `${t("wa.total")}: ${money(total())}`].join("\n");
  }

  // A small copy of the product photo flies into the bag icon.
  function flyToBag(from) {
    if (reducedMotion) return;
    const img = from.closest(".card, .qv, .mini, .line, .r-item")?.querySelector("img");
    const target = $$('[data-open="cart"]').find(el => el.offsetParent);
    if (!img || !target) return;
    const a = img.getBoundingClientRect(), b = target.getBoundingClientRect();
    const size = Math.min(90, a.width);
    const clone = img.cloneNode();
    clone.removeAttribute("loading");
    clone.className = "fly";
    Object.assign(clone.style, { left: a.left + a.width / 2 - size / 2 + "px", top: a.top + a.height / 2 - size / 2 + "px", width: size + "px", height: size + "px" });
    document.body.appendChild(clone);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    clone.animate([
      { transform: "translate(0,0) scale(1)", opacity: 1 },
      { transform: `translate(${dx}px, ${dy}px) scale(.15)`, opacity: .6 }
    ], { duration: 650, easing: "cubic-bezier(.5,-.2,.7,1)" }).onfinish = () => clone.remove();
  }

  /* ---------- wishlist ---------- */
  function toggleWish(id) {
    if (state.wish.has(id)) { state.wish.delete(id); toast(t("toast.unwish")); }
    else { state.wish.add(id); toast(t("toast.wish")); bump($$('[data-count="wish"]')); }
    saveWish(); renderCounts(); renderWish();
    $$(`[data-wish="${id}"]`).forEach(b => {
      const on = state.wish.has(id);
      b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on);
      if (b.classList.contains("heart")) b.setAttribute("aria-label", on ? t("p.unwish") : t("p.wish"));
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
        ${addBtn(p, t("wish.move"))}</div>
      <div class="line__end"><button class="link" data-wish="${p.id}">${t("cart.remove")}</button></div>
    </div>`).join("");
  }

  /* ---------- orders ---------- */
  const STEPS = ["placed", "confirmed", "shipped", "delivered"];
  const fmtDate = ts => new Date(ts).toLocaleDateString(state.lang === "ar" ? "ar-EG" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

  function renderOrders() {
    if (!state.orders.length) {
      $("#orderItems").innerHTML = `<div class="drawer__empty">
        <svg viewBox="0 0 24 24"><path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z"/><path d="m3 7.5 9 4.5 9-4.5M12 12v9"/></svg>
        <p>${t("ord.empty")}</p><a href="#shop" class="btn btn--dark" data-close>${t("cart.browse")}</a></div>`;
      return;
    }
    $("#orderItems").innerHTML = state.orders.map(o => {
      const n = o.items.reduce((s, i) => s + i.q, 0);
      const cancelled = o.status === "cancelled";
      const at = STEPS.indexOf(o.status);
      return `<article class="order ${cancelled ? "is-cancelled" : ""}">
        <header class="order__head"><strong dir="ltr">${o.id}</strong><span>${fmtDate(o.date)}</span></header>
        ${cancelled ? `<p class="order__status">${t("ord.cancelled")}</p>` : `<ol class="steps">${STEPS.map((s, i) =>
          `<li class="${i <= at ? "is-done" : ""}"><i></i><span>${t("ord." + s)}</span></li>`).join("")}</ol>`}
        <ul class="order__items">${o.items.map(i => {
          const p = byId(i.id);
          return `<li><span>${esc(p ? L(p).name : i.name)}${p && p.options && p.options.list[i.o] ? ` · ${esc(L(p.options.list[i.o]))}` : ""} × ${i.q}</span><span>${money(i.price * i.q)}</span></li>`;
        }).join("")}</ul>
        <p class="order__meta">${n === 1 ? t("ord.item1") : t("ord.items", { n })} · ${t("ord.deliverTo")}: ${esc(L(govById(o.gov) || GOVERNORATES[0]))} · ${t("ord.pay")}: ${t("pay." + o.pay)}</p>
        <p class="order__total"><span>${t("cart.total")}</span><strong>${money(o.total)}</strong></p>
        ${o.status === "placed" ? `<p class="order__note">${t("ord.callNote", { phone: `<span dir="ltr">${esc(o.phone)}</span>` })}</p>` : ""}
        <div class="order__actions">
          <button class="btn btn--dark btn--sm" data-reorder="${o.id}">${t("ord.again")}</button>
          <button class="btn btn--line btn--sm" data-order-help="${o.id}">${t("ord.help")}</button>
          ${o.status === "placed" ? `<button class="link" data-cancel="${o.id}">${t("ord.cancel")}</button>` : ""}
        </div>
      </article>`;
    }).join("");
  }

  function reorder(id) {
    const o = state.orders.find(x => x.id === id);
    if (!o) return;
    o.items.forEach(i => { if (lineOf(`${i.id}:${i.o}`)) addToCart(i.id, i.q, null, i.o, true); });
    openLayer($("#cart"));
  }

  function cancelOrder(id) {
    const o = state.orders.find(x => x.id === id);
    if (!o || !confirm(t("ord.cancelAsk", { id }))) return;
    o.status = "cancelled";
    store.set("orders", state.orders);
    renderOrders();
  }

  /* ---------- overlays (drawers / modal / search) ---------- */
  let lastFocus = null, openEl = null;

  function openLayer(el) {
    closeLayer(true);
    closeMenu();
    lastFocus = document.activeElement;
    openEl = el;
    el.hidden = false;
    $("#overlay").hidden = false;
    document.body.classList.add("no-scroll");
    requestAnimationFrame(() => { el.classList.add("is-open"); $("#overlay").classList.add("is-open"); });
    const f = el.querySelector("input, button:not([data-close]), a, select") || el.querySelector("button");
    setTimeout(() => f && f.focus({ preventScroll: true }), 60);
  }

  function closeLayer(instant) {
    if (!openEl) return;
    const el = openEl; openEl = null;
    el.classList.remove("is-open"); $("#overlay").classList.remove("is-open");
    document.body.classList.remove("no-scroll");
    const done = () => { el.hidden = true; if (!openEl) $("#overlay").hidden = true; };
    instant === true ? done() : setTimeout(done, 250);
    if (instant !== true && lastFocus) lastFocus.focus({ preventScroll: true });
    if (el.id === "modal" && /^#p\d+$/.test(location.hash)) history.replaceState(null, "", location.pathname + location.search);
  }

  // Keep focus inside an open drawer or dialog while tabbing.
  function trapFocus(e) {
    if (!openEl || e.key !== "Tab") return;
    const items = $$("button, a[href], input, select, textarea, summary", openEl).filter(el => !el.disabled && el.offsetParent && el.tabIndex >= 0);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  let qv = { id: 0, o: 0 };

  function reviewsHtml(p) {
    const mine = state.reviews[p.id] || [];
    return `<section class="rv" aria-labelledby="rvTitle">
      <h4 id="rvTitle">${t("rv.title")} <small>${stars(p.rating)} ${p.rating} · ${t("p.reviews", { n: p.reviews + mine.length })}</small></h4>
      ${mine.length ? `<p class="rv__label">${t("rv.yours")}</p><ul class="rv__list">${mine.map(r => `<li>
        <div>${stars(r.rating)} <strong>${esc(r.name)}</strong> <small>${fmtDate(r.date)}</small></div>
        ${r.text ? `<p>${esc(r.text)}</p>` : ""}</li>`).join("")}</ul>` : ""}
      <details class="rv__write">
        <summary class="btn btn--line btn--sm">✍️ ${t("rv.write")}</summary>
        <form class="rv__form" id="rvForm" data-id="${p.id}" novalidate>
          <fieldset class="rate"><legend>${t("rv.rating")}</legend>
            ${[5, 4, 3, 2, 1].map(n => `<input type="radio" name="rating" id="r${n}" value="${n}"><label for="r${n}" title="${t("rv.star", { n })}"><span class="sr">${t("rv.star", { n })}</span>★</label>`).join("")}
          </fieldset>
          <label class="field"><span>${t("rv.name")}</span><input name="name" maxlength="40" value="${esc(state.profile.name || "")}"></label>
          <label class="field"><span>${t("rv.text")}</span><textarea name="text" rows="3" maxlength="500"></textarea></label>
          <p class="form-msg" id="rvMsg" role="status"></p>
          <button class="btn btn--dark btn--sm" type="submit">${t("rv.send")}</button>
        </form>
      </details>
    </section>`;
  }

  function optionsHtml(p) {
    if (!p.options) return "";
    const shade = isShade(p);
    return `<div class="qv__opts">
      <p class="qv__optlabel">${shade ? t("p.shade") : t("p.size")}: <b id="qvOptName">${esc(L(optOf(p, qv.o)))}</b></p>
      <div class="${shade ? "swatches" : "sizes"}" role="radiogroup" aria-label="${shade ? t("p.shade") : t("p.size")}">
        ${p.options.list.map((o, i) => shade
          ? `<button class="swatch ${i === qv.o ? "is-on" : ""}" role="radio" aria-checked="${i === qv.o}" data-opt="${i}" style="--c:${o.color}" title="${esc(L(o))}" aria-label="${esc(L(o))}"></button>`
          : `<button class="size ${i === qv.o ? "is-on" : ""}" role="radio" aria-checked="${i === qv.o}" data-opt="${i}">${esc(L(o))}<small>${money(priceOf(p, i))}</small></button>`).join("")}
      </div></div>`;
  }

  function quickView(id, o = 0) {
    const p = byId(id), d = L(p);
    qv = { id, o };
    state.recent = [id, ...state.recent.filter(x => x !== id)].slice(0, 8);
    store.set("recent", state.recent);
    $("#modalContent").innerHTML = `<div class="qv">
      <div class="qv__img">${imgTag(p)}${badge(p)}</div>
      <div class="qv__info">
        <p class="card__cat">${esc(L(catOf(p)))}</p>
        <h3 id="modalTitle">${esc(d.name)}</h3>
        <div class="card__rating">${stars(p.rating)}<span>${p.rating} · ${t("p.reviews", { n: p.reviews + (state.reviews[p.id] || []).length })}</span></div>
        <p class="price price--lg" id="qvPrice">${priceHtml(p, o)}</p>
        <p class="qv__desc">${esc(d.desc)}</p>
        ${optionsHtml(p)}
        <dl class="qv__specs"><div><dt>${t("p.notes")}</dt><dd>${esc(d.notes)}</dd></div>
          ${p.options && p.options.type === "size" ? "" : `<div><dt>${t("p.size")}</dt><dd>${esc(d.size)}</dd></div>`}</dl>
        <p class="stock ${p.stock ? "stock--low" : ""}">${p.stock ? "⏳ " + t("p.low", { n: p.stock }) : "✓ " + t("p.inStock")}</p>
        <div class="qv__buy">
          <div class="qty qty--lg" aria-label="${t("p.qty")}"><button data-qv-d="-1" aria-label="−">−</button><span id="qvQty">1</span><button data-qv-d="1" aria-label="+">+</button></div>
          <button class="btn btn--dark" data-qv-add="${p.id}">${t("p.add")}</button>
          ${heartBtn(p, "heart--box")}
        </div>
        <button class="btn btn--gold btn--block" data-qv-buy="${p.id}">${t("p.buyNow")}</button>
        <p class="qv__note" id="qvDeliver">${deliverText()}</p>
        <button class="link qv__share" data-share="${p.id}"><svg viewBox="0 0 24 24"><circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4"/></svg>${t("p.share")}</button>
        ${reviewsHtml(p)}
      </div></div>`;
    if (openEl !== $("#modal")) openLayer($("#modal"));
    $(".modal__box").scrollTop = 0;
    history.replaceState(null, "", "#p" + id);
    renderRecent();
  }

  function pickOption(i) {
    const p = byId(qv.id);
    qv.o = i;
    $$("[data-opt]").forEach(b => { const on = +b.dataset.opt === i; b.classList.toggle("is-on", on); b.setAttribute("aria-checked", on); });
    $("#qvOptName").textContent = L(optOf(p, i));
    $("#qvPrice").innerHTML = priceHtml(p, i);
  }

  async function share(id) {
    const p = byId(id);
    const url = location.href.split("#")[0] + "#p" + id;
    if (navigator.share) {
      try { await navigator.share({ title: L(p).name, text: `${L(p).name} · ${money(p.price)}`, url }); return; } catch { /* closed or not allowed */ }
    }
    try { await navigator.clipboard.writeText(url); toast(t("p.copied")); }
    catch { prompt(t("p.share"), url); }
  }

  function submitReview(form) {
    const data = Object.fromEntries(new FormData(form));
    if (!data.rating) { $("#rvMsg").textContent = t("rv.needRating"); $("#rvMsg").className = "form-msg is-bad"; return; }
    const id = +form.dataset.id;
    const name = (data.name || "").trim() || (state.lang === "ar" ? "عميل" : "Customer");
    (state.reviews[id] = state.reviews[id] || []).unshift({ name, rating: +data.rating, text: (data.text || "").trim(), date: Date.now() });
    store.set("reviews", state.reviews);
    $(".rv").outerHTML = reviewsHtml(byId(id));
    toast(t("rv.thanks"));
  }

  /* ---------- checkout ---------- */
  function renderCoSummary() {
    const form = $("#coForm");
    const gift = form && form.gift.checked ? STORE.giftWrapFee : 0;
    $("#coSummary").innerHTML = `
      <ul>${cartLines().map(l => `<li><span>${esc(L(l.p).name)}${l.opt ? ` · ${esc(L(l.opt))}` : ""} × ${l.q}</span><span>${money(l.price * l.q)}</span></li>`).join("")}</ul>
      ${sumsHtml(gift, t("co.giftLine"))}`;
    const g = govById(state.gov);
    $("#coEta").textContent = `🚚 ${t("cart.eta", { d: g.days })}`;
  }

  function checkout() {
    if (!cartLines().length) return;
    const pf = state.profile;
    $("#modalContent").innerHTML = `<form class="co" id="coForm" novalidate>
      <h3 id="modalTitle">${t("co.title")}</h3>
      <div class="co__grid">
        <div class="co__fields">
          <label class="field"><span>${t("co.name")}</span><input name="name" autocomplete="name" required value="${esc(pf.name || "")}"></label>
          <label class="field"><span>${t("co.phone")}</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="01X XXXX XXXX" required dir="ltr" value="${esc(pf.phone || "")}"></label>
          <div class="field-row">
            <label class="field"><span>${t("co.gov")}</span><select name="gov" data-gov autocomplete="address-level1">${govOptions(state.gov)}</select></label>
            <label class="field"><span>${t("co.area")}</span><input name="area" autocomplete="address-level2" required value="${esc(pf.area || "")}"></label>
          </div>
          <label class="field"><span>${t("co.address")}</span><textarea name="address" rows="2" autocomplete="street-address" required>${esc(pf.address || "")}</textarea></label>
          <label class="field"><span>${t("co.notes")}</span><input name="notes" placeholder="${t("co.notesPh")}"></label>
          <fieldset class="field"><legend>${t("co.pay")}</legend>
            <div class="pay-opts">
              ${PAYMENTS.map((m, i) => `<label class="pay-opt"><input type="radio" name="pay" value="${m}" ${(pf.pay ? pf.pay === m : i === 0) ? "checked" : ""}>
                <span><strong>${t("pay." + m)}</strong><small>${t("pay." + m + ".d")}</small></span></label>`).join("")}
            </div>
          </fieldset>
          <label class="check"><input type="checkbox" name="gift" data-gift> <span>🎁 ${t("co.gift", { n: money(STORE.giftWrapFee) })}</span></label>
          <label class="field" id="giftMsgWrap" hidden><span>${t("co.giftMsg")}</span><textarea name="giftMsg" rows="2" maxlength="200"></textarea></label>
          <label class="check"><input type="checkbox" name="save" checked> <span>${t("co.save")}</span></label>
        </div>
        <aside class="co__summary">
          <h4>${t("co.summary")}</h4>
          <div id="coSummary"></div>
          <p class="co__eta" id="coEta"></p>
          <button class="btn btn--gold btn--block" type="submit">${t("co.place")}</button>
          <p class="co__secure">🔒 ${t("co.secure")}</p>
        </aside>
      </div></form>`;
    renderCoSummary();
    if (openEl !== $("#modal")) openLayer($("#modal"));
    $(".modal__box").scrollTop = 0;
  }

  function submitCheckout(form) {
    let ok = true;
    $$(".field__err", form).forEach(e => e.remove());
    $$("[required]", form).forEach(inp => {
      let msg = "";
      const v = inp.value.trim();
      if (!v) msg = t("co.required");
      else if (inp.name === "phone" && !/^(\+?20|0020|0)?1[0125]\d{8}$/.test(v.replace(/[\s-]/g, ""))) msg = t("co.phoneBad");
      inp.setAttribute("aria-invalid", !!msg);
      if (msg) {
        ok = false;
        inp.insertAdjacentHTML("afterend", `<small class="field__err">${msg}</small>`);
      }
    });
    if (!ok) { $("[aria-invalid=true]", form).focus(); return; }
    const data = Object.fromEntries(new FormData(form));
    const gift = data.gift ? STORE.giftWrapFee : 0;
    const order = {
      id: "AQZ-" + Math.floor(100000 + Math.random() * 900000),
      date: Date.now(),
      items: cartLines().map(l => ({ id: l.p.id, o: l.o, q: l.q, price: l.price, name: l.p.en.name })),
      subtotal: subtotal(), discount: discount(), shipping: shipping(), gift, total: total(gift),
      promo: discount() ? state.promo : null,
      gov: state.gov, name: data.name.trim(), phone: data.phone.trim(), area: data.area.trim(), address: data.address.trim(),
      notes: data.notes, giftMsg: data.giftMsg || "", pay: data.pay, status: "placed"
    };
    state.orders = [order, ...state.orders].slice(0, 30);
    store.set("orders", state.orders);
    state.profile = data.save ? { name: order.name, phone: order.phone, area: order.area, address: order.address, pay: order.pay } : {};
    store.set("profile", state.profile);
    state.cart = {}; saveCart();
    state.promo = null; store.set("promo", null);
    renderCounts(); renderCart(); renderOrders();
    $("#modalContent").innerHTML = `<div class="done">
      <div class="done__icon"><svg viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></div>
      <h3 id="modalTitle">${t("co.done", { name: esc(order.name.split(" ")[0]) })}</h3>
      <p>${t("co.doneSub", { id: `<strong dir="ltr">${order.id}</strong>`, phone: `<span dir="ltr">${esc(order.phone)}</span>` })}</p>
      <p class="done__pay"><strong>${t("pay." + order.pay)}:</strong> ${t("pay.next." + order.pay)}</p>
      <p class="done__total">${t("cart.total")}: <strong>${money(order.total)}</strong> · ${t("cart.eta", { d: govById(order.gov).days })}</p>
      <div class="done__actions">
        <button class="btn btn--dark" data-open="orders">${t("co.track")}</button>
        <button class="btn btn--line" data-close>${t("co.continue")}</button>
      </div></div>`;
    $(".modal__box").scrollTop = 0;
    if (!reducedMotion) confetti();
  }

  function confetti() {
    const box = $(".done__icon");
    if (!box) return;
    const colors = ["#d6b07a", "#b98a4e", "#b4566b", "#2f7d5b", "#3b1d2a"];
    for (let i = 0; i < 28; i++) {
      const c = document.createElement("i");
      c.className = "confetti";
      c.style.background = colors[i % colors.length];
      box.appendChild(c);
      const a = (Math.PI * 2 * i) / 28, r = 80 + Math.random() * 70;
      c.animate([{ transform: "translate(0,0) rotate(0)", opacity: 1 },
        { transform: `translate(${Math.cos(a) * r}px, ${Math.sin(a) * r + 40}px) rotate(${Math.random() * 540}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" }).onfinish = () => c.remove();
    }
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
    const max = { low: 1500, mid: 2500, high: Infinity }[budget];
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
        ${addBtn(p)}</div>`).join("")}</div>
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
  let toastTimer, toastAction = null;
  function toast(msg, action) {
    const el = $("#toast");
    toastAction = action || null;
    el.innerHTML = `<span>${esc(msg)}</span>${action ? `<button class="toast__btn" data-toast-action>${esc(action.label)}</button>` : ""}`;
    el.classList.toggle("has-action", !!action);
    el.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("is-on"), action ? 4500 : 2200);
  }
  function bump(els) { els.forEach(el => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); }); }

  function setCat(cat, scroll) {
    state.cat = cat;
    renderChips(); renderGrid();
    if (scroll) $("#shop").scrollIntoView({ behavior: "smooth" });
  }

  function renderAll() {
    renderCats(); renderBrands(); renderChips(); renderPriceFilter(); renderGrid(); renderReviews(); renderFaq(); renderRecent();
    renderCart(); renderWish(); renderOrders(); renderCounts(); renderQuiz();
    if (openEl && openEl.id === "searchPop") renderSearch($("#searchBig").value);
    if (openEl && openEl.id === "modal") {
      if ($("#coForm")) checkout();
      else if ($(".qv")) quickView(qv.id, qv.o);
    }
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const el = e.target.closest("button, a");
    if (!el) { if (e.target.id === "overlay" || e.target.id === "modal") closeLayer(); return; }
    const d = el.dataset;

    if ("toastAction" in d) { const a = toastAction; $("#toast").classList.remove("is-on"); if (a) a.fn(); return; }
    if ("close" in d) { if (el.tagName === "A") closeLayer(true); else { closeLayer(); return; } }
    if (d.add) { addToCart(+d.add, 1, el); return; }
    if (d.wish) { toggleWish(+d.wish); return; }
    if (d.quick) { quickView(+d.quick); return; }
    if (d.open) { e.preventDefault(); openLayer($("#" + d.open)); return; }
    if (d.cat) { setCat(d.cat, true); return; }
    if (d.catLink) { setCat(d.catLink); closeMenu(); return; }
    if (d.chip) { setCat(d.chip); return; }
    if (d.qty) { setQty(d.qty, state.cart[d.qty] + +d.d); return; }
    if (d.remove) { removeLine(d.remove); return; }
    if ("checkout" in d) { checkout(); return; }
    if ("waOrder" in d) { window.open(waLink(waOrderText()), "_blank", "noopener"); return; }
    if ("promoRemove" in d) { state.promo = null; store.set("promo", null); renderCart(); return; }
    if (d.opt) { pickOption(+d.opt); return; }
    if (d.share) { share(+d.share); return; }
    if (d.qvD) {
      const s = $("#qvQty"), p = byId(qv.id);
      s.textContent = Math.max(1, Math.min(maxQty(p), +s.textContent + +d.qvD)); return;
    }
    if (d.qvAdd) { addToCart(+d.qvAdd, +$("#qvQty").textContent, el, qv.o); return; }
    if (d.qvBuy) { if (addToCart(+d.qvBuy, +$("#qvQty").textContent, null, qv.o, true) || cartCount()) checkout(); return; }
    if (d.reorder) { reorder(d.reorder); return; }
    if (d.cancel) { cancelOrder(d.cancel); return; }
    if (d.orderHelp) { window.open(waLink(t("ord.waHelp", { id: d.orderHelp })), "_blank", "noopener"); return; }
    if (d.answer) {
      state.quiz.answers[state.quiz.step] = d.answer; state.quiz.step++;
      renderQuiz(); return;
    }
    if ("quizBack" in d) { state.quiz.step--; renderQuiz(); return; }
    if ("quizRestart" in d) { state.quiz = { step: 0, answers: [] }; renderQuiz(); return; }
  });

  document.addEventListener("change", e => {
    const el = e.target;
    if ("gov" in el.dataset) setGov(el.value);
    if ("gift" in el.dataset) { $("#giftMsgWrap").hidden = !el.checked; renderCoSummary(); }
  });

  // Clear a field's error as soon as the customer starts fixing it.
  document.addEventListener("input", e => {
    const el = e.target;
    if (el.getAttribute("aria-invalid") !== "true" || !el.closest("#coForm")) return;
    el.removeAttribute("aria-invalid");
    if (el.nextElementSibling && el.nextElementSibling.classList.contains("field__err")) el.nextElementSibling.remove();
  });

  $("#overlay").addEventListener("click", () => closeLayer());
  document.addEventListener("keydown", e => {
    trapFocus(e);
    if (e.key === "Escape") { closeLayer(); closeMenu(); }
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); $("#searchOpen").click(); }
  });
  document.addEventListener("submit", e => {
    if (e.target.id === "coForm") { e.preventDefault(); submitCheckout(e.target); }
    if (e.target.id === "promoForm") { e.preventDefault(); applyPromo($("#promoInput").value); }
    if (e.target.id === "rvForm") { e.preventDefault(); submitReview(e.target); }
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
  $("#maxPrice").addEventListener("input", e => { state.maxPrice = +e.target.value; renderPriceFilter(); renderGrid(); });
  $("#clearFilters").addEventListener("click", () => {
    Object.assign(state, { cat: "all", q: "", sale: false, sort: "featured", maxPrice: PRICE_MAX });
    $("#search").value = ""; $("#onSale").checked = false; $("#sort").value = "featured";
    renderChips(); renderPriceFilter(); renderGrid();
  });
  $("#recentClear").addEventListener("click", () => { state.recent = []; store.set("recent", []); renderRecent(); });

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

  const waContact = () => window.open(waLink(t("wa.contact")), "_blank", "noopener");
  $("#waContact").addEventListener("click", waContact);
  $("#waFab").addEventListener("click", waContact);
  $("#toTop").addEventListener("click", () => scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" }));

  // header shadow and back-to-top button on scroll
  const header = $(".header");
  addEventListener("scroll", () => {
    header.classList.toggle("is-scrolled", scrollY > 10);
    $("#toTop").hidden = scrollY < 900;
  }, { passive: true });

  // Links like #p6 open that product, so a shared link lands on the product.
  function openFromHash() {
    const m = /^#p(\d+)$/.exec(location.hash);
    if (m && byId(+m[1])) quickView(+m[1]);
  }
  addEventListener("hashchange", openFromHash);

  /* ---------- init ---------- */
  $("#year").textContent = new Date().getFullYear();
  $$("[data-img]").forEach(el => setBg(el, IMAGES[el.dataset.img]));
  applyLang();
  openFromHash();
})();
