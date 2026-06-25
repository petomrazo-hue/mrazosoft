/* ░░ Cookie lišta — honest, bez trackingu ░░
   Web používa len nevyhnutné lokálne úložisko (voľba jazyka, súhlas).
   Žiadne analytické ani marketingové cookies sa nenačítavajú.
   Súhlas sa pamätá v localStorage, takže lišta sa pri prvej návšteve zobrazí raz;
   neskôr sa dá kedykoľvek znova otvoriť odkazom „Nastavenia cookies" v pätičke. */
(function () {
  "use strict";
  var KEY = "cookie-consent-v1";
  var el = null;

  function hasConsent() { try { return !!localStorage.getItem(KEY); } catch (e) { return true; } }
  function save() { try { localStorage.setItem(KEY, new Date().toISOString()); } catch (e) {} }

  function build() {
    if (el) return el;
    el = document.createElement("div");
    el.className = "cookie";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-modal", "true");
    el.setAttribute("aria-label", "Cookies a súkromie");
    el.innerHTML =
      '<div class="cookie-box" role="document">' +
        "<h4>Cookies a súkromie</h4>" +
        "<p>Tento web používa len <strong>nevyhnutné</strong> lokálne úložisko (napr. voľba jazyka a tento súhlas). " +
        "<strong>Analytické ani marketingové cookies nepoužívame</strong> — nič ťa tu nesleduje. " +
        '<a href="zasady.html">Viac o spracovaní údajov</a>.</p>' +
        '<div class="cookie-cats" id="cookieCats">' +
          '<div class="cookie-cat"><div><strong>Nevyhnutné</strong><span>Voľba jazyka, súhlas — web bez nich nefunguje.</span></div><span class="cookie-tag">Vždy aktívne</span></div>' +
          '<div class="cookie-cat"><div><strong>Analytické</strong><span>Meranie návštevnosti.</span></div><span class="cookie-tag">Nevyužívame</span></div>' +
          '<div class="cookie-cat"><div><strong>Marketingové</strong><span>Reklama a remarketing.</span></div><span class="cookie-tag">Nevyužívame</span></div>' +
        "</div>" +
        '<div class="cookie-actions">' +
          '<button class="cookie-btn" id="cookieOk" type="button">Rozumiem</button>' +
          '<button class="cookie-link" id="cookieToggle" type="button">Nastavenia</button>' +
        "</div>" +
      "</div>";
    document.body.appendChild(el);

    el.querySelector("#cookieOk").addEventListener("click", function () {
      save(); hide();
    });
    el.querySelector("#cookieToggle").addEventListener("click", function () {
      el.querySelector("#cookieCats").classList.toggle("open");
    });
    // klik mimo karty (na stmavené pozadie) zavrie okno
    el.addEventListener("click", function (e) { if (e.target === el) hide(); });
    return el;
  }

  function show() {
    var node = build();
    requestAnimationFrame(function () { node.classList.add("show"); });
  }
  function hide() { if (el) el.classList.remove("show"); }

  // verejné API — odkaz „Nastavenia cookies" v pätičke
  window.openCookieSettings = show;

  function init() {
    if (!hasConsent()) show();
    document.querySelectorAll(".js-cookie-settings").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); show(); });
    });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
