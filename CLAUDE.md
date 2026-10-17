# CLAUDE.md — imadbelattar.dev

Imad Belattar's one-page services site (@imad.code), Arabic first (RTL), French second.
Live: https://imadbelattar.dev · Cloudflare Workers (static assets + one small Worker) · this repo: `imadBelattar/imad-work-with-me`.

Business context, decisions, status and the dated log live in the Claude project "Work with me site":
`claude/site-context.md` (read it first in a new chat) and `work-with-me-site-brief.md` (the founding plan).
This file covers how the code works and how to change it.

## Rules that always apply
- **Real work only.** No invented testimonials, client logos, results, numbers or reviews. A sample is labelled "مثال توضيحي".
- **Verify before writing** any price, plan, limit or platform rule against an official source; note source + date in `site-context.md`.
- **Never name an employer or Imad's private projects. No code or repo mentions on the public page.**
- **Imad approves all copy and sets prices.** Any wording change is shown to him as a before → after list before merge.
- **Name:** عماد بالعطار (with the alef, never بلعطار) · Imad Belattar.

## Copy rules (Arabic, MSA)
- Service order everywhere: **1. websites → 2. AI automation → 3. motion graphics reels** (hero, lists, offer cards, meta, JSON-LD, footer).
- Terms: "مواقع ويب", "متاجر إلكترونية", "صفحات هبوط (Landing pages)", "ريلز موشن جرافيك", "أتمتة المهام بالذكاء الاصطناعي (AI automation)".
  The AI service is automation of repetitive daily tasks (workflows), **not a chatbot on the website**; never write just "ذكاء اصطناعي" for it.
- Tool and product names in Latin script: WhatsApp, Instagram, Claude, Reels, AI, Landing page. Translated concepts stay Arabic (الذكاء الاصطناعي).
- One idea per line, no hype. Darija only if Imad wrote or approved it.
- Keep Latin pairs on one line with a non-breaking space: `Landing pages`, `AI automation`.

## Layout
- `public/` is the only folder served. `index.html` (all Arabic copy), `style.css` (tokens in `:root`), `script.js` (`CONFIG` at the top: WhatsApp number, email, site URL), `i18n.js` (French + strings not on the page), `guides.js` (free guides list), `_redirects` (short links), `assets/` (`reels/`, `guides/`, photos, og image), `robots.txt`, `sitemap.xml`, icons.
- `worker/index.js` runs **only** for `/assets/reels/*` (`run_worker_first` in `wrangler.jsonc`) and answers byte-range requests: iPhone Safari won't play MP4 without `206 Partial Content`, and static assets always send the whole file. Everything else is plain static assets (free, unlimited); Worker requests count toward the Free 100,000/day.
- Page order: hero → offers → `#examples` (reel players) → `#guides` → `#about` → `#how` → `#trust` → `#faq` → `#contact`. Section backgrounds alternate (`section--tint`); keep them alternating when adding a section.

## How things work
- **i18n:** Arabic is read from the HTML (`data-i18n`, `data-i18n-attr="attr:key"`, `data-i18n-html` for markup). Every new key needs a French entry in `i18n.js`. Canonical/hreflang are set per language by `script.js`.
- **Reel players:** `<video preload="none" playsinline data-poster=…>`; covers load when the strip nears the screen; tap = play with sound / pause, one at a time, paused off-screen; teal scrubber = `<input type="range" dir="ltr">`. The reels have their own progress line burned into the bottom 8px of 1280, hidden by drawing the video 0.8% taller than its frame. Add a reel: README → "Adding a reel" (720x1280 H.264 CRF 26, faststart, ~2 MB; originals never in the repo).
- **Guides:** add a block to `public/guides.js` (cover 4:5 WebP 480px in `assets/guides/`, Drive link shared "Anyone with the link: Viewer"). `/guides` → `/#guides` via `_redirects` (302).
- **Design:** Deep Slate tokens, single accent teal `#4FD1C5`, one highlighted element per section, no red/green/orange. Cairo (Arabic), Sora/Inter (Latin). Logical CSS properties only (RTL + LTR share one stylesheet). Mobile first; muted text only on card backgrounds (contrast).
- **SEO:** production URL https://imadbelattar.dev/ appears in `index.html` (hreflang, og, JSON-LD), `script.js` (`CONFIG.siteUrl`), `robots.txt`, `sitemap.xml`.

## Workflow
1. Branch from `main` (`main` = live; every push to `main` deploys in ~1 min).
2. Small commits, one idea each, ending with the attribution lines the session gives.
3. Push the branch → Cloudflare builds a preview at `https://<branch>-imad-work-with-me.imad-code-ai.workers.dev`. The build result is the GitHub check run on the commit (`gh api repos/imadBelattar/imad-work-with-me/commits/<sha>/check-runs`).
4. Open the PR with the REST API (`gh api repos/imadBelattar/imad-work-with-me/pulls -f title=… -f head=… -f base=main -F body=@file`); `gh pr create` doesn't work in Claude sessions. Include tests, decisions and the before → after wording table.
5. **Imad merges** on GitHub. Then check the production check run and the live page.
6. End of session: add a line to the log in `claude/site-context.md` (and the course doc's Project log for any infra change or failure).

Sandbox notes: clones are shallow and only track `main`; before pushing a new branch run `git fetch origin main`, and after the first push add `git config --add remote.origin.fetch +refs/heads/<branch>:refs/remotes/origin/<branch>` so git sees the upstream.

## Testing before showing Imad
- Run locally with Cloudflare's runtime: `npx wrangler dev` (serves `_redirects` and the Worker). `python3 -m http.server` in `public/` is fine for layout only.
- Phone widths 360 and 390 px: RTL, no horizontal scroll, videos fit the screen, tap targets ≥ 44px; also `?lang=fr`.
- Links: WhatsApp, Instagram, each reel post, the guide. Byte ranges: `curl -H "Range: bytes=0-1" …/assets/reels/<file>.mp4` → 206.
- Lighthouse mobile (`npx lighthouse … --form-factor=mobile`): last result Performance 98, Accessibility 100, Best Practices 96, SEO 100.
- Sandbox limits: the shell can't reach imadbelattar.dev or Google Fonts (Best Practices 96 is that font request); headless Chromium can't decode H.264 (test player logic with a WebM stand-in served with range support); Instagram and wa.me block fetch tools. Web fetches of the live page need a cache-busting query (`?v=<sha>`), and the first minute after a merge can still show the old page.
