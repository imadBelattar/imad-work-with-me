# Work-with-me site

One-page services site for Imad Belattar (@imad.code). Plain HTML + CSS + a little JS, no build step.

Working on this repo with Claude: the rules, workflow and testing notes are in `CLAUDE.md`.

## Files
Site files live in `public/` (only that folder is published). `worker/index.js` is a small Worker that runs only for `/assets/reels/*` to answer byte-range requests (iPhone Safari won't play MP4 without them).
- `index.html` — all the copy (Arabic, RTL). `TODO(imad)` comments mark text that needs approval.
- `style.css` — Deep Slate design tokens at the top (`:root`).
- `i18n.js` — translations. Arabic is read from `index.html`; French (and later Darija) live here.
- `assets/` — Imad's photo (reel crop + square avatar, WebP), `reels/` (web MP4s + covers), `guides/` (guide covers).
- `guides.js` — the free guides list (title, one line, cover, Drive link). Add a guide by copying one block.
- `_redirects` — short links (`/guides` → `/#guides`).
- `script.js` — the `CONFIG` block at the top holds the WhatsApp number, email and the site address used for SEO. Empty values are hidden on the page.
- `robots.txt`, `sitemap.xml`, `favicon.svg`, icons, `assets/og-image.jpg` — SEO and share preview.

## Preview locally
```
cd public && python3 -m http.server 8000
```
Then open http://localhost:8000 (reel videos and `/guides` need the Cloudflare runtime: `npx wrangler dev` instead).

## Adding a reel
1. Make a web copy: `ffmpeg -i original.mp4 -vf scale=720:1280 -c:v libx264 -preset slow -crf 26 -pix_fmt yuv420p -c:a aac -b:a 96k -ac 1 -movflags +faststart public/assets/reels/reel-NAME.mp4` (aim for a few MB; keep the original out of the repo).
2. Put the cover in `public/assets/reels/cover-NAME.webp` (540x960).
3. Copy one `<li class="reelitem">` in `index.html`, set the MP4, `data-poster` and the post URL; add its title in `i18n.js` (French).

## Deploy
Cloudflare Workers (static assets), connected to this repo. Every push to `main` deploys automatically to https://imadbelattar.dev (domain registered at Name.com, nameservers on Cloudflare).
Config: `wrangler.jsonc` (the `name` must match the Cloudflare project name).

## Languages
Arabic is the default. `?lang=fr` opens the French version; the choice is remembered in the browser.
To add a language, copy the `fr` block in `i18n.js`, translate it, and add a `data-lang` button in the navbar.

## SEO
- Canonical address per language (set in `script.js`), `hreflang` links for Arabic and French, Open Graph share preview, structured data (Person + ProfessionalService), `robots.txt` and `sitemap.xml`.
- The production address is https://imadbelattar.dev/ (custom domain on the Worker, declared in `wrangler.jsonc`). It appears in: `index.html` (hreflang, og:url, og:image, JSON-LD), `script.js` (`CONFIG.siteUrl`), `robots.txt`, `sitemap.xml`. If it ever changes, replace it everywhere.
- Add the site to Google Search Console and submit `sitemap.xml`.

## Review flow
Bigger changes go on a branch + pull request. Cloudflare builds a preview address for the branch; merge into `main` once approved.

## Before going live
- Fill `CONFIG` in `script.js` (WhatsApp number first: the page shows only the Instagram button until it is set).
- Approve every piece of copy, and set real prices and durations in the three offer cards.
- Check the hosting provider's terms for commercial use (see the project brief, section 7).
- Test on a phone: Arabic RTL, speed, WhatsApp link.
