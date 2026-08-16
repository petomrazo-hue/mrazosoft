/* ░░ Cookie consent — config shim pre mrazosoft.sk ░░
   Zdieľané jadro CMP je v consent-core.js (zhodné s harmonyhome.sk;
   kanonický zdroj: LAB/001projects/cookie-consent/).
   Tu nastavíme len Google Consent Mode v2 default + konfiguráciu nástrojov,
   a potom dotiahneme jadro. */
(function () {
  "use strict";
  if (window.__UC__) return;   // vo výstavbe → nemeriame, teda ani lišta súhlasu

  // ── Google Consent Mode v2 — default „denied" (pred akýmkoľvek tagom) ──
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", personalization_storage: "denied",
    functionality_storage: "granted", security_storage: "granted",
    wait_for_update: 500
  });
  gtag("js", new Date());

  // ── Konfigurácia ──
  window.__consentConfig = {
    version: 1,
    expiryDays: 180,
    theme: "dark",
    policyUrl: "/zasady#cookies",
    text: {
      intro:
        "Tento web používa cookies, aby fungoval správne, a — s tvojím súhlasom — aj " +
        "na meranie návštevnosti a marketing, vďaka ktorým ti vieme zlepšovať obsah a " +
        "ukazovať relevantnejšie reklamy. Súhlas vieš kedykoľvek zmeniť alebo odvolať."
    },
    tools: {
      /* ── ZAPNUTIE MERANIA — JEDINÉ dve miesta, kde treba niečo doplniť ──
         Postup krok za krokom (kde kliknúť, čo skopírovať): ZAPNUT-MERANIE.md
         v koreni projektu. Nič iné meniť netreba — consent-core.js oba nástroje
         načíta SÁM a VÝHRADNE po analytickom súhlase návštevníka.
         Po doplnení: bump `cookies.js?v=` vo všetkých HTML + /ship mrazosoft. */
      ga4:       { id: "",                 category: "analytics" },  /* G-XXXXXXXXXX — GA4 → Správca → Dátové streamy */
      clarity:   { id: "",                 category: "analytics" },  /* 10-znakový kód projektu z clarity.microsoft.com */
      googleAds: {
        id: "AW-18272862336",             // mrazosoft Google Ads (účet 950-659-3315)
        category: "marketing",
        advancedConsent: false,           // gtag sa NESŤAHUJE pred marketingovým súhlasom (basic consent mode)
        // Konverzná akcia „MRAZOSOFT – Kontakt" (Kontakt, Hlavná, Jedna/klik).
        // Každý lead event → tá istá konverzia (klik WhatsApp/tel/mail + odoslanie formulára).
        conversions: {
          lead_form:     "VQ78CPP30sUcEICBl4lE",
          lead_whatsapp: "VQ78CPP30sUcEICBl4lE",
          lead_call:     "VQ78CPP30sUcEICBl4lE",
          lead_email:    "VQ78CPP30sUcEICBl4lE"
        }
      },
      metaPixel: { id: "",                 category: "marketing" }   /* Meta Pixel id */
    },
    // First-party zber → Firebase RTDB cez REST (bez SDK, len po analytickom súhlase).
    // Reuse existujúcej DB (tajny-dc6d6). Dashboard: data.html.
    firstParty: {
      sink: function (evt) {
        var DB = "https://tajny-dc6d6-default-rtdb.europe-west1.firebasedatabase.app";
        var day = new Date().toISOString().slice(0, 10);
        var rec = { n: evt.name, p: evt.path, r: evt.ref ? evt.ref.slice(0, 500) : "", t: evt.ts };
        if (evt.form) rec.form = String(evt.form).slice(0, 78);
        try {
          fetch(DB + "/analytics/mrazosoft/" + day + ".json", {
            method: "POST", keepalive: true,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(rec)
          });
        } catch (e) {}
      }
    }
  };

  // ── Dotiahni zdieľané jadro ──
  // Cesta sa počíta z URL TOHTO skriptu, nie z URL stránky. Relatívne
  // "consent-core.js" sa v podpriečinku vyhodnotí voči nemu — na /en/ tak
  // vznikalo /en/consent-core.js → 404 a súhlas s cookies sa vôbec nenačítal
  // (nájdené 13. 8. 2026 pri overovaní naživo, týkalo sa všetkých 5 EN stránok).
  var self = document.currentScript;
  if (!self) {
    var vsetky = document.getElementsByTagName("script");
    for (var i = vsetky.length - 1; i >= 0; i--) {
      if (/cookies\.js(\?|$)/.test(vsetky[i].src || "")) { self = vsetky[i]; break; }
    }
  }
  var zaklad = self && self.src ? self.src.replace(/cookies\.js(\?.*)?$/, "") : "";
  var s = document.createElement("script");
  s.src = zaklad + "consent-core.js?v=4";
  s.defer = true;
  document.head.appendChild(s);
})();
