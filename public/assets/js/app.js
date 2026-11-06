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
    lang: store.get("lang", "ar") === "en" ? "en" : "ar", // Arabic first
    gal: { f: "all", shown: GAL_PAGE, at: -1 },
    cart: cleanCart(store.get("cart", {})) // { product code: quantity }
  };
  // Keep only known product codes with whole quantities from 1 to 20 (storage can be edited by anyone).
  function cleanCart(raw) {
    const out = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      Object.entries(raw).forEach(([code, qty]) => {
        const n = Math.floor(Number(qty));
        if (/^[A-Z0-9]{2,12}$/.test(code) && GALLERY.some(it => it.code === code) && n >= 1) out[code] = Math.min(20, n);
      });
    }
    return out;
  }
  // Text typed by a customer: no control characters, limited length.
  const cleanText = (v, max) => String(v || "").replace(/[\u0000-\u001f\u007f\u200e\u200f\u202a-\u202e\u2066-\u2069]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
  const BAG_ICON = `<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>`;
  const WA_ICON = `<svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19.2L4 20z"/></svg>`;

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
  function imgFail(img) {
    if (img.classList.contains("is-fallback")) return;
    const pic = img.closest("picture");
    if (pic) pic.querySelectorAll("source").forEach(s => s.remove());
    img.srcset = ""; img.src = FALLBACK; img.classList.add("is-fallback");
  }
  document.addEventListener("error", e => { if (e.target.tagName === "IMG") imgFail(e.target); }, true);

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
  const galSrc = (it, size, ext = "jpg") => `assets/img/collection/${size === "thumb" ? "thumb/" : ""}${it.code.toLowerCase()}.${ext}`;
  // <picture> with a WebP source (about half the size) and the JPG for older browsers
  const pic = (it, size, attrs = "") => `<picture><source type="image/webp" srcset="${galSrc(it, size, "webp")}"><img src="${galSrc(it, size)}" ${attrs}></picture>`;
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
    // the tiles show at most ~400px wide, so the 480px thumbnails are enough
    $$("[data-tile]").forEach(el => setBg(el, [galSrc(byCode(el.dataset.tile), "thumb", "webp"), galSrc(byCode(el.dataset.tile), "thumb")]));
  }

  function renderHero() {
    const it = byCode(HERO_PHOTO);
    if (!it) { $(".hero__art").hidden = true; return; }
    const img = $("#heroImg");
    // index.html already names the hero photo so the browser fetches it first; update it only if HERO_PHOTO changes
    if (img.dataset.code !== it.code) { $("#heroWebp").srcset = galSrc(it, "full", "webp"); img.src = galSrc(it); img.dataset.code = it.code; }
    img.alt = galTitle(it);
    $("#heroArch").setAttribute("aria-label", `${t("hero.view")}: ${galTitle(it)}`);
    $("#heroName").textContent = galTitle(it);
    $("#heroBrand").textContent = galSub(it);
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
      ${it.type === "set" ? `<span class="ribbon">${t("gal.type.set")}</span>` : ""}
      <span class="gal__img">${pic(it, "thumb", `alt="${esc(galTitle(it))}" width="480" height="480" loading="lazy" decoding="async"`)}</span>
      <span class="gal__cap"><strong>${esc(galTitle(it))}</strong><small>${esc(galSub(it))}</small><span class="gal__price ${SHOP.priceOf(it.code) === null ? "is-ask" : ""}">${priceLabel(it.code)}</span></span>
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
      <div class="gv__img">${pic(it, "full", `alt="${esc(galTitle(it))}" width="1000" height="1000"`)}</div>
      <div class="qv__info">
        <p class="gv__cat">${esc(galSub(it))}</p>
        <h3 id="modalTitle">${esc(galTitle(it))}</h3>
        <p class="gv__ref">${t("gal.ref")} <bdi>${esc(it.code)}</bdi> · ${t("gal.pos", { a: i + 1, b: list.length })}</p>
        <p class="gv__price ${SHOP.priceOf(it.code) === null ? "is-ask" : ""}">${priceLabel(it.code)}</p>
        <p class="qv__desc">${t(SHOP.priceOf(it.code) === null ? "gal.note" : "gal.noteCart")}</p>
        <button class="btn btn--dark btn--block" data-add-cart="${it.code}">${BAG_ICON}<span>${t("cart.add")}</span></button>
        <a class="btn btn--line btn--block" data-gal-ask href="${esc(waHref(waAskText(it)))}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24"><path d="M4 20l1.3-3.8A8 8 0 1 1 8 19.2L4 20z"/></svg>${t("gal.ask")}</a>
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
    $("#reviewsSection").hidden = !TESTIMONIALS.length;
    $("#statCount").textContent = GALLERY.length;
    const stars = `<span class="stars" aria-label="5 / 5"><span></span></span>`;
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


  /* ---------- prices & cart ---------- */
  const num = n => n.toLocaleString(state.lang === "ar" ? "ar-EG" : "en");
  const money = n => state.lang === "ar" ? `${n.toLocaleString("ar-EG")} ج.م` : `EGP ${n.toLocaleString("en")}`;
  const priceLabel = code => { const p = SHOP.priceOf(code); return p === null ? t("price.onRequest") : money(p); };
  const cartLines = () => Object.entries(state.cart).filter(([c]) => byCode(c)).map(([code, qty]) => ({ code, qty, it: byCode(code) }));
  const cartCount = () => cartLines().reduce((a, l) => a + l.qty, 0);
  const saveCart = () => store.set("cart", state.cart);

  function addToCart(code, btn) {
    state.cart[code] = Math.min(20, (state.cart[code] || 0) + 1);
    saveCart(); renderCart(); renderCounts();
    toast(t("cart.added", { name: galTitle(byCode(code)) }));
    $$("[data-count='cart']").forEach(el => { el.classList.remove("bump"); void el.offsetWidth; el.classList.add("bump"); });
    if (btn) { btn.classList.add("is-done"); btn.querySelector("span").textContent = "✓ " + t("cart.addedShort"); setTimeout(() => { btn.classList.remove("is-done"); btn.querySelector("span").textContent = t("cart.add"); }, 1400); }
  }
  function setQty(code, qty) {
    if (qty <= 0) delete state.cart[code]; else state.cart[code] = Math.min(20, qty);
    saveCart(); renderCart(); renderCounts();
  }
  function clearCart() { state.cart = {}; saveCart(); renderCart(); renderCounts(); }

  function renderCounts() {
    const n = cartCount();
    $$("[data-count='cart']").forEach(el => { el.textContent = n; el.hidden = !n; });
  }

  function renderCart() {
    const lines = cartLines(), q = SHOP.quote(lines, null), free = SHOP.DELIVERY.freeFrom;
    $("#cartTitle").textContent = t("cart.title");
    if (!lines.length) {
      $("#shipBar").hidden = true;
      $("#cartItems").innerHTML = `<div class="drawer__empty">${BAG_ICON}<p><strong>${t("cart.empty")}</strong></p><p>${t("cart.emptySub")}</p>
        <a href="#collection" class="btn btn--dark" data-close>${t("cart.browse")}</a></div>`;
      $("#cartFoot").innerHTML = "";
      return;
    }
    $("#shipBar").hidden = q.unpriced;
    if (!q.unpriced) {
      const left = free - q.subtotal, pct = Math.min(100, (q.subtotal / free) * 100);
      $("#shipBar").innerHTML = `<p>${left > 0 ? t("cart.toFree", { n: money(left) }) : "✓ " + t("cart.gotFree")}</p><div class="ship-bar__track"><span></span></div>`;
      $("#shipBar .ship-bar__track span").style.width = pct + "%";
    }
    $("#cartItems").innerHTML = lines.map(({ code, qty, it }) => {
      const p = SHOP.priceOf(code);
      return `<div class="line">
        ${pic(it, "thumb", `class="line__img" alt="" width="72" height="72"`)}
        <div class="line__info">
          <p class="line__name">${esc(galTitle(it))}</p>
          <p class="line__meta">${t("gal.ref")} <bdi>${esc(code)}</bdi> · ${priceLabel(code)}</p>
          <div class="qty" role="group" aria-label="${t("cart.qty")}">
            <button data-qty="${code}" data-d="-1" aria-label="−">−</button><span>${qty.toLocaleString(state.lang === "ar" ? "ar-EG" : "en")}</span><button data-qty="${code}" data-d="1" aria-label="+">+</button>
          </div>
        </div>
        <div class="line__end"><strong>${p === null ? "—" : money(p * qty)}</strong><button class="link" data-remove="${code}">${t("cart.remove")}</button></div>
      </div>`;
    }).join("");
    const delivery = !q.unpriced && q.subtotal >= free ? t("cart.free") : t("cart.atCheckout");
    $("#cartFoot").innerHTML = `
      <div class="sum"><span>${t("cart.subtotal")}</span><span>${q.subtotal ? money(q.subtotal) : "—"}${q.unpriced && q.subtotal ? " +" : ""}</span></div>
      <div class="sum"><span>${t("cart.delivery")}</span><span>${delivery}</span></div>
      ${q.unpriced ? `<p class="cart-note">${t("cart.unpricedNote")}</p>` : ""}
      <button class="btn btn--wa btn--block cart-wa" data-cart-wa>${WA_ICON}${t("cart.waOrder")}</button>
      <p class="cart-wa-note">${t(SHOP.WHATSAPP_BOT.enabled ? "cart.waNoteBot" : "cart.waNote")}<br>💳 ${t("cart.payNote")}</p>
      <button class="btn btn--line btn--block" data-checkout>${t("cart.checkoutDetails")}</button>`;
  }

  /* ---------- checkout ---------- */
  const PHONE_RE = /^(\+?20|0)?1[0125]\d{8}$/;
  const makeRef = () => { const d = new Date(); const p = n => String(n).padStart(2, "0"); return `ATR-${String(d.getFullYear()).slice(2)}${p(d.getMonth() + 1)}${p(d.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`; };

  // Why card payment is not offered right now ("" = it is available).
  function cardBlock(q, gov) {
    if (!SHOP.PAYMENT.cardEnabled) return "co.cardSoon";
    if (q.unpriced) return "co.cardUnpriced";
    if (gov && q.total === null) return "co.cardDelivery";
    if (!gov && q.subtotal < SHOP.DELIVERY.freeFrom && SHOP.DELIVERY.aswan === null && SHOP.DELIVERY.other === null) return "co.cardDelivery";
    return "";
  }

  function checkout() {
    if (!cartLines().length) return;
    const field = (name, label, input) => `<label class="field" data-field="${name}"><span>${label}</span>${input}</label>`;
    $("#modalContent").innerHTML = `<form class="co" id="coForm" novalidate>
      <h3 id="modalTitle">${t("co.title")}</h3>
      <div class="co__grid">
        <div class="co__fields">
          ${field("name", t("co.name"), `<input id="coName" name="name" autocomplete="name" maxlength="80" required>`)}
          ${field("phone", t("co.phone"), `<input id="coPhone" name="phone" type="tel" maxlength="20" inputmode="tel" autocomplete="tel" placeholder="01X XXXX XXXX" dir="ltr" required>`)}
          ${field("gov", t("co.gov"), `<select id="coGov" name="gov" required><option value="">${t("co.govPick")}</option>${SHOP.GOVERNORATES.map(g => `<option value="${g.id}">${esc(L(g))}</option>`).join("")}</select>`)}
          ${field("address", t("co.address"), `<textarea id="coAddress" name="address" rows="2" maxlength="200" autocomplete="street-address" required></textarea>`)}
          <fieldset class="field">
            <legend>${t("co.pay")}</legend>
            <div class="pay-opts">
              <label class="pay-opt" id="payCard"><input type="radio" name="pay" value="card"><span><strong>${t("co.card")}</strong><small id="payCardNote">${t("co.cardNote")}</small></span><span class="pay-opt__logos" aria-hidden="true">VISA · Mastercard</span></label>
              <label class="pay-opt"><input type="radio" name="pay" value="whatsapp"><span><strong>${t("co.wa")}</strong><small>${t("co.waNote")}</small></span>${WA_ICON}</label>
            </div>
          </fieldset>
          <div id="coEmailWrap" hidden>${field("email", t("co.email"), `<input id="coEmail" name="email" type="email" maxlength="80" autocomplete="email" dir="ltr">`)}</div>
          <div id="coCodeWrap">${field("code", t("co.code"), `<input id="coCode" name="code" autocomplete="off" dir="ltr" maxlength="20">`)}</div>
        </div>
        <aside class="co__summary">
          <h4>${t("co.summary")}</h4>
          <div id="coSummary"></div>
          <button class="btn btn--gold btn--block" type="submit" id="coSubmit"></button>
          <p class="co__msg" id="coMsg" role="alert"></p>
          <p class="co__agree">${t("co.agree", { terms: `<a href="terms.html" target="_blank" rel="noopener">${t("footer.terms")}</a>`, privacy: `<a href="privacy.html" target="_blank" rel="noopener">${t("footer.privacy")}</a>` })}</p>
        </aside>
      </div></form>`;
    openLayer($("#modal"));
    updateCheckout();
  }

  function updateCheckout() {
    const form = $("#coForm"); if (!form) return;
    const lines = cartLines(), gov = form.elements.namedItem("gov").value, q = SHOP.quote(lines, gov);
    const block = cardBlock(q, gov), card = form.querySelector("[value=card]"), wa = form.querySelector("[value=whatsapp]");
    card.disabled = !!block;
    $("#payCard").classList.toggle("is-off", !!block);
    $("#payCardNote").textContent = t(block || "co.cardNote");
    if (!card.checked && !wa.checked) (block ? wa : card).checked = true;
    if (block && card.checked) wa.checked = true;
    const method = card.checked ? "card" : "whatsapp";
    $("#coEmailWrap").hidden = method !== "card";
    $("#coCodeWrap").hidden = method !== "whatsapp"; // discount codes are honoured on WhatsApp orders
    $("#coEmail").required = method === "card";

    const deliveryText = !gov ? (q.delivery === 0 ? t("cart.free") : t("cart.atCheckout"))
      : q.delivery === null ? t("cart.onWa") : q.delivery === 0 ? t("cart.free") : money(q.delivery);
    const totalText = q.total !== null && (gov || q.delivery === 0) ? money(q.total) : (q.unpriced || gov ? t("cart.onWa") : t("cart.atCheckout"));
    $("#coSummary").innerHTML = `<ul>${lines.map(({ code, qty, it }) => {
      const p = SHOP.priceOf(code);
      return `<li><span>${esc(galTitle(it))} × ${qty.toLocaleString(state.lang === "ar" ? "ar-EG" : "en")}</span><span>${p === null ? t("price.onRequest") : money(p * qty)}</span></li>`;
    }).join("")}</ul>
      <div class="sum"><span>${t("cart.subtotal")}</span><span>${q.subtotal ? money(q.subtotal) : "—"}</span></div>
      <div class="sum"><span>${t("cart.delivery")}</span><span>${deliveryText}</span></div>
      <div class="sum sum--total"><span>${t("cart.total")}</span><span>${totalText}</span></div>`;
    $("#coSubmit").textContent = method === "card"
      ? (q.total !== null && gov ? t("co.submitCard", { total: money(q.total) }) : t("co.card"))
      : t("co.submitWa");
  }

  // The message that reaches the store's WhatsApp. c (customer details) is optional:
  // from the cart's quick button the customer fills in name and address in the chat.
  function waOrderText(ref, c = null) {
    const lines = cartLines(), q = SHOP.quote(lines, c ? c.gov : null);
    const gov = c && SHOP.GOVERNORATES.find(g => g.id === c.gov);
    const brand = it => { const b = galBrand(it); return b && it.en ? ` – ${b}` : ""; };
    const rows = lines.map(({ code, qty, it }) => { const p = SHOP.priceOf(code); return `• ${galTitle(it)}${brand(it)} (${code}) × ${num(qty)}${p === null ? ` – ${t("price.onRequest")}` : ` = ${money(p * qty)}`}`; });
    const count = lines.reduce((a, l) => a + l.qty, 0);
    const out = [t("wa.order"), "", ...rows, "", `${t("wa.items")}: ${num(count)}`];
    if (q.subtotal) out.push(`${t("cart.subtotal")}: ${money(q.subtotal)}${q.unpriced ? " + " + t("price.onRequest") : ""}`);
    // From the cart button (no details yet) the message stays short: the store's quick replies
    // ask for name and address (/2) and give the delivery fees (/3). Free delivery is still shown.
    if (c || q.delivery === 0) out.push(`${t("cart.delivery")}: ${q.delivery === 0 ? t("cart.free") : q.delivery !== null ? money(q.delivery) : t("cart.onWa")}`);
    if (q.total !== null) out.push(`${t("cart.total")}: ${money(q.total)}`);
    if (c && c.code) out.push(`${t("wa.code")}: ${c.code}`);
    out.push(t("wa.pay"), "", `${t("wa.orderRef")}: ${ref}`);
    if (c) out.push(`${t("wa.name")}: ${c.name}`, `${t("wa.phone")}: ${c.phone}`, `${t("wa.gov")}: ${gov ? L(gov) : ""}`, `${t("wa.address")}: ${c.address}`);
    return out.join("\n");
  }

  // Open the order in WhatsApp in a new tab. Returns false if the browser blocked it.
  function openWhatsApp(text) {
    const w = window.open(waHref(text), "_blank");
    if (!w) return false;
    try { w.opener = null; } catch { /* cross-origin already */ }
    return true;
  }
  // With the WhatsApp assistant on: save the cart on the server, then open WhatsApp with the
  // order number; the assistant replies there with the details and the confirm buttons.
  async function orderViaAssistant() {
    const tab = window.open("", "_blank"); // opened now, while the tap still counts, filled in below
    const lines = cartLines();
    let ref = null;
    try {
      const res = await fetch(SHOP.WHATSAPP_BOT.orderEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang: state.lang, lines: lines.map(({ code, qty }) => ({ code, qty })) })
      });
      const data = await res.json();
      if (res.ok && /^ATR-\d{6}-\d{4}$/.test(data.ref || "")) ref = data.ref;
    } catch { /* falls back below */ }
    // If the server could not save it, send the full order as text instead, so nothing is lost
    const text = ref
      ? t("wa.botStart", { ref, items: lines.map(l => `${l.code} × ${l.qty}`).join("، ") })
      : waOrderText(ref = makeRef());
    if (tab) { try { tab.opener = null; tab.location = waHref(text); } catch { /* closed */ } }
    clearCart(); closeLayer(true);
    if (tab) orderSentScreen(ref, text);
    else $("#modalContent").innerHTML = `<div class="done"><div class="done__icon">${WA_ICON}</div>
      <h3 id="modalTitle">${t("co.readyTitle")}</h3><p>${t("co.readySub", { ref: `<bdi>${esc(ref)}</bdi>` })}</p>
      ${instapayBox()}
          <a class="btn btn--wa" data-wa-order href="${esc(waHref(text))}" target="_blank" rel="noopener">${WA_ICON}${t("co.send")}</a>
      <button class="link" data-close>${t("co.continue")}</button></div>`;
    openLayer($("#modal"));
  }

  // How to pay by InstaPay, shown after the order is sent (address and name from shop.js)
  function instapayBox() {
    const ip = SHOP.INSTAPAY || {};
    const addr = cleanText(ip.address, 80), name = cleanText(ip.accountName, 80);
    const target = addr
      ? `${t("ip.step2")}<span class="ip__addr"><bdi dir="ltr">${esc(addr)}</bdi><button class="ip__copy" data-copy="${esc(addr)}">${t("ip.copy")}</button></span>${name ? `<small>${t("ip.name")}: ${esc(name)}</small>` : ""}`
      : t("ip.step2Later");
    return `<div class="ip"><p class="ip__title">💳 ${t("ip.title")}</p>
      <ol><li>${t("ip.step1")}</li><li>${target}</li><li>${t("ip.step3")}</li></ol></div>`;
  }

  function orderSentScreen(ref, text) {
    $("#modalContent").innerHTML = `<div class="done">
      <div class="done__icon">${WA_ICON}</div>
      <h3 id="modalTitle">${t("wa.sentTitle")}</h3>
      <p>${t("wa.sentSub", { ref: `<bdi>${esc(ref)}</bdi>` })}</p>
      ${instapayBox()}
      <a class="btn btn--wa" href="${esc(waHref(text))}" target="_blank" rel="noopener">${WA_ICON}${t("wa.openAgain")}</a>
      <button class="link" data-close>${t("co.continue")}</button></div>`;
  }

  async function submitCheckout(form) {
    $$(".field__err", form).forEach(e => e.remove());
    $("#coMsg").textContent = "";
    let ok = true;
    $$("[required]", form).forEach(inp => {
      const v = inp.value.trim();
      let msg = !v ? t("co.required")
        : inp.name === "phone" && !PHONE_RE.test(v.replace(/[\s-]/g, "")) ? t("co.phoneBad")
        : inp.name === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t("co.emailBad") : "";
      inp.setAttribute("aria-invalid", !!msg);
      if (msg) { ok = false; inp.insertAdjacentHTML("afterend", `<small class="field__err">${msg}</small>`); }
    });
    if (!ok) { $("[aria-invalid=true]", form).focus(); return; }
    const v = n => form.elements.namedItem(n).value;
    const c = { name: cleanText(v("name"), 80), phone: cleanText(v("phone"), 20), gov: SHOP.GOVERNORATES.some(g => g.id === v("gov")) ? v("gov") : "",
      address: cleanText(v("address"), 200), email: cleanText(v("email"), 80), code: cleanText(v("code"), 20).toUpperCase().replace(/[^A-Z0-9-]/g, "") };
    const ref = makeRef();

    if (form.elements.namedItem("pay").value === "whatsapp") {
      const text = waOrderText(ref, c);
      if (openWhatsApp(text)) { clearCart(); orderSentScreen(ref, text); return; }
      $("#modalContent").innerHTML = `<div class="done">
        <div class="done__icon">${WA_ICON}</div>
        <h3 id="modalTitle">${t("co.readyTitle")}</h3>
        <p>${t("co.readySub", { ref: `<bdi>${ref}</bdi>` })}</p>
        ${instapayBox()}
          <a class="btn btn--wa" data-wa-order href="${esc(waHref(text))}" target="_blank" rel="noopener">${WA_ICON}${t("co.send")}</a>
        <button class="link" data-close>${t("co.continue")}</button></div>`;
      return;
    }

    // card: the server works out the amount from shop.js and returns Paymob's secure page
    const btn = $("#coSubmit");
    btn.disabled = true; btn.textContent = t("co.paying");
    try {
      const res = await fetch(SHOP.PAYMENT.checkoutEndpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref, customer: c, lines: cartLines().map(({ code, qty, it }) => ({ code, qty, name: it.en || galBrand(it) || code })) })
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || res.status);
      store.set("pendingRef", ref);
      location.href = data.url;
    } catch {
      btn.disabled = false; updateCheckout();
      $("#coMsg").textContent = t("co.payFail");
    }
  }

  // Back from Paymob: confirm the result on the server before saying anything.
  async function handlePaymentReturn() {
    const params = new URLSearchParams(location.search);
    if (!params.has("hmac")) return;
    history.replaceState(null, "", location.pathname + location.hash);
    let r = null;
    try { const res = await fetch(SHOP.PAYMENT.verifyEndpoint + "?" + params.toString()); if (res.ok) r = await res.json(); } catch { /* checked below */ }
    const ref = store.get("pendingRef", "");
    let title, sub, icon = "✓";
    if (r && r.paid) { title = t("pay.okTitle"); sub = t("pay.okSub", { amount: money(r.amount), ref: `<bdi>${esc(ref)}</bdi>` }); clearCart(); store.set("pendingRef", ""); }
    else if (!r || r.pending) { title = t("pay.pendingTitle"); sub = t("pay.pendingSub"); icon = "…"; }
    else { title = t("pay.failTitle"); sub = t("pay.failSub"); icon = "!"; }
    $("#modalContent").innerHTML = `<div class="done">
      <div class="done__icon ${r && r.paid ? "" : "done__icon--muted"}">${icon}</div>
      <h3 id="modalTitle">${title}</h3><p>${sub}</p>
      <a class="btn btn--wa" href="${esc(waHref(t("wa.contact") + (ref ? ` (${ref})` : "")))}" target="_blank" rel="noopener">${WA_ICON}${t("pay.ask")}</a>
      <button class="link" data-close>${t("co.continue")}</button></div>`;
    openLayer($("#modal"));
  }

  let toastTimer;
  function toast(msg) {
    const el = $("#toast");
    el.textContent = msg; el.classList.add("is-on");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("is-on"), 2200);
  }

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
        ? res.map(it => `<button class="s-item" data-gal-code="${it.code}">${pic(it, "thumb", `alt="" width="56" height="56"`)}<span><strong>${esc(galTitle(it))}</strong><small>${esc(galSub(it))}</small></span></button>`).join("")
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
    $$("[data-i18n-label]").forEach(el => el.setAttribute("aria-label", t(el.dataset.i18nLabel)));
    $("#langBtn").textContent = state.lang === "ar" ? "English" : "عربي";
    $("#langBtn").lang = state.lang === "ar" ? "en" : "ar";
    // the tagline is always shown in both languages
    $$(".hero__alt").forEach(el => { el.lang = state.lang === "ar" ? "en" : "ar"; el.dir = state.lang === "ar" ? "ltr" : "rtl"; });
    $("#langBtn").setAttribute("aria-label", state.lang === "ar" ? "Switch to English" : "التبديل إلى العربية");
    renderHero(); renderCats(); renderBrands(); renderGalChips(); renderGallery(); renderReviews();
    renderCart(); renderCounts();
    if (openEl && openEl.id === "modal" && $("#coForm")) checkout();
    if (galOpen()) galView(state.gal.at);
    if (openEl && openEl.id === "searchPop") renderSearch($("#searchBig").value);
  }

  /* ---------- events ---------- */
  document.addEventListener("click", e => {
    const el = e.target.closest("button, a");
    if (!el) { if (e.target.id === "modal") closeLayer(); return; }
    const d = el.dataset;

    if ("close" in d) { if (el.tagName === "A") closeLayer(true); else closeLayer(); return; }
    if (d.galLink) { setGalFilter(d.galLink); closeMenu(); if (el.tagName !== "A") $("#collection").scrollIntoView({ behavior: "smooth" }); return; }
    if (d.galF) { setGalFilter(d.galF); return; }
    if (d.gal) { galView(+d.gal); openLayer($("#modal")); return; }
    if (el.id === "heroArch") { d.galCode = HERO_PHOTO; }
    if (d.galCode) {
      setGalFilter("all");
      galView(GALLERY.findIndex(it => it.code === d.galCode));
      openLayer($("#modal")); return;
    }
    if (d.galStep) { galView(state.gal.at + +d.galStep); el.focus(); return; }
    if ("search" in d) { closeMenu(); openLayer($("#searchPop")); renderSearch($("#searchBig").value); return; }
    if (d.addCart) { addToCart(d.addCart, el); return; }
    if ("cartOpen" in d) { closeMenu(); renderCart(); openLayer($("#cart")); return; }
    if (d.qty) { setQty(d.qty, (state.cart[d.qty] || 0) + +d.d); return; }
    if (d.remove) { setQty(d.remove, 0); return; }
    if ("checkout" in d) { checkout(); return; }
    if ("cartWa" in d) {
      if (!cartLines().length) return;
      if (SHOP.WHATSAPP_BOT.enabled) { orderViaAssistant(); return; }
      const ref = makeRef(), text = waOrderText(ref);
      if (openWhatsApp(text)) { clearCart(); closeLayer(true); orderSentScreen(ref, text); openLayer($("#modal")); }
      else { // the browser blocked the new tab: show a link the customer taps
        $("#modalContent").innerHTML = `<div class="done"><div class="done__icon">${WA_ICON}</div>
          <h3 id="modalTitle">${t("co.readyTitle")}</h3><p>${t("co.readySub", { ref: `<bdi>${esc(ref)}</bdi>` })}</p>
          ${instapayBox()}
          <a class="btn btn--wa" data-wa-order href="${esc(waHref(text))}" target="_blank" rel="noopener">${WA_ICON}${t("co.send")}</a>
          <button class="link" data-close>${t("co.continue")}</button></div>`;
        openLayer($("#modal"));
      }
      return;
    }
    if (d.copy) { // copy the InstaPay address
      const done = () => { el.textContent = t("ip.copied"); setTimeout(() => { el.textContent = t("ip.copy"); }, 1600); };
      if (navigator.clipboard) navigator.clipboard.writeText(d.copy).then(done, () => {});
      return;
    }
    if ("waOrder" in d) { clearCart(); setTimeout(() => closeLayer(), 300); return; } // the link itself opens WhatsApp
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

  document.addEventListener("change", e => { if (e.target.closest("#coForm")) updateCheckout(); });
  document.addEventListener("input", e => {
    if (!e.target.closest("#coForm") || e.target.getAttribute("aria-invalid") !== "true") return;
    e.target.removeAttribute("aria-invalid");
    const err = e.target.parentElement.querySelector(".field__err"); if (err) err.remove();
  });
  document.addEventListener("submit", e => { if (e.target.id === "coForm") { e.preventDefault(); submitCheckout(e.target); } });

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

  $("#newsForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target, inp = $("#newsEmail"), msg = $("#newsMsg"), btn = form.querySelector("button");
    const show = (key, good) => { msg.textContent = t(key); msg.className = "form-msg " + (good ? "is-ok" : "is-bad"); };
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
    inp.setAttribute("aria-invalid", !ok);
    if (!ok) return show("news.bad", false);
    btn.disabled = true;
    try {
      // Netlify Forms stores the email; it appears under Forms → newsletter in the Netlify dashboard
      const res = await fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams(new FormData(form)).toString() });
      if (!res.ok) throw new Error(res.status);
      inp.value = ""; show("news.ok", true);
    } catch { show("news.fail", false); }
    btn.disabled = false;
  });

  // header shadow on scroll
  const header = $(".header");
  addEventListener("scroll", () => header.classList.toggle("is-scrolled", scrollY > 10), { passive: true });

  /* ---------- init ---------- */
  $("#year").textContent = new Date().getFullYear();
  saveCart(); // store the cleaned cart, dropping anything invalid that was saved before
  applyLang();
  handlePaymentReturn();
})();
