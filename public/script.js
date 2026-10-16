// Edit only this block. Anything left empty ("") is simply not shown on the page.
const CONFIG = {
  whatsappNumber: "212693877257", // international format, digits only
  email: "",                       // e.g. "hello@example.com"
  guideUrl: "",                    // link to the free PDF guide (Google Drive share link)
  repoUrl: "https://github.com/imadBelattar/imad-work-with-me",
  photoReel: "assets/imad-reel.webp",     // tall photo for the hero frame
  photoAvatar: "assets/imad-avatar.webp", // square photo for the contact block
  defaultLang: "ar"
};

(function () {
  const $$ = (sel, root = document) => root.querySelectorAll(sel);
  const html = document.documentElement;
  const DICT = window.I18N || {};
  const DIR = { ar: "rtl", ary: "rtl", fr: "ltr", en: "ltr" };

  /* ---------- i18n: Arabic comes from the HTML, other languages from i18n.js ---------- */
  const base = Object.assign({}, DICT.ar);
  $$("[data-i18n]").forEach((el) => {
    base[el.dataset.i18n] = el.hasAttribute("data-i18n-html") ? el.innerHTML : el.textContent;
  });
  $$("[data-i18n-attr]").forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":");
      base[key] = el.getAttribute(attr);
    });
  });
  DICT.ar = base;

  let lang = "ar";
  const t = (key) => (DICT[lang] && DICT[lang][key] != null ? DICT[lang][key] : base[key]);

  function applyLang(next) {
    lang = DICT[next] ? next : "ar";
    html.lang = lang;
    html.dir = DIR[lang] || "ltr";
    $$("[data-i18n]").forEach((el) => {
      const value = t(el.dataset.i18n);
      if (el.hasAttribute("data-i18n-html")) el.innerHTML = value; else el.textContent = value;
    });
    $$("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":");
        el.setAttribute(attr, t(key));
      });
    });
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
    updateWhatsApp();
    setMenu(false);
    try { localStorage.setItem("lang", lang); } catch (e) {}
    try {
      const url = new URL(location.href);
      if (lang === CONFIG.defaultLang) url.searchParams.delete("lang"); else url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    } catch (e) {}
  }

  /* ---------- WhatsApp / email / guide / repo links ---------- */
  const number = CONFIG.whatsappNumber.replace(/\D/g, "");
  const wa = (text) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);

  function updateWhatsApp() {
    if (!number) return;
    $$("[data-whatsapp]").forEach((a) => {
      a.href = wa(t("wa.general"));
      a.target = "_blank";
      a.rel = "noopener";
      a.hidden = false;
    });
    $$("[data-offer]").forEach((a) => {
      a.href = wa(t("wa.offer") + t("wa." + a.dataset.offer));
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  if (CONFIG.email) {
    $$("[data-email]").forEach((a) => { a.href = "mailto:" + CONFIG.email; a.hidden = false; });
  }
  if (CONFIG.guideUrl) {
    $$("[data-guide]").forEach((box) => (box.hidden = false));
    $$("[data-guide-link]").forEach((a) => (a.href = CONFIG.guideUrl));
  }
  if (CONFIG.repoUrl) {
    $$("[data-repo-link]").forEach((a) => { a.href = CONFIG.repoUrl; a.hidden = false; });
  }

  /* ---------- Photo (falls back to the IB initials if missing) ---------- */
  function setPhoto(img, src) {
    if (!src) return;
    img.addEventListener("load", () => {
      img.hidden = false;
      const fallback = img.parentElement.querySelector("[data-initials]");
      if (fallback) fallback.hidden = true;
    }, { once: true });
    img.src = src;
  }
  const [reelImg, avatarImg] = $$("img[data-photo]");
  if (reelImg) setPhoto(reelImg, CONFIG.photoReel);
  if (avatarImg) setPhoto(avatarImg, CONFIG.photoAvatar);

  /* ---------- Navbar ---------- */
  const nav = document.querySelector("[data-nav]");
  const menuBtn = document.querySelector("[data-menu-btn]");
  const menu = document.querySelector("[data-menu]");

  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", t(open ? "nav.close" : "nav.menu"));
    menu.hidden = !open;
  }
  menuBtn && menuBtn.addEventListener("click", () => setMenu(menu.hidden));
  menu && menu.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  document.addEventListener("click", (e) => {
    if (menu && !menu.hidden && !nav.contains(e.target)) setMenu(false);
  });
  matchMedia("(min-width: 960px)").addEventListener("change", (e) => { if (e.matches) setMenu(false); });

  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Highlight the nav link of the section on screen
  const links = $$(".nav__links a");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.setAttribute("aria-current", String(a.hash === "#" + entry.target.id)));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    ["offers", "examples", "how", "trust", "faq", "contact", "top"].forEach((id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  $$("[data-lang]").forEach((b) => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));

  /* ---------- Initial language: ?lang= → saved choice → default ---------- */
  let start = CONFIG.defaultLang;
  try { start = localStorage.getItem("lang") || start; } catch (e) {}
  const fromUrl = new URLSearchParams(location.search).get("lang");
  if (fromUrl) start = fromUrl;
  applyLang(start);
})();
