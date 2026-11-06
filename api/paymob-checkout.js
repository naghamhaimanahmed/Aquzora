// Vercel entry point for netlify/functions/paymob-checkout.js (see _adapter.js)
module.exports = require("./_adapter.js")(require("../netlify/functions/paymob-checkout.js").handler);
