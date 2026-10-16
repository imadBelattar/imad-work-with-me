# Work-with-me site

One-page services site for Imad Belattar (@imad.code). Plain HTML + CSS + a little JS, no build step.

## Files
- `index.html` — all the copy (Arabic, RTL). `TODO(imad)` comments mark text that needs approval.
- `style.css` — Deep Slate design tokens at the top (`:root`).
- `script.js` — the `CONFIG` block at the top holds the WhatsApp number, email, guide link and repo link. Empty values are hidden on the page.

## Preview locally
```
python3 -m http.server 8000
```
Then open http://localhost:8000

## Before going live
- Fill `CONFIG` in `script.js` (WhatsApp number first: the page shows only the Instagram button until it is set).
- Approve every piece of copy, and set real prices and durations in the three offer cards.
- Check the hosting provider's terms for commercial use (see the project brief, section 7).
- Test on a phone: Arabic RTL, speed, WhatsApp link.
