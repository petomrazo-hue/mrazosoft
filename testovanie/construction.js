/* ░░ UNDER CONSTRUCTION — odpočet do spustenia (auto-odomknutie) ░░
   Overlay sa zobrazuje, kým nenastane LAUNCH; v ten čas sa web SÁM odomkne (reload).
   Po spustení netreba nič nasadzovať — gate je časový. */
(function () {
  "use strict";
  // bypass na lokálnom / LAN serveri (vývoj + hranie bez čakacej obrazovky)
  var H = location.hostname;
  if (H === "" || /^(localhost$|127\.|10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(H) || /\.local$/.test(H)) return;
  var LAUNCH = new Date("2026-06-25T16:30:00+02:00").getTime(); // 16:30 CEST
  if (Date.now() >= LAUNCH) return;            // už spustené → normálny web

  window.__UC__ = true;                        // poistka pre app.js (nespúšťať splash/init)
  document.documentElement.classList.add("uc-on");

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

  function p2(n) { return (n < 10 ? "0" : "") + n; }

  function build() {
    if (document.getElementById("uc")) return;
    var o = document.createElement("div");
    o.id = "uc";
    o.setAttribute("role", "status");
    o.setAttribute("aria-label", "Web sa spúšťa o 16:30");
    o.innerHTML =
      '<div class="uc-grid" aria-hidden="true"></div>' +
      '<div class="uc-scan" aria-hidden="true"></div>' +
      '<div class="uc-stage">' +
        '<div class="uc-brand">' + FLAKE + '<span class="uc-brand-name">MRAZO<span>SOFT</span></span></div>' +
        '<div class="uc-title" data-text="VO VÝSTAVBE">VO VÝSTAVBE</div>' +
        '<div class="uc-sub">Robíme posledné úpravy. Nový web spúšťame dnes.</div>' +
        '<div class="uc-count" id="ucCount">--:--</div>' +
        '<div class="uc-bar"><span class="uc-bar-fill"></span></div>' +
        '<div class="uc-pct">Spustenie o 16:30</div>' +
      '</div>';
    document.body.appendChild(o);

    var el = document.getElementById("ucCount");
    (function tick() {
      var rem = LAUNCH - Date.now();
      if (rem <= 0) {
        el.textContent = "00:00";
        setTimeout(function () { location.reload(); }, 500);
        return;
      }
      var s = Math.floor(rem / 1000);
      var h = Math.floor(s / 3600); s -= h * 3600;
      var m = Math.floor(s / 60); s -= m * 60;
      el.textContent = (h > 0 ? p2(h) + ":" : "") + p2(m) + ":" + p2(s);
      setTimeout(tick, 1000);
    })();
  }

  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
