/* Newsletter sign-up: saves the email (Netlify Blobs on Netlify, the Redis database on Vercel)
   and, when Telegram alerts are set up, tells the owner. Called by the form at the bottom of
   the home page. Each address is saved once, under atr-newsletter:<email>. */
const { stores, getJSON, setJSON } = require("../lib/storage.js");
const { reply, lowerHeaders, clientIp, limiter, checkSiteRequest } = require("../lib/guard.js");
const { notifyOwner } = require("../lib/notify.js");

const tooMany = limiter(5, 10 * 60 * 1000); // 5 sign-ups per visitor per 10 minutes
const EMAIL = /^[^\s@<>"']{1,64}@[^\s@<>"']{1,190}\.[a-z]{2,24}$/i;

exports.handler = async event => {
  const bad = checkSiteRequest(event, process.env.SITE_URL, 2000, true);
  if (bad) return bad;
  if (tooMany(clientIp(lowerHeaders(event)))) return reply(429, { error: "too_many" });
  let body;
  try { body = JSON.parse(event.body || "{}"); } catch { return reply(400, { error: "bad_json" }); }
  if (body.website) return reply(200, { ok: true });            // the hidden field only bots fill in
  const email = String(body.email || "").trim().toLowerCase();
  if (!EMAIL.test(email)) return reply(400, { error: "email" });
  const lang = body.lang === "en" ? "en" : "ar";
  try {
    const { subs } = stores(event);
    if (!(await getJSON(subs, email))) {
      await setJSON(subs, email, { email, lang, at: new Date().toISOString() });
      await notifyOwner(`📩 New newsletter sign-up: ${email} (${lang})`);
    }
  } catch (e) {
    console.error("newsletter", e.message);
    return reply(503, { error: "not_configured" });
  }
  return reply(200, { ok: true });
};
