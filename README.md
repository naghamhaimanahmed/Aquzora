# Aquzora · Perfumes, Oud, Makeup & Skincare

A professional, bilingual (English / العربية) beauty store website. Open `index.html` in any browser; no install or build step.

## Features
- **English ⇄ Arabic** with full right-to-left layout; the choice is remembered.
- **Shop by category**: Perfumes, Oud & Bakhoor, Makeup, Skincare.
- **Live search** (header search, press `/`), category chips, sort by price or rating, and an "On sale" filter.
- **Quick view** for every product: notes, size, rating, quantity, add to bag or buy now.
- **Bag drawer**: quantity controls, free-delivery progress bar (free over AED 200), totals, and **Order on WhatsApp**.
- **Checkout**: name, UAE mobile validation, emirate, address, payment (cash on delivery, card, Apple Pay) and an order confirmation.
- **Wishlist** saved in the browser.
- **Scent finder**: 3 quick questions that recommend perfumes.
- Brands strip, reviews, newsletter sign-up, footer with contact.
- Mobile first: bottom navigation bar, bottom-sheet product views, large tap targets, keyboard and screen-reader friendly, respects reduced motion.

## Images
Run `bash download-images.sh` once (on a computer with internet access) to save every photo into `assets/img/`. The site then uses those files, so photos also show offline and inside the published preview page.

Product and banner photos are free Unsplash photos, loaded from Unsplash. If a photo cannot load, a drawn illustration is shown instead, so nothing ever looks broken.

To use your own photos (recommended for real products), put them in `assets/img/` and change the `img` values in `assets/js/data.js`, for example `img: "assets/img/royal-oud.jpg"`.

Official photos and logos of brands such as Assaf or Ibrahim Al Qurashi are copyrighted, so they are not included. If you are an authorised seller, ask the brand for its media kit and add the photos the same way.

## Editing content
- Products, prices, categories, brands and reviews: `assets/js/data.js`
- All interface text in both languages: `assets/js/i18n.js`
- WhatsApp number: set `STORE.whatsapp` in `assets/js/data.js` (e.g. `"9715XXXXXXXX"`)
- Colours and fonts: the `:root` variables at the top of `assets/css/style.css`

Checkout is a front-end demo; connect it to a payment provider or store platform before taking real orders.
