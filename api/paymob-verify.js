// Vercel entry point for netlify/functions/paymob-verify.js (see _adapter.js)
module.exports = require("./_adapter.js")(require("../netlify/functions/paymob-verify.js").handler);
