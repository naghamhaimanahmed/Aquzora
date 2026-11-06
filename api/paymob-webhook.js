// Vercel entry point for netlify/functions/paymob-webhook.js (see _adapter.js)
module.exports = require("./_adapter.js")(require("../netlify/functions/paymob-webhook.js").handler);
