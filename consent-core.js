/* ════════════════════════════════════════════════════════════════════════
   Mrazosoft Consent — zdieľaný cookie consent core (CMP)
   ────────────────────────────────────────────────────────────────────────
   Framework-agnostic, bez závislostí. Funguje na statickom webe aj vo WP.
   Implementuje Google Consent Mode v2 (default „denied") + granulárny súhlas.

   Právny rámec: § 109 zák. 452/2021 Z. z. (SK ePrivacy), GDPR čl. 6/7,
   EDPB Guidelines 03/2022 (zákaz dark patterns → „Odmietnuť všetko" rovnako
   prominentné ako „Prijať všetko"), Consent Mode v2 (povinné v EHP od 03/2024).

   POUŽITIE:
   1) Do <head> čo najvyššie vlož inline „default denied" snippet (pozri README).
   2) Pred týmto súborom nastav window.__consentConfig = { ... } (pozri README).
   3) Načítaj consent.css + tento súbor.
   ════════════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var cfg = window.__consentConfig || {};
  var VERSION = cfg.version || 1;
  var EXPIRY_DAYS = cfg.expiryDays || 180;
  var STORAGE_KEY = "mz_consent_v" + VERSION;
  var COOKIE_NAME = "mz_consent";

  // Kategórie. necessary je vždy ON a nedá sa vypnúť.
  var CATEGORIES = ["necessary", "analytics", "preferences", "marketing"];

  // gtag stub — pre prípad, že inline default snippet v <head> chýba.
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  // ── Texty (dajú sa prebiť cez cfg.text) ─────────────────────────────────
  var T = Object.assign({
    title: "Súkromie a súbory cookie",
    intro:
      "Používame cookies, aby web fungoval správne, a — s vaším súhlasom — aj na " +
      "meranie návštevnosti a marketing, vďaka ktorým vám vieme zlepšovať služby a " +
      "ukazovať relevantnejší obsah. Súhlas môžete kedykoľvek zmeniť alebo odvolať.",
    policyText: "Viac v zásadách ochrany osobných údajov",
    acceptAll: "Prijať všetko",
    rejectAll: "Odmietnuť všetko",
    settings: "Nastavenia",
    save: "Uložiť voľbu",
    catTitles: {
      necessary: "Nevyhnutné",
      analytics: "Analytické",
      preferences: "Preferenčné",
      marketing: "Marketingové"
    },
    catDesc: {
      necessary:
        "Potrebné na základné fungovanie a bezpečnosť stránky (napr. voľba jazyka, " +
        "ochrana formulára, tento súhlas). Bez nich web nefunguje.",
      analytics:
        "Meranie návštevnosti a správania (Google Analytics, Microsoft Clarity) — " +
        "anonymizované štatistiky, ktoré nám pomáhajú zlepšovať web.",
      preferences:
        "Zapamätanie vašich nastavení a volieb pre pohodlnejšie používanie.",
      marketing:
        "Reklama a remarketing (Google Ads, Meta Pixel) — meranie konverzií a " +
        "zobrazovanie relevantnejších reklám. Môže zahŕňať automatizované profilovanie."
    },
    alwaysOn: "Vždy aktívne"
  }, cfg.text || {});

  // ── Stav súhlasu ────────────────────────────────────────────────────────
  function defaultState() {
    return { necessary: true, analytics: false, preferences: false, marketing: false };
  }

  function readStored() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || data.version !== VERSION) return null;
      // Expirácia.
      if (data.ts && (Date.now() - data.ts) > EXPIRY_DAYS * 864e5) return null;
      return data;
    } catch (e) { return null; }
  }

  function persist(state) {
    var record = { version: VERSION, ts: Date.now(), categories: state };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(record)); } catch (e) {}
    // First-party cookie pre server-side prehľad (bez citlivých údajov).
    try {
      var val = encodeURIComponent(JSON.stringify({ v: VERSION, c: state }));
      var maxAge = EXPIRY_DAYS * 86400;
      document.cookie = COOKIE_NAME + "=" + val + ";path=/;max-age=" + maxAge +
        ";SameSite=Lax" + (location.protocol === "https:" ? ";Secure" : "");
    } catch (e) {}
  }

  // ── Consent Mode v2 update ──────────────────────────────────────────────
  function pushConsentUpdate(state) {
    gtag("consent", "update", {
      analytics_storage:   state.analytics   ? "granted" : "denied",
      ad_storage:          state.marketing   ? "granted" : "denied",
      ad_user_data:        state.marketing   ? "granted" : "denied",
      ad_personalization:  state.marketing   ? "granted" : "denied",
      personalization_storage: state.preferences ? "granted" : "denied",
      functionality_storage: "granted",
      security_storage: "granted"
    });
  }

  // ── Načítanie nástrojov (len pre povolené kategórie) ────────────────────
  var loaded = {};
  function injectScript(src, attrs) {
    var s = document.createElement("script");
    s.async = true; s.src = src;
    if (attrs) Object.keys(attrs).forEach(function (k) { s.setAttribute(k, attrs[k]); });
    document.head.appendChild(s);
    return s;
  }
  function ensureGtagJs(anyId) {
    if (loaded.gtagjs) return;
    loaded.gtagjs = true;
    injectScript("https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(anyId));
    gtag("js", new Date());
  }

  function applyTools(state) {
    var tools = cfg.tools || {};

    // ── Analytické ──
    if (state.analytics) {
      if (tools.ga4 && tools.ga4.id && !loaded.ga4) {
        loaded.ga4 = true;
        ensureGtagJs(tools.ga4.id);
        gtag("config", tools.ga4.id, { anonymize_ip: true });
      }
      if (tools.clarity && tools.clarity.id && !loaded.clarity) {
        loaded.clarity = true;
        (function (c, l, a, r, i, t, y) {
          c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
          t = l.createElement(r); t.async = 1;
          t.src = "https://www.clarity.ms/tag/" + i;
          y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
        })(window, document, "clarity", "script", tools.clarity.id);
      }
    }

    // ── Marketingové ──
    if (state.marketing) {
      if (tools.googleAds && tools.googleAds.id && !loaded.googleAds) {
        loaded.googleAds = true;
        ensureGtagJs(tools.googleAds.id);
        gtag("config", tools.googleAds.id);
      }
      if (tools.metaPixel && tools.metaPixel.id && !loaded.metaPixel) {
        loaded.metaPixel = true;
        (function (f, b, e, v, n, t, s) {
          if (f.fbq) return; n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
          n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
          s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
        })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
        window.fbq("init", tools.metaPixel.id);
        window.fbq("track", "PageView");
      }
    }
  }

  // ── Lead / konverzie ────────────────────────────────────────────────────
  // Lead event (klik WhatsApp/tel/mail + odoslanie formulára) sa rozdvojí na:
  //   (a) first-party zber  → cfg.firstParty.sink   (gated na ANALYTICKÝ súhlas)
  //   (b) Google Ads konverzia → gtag('event','conversion') (gated na MARKETINGOVÝ súhlas)
  // Obe vetvy sú nezávislé: každá strieľa len ak jej kategória má súhlas.

  // (a) First-party zber. cfg.firstParty = { sink: function(evt){...} }
  var fp = { ready: false, pageviewSent: false };
  function fpSend(name, params) {
    var sink = cfg.firstParty && cfg.firstParty.sink;
    if (!sink || !fp.ready) return;
    var evt = { name: name, path: location.pathname, ref: document.referrer || "", ts: Date.now() };
    if (params) Object.keys(params).forEach(function (k) { evt[k] = params[k]; });
    try { sink(evt); } catch (e) {}
  }
  function fpEnable() {
    if (!(cfg.firstParty && cfg.firstParty.sink)) return;
    fp.ready = true;
    if (!fp.pageviewSent) { fp.pageviewSent = true; fpSend("pageview"); }
  }

  // (b) Google Ads konverzia.
  // cfg.tools.googleAds.conversions = { lead_form:'LABEL', lead_whatsapp:'LABEL', ... }
  // send_to = 'AW-XXXX/LABEL'. Bez labelu pre daný event = no-op.
  var marketingOn = false;
  function adsConvert(name) {
    var ga = cfg.tools && cfg.tools.googleAds;
    if (!marketingOn || !ga || !ga.id || !loaded.googleAds) return;
    var label = (ga.conversions || {})[name];
    if (!label) return;
    try { gtag("event", "conversion", { send_to: ga.id + "/" + label }); } catch (e) {}
  }

  // Spoločná routa: lead event → first-party + Google Ads.
  function emitLead(name, params) {
    fpSend(name, params);
    adsConvert(name);
  }

  // Listenery sa naviažu raz pri inite (nezávisle od súhlasu); samotné vetvy
  // si súhlas kontrolujú samy, takže žiadne dáta neuniknú pred udelením súhlasu.
  var leadListeners = false;
  function attachLeadListeners() {
    if (leadListeners) return;
    leadListeners = true;
    document.addEventListener("click", function (e) {
      var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (/^https?:\/\/(wa\.me|api\.whatsapp\.com)/i.test(href)) emitLead("lead_whatsapp");
      else if (/^tel:/i.test(href)) emitLead("lead_call");
      else if (/^mailto:/i.test(href)) emitLead("lead_email");
    }, true);
    document.addEventListener("submit", function (e) {
      var f = e.target;
      if (f && f.tagName === "FORM" && !f.classList.contains("mzc-no-track")) {
        emitLead("lead_form", { form: f.getAttribute("name") || f.id || "" });
      }
    }, true);
  }

  function apply(state, opts) {
    pushConsentUpdate(state);
    applyTools(state);
    marketingOn = !!state.marketing;
    if (state.analytics) fpEnable();
    try {
      window.dispatchEvent(new CustomEvent("consentchanged", { detail: state }));
    } catch (e) {}
    if (opts && opts.persist) persist(state);
  }

  // ── UI ──────────────────────────────────────────────────────────────────
  var root = null;
  var current = defaultState();

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function buildCategoryRow(cat, checked, locked) {
    var row = el("div", "mzc-cat");
    var head = el("div", "mzc-cat-head");
    var label = el("label", "mzc-cat-label");
    var sw = el("span", "mzc-switch" + (locked ? " is-locked" : ""));
    var input = document.createElement("input");
    input.type = "checkbox";
    input.checked = locked ? true : checked;
    input.disabled = !!locked;
    input.setAttribute("data-cat", cat);
    var knob = el("span", "mzc-knob");
    sw.appendChild(input); sw.appendChild(knob);
    var title = el("span", "mzc-cat-title", T.catTitles[cat]);
    label.appendChild(sw); label.appendChild(title);
    head.appendChild(label);
    head.appendChild(el("span", "mzc-cat-tag", locked ? T.alwaysOn : ""));
    var desc = el("p", "mzc-cat-desc", T.catDesc[cat]);
    row.appendChild(head); row.appendChild(desc);
    return row;
  }

  function build() {
    if (root) return root;
    root = el("div", "mzc" + (cfg.theme === "dark" ? " mzc-dark" : ""));
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", T.title);

    var policyLink = cfg.policyUrl
      ? ' <a class="mzc-policy" href="' + cfg.policyUrl + '">' + T.policyText + "</a>."
      : "";

    var box = el("div", "mzc-box", "");
    box.innerHTML =
      '<div class="mzc-head">' +
        '<p class="mzc-title" role="heading" aria-level="2">' + T.title + "</p>" +
        '<p class="mzc-intro">' + T.intro + policyLink + "</p>" +
      "</div>" +
      '<div class="mzc-cats" id="mzcCats"></div>' +
      '<div class="mzc-actions">' +
        '<button type="button" class="mzc-btn mzc-btn-ghost" data-act="reject">' + T.rejectAll + "</button>" +
        '<button type="button" class="mzc-btn mzc-btn-ghost mzc-btn-settings" data-act="settings">' + T.settings + "</button>" +
        '<button type="button" class="mzc-btn mzc-btn-save" data-act="save" hidden>' + T.save + "</button>" +
        '<button type="button" class="mzc-btn mzc-btn-primary" data-act="accept">' + T.acceptAll + "</button>" +
      "</div>";

    root.appendChild(box);
    document.body.appendChild(root);

    // Naplň kategórie.
    var cats = box.querySelector("#mzcCats");
    cats.appendChild(buildCategoryRow("necessary", true, true));
    cats.appendChild(buildCategoryRow("analytics", current.analytics, false));
    cats.appendChild(buildCategoryRow("preferences", current.preferences, false));
    cats.appendChild(buildCategoryRow("marketing", current.marketing, false));

    // Akcie.
    box.querySelector('[data-act="accept"]').addEventListener("click", function () {
      finish({ necessary: true, analytics: true, preferences: true, marketing: true });
    });
    box.querySelector('[data-act="reject"]').addEventListener("click", function () {
      finish(defaultState());
    });
    box.querySelector('[data-act="settings"]').addEventListener("click", function () {
      root.classList.toggle("mzc-expanded");
      box.querySelector('[data-act="save"]').hidden = !root.classList.contains("mzc-expanded");
    });
    box.querySelector('[data-act="save"]').addEventListener("click", function () {
      var state = defaultState();
      cats.querySelectorAll('input[data-cat]').forEach(function (i) {
        state[i.getAttribute("data-cat")] = i.checked;
      });
      state.necessary = true;
      finish(state);
    });

    // Klik mimo karty zatvorí (len ak už súhlas existuje).
    root.addEventListener("click", function (e) {
      if (e.target === root && readStored()) hide();
    });
    return root;
  }

  function syncSwitches(state) {
    if (!root) return;
    root.querySelectorAll('input[data-cat]').forEach(function (i) {
      var c = i.getAttribute("data-cat");
      if (c !== "necessary") i.checked = !!state[c];
    });
  }

  function show(expanded) {
    current = readStored() ? readStored().categories : defaultState();
    var node = build();
    syncSwitches(current);
    if (expanded) {
      node.classList.add("mzc-expanded");
      node.querySelector('[data-act="save"]').hidden = false;
    }
    requestAnimationFrame(function () { node.classList.add("mzc-show"); });
  }
  function hide() { if (root) root.classList.remove("mzc-show"); }

  function finish(state) {
    current = state;
    apply(state, { persist: true });
    hide();
  }

  // ── Public API ──────────────────────────────────────────────────────────
  window.openCookieSettings = function () { show(true); };
  window.__consent = {
    get: function () { var s = readStored(); return s ? s.categories : null; },
    set: finish,
    reopen: function () { show(true); },
    track: function (name, params) { emitLead(name, params); }  // manuálna konverzia (first-party + Ads, každá gated na súhlas)
  };

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    attachLeadListeners();
    // Advanced Consent Mode: Google tag načítaj hneď (consent default = denied),
    // aby ho Google detegoval a fungovali modelované (cookieless) konverzie.
    // Žiadne cookies/PII pred súhlasom; konverzie ostávajú gated cez marketingOn.
    var ga0 = cfg.tools && cfg.tools.googleAds;
    if (ga0 && ga0.id && ga0.advancedConsent && !loaded.googleAds) {
      loaded.googleAds = true;
      ensureGtagJs(ga0.id);
      gtag("config", ga0.id);
    }
    var stored = readStored();
    if (stored) {
      // Súhlas existuje → aplikuj bez zobrazenia banneru.
      apply(stored.categories, { persist: false });
    } else {
      // Prvá návšteva / vypršané → zobraz banner (default = všetko denied).
      apply(defaultState(), { persist: false });
      show(false);
    }
    // Footer odkaz „Nastavenia cookies".
    document.querySelectorAll(".js-cookie-settings").forEach(function (btn) {
      btn.addEventListener("click", function (e) { e.preventDefault(); show(true); });
    });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();
