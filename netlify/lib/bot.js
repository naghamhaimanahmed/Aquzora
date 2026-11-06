/* The WhatsApp order assistant's conversation, step by step.
   handle() is pure: it takes the customer's saved conversation and their new message,
   and returns the updated conversation, the replies to send and an optional owner alert.
   Steps: confirm → name → gov (→ govName) → address → phone (→ phoneType) → final → done */
const SHOP = require("../../public/assets/js/shop.js");
const { GALLERY, GALLERY_BRANDS } = require("../../public/assets/js/data.js");

const T = {
  ar: {
    detailsTitle: "🧾 تفاصيل طلبك رقم {ref}",
    items: "عدد القطع", subtotal: "المجموع", delivery: "التوصيل", total: "الإجمالي",
    onRequest: "السعر عند الطلب", free: "مجاني", priceLater: "نؤكد السعر معك هنا",
    deliveryRule: "{a} داخل أسوان، {b} لباقي المحافظات، ومجاني فوق {f}",
    askConfirm: "لتأكيد طلبك اضغط «تأكيد الطلب» 👇\n(أو اكتب: تأكيد)",
    bConfirm: "✅ تأكيد الطلب", bEdit: "✏️ تعديل الطلب", bCancel: "❌ إلغاء الطلب",
    askName: "شكراً لك! 🌸\nما اسمك بالكامل؟",
    nameShort: "من فضلك اكتب اسمك بالكامل.",
    askGov: "أهلاً {name} 👋\nأين نوصّل طلبك؟",
    bAswan: "📍 داخل أسوان", bOther: "🚚 محافظة أخرى",
    askGovName: "اكتب اسم محافظتك:",
    askAddress: "اكتب عنوانك بالتفصيل من فضلك:\nالمنطقة، الشارع، رقم العمارة، الدور، الشقة، وأقرب علامة مميزة.",
    addressShort: "العنوان قصير. من فضلك أضف تفاصيل أكثر: الشارع، رقم العمارة، الشقة، وعلامة مميزة.",
    askPhone: "ما رقم الموبايل الذي نتصل عليه عند التوصيل؟",
    bSamePhone: "📱 نفس رقم الواتساب", bOtherPhone: "☎️ رقم آخر",
    askPhoneType: "اكتب رقم الموبايل (مثال: 01012345678):",
    phoneBad: "الرقم غير صحيح. اكتب رقم موبايل مصري من ١١ رقماً يبدأ بـ 01.",
    summaryTitle: "📋 مراجعة طلبك رقم {ref}",
    summaryAsk: "هل كل البيانات صحيحة؟",
    bFinal: "✅ تأكيد ثم الدفع", bEditDetails: "✏️ تعديل البيانات",
    payAsk: "💳 لإتمام تأكيد طلبك رقم {ref}:\n1. حوّل {amount} عبر إنستاباي إلى:\n{target}\n2. أرسل هنا صورة (سكرين شوت) التحويل 📸",
    payTotalLater: "الإجمالي الذي سنؤكده لك هنا", payTargetLater: "سنرسل لك بيانات التحويل في رسالة الآن", payName: "باسم",
    payWaiting: "في انتظار صورة (سكرين شوت) تحويل إنستاباي 📸 لتأكيد طلبك {ref}.",
    aswan: "أسوان",
    done: "✅ استلمنا صورة التحويل لطلبك رقم {ref}!\nسنتحقق من الدفع ونؤكد لك، ثم نتصل بك على {phone} قبل التوصيل. المدة المتوقعة: {eta}.\nشكراً لاختيارك عطر 🌹",
    etaAswan: "١–٢ يوم عمل", etaOther: "٢–٤ أيام",
    cancelled: "تم إلغاء الطلب {ref}. يسعدنا خدمتك في أي وقت: {site}",
    editOrder: "لتعديل المنتجات، عدّل سلتك على الموقع ثم اضغط «اطلب عبر واتساب» من جديد:\n{site}",
    notFound: "مرحباً بك في عطر 🌹\nلم نجد هذا الطلب. يمكنك إعادة الطلب من موقعنا:\n{site}\nأو اكتب سؤالك وسيرد عليك فريقنا.",
    welcome: "مرحباً بك في عطر · دار عطور 🌹\nتصفّح المجموعة واطلب من موقعنا:\n{site}\nأو اكتب سؤالك وسيرد عليك فريقنا قريباً.",
    alreadyDone: "طلبك رقم {ref} مؤكد ✅ وفريقنا سيتواصل معك قريباً. لأي سؤال اكتب هنا.",
    pickButton: "من فضلك اختر من الأزرار 👇",
    confirmWords: /^(تأكيد|تاكيد|أكد|اكد|أؤكد|نعم|اه|أيوه|ايوه|تمام|موافق|confirm|yes|ok)(?=$|[\s!.،,؟?])/i,
    cancelWords: /^(إلغاء|الغاء|الغي|ألغي|cancel)(?=$|[\s!.،,؟?])/i
  },
  en: {
    detailsTitle: "🧾 Your order {ref}",
    items: "Items", subtotal: "Subtotal", delivery: "Delivery", total: "Total",
    onRequest: "Price on request", free: "Free", priceLater: "We will confirm the price here",
    deliveryRule: "{a} in Aswan, {b} to other governorates, free over {f}",
    askConfirm: "To confirm your order, tap \"Confirm order\" 👇\n(or type: confirm)",
    bConfirm: "✅ Confirm order", bEdit: "✏️ Edit order", bCancel: "❌ Cancel",
    askName: "Thank you! 🌸\nWhat is your full name?",
    nameShort: "Please type your full name.",
    askGov: "Hello {name} 👋\nWhere should we deliver your order?",
    bAswan: "📍 In Aswan", bOther: "🚚 Other governorate",
    askGovName: "Type the name of your governorate:",
    askAddress: "Please type your full address:\narea, street, building number, floor, flat and a nearby landmark.",
    addressShort: "That address is short. Please add more detail: street, building number, flat and a landmark.",
    askPhone: "Which mobile number should we call on delivery?",
    bSamePhone: "📱 This WhatsApp no.", bOtherPhone: "☎️ Another number",
    askPhoneType: "Type the mobile number (e.g. 01012345678):",
    phoneBad: "That number doesn't look right. Type an 11-digit Egyptian mobile number starting with 01.",
    summaryTitle: "📋 Please check your order {ref}",
    summaryAsk: "Is everything correct?",
    bFinal: "✅ Confirm & pay", bEditDetails: "✏️ Edit details",
    payAsk: "💳 To complete your order {ref}:\n1. Transfer {amount} by InstaPay to:\n{target}\n2. Send the transfer screenshot here 📸",
    payTotalLater: "the total we confirm here", payTargetLater: "we will send you the transfer details in a moment", payName: "Name",
    payWaiting: "Waiting for your InstaPay transfer screenshot 📸 to confirm order {ref}.",
    aswan: "Aswan",
    done: "✅ We received the transfer screenshot for order {ref}!\nWe will check the payment and confirm, then call you on {phone} before delivery. Expected time: {eta}.\nThank you for choosing Atr 🌹",
    etaAswan: "1–2 working days", etaOther: "2–4 days",
    cancelled: "Order {ref} is cancelled. We are happy to help any time: {site}",
    editOrder: "To change the products, edit your cart on the website and tap \"Order on WhatsApp\" again:\n{site}",
    notFound: "Welcome to Atr 🌹\nWe couldn't find that order. You can order again on our website:\n{site}\nor type your question and our team will reply.",
    welcome: "Welcome to Atr · Maison de Parfum 🌹\nBrowse the collection and order on our website:\n{site}\nor type your question and our team will reply soon.",
    alreadyDone: "Your order {ref} is confirmed ✅ and our team will contact you soon. Type here for any question.",
    pickButton: "Please choose one of the buttons 👇",
    confirmWords: /^(confirm|yes|ok|okay|تأكيد|تاكيد)(?=$|[\s!.،,؟?])/i,
    cancelWords: /^(cancel|إلغاء|الغاء)(?=$|[\s!.،,؟?])/i
  }
};

