// Vercel entry point for netlify/functions/whatsapp-webhook.js (see _adapter.js)
module.exports = require("./_adapter.js")(require("../netlify/functions/whatsapp-webhook.js").handler);
