/* Alerts for the shop owner. Always written to Netlify's function log, and sent on
   Telegram when TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID are set. */
async function notifyOwner(text) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  console.log(text);
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text.slice(0, 4000) })
    });
  } catch (e) { console.error("Telegram alert failed", e.message); }
}

module.exports = { notifyOwner };
