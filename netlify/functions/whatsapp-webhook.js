/* WhatsApp order assistant (WhatsApp Business Platform / Cloud API webhook).
   Meta calls this for every message a customer sends to the store's WhatsApp number.
   It checks Meta's signature, runs the conversation in ../lib/bot.js, replies with
   text and tap-buttons, and alerts the owner when an order is confirmed.

   Environment variables (Netlify → Site configuration → Environment variables):
     WHATSAPP_TOKEN            permanent access token of a System User with whatsapp_business_messaging
     WHATSAPP_PHONE_NUMBER_ID  the "Phone number ID" from Meta → WhatsApp → API setup
     WHATSAPP_APP_SECRET       Meta app → Settings → Basic → App secret (verifies Meta's signature)
     WHATSAPP_VERIFY_TOKEN     any long random text; type the same text in Meta's webhook settings
     SITE_URL                  e.g. https://atr-perfume.netlify.app
     WHATSAPP_API_VERSION      optional, default v23.0
   Optional owner alerts: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID (see README). */
const crypto = require("crypto");
const { handle, REF_RE } = require("../lib/bot.js");
const { stores, getJSON, setJSON } = require("../lib/storage.js");
const { notifyOwner } = require("../lib/notify.js");

const SESSION_DAYS = 3;
const ok = (body = "ok") => ({ statusCode: 200, headers: { "Content-Type": "text/plain" }, body });

function validSignature(raw, header, secret) {
  if (!header || !secret || !header.startsWith("sha256=")) return false;
  const expected = Buffer.from("sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex"));
  const given = Buffer.from(header);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

// What the customer sent: typed text and/or the id of the button they tapped.
function readMessage(m) {
  if (m.type === "text") return { text: m.text && m.text.body };
  if (m.type === "interactive" && m.interactive) {
    const r = m.interactive.button_reply || m.interactive.list_reply || {};
    return { buttonId: r.id, text: r.title };
  }
  if (m.type === "button" && m.button) return { text: m.button.text };
  if (m.type === "image" && m.image) return { image: true, mediaId: m.image.id, text: m.image.caption || "" }; // e.g. the InstaPay screenshot
  if (m.type === "document" && m.document && /^image\//.test(m.document.mime_type || "")) return { image: true, mediaId: m.document.id, text: m.document.caption || "" };
  return { text: "" }; // images, voice notes, stickers…
}

async function send(to, msg) {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_API_VERSION } = process.env;
  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION || "v23.0"}/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const post = payload => fetch(url, {
    method: "POST",
    headers: { "Authorization": `Bearer ${WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, ...payload })
  }).then(async r => { if (!r.ok) console.error("WhatsApp send failed", r.status, (await r.text()).slice(0, 300)); });

  if (msg.type === "text") return post({ type: "text", text: { body: msg.body.slice(0, 4000), preview_url: true } });
  // Buttons: WhatsApp allows a 1024-character text above them; send longer text first
  let body = msg.body;
  if (body.length > 1000) { await post({ type: "text", text: { body: body.slice(0, 4000) } }); body = "👇"; }
  return post({
    type: "interactive",
    interactive: { type: "button", body: { text: body }, action: { buttons: msg.buttons.slice(0, 3).map(b => ({ type: "reply", reply: { id: b.id, title: b.title.slice(0, 20) } })) } }
  });
}

exports.handler = async event => {
  const env = process.env;
  // Meta checks the address once when you save it in the webhook settings
  if (event.httpMethod === "GET") {
    const q = event.queryStringParameters || {};
    if (q["hub.mode"] === "subscribe" && env.WHATSAPP_VERIFY_TOKEN && q["hub.verify_token"] === env.WHATSAPP_VERIFY_TOKEN) return ok(q["hub.challenge"] || "");
    return { statusCode: 403, body: "forbidden" };
  }
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "method" };
  if (!env.WHATSAPP_APP_SECRET || !env.WHATSAPP_TOKEN || !env.WHATSAPP_PHONE_NUMBER_ID) return { statusCode: 503, body: "not configured" };

  const raw = event.isBase64Encoded ? Buffer.from(event.body || "", "base64").toString("utf8") : (event.body || "");
  if (raw.length > 500000) return { statusCode: 413, body: "too large" };
  const headers = Object.fromEntries(Object.entries(event.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
  if (!validSignature(raw, headers["x-hub-signature-256"], env.WHATSAPP_APP_SECRET)) return { statusCode: 401, body: "signature" };

  let data;
  try { data = JSON.parse(raw); } catch { return { statusCode: 400, body: "bad json" }; }
  const { orders, chats } = stores(event);
  const ownNumber = id => id === env.WHATSAPP_PHONE_NUMBER_ID;

  for (const entry of data.entry || []) {
    for (const change of entry.changes || []) {
      const value = change.value || {};
      if (value.metadata && !ownNumber(value.metadata.phone_number_id)) continue;
      for (const m of value.messages || []) {
        try {
          const from = String(m.from || "").replace(/\D/g, "");
          if (!from) continue;
          const key = `wa:${from}`;
          let session = await getJSON(chats, key);
          if (session && session.seen && session.seen.includes(m.id)) continue; // Meta sometimes delivers twice
          if (session && Date.now() - Date.parse(session.updated || 0) > SESSION_DAYS * 864e5) session = null;

          const msg = { from, ...readMessage(m) };
          const ref = (String(msg.text || "").match(REF_RE) || [])[0] || (session && session.ref);
          const order = ref ? await getJSON(orders, ref) : null;
          const now = new Date().toISOString();
          const result = handle(session, msg, { order, siteUrl: env.SITE_URL || "", now });

          const seen = [...((session && session.seen) || []), m.id].slice(-20);
          await setJSON(chats, key, { ...result.session, seen });
          if (result.orderUpdate && order) await setJSON(orders, order.ref, { ...order, ...result.orderUpdate, updatedAt: now });

          for (const r of result.replies) await send(from, r);
          if (result.alert) await notifyOwner(result.alert);
        } catch (e) {
          console.error("WhatsApp message failed", e.message);
        }
      }
    }
  }
  return ok(); // always 200 for valid deliveries, so Meta does not keep retrying
};
