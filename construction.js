/* ░░ UNDER CONSTRUCTION — prepínač ░░
   UC_ON = true  → návštevník vidí „VO VÝSTAVBE" (reálny web je skrytý)
   UC_ON = false → normálny web
   Mení sa LEN tento jeden riadok; potom commit + push. */
(function () {
  "use strict";
  var UC_ON = true;            // ← PREPÍNAČ

  if (!UC_ON) return;
  window.__UC__ = true;        // poistka pre app.js (nespúšťať splash/init pod overlayom)
  document.documentElement.classList.add("uc-on");  // hneď (v <head>) → žiadny záblesk webu

  var FLAKE =
    '<svg class="uc-flake" viewBox="0 0 64 64" aria-hidden="true">' +
      '<defs><linearGradient id="ucFrost" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0" stop-color="#38BDF8"/><stop offset="0.5" stop-color="#818CF8"/><stop offset="1" stop-color="#22D3EE"/>' +
      '</linearGradient></defs>' +
      '<g fill="none" stroke="url(#ucFrost)" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<g id="ucArm"><line x1="32" y1="32" x2="32" y2="7"/><line x1="32" y1="14" x2="26" y2="8"/><line x1="32" y1="14" x2="38" y2="8"/><line x1="32" y1="22" x2="27.5" y2="17.5"/><line x1="32" y1="22" x2="36.5" y2="17.5"/></g>' +
        '<use href="#ucArm" transform="rotate(60 32 32)"/><use href="#ucArm" transform="rotate(120 32 32)"/><use href="#ucArm" transform="rotate(180 32 32)"/><use href="#ucArm" transform="rotate(240 32 32)"/><use href="#ucArm" transform="rotate(300 32 32)"/>' +
        '<circle cx="32" cy="32" r="3" fill="url(#ucFrost)" stroke="none"/>' +
      '</g>' +
    '</svg>';

  function build() {
    if (document.getElementById("uc")) return;
    var o = document.createElement("div");
    o.id = "uc";
    o.setAttribute("role", "status");
    o.setAttribute("aria-label", "Stránka je vo výstavbe");
    o.innerHTML =
      '<div class="uc-grid" aria-hidden="true"></div>' +
      '<div class="uc-scan" aria-hidden="true"></div>' +
      '<div class="uc-stage">' +
        '<div class="uc-wire" aria-hidden="true">' +
          '<div class="uc-w uc-w-nav"></div>' +
          '<div class="uc-w uc-w-hero"></div>' +
          '<div class="uc-row"><div class="uc-w uc-w-card"></div><div class="uc-w uc-w-card uc-w-card2"></div></div>' +
        '</div>' +
        FLAKE +
        '<div class="uc-title" data-text="VO VÝSTAVBE">VO VÝSTAVBE</div>' +
        '<div class="uc-sub">Na niečom veľkom pracujeme. Čoskoro tu bude nový web.</div>' +
        '<div class="uc-bar"><span class="uc-bar-fill"></span></div>' +
        '<div class="uc-pct">0%</div>' +
      '</div>';
    document.body.appendChild(o);

    // percentá synchronizované so 4 s loopom progress baru
    var pct = o.querySelector(".uc-pct");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      pct.textContent = "100%";
      return;
    }
    var t0 = performance.now();
    (function tick(now) {
      var p = Math.floor(((now - t0) % 4000) / 4000 * 100);
      pct.textContent = p + "%";
      requestAnimationFrame(tick);
    })(t0);
  }

  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
