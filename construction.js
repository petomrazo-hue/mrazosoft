/* ░░ MRAZOSOFT — obrazovka „vo výstavbe" (manuálny spínač) ░░
   Prekryv nad TITULKOU. Web sa nemaže — len sa schová, takže indexácia
   v Googli ostáva a vypnutie je zmena jedného slova.

   Zapni:  UC_ON = true   + deploy (git push main)
   Vypni:  UC_ON = false  + deploy

   NÁHĽAD (vidí skutočný web aj keď je prekryv zapnutý):
     https://mrazosoft.sk/?nahlad=mrazo2026   → odomkne a zapamätá (localStorage)
     https://mrazosoft.sk/?nahlad=off         → znova zamkne

   Žiadny odpočet: dátum spustenia, ktorý sa nedodrží, je horší než žiadny. */
(function () {
  "use strict";

  var UC_ON = true;                 // ← ZAPNI / VYPNI prekryv
  var PREVIEW_KEY = "mrazo2026";    // tajný token pre náhľad

  if (!UC_ON) return;

  // ── náhľad: ?nahlad=mrazo2026 odomkne (a zapamätá), ?nahlad=off zamkne
  try {
    var q = new URLSearchParams(location.search).get("nahlad");
    if (q === "off") { localStorage.removeItem("uc_preview"); }
    else if (q === PREVIEW_KEY) { localStorage.setItem("uc_preview", "1"); }
    if (localStorage.getItem("uc_preview") === "1") return;   // náhľad → normálny web
  } catch (e) {}

  // bypass na lokále / LAN (vývoj bez čakacej obrazovky)
  var H = location.hostname;
  if (H === "" || /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(H) || /\.local$/.test(H)) return;

  window.__UC__ = true;             // poistka pre app.js, hero.js, cookies.js, tajne.js
  document.documentElement.classList.add("uc-on");

  var MAIL = "petermraz@mrazosoft.sk";
  var GOOGLE = "https://g.page/r/CeMdofK8XEncEBM";

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

  var MAIL_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>';
  var STAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14l-5-4.87 6.91-1.01L12 2z"/></svg>';

  function p2(n) { return (n < 10 ? "0" : "") + n; }

  function build() {
    if (document.getElementById("uc")) return;
    var o = document.createElement("div");
    o.id = "uc";
    o.setAttribute("role", "status");
    o.setAttribute("aria-label", "Stránka je dočasne vo výstavbe");
    o.innerHTML =
      '<div class="uc-grid" aria-hidden="true"></div>' +
      '<div class="uc-scan" aria-hidden="true"></div>' +
      '<div class="uc-stage">' +
        '<div class="uc-brand">' + FLAKE + '<span class="uc-brand-name">MRAZO<span>SOFT</span></span></div>' +
        '<h1 class="uc-title" data-text="Chvíľu strpenia">Chvíľu strpenia</h1>' +
        '<div class="uc-clock" id="ucClock" aria-label="Aktuálny čas">--:--:--</div>' +
        '<p class="uc-sub">Web sa prerába. Staviam novú verziu.<br>Ozvať sa mi môžete stále:</p>' +
        '<div class="uc-actions">' +
          '<a class="uc-btn uc-btn--primary" href="mailto:' + MAIL + '?subject=Dopyt%20cez%20MRAZOSOFT">' + MAIL_SVG + 'Napísať mail</a>' +
          '<a class="uc-btn" href="' + GOOGLE + '" target="_blank" rel="noopener noreferrer">' + STAR_SVG + 'Recenzie na Google</a>' +
        '</div>' +
        '<div class="uc-meta">Peter Mráz · Poprad, Slovensko · <a href="mailto:' + MAIL + '">' + MAIL + '</a></div>' +
      '</div>';
    document.body.appendChild(o);

    // živé hodiny — nech obrazovka nevyzerá ako zamrznutý obrázok
    var el = document.getElementById("ucClock");
    function tick() {
      if (!el) return;
      var d = new Date();
      el.textContent = p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds());
    }
    tick();
    setInterval(tick, 1000);
  }

  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
