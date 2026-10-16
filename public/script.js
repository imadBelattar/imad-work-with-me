// Edit only this block. Anything left empty ("") is simply not shown on the page.
const CONFIG = {
  whatsappNumber: "212693877257", // international format, digits only, e.g. "2126XXXXXXXX"
  email: "",          // e.g. "hello@example.com"
  guideUrl: "",       // link to the free PDF guide (Google Drive share link)
  repoUrl: "https://github.com/imadBelattar/imad-work-with-me" // link to this site's GitHub repo
};

(function () {
  const number = CONFIG.whatsappNumber.replace(/\D/g, "");
  const wa = (text) => "https://wa.me/" + number + "?text=" + encodeURIComponent(text);
  const $$ = (sel) => document.querySelectorAll(sel);

  if (number) {
    // Main WhatsApp buttons (hero + contact)
    $$("[data-whatsapp]").forEach((a) => {
      a.href = wa("السلام عليكم، اطلعت على صفحتك وأريد الاستفسار عن خدماتك.");
      a.target = "_blank";
      a.rel = "noopener";
      a.hidden = false;
    });
    // Per-offer links start as "#contact" and become a pre-filled WhatsApp message
    $$("[data-offer]").forEach((a) => {
      a.href = wa("السلام عليكم، أريد الاستفسار عن عرض: " + a.dataset.offer);
      a.target = "_blank";
      a.rel = "noopener";
    });
  }

  if (CONFIG.email) {
    $$("[data-email]").forEach((a) => {
      a.href = "mailto:" + CONFIG.email;
      a.hidden = false;
    });
  }

  if (CONFIG.guideUrl) {
    $$("[data-guide]").forEach((box) => (box.hidden = false));
    $$("[data-guide-link]").forEach((a) => (a.href = CONFIG.guideUrl));
  }

  if (CONFIG.repoUrl) {
    $$("[data-repo-link]").forEach((a) => {
      a.href = CONFIG.repoUrl;
      a.hidden = false;
    });
  }
})();
