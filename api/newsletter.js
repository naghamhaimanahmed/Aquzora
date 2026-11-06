// Vercel entry point for netlify/functions/newsletter.js (see _adapter.js)
module.exports = require("./_adapter.js")(require("../netlify/functions/newsletter.js").handler);
