// Builds prices/products.csv (English) and prices/products-ar.csv (Arabic) from the site's own data,
// so the files always match what the website shows.  Run: node prices/make-products-csv.js
const fs = require("fs"), path = require("path");
const root = path.join(__dirname, "..", "public", "assets", "js");
const { GALLERY, GALLERY_BRANDS } = require(path.join(root, "data.js"));
const SHOP = require(path.join(root, "shop.js"));
const { DETAILS, NOTES, FAMILIES } = require(path.join(root, "details.js"));

const cell = v => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
const write = (file, rows) => fs.writeFileSync(path.join(__dirname, file), "﻿" + rows.map(r => r.map(cell).join(",")).join("\r\n") + "\r\n");

function build(i) {           // i = 0 English, 1 Arabic
  const ar = i === 1, sep = ar ? "، " : ", ";
  const G = { m: ["Men", "رجالي"], w: ["Women", "نسائي"], u: ["Unisex", "للجنسين"] };
  const TYPE = { perfume: ["Perfume", "عطر"], set: ["Gift set", "طقم هدايا"] };
  const notes = l => (l || []).map(n => (NOTES[n] ? NOTES[n][i] : n)).join(sep);
  const head = ar
    ? ["الكود", "الماركة", "اسم المنتج", "النوع", "الحجم (مل)", "لمن", "العائلة العطرية", "المقدمة", "القلب", "القاعدة", "أبرز المكونات", "محتويات الطقم", "العطّار", "الوصف", "السعر (جنيه)"]
    : ["Code", "Brand", "Product", "Type", "Size (ml)", "For", "Scent family", "Top notes", "Heart notes", "Base notes", "Key notes", "Set contents", "Perfumer", "Description", "Price (EGP)"];
  const rows = GALLERY.map(it => {
    const d = DETAILS[it.code] || {};
    return [it.code, GALLERY_BRANDS[it.brand][ar ? "ar" : "en"], ar ? it.ar : it.en, TYPE[it.type][i], d.size || "",
      d.g ? G[d.g][i] : "", (d.fam || []).map(f => FAMILIES[f][i]).join(" · "),
      notes(d.top), notes(d.heart), notes(d.base), notes(d.key), (d.inc || []).map(x => x[i]).join(sep),
      d.by || "", ar ? d.ar : d.en, SHOP.priceOf(it.code) ?? ""];
  });
  return [head, ...rows];
}
write("products.csv", build(0));
write("products-ar.csv", build(1));
console.log("wrote", GALLERY.length, "products");
