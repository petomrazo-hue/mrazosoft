/* ░░ Cookie lišta — honest, bez trackingu ░░
   Web používa len nevyhnutné lokálne úložisko (voľba jazyka, súhlas).
   Žiadne analytické ani marketingové cookies sa nenačítavajú.
   Súhlas sa pamätá v localStorage, takže lišta sa zobrazí len raz. */
(function () {
  "use strict";
  var KEY = "cookie-consent-v1";
  try { if (localStorage.getItem(KEY)) return; } catch (e) { return; }

  function save() { try { localStorage.setItem(KEY, new Date().toISOString()); } catch (e) {} }

  function build() {
    var el = document.createElement("div");
    el.className = "cookie";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", "Cookies a súkromie");
    el.innerHTML =
      "<h4>Cookies a súkromie</h4>" +
      "<p>Tento web používa len <strong>nevyhnutné</strong> lokálne úložisko (napr. voľba jazyka a tento súhlas). " +
      "<strong>Analytické ani marketingové cookies nepoužívame</strong> — nič ťa tu nesleduje.</p>" +
      '<div class="cookie-cats" id="cookieCats">' +
        '<div class="cookie-cat"><div><strong>Nevyhnutné</strong><span>Voľba jazyka, súhlas — web bez nich nefunguje.</span></div><span class="cookie-tag">Vždy aktívne</span></div>' +
        '<div class="cookie-cat"><div><strong>Analytické</strong><span>Meranie návštevnosti.</span></div><span class="cookie-tag">Nevyužívame</span></div>' +
        '<div class="cookie-cat"><div><strong>Marketingové</strong><span>Reklama a remarketing.</span></div><span class="cookie-tag">Nevyužívame</span></div>' +
      "</div>" +
      '<div class="cookie-actions">' +
        '<button class="cookie-btn" id="cookieOk" type="button">Rozumiem</button>' +
        '<button class="cookie-link" id="cookieToggle" type="button">Nastavenia</button>' +
      "</div>";
    document.body.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("show"); });

    el.querySelector("#cookieOk").addEventListener("click", function () {
      save(); el.classList.remove("show");
      setTimeout(function () { el.remove(); }, 300);
    });
    el.querySelector("#cookieToggle").addEventListener("click", function () {
      el.querySelector("#cookieCats").classList.toggle("open");
    });
  }

  if (document.readyState !== "loading") build();
  else document.addEventListener("DOMContentLoaded", build);
})();