const REF_RE = /ATR-\d{6}-\d{4}/;
const PHONE_RE = /^(?:\+?20|0)?1[0125]\d{8}$/;
const fill = (s, vars = {}) => Object.entries(vars).reduce((a, [k, v]) => a.split(`{${k}}`).join(v), s);
const toArabicDigits = s => String(s).replace(/\d/g, d => "٠١٢٣٤٥٦٧٨٩"[d]);
const money = (n, lang) => lang === "ar" ? `${toArabicDigits(n.toLocaleString("en").replace(/,/g, "٬"))} ج.م` : `EGP ${n.toLocaleString("en")}`;
const clean = (v, max) => String(v || "").replace(/[\u0000-\u001f\u007f‎‏‪-‮⁦-⁩]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
// "201012345678" (WhatsApp's format) → "01012345678"
const localPhone = p => { let d = String(p).replace(/\D/g, ""); if (d.startsWith("20")) d = "0" + d.slice(2); return d.length === 10 && d.startsWith("1") ? "0" + d : d; };

function productLine(code, qty, lang) {
  const it = GALLERY.find(g => g.code === code);
  const name = it ? ((lang === "ar" ? it.ar || it.en : it.en) || code) : code;
  const brand = it && it.en && GALLERY_BRANDS[it.brand] ? ` – ${GALLERY_BRANDS[it.brand][lang] || GALLERY_BRANDS[it.brand].en}` : "";
  const p = SHOP.priceOf(code);
  return `• ${name}${brand} (${code}) × ${lang === "ar" ? toArabicDigits(qty) : qty}${p === null ? ` – ${T[lang].onRequest}` : ` = ${money(p * qty, lang)}`}`;
}

// Order lines, item count and money for a governorate choice ("aswan", "other" or none yet).
function orderBlock(order, lang, gov) {
  const t = T[lang], q = SHOP.quote(order.lines, gov || null);
  const rows = order.lines.map(l => productLine(l.code, l.qty, lang));
  const count = order.lines.reduce((a, l) => a + l.qty, 0);
  const out = [...rows, "", `${t.items}: ${lang === "ar" ? toArabicDigits(count) : count}`];
  if (q.subtotal) out.push(`${t.subtotal}: ${money(q.subtotal, lang)}${q.unpriced ? " + " + t.onRequest : ""}`);
  const D = SHOP.DELIVERY;
  out.push(`${t.delivery}: ${q.delivery === 0 ? t.free : q.delivery !== null ? money(q.delivery, lang)
    : fill(t.deliveryRule, { a: money(D.aswan, lang), b: money(D.other, lang), f: money(D.freeFrom, lang) })}`);
  out.push(`${t.total}: ${q.total !== null ? money(q.total, lang) : t.priceLater}`);
  return { text: out.join("\n"), quote: q };
}

const text = body => ({ type: "text", body });
const buttons = (body, list) => ({ type: "buttons", body, buttons: list.map(([id, title]) => ({ id, title })) });

function confirmButtons(t) { return buttons(t.askConfirm, [["confirm", t.bConfirm], ["edit", t.bEdit], ["cancel", t.bCancel]]); }
function phoneButtons(t) { return buttons(t.askPhone, [["phone_same", t.bSamePhone], ["phone_other", t.bOtherPhone]]); }
function govButtons(t, name) { return buttons(fill(t.askGov, { name: name.split(" ")[0] }), [["gov_aswan", t.bAswan], ["gov_other", t.bOther]]); }

function summary(s, order, t, lang) {
  const block = orderBlock(order, lang, s.gov);
  const gov = s.gov === "aswan" ? t.aswan : s.govName;
  return buttons([fill(t.summaryTitle, { ref: s.ref }), "", block.text, "", `👤 ${s.name}`, `📍 ${gov}`, `🏠 ${s.address}`, `📱 ${s.phone}`, "", t.summaryAsk].join("\n"),
    [["final", t.bFinal], ["edit_details", t.bEditDetails]]);
}

const customerOf = s => ({ name: s.name, gov: s.gov, govName: s.govName, address: s.address, phone: s.phone, waId: s.waId });

// InstaPay instructions with the total (or a note that it will be confirmed) and the transfer target.
function payAsk(s, order, t) {
  const lang = s.lang, q = SHOP.quote(order.lines, s.gov);
  const ip = SHOP.INSTAPAY || {};
  const target = ip.address ? `${ip.address}${ip.accountName ? `\n(${t.payName}: ${ip.accountName})` : ""}` : t.payTargetLater;
  return fill(t.payAsk, { ref: s.ref, amount: q.total !== null ? money(q.total, lang) : t.payTotalLater, target });
}

function ownerAlert(s, order, title = "🛍️ طلب جديد مؤكد عبر واتساب") {
  const block = orderBlock(order, "ar", s.gov);
  return [title, `رقم الطلب: ${s.ref}`, "", block.text, "",
    `الاسم: ${s.name}`, `المحافظة: ${s.gov === "aswan" ? "أسوان" : s.govName}`, `العنوان: ${s.address}`,
    `موبايل التوصيل: ${s.phone}`, `واتساب العميل: +${s.waId}`].join("\n");
}

/* session: the saved conversation (or null). msg: { from, text, buttonId }.
   order: the saved order for a reference found in the message (or null).
   Returns { session, replies, alert, orderUpdate }. */
function handle(session, msg, ctx) {
  const site = ctx.siteUrl;
  const words = clean(msg.text, 300);
  const id = msg.buttonId || "";
  const refInText = (words.match(REF_RE) || [])[0];

  // A new order reference starts (or restarts) the flow
  if (refInText && (!session || session.ref !== refInText || session.step === "done" || session.step === "cancelled")) {
    const order = ctx.order;
    const lang = order && order.lang === "en" ? "en" : "ar";
    if (!order) return { session: { step: "idle", waId: msg.from, welcomedAt: ctx.now, updated: ctx.now }, replies: [text(fill(T[lang].notFound, { site }))], alert: `💬 رسالة بطلب غير معروف من +${msg.from}:\n${words}` };
    const t = T[lang];
    const c = order.customer;
    if (c && c.name && c.phone && c.address && c.gov) { // details already given on the website: go to the summary
      const s = { ref: refInText, lang, step: "final", waId: msg.from, updated: ctx.now,
        name: c.name, phone: c.phone, address: c.address, gov: c.gov, govName: c.gov === "aswan" ? t.aswan : c.govName };
      return { session: s, replies: [summary(s, order, t, lang)] };
    }
    const s = { ref: refInText, lang, step: "confirm", waId: msg.from, updated: ctx.now };
    return { session: s, replies: [text([fill(t.detailsTitle, { ref: s.ref }), "", orderBlock(order, lang).text].join("\n")), confirmButtons(t)] };
  }

  // Not in an order: welcome at most once a day, and always pass the message on to the owner
  if (!session || session.step === "cancelled" || session.step === "idle") {
    const recent = session && session.welcomedAt && Date.parse(ctx.now) - Date.parse(session.welcomedAt) < 864e5;
    return {
      session: { step: "idle", waId: msg.from, welcomedAt: recent ? session.welcomedAt : ctx.now, updated: ctx.now },
      replies: recent ? [] : [text(fill(T.ar.welcome, { site }))],
      alert: `💬 رسالة من +${msg.from}:\n${words || "(صورة/صوت/زر)"}`
    };
  }

  const s = { ...session, updated: ctx.now }, t = T[s.lang], order = ctx.order;
  const yes = id === "confirm" || id === "final" || t.confirmWords.test(words);
  if (id === "cancel" || (s.step !== "done" && t.cancelWords.test(words))) {
    return { session: { ...s, step: "cancelled" }, replies: [text(fill(t.cancelled, { ref: s.ref, site }))], orderUpdate: { status: "cancelled" } };
  }

  switch (s.step) {
    case "confirm":
      if (id === "edit") return { session: s, replies: [text(fill(t.editOrder, { site }))] };
      if (yes) return { session: { ...s, step: "name" }, replies: [text(t.askName)] };
      return { session: s, replies: [text(t.pickButton), confirmButtons(t)] };

    case "name": {
      const name = clean(words, 80);
      if (id || name.length < 3) return { session: s, replies: [text(t.nameShort)] };
      return { session: { ...s, name, step: "gov" }, replies: [govButtons(t, name)] };
    }

    case "gov":
      if (id === "gov_aswan" || /^(أسوان|اسوان|aswan)$/i.test(words)) return { session: { ...s, gov: "aswan", govName: t.aswan, step: "address" }, replies: [text(t.askAddress)] };
      if (id === "gov_other") return { session: { ...s, step: "govName" }, replies: [text(t.askGovName)] };
      if (words.length >= 3 && !id) return { session: { ...s, gov: "other", govName: clean(words, 40), step: "address" }, replies: [text(t.askAddress)] };
      return { session: s, replies: [govButtons(t, s.name)] };

    case "govName": {
      const g = clean(words, 40);
      if (/^(أسوان|اسوان|aswan)$/i.test(g)) return { session: { ...s, gov: "aswan", govName: t.aswan, step: "address" }, replies: [text(t.askAddress)] };
      if (g.length < 3) return { session: s, replies: [text(t.askGovName)] };
      return { session: { ...s, gov: "other", govName: g, step: "address" }, replies: [text(t.askAddress)] };
    }

    case "address": {
      const address = clean(words, 300);
      if (id || address.length < 12) return { session: s, replies: [text(t.addressShort)] };
      return { session: { ...s, address, step: "phone" }, replies: [phoneButtons(t)] };
    }

    case "phone":
    case "phoneType": {
      let phone = null;
      if (id === "phone_same") phone = localPhone(msg.from);
      else if (id === "phone_other") return { session: { ...s, step: "phoneType" }, replies: [text(t.askPhoneType)] };
      else {
        const digits = words.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d)).replace(/[\s-]/g, "");
        if (PHONE_RE.test(digits)) phone = localPhone(digits.startsWith("0") ? "20" + digits.slice(1) : digits);
        else return { session: s, replies: [text(t.phoneBad), ...(s.step === "phone" ? [phoneButtons(t)] : [])] };
      }
      const next = { ...s, phone, step: "final" };
      return { session: next, replies: [summary(next, order, t, s.lang)] };
    }

    case "final":
      if (id === "edit_details") return { session: { ...s, step: "name" }, replies: [text(t.askName)] };
      if (yes) {
        const next = { ...s, step: "payment" };
        return {
          session: next,
          replies: [text(payAsk(next, order, t))],
          alert: ownerAlert(next, order, "🕒 طلب بانتظار تحويل إنستاباي"),
          orderUpdate: { status: "awaiting_payment", customer: customerOf(s), detailsAt: ctx.now }
        };
      }
      return { session: s, replies: [text(t.pickButton), summary(s, order, t, s.lang)] };

    case "payment":
      if (msg.image) {
        const done = { ...s, step: "done" };
        return {
          session: done,
          replies: [text(fill(t.done, { ref: s.ref, phone: s.phone, eta: s.gov === "aswan" ? t.etaAswan : t.etaOther }))],
          alert: ownerAlert(done, order, "💳 وصلت صورة تحويل إنستاباي — راجع وصول المبلغ في تطبيق إنستاباي ثم أكّد للعميل"),
          orderUpdate: { status: "payment_sent", customer: customerOf(s), paymentScreenshot: { mediaId: msg.mediaId || "", at: ctx.now } }
        };
      }
      return { session: s, replies: [text(fill(t.payWaiting, { ref: s.ref })), text(payAsk(s, order, t))] };

    case "done":
    default: // order confirmed: say so once, then just pass messages on to the owner
      return { session: { ...s, doneNoticeSent: true }, replies: s.doneNoticeSent ? [] : [text(fill(t.alreadyDone, { ref: s.ref }))], alert: `💬 رسالة من +${msg.from} بخصوص الطلب ${s.ref}:\n${words || "(صورة/صوت/زر)"}` };
  }
}

module.exports = { handle, REF_RE, orderBlock, T };
