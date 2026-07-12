/* ░░ Cookie consent — config shim pre mrazosoft.sk ░░
   Zdieľané jadro CMP je v consent-core.js (zhodné s harmonyhome.sk;
   kanonický zdroj: LAB/001projects/cookie-consent/).
   Tu nastavíme len Google Consent Mode v2 default + konfiguráciu nástrojov,
   a potom dotiahneme jadro. */
(function () {
  "use strict";

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
    policyUrl: "zasady.html#cookies",
    text: {
      intro:
        "Tento web používa cookies, aby fungoval správne, a — s tvojím súhlasom — aj " +
        "na meranie návštevnosti a marketing, vďaka ktorým ti vieme zlepšovať obsah a " +
        "ukazovať relevantnejšie reklamy. Súhlas vieš kedykoľvek zmeniť alebo odvolať."
    },
    tools: {
      ga4:       { id: "",                 category: "analytics" },  /* G-XXXXXXXXXX */
      clarity:   { id: "",                 category: "analytics" },  /* Clarity project id */
      googleAds: {
        id: "AW-18272862336",             // mrazosoft Google Ads (účet 950-659-3315)
        category: "marketing",
        advancedConsent: true,            // Advanced Consent Mode: tag sa načíta hneď (consent default denied) → Google ho deteguje
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
    // VYPNUTÉ pri go-live 11.7.2026 (GOLIVE bod 14): RTDB pravidlá tajny-dc6d6
    // odmietali zápis (401 v konzole), dáta sa nikdy nezapisovali. Pre opätovné
    // zapnutie najprv povoliť zápis do /analytics/mrazosoft v pravidlách DB.
    firstParty: {
      sink: function () {}
    }
  };

  // ── Dotiahni zdieľané jadro ──
  var s = document.createElement("script");
  s.src = "consent-core.js?v=4";
  s.defer = true;
  document.head.appendChild(s);
})();
