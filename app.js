/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   MRAZOSOFT — app.js (v2 "wow")
   i18n SK/EN, frost častice, rotátor, count-up, tilt,
   magnetické tlačidlá, scroll progress. Žiadne závislosti.
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  /* ── Prekladový slovník ───────────────────────────────── */
  var rotateWords = {
    sk: ["weby", "appky", "e-shopy", "PWA", "nástroje"],
    en: ["websites", "apps", "e-shops", "PWAs", "tools"]
  };

  var i18n = {
    sk: {
      "nav.services": "Služby", "nav.projects": "Projekty", "nav.process": "Ako to funguje", "nav.contact": "Kontakt", "nav.cta": "Nezáväzná ponuka", "nav.status": "Voľné kapacity", "splash.skip": "kliknite pre preskočenie",
      "hero.badge": "Peto Mráz · vývojár z Popradu — otvorené pre nové projekty",
      "hero.lead": "Tvorím", "hero.rest": "ktoré naozaj fungujú.",
      "hero.sub": "Od nápadu po nasadenie. Navrhnem aj naprogramujem web, appku či e-shop, ktorý vyzerá draho, načítava sa bleskovo a robí presne to, čo vaši zákazníci potrebujú.",
      "hero.cta1": "Pozrite si projekty", "hero.cta2": "Poďme do toho",
      "hero.stat1": "nasadených projektov", "hero.stat2": "vlastný, čistý kód", "hero.stat3": "priemerná odozva",
      "services.eyebrow": "Čo pre vás spravím", "services.title": "Služby", "services.sub": "Celý vývoj pod jednou strechou — od prvého skicu po živý web.",
      "services.web.t": "Webové stránky", "services.web.d": "Rýchle, moderné a responzívne weby — prezentačné stránky, landing pages aj firemné weby, ktoré predávajú.",
      "services.apps.t": "Webové & mobilné appky", "services.apps.d": "PWA a Android aplikácie, ktoré fungujú aj offline a inštalujú sa ako natívne — bez app store byrokracie.",
      "services.ecom.t": "E-shopy & e-commerce", "services.ecom.d": "PrestaShop moduly, témy a integrácie — napojenie na ERP, feedy, Heureka aj automatizácia produktov.",
      "services.tools.t": "Automatizácia & AI", "services.tools.d": "Python nástroje, scraping, reporty a AI integrácie, ktoré ušetria hodiny rutinnej práce každý týždeň.",
      "services.from": "už od", "services.price": "Cena na vyžiadanie", "services.guarantee": "Pevná cena dohodnutá vopred — žiadne prekvapenia. Nezáväznú ponuku pošlem do 24 hodín.",
      "projects.eyebrow": "Moja tvorba", "projects.title": "Projekty, ktoré žijú naživo", "projects.sub": "Žiadne mockupy z fotobanky — toto sú reálne nasadené produkty, ktoré práve teraz niekomu slúžia.",
      "proj.rytmiko.d": "PWA edukačná hra pre deti s Downovým syndrómom — sedem hier na vzory, počítanie a zvuky, slovenské neurónové hlasy a maskot Zajko. Funguje offline a inštaluje sa do telefónu.",
      "proj.harmony.d": "Web pre upratovaciu službu z Popradu — „víkendy sú na oddych\". Kompletný dizajn, copywriting, SEO a napojenie objednávok na WhatsApp. Stránka, ktorá premieňa návštevníkov na klientov.",
      "proj.esol.d": "Kompletný e-shop na PrestaShope pre esol.sk — stovky produktov, automatické napojenie na Oberon ERP a generovanie reklamných letákov pre Facebook a Instagram. Menej ručnej roboty, viac priestoru na predaj.",
      "proj.fleet.d": "PWA a Android appka na správu vozidiel — STK, emisie, diaľničná známka a servis s farebným semaforom, ktorý vás upozorní skôr, než vyprší termín.",
      "proj.heureka.d": "Python nástroj na opravu nesparovaných produktov pre Heureka.sk — spracuje XML feed a vyexportuje CSV pre PrestaShop Store Manager. Z hodín ručnej práce sú sekundy.",
      "proj.view": "Otvoriť naživo", "proj.private": "Na vyžiadanie", "proj.demo": "Ukážka", "status.live": "Live", "status.dev": "Vo vývoji",
      "process.eyebrow": "Spolupráca", "process.title": "Ako to funguje", "process.sub": "Jednoducho, transparentne a bez stresu. Štyri kroky od nápadu k hotovému produktu.",
      "process.s1.t": "Nápad & konzultácia", "process.s1.d": "Vypočujem si, čo potrebujete, a poradím najlepšie riešenie. Nezáväzne a zrozumiteľne.",
      "process.s2.t": "Návrh & dizajn", "process.s2.d": "Pripravím vizuál a štruktúru. Uvidíte, ako bude výsledok vyzerať, ešte pred programovaním.",
      "process.s3.t": "Vývoj", "process.s3.d": "Naprogramujem to vlastnými rukami — čisto, rýchlo a s dôrazom na detail.",
      "process.s4.t": "Nasadenie & podpora", "process.s4.d": "Spustím to naživo, odovzdám a som tu, keď budete potrebovať úpravy.",
      "about.eyebrow": "O mne", "about.title": "Jeden človek. Celý projekt v jedných rukách.",
      "about.p1": "MRAZOSOFT je tvorba Peta Mráza — od dizajnu cez kód až po nasadenie. Žiadne zbytočné medzičlánky, žiadne preplatené šablóny. Píšem vlastný, čistý kód a stojím si za výsledkom.",
      "about.p2": "Komunikujete priamo s tým, kto to programuje. To znamená rýchle rozhodnutia, férové ceny a produkt, ktorý naozaj robí, čo má.",
      "about.f1.t": "Blesková rýchlosť", "about.f1.d": "Stránky a appky optimalizované na výkon a Google.",
      "about.f2.t": "Vlastný kód", "about.f2.d": "Bez ťažkých frameworkov tam, kde nie sú potrebné.",
      "about.f3.t": "Osobný prístup", "about.f3.d": "Komunikujete priamo s autorom, nie s callcentrom.",
      "contact.eyebrow": "Poďme sa rozprávať", "contact.title": "Máte nápad? Premením ho na web alebo appku, ktorá predáva.",
      "contact.text": "Napíšte mi pár riadkov o tom, čo potrebujete — ozvem sa do 24 hodín s návrhom riešenia a cenou. Nezáväzne.",
      "contact.cta": "Napíšte mi e-mail", "contact.or": "alebo rovno",
      "form.name": "Vaše meno", "form.contact": "E-mail alebo telefón", "form.msg": "Čo potrebujete? Pár riadkov stačí.",
      "form.send": "Odoslať dopyt", "form.sending": "Odosielam…", "form.ok": "Ďakujem! Ozvem sa do 24 hodín.", "form.err": "Niečo sa pokazilo — skúste to znova alebo napíšte e-mail.",
      "trust.1": "✓ Pevná cena vopred", "trust.2": "✓ Odpoveď do 24 hodín", "trust.3": "✓ Kód je váš", "trust.4": "✓ Bez záväzkov",
      "footer.tagline": "Weby a aplikácie na mieru. ❄"
    },
    en: {
      "nav.services": "Services", "nav.projects": "Projects", "nav.process": "How it works", "nav.contact": "Contact", "nav.cta": "Get a quote", "nav.status": "Open for work", "splash.skip": "click to skip",
      "hero.badge": "Peto Mráz · developer from Poprad — open for new projects",
      "hero.lead": "I build", "hero.rest": "and they actually work.",
      "hero.sub": "From idea to deployment. I design and code the website, app or store — one that looks expensive, loads in a flash and does exactly what your customers need.",
      "hero.cta1": "See the projects", "hero.cta2": "Let's do this",
      "hero.stat1": "shipped projects", "hero.stat2": "own, clean code", "hero.stat3": "average response",
      "services.eyebrow": "What I'll build for you", "services.title": "Services", "services.sub": "The whole build under one roof — from the first sketch to a live site.",
      "services.web.t": "Websites", "services.web.d": "Fast, modern and responsive sites — presentation pages, landing pages and company websites that sell.",
      "services.apps.t": "Web & mobile apps", "services.apps.d": "PWAs and Android apps that work offline and install like native ones — no app-store bureaucracy.",
      "services.ecom.t": "E-shops & e-commerce", "services.ecom.d": "PrestaShop modules, themes and integrations — ERP and feed connections, Heureka and product automation.",
      "services.tools.t": "Automation & AI", "services.tools.d": "Python tools, scraping, reports and AI integrations that save hours of routine work every week.",
      "services.from": "from", "services.price": "Price on request", "services.guarantee": "Fixed price agreed up front — no surprises. I'll send a no-commitment quote within 24 hours.",
      "projects.eyebrow": "My work", "projects.title": "Projects that live in the wild", "projects.sub": "No stock mockups — these are real, deployed products serving someone right now.",
      "proj.rytmiko.d": "A PWA educational game for children with Down syndrome — seven games for patterns, counting and sounds, Slovak neural voices and the mascot Zajko. Works offline and installs to the phone.",
      "proj.harmony.d": "Website for a cleaning service from Poprad — \"weekends are for rest\". Full design, copywriting, SEO and WhatsApp order integration. A site that turns visitors into clients.",
      "proj.esol.d": "A complete PrestaShop store for esol.sk — hundreds of products, automatic Oberon ERP sync and auto-generated ad flyers for Facebook and Instagram. Less manual work, more time to sell.",
      "proj.fleet.d": "A PWA and Android app for fleet management — inspections, emissions, vignette and service with a colour traffic-light that warns you before a deadline expires.",
      "proj.heureka.d": "A Python tool to fix unmatched products for Heureka.sk — it processes the XML feed and exports CSV for PrestaShop Store Manager. Hours of manual work become seconds.",
      "proj.view": "Open live", "proj.private": "On request", "proj.demo": "Demo", "status.live": "Live", "status.dev": "In development",
      "process.eyebrow": "Working together", "process.title": "How it works", "process.sub": "Simple, transparent and stress-free. Four steps from idea to finished product.",
      "process.s1.t": "Idea & consultation", "process.s1.d": "I listen to what you need and advise the best solution. No commitment, plain language.",
      "process.s2.t": "Design & concept", "process.s2.d": "I prepare the visuals and structure. You see how it'll look before any coding.",
      "process.s3.t": "Development", "process.s3.d": "I build it with my own hands — clean, fast and with attention to detail.",
      "process.s4.t": "Launch & support", "process.s4.d": "I ship it live, hand it over and I'm here whenever you need changes.",
      "about.eyebrow": "About", "about.title": "One person. The whole project in one pair of hands.",
      "about.p1": "MRAZOSOFT is the work of Peto Mráz — from design through code to deployment. No needless middlemen, no overpriced templates. I write my own clean code and stand behind the result.",
      "about.p2": "You talk directly to the person who codes it. That means fast decisions, fair prices and a product that truly does its job.",
      "about.f1.t": "Blazing speed", "about.f1.d": "Sites and apps optimised for performance and Google.",
      "about.f2.t": "Own code", "about.f2.d": "No heavy frameworks where they aren't needed.",
      "about.f3.t": "Personal approach", "about.f3.d": "You talk directly to the author, not a call centre.",
      "contact.eyebrow": "Let's talk", "contact.title": "Got an idea? I'll turn it into a website or app that sells.",
      "contact.text": "Drop me a few lines about what you need — I'll get back within 24 hours with a proposed solution and a price. No commitment.",
      "contact.cta": "Email me", "contact.or": "or just",
      "form.name": "Your name", "form.contact": "E-mail or phone", "form.msg": "What do you need? A few lines is enough.",
      "form.send": "Send enquiry", "form.sending": "Sending…", "form.ok": "Thanks! I'll get back within 24 hours.", "form.err": "Something went wrong — try again or email me.",
      "trust.1": "✓ Fixed price up front", "trust.2": "✓ Reply within 24 h", "trust.3": "✓ The code is yours", "trust.4": "✓ No commitment",
      "footer.tagline": "Custom websites and applications. ❄"
    }
  };

  var STORAGE_KEY = "mrazosoft-lang";
  var currentLang = "sk";

  function applyLang(lang) {
    var dict = i18n[lang] || i18n.sk;
    currentLang = lang;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      var key = el.getAttribute("data-i18n-ph");
      if (dict[key] != null) el.placeholder = dict[key];
    });
    document.documentElement.lang = lang;
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    restartRotator();
  }

  function initLang() {
    var lang = "sk";
    try { var s = localStorage.getItem(STORAGE_KEY); if (s === "sk" || s === "en") lang = s; } catch (e) {}
    applyLang(lang);
    document.querySelectorAll(".lang-switch button").forEach(function (btn) {
      btn.addEventListener("click", function () { applyLang(btn.getAttribute("data-lang")); });
    });
  }

  /* ── Rotujúce slovo v nadpise ─────────────────────────── */
  var rotTimer = null, rotIdx = 0;
  function restartRotator() {
    var el = document.querySelector(".rotator-word");
    if (!el) return;
    if (rotTimer) clearInterval(rotTimer);
    var words = rotateWords[currentLang] || rotateWords.sk;
    rotIdx = 0;
    el.textContent = words[0];
    if (reduceMotion) return;
    rotTimer = setInterval(function () {
      rotIdx = (rotIdx + 1) % words.length;
      el.textContent = words[rotIdx];
      el.style.animation = "none";
      void el.offsetWidth;
      el.style.animation = "";
    }, 2200);
  }

  /* ── Scroll progress + nav stav ───────────────────────── */
  function initScroll() {
    var bar = document.querySelector(".scroll-progress");
    var nav = document.getElementById("nav");
    function onScroll() {
      var st = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
      if (nav) nav.classList.toggle("scrolled", st > 20);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ── Scroll-reveal + count-up ─────────────────────────── */
  function countUp(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1400;
    function frame(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function initReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in"); });
      document.querySelectorAll("[data-count]").forEach(countUp);
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          entry.target.querySelectorAll && entry.target.querySelectorAll("[data-count]").forEach(countUp);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    items.forEach(function (el) { obs.observe(el); });
  }

  /* ── 3D tilt ──────────────────────────────────────────── */
  function initTilt() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll(".tilt").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(900px) rotateX(" + (-py * 7).toFixed(2) + "deg) rotateY(" + (px * 9).toFixed(2) + "deg) translateY(-4px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ── Magnetické tlačidlá ──────────────────────────────── */
  function initMagnetic() {
    if (isTouch || reduceMotion) return;
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = e.clientX - r.left - r.width / 2;
        var y = e.clientY - r.top - r.height / 2;
        el.style.transform = "translate(" + (x * 0.25).toFixed(1) + "px," + (y * 0.35).toFixed(1) + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ── Frost častice (canvas) ───────────────────────────── */
  function initSnow() {
    var canvas = document.querySelector(".snow");
    if (!canvas || reduceMotion) return;
    var ctx = canvas.getContext("2d");
    var flakes = [], W, H, raf;
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make() {
      var count = Math.min(70, Math.floor(W / 16));
      flakes = [];
      for (var i = 0; i < count; i++) {
        flakes.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + 0.6, s: Math.random() * 0.5 + 0.2, d: Math.random() * 0.6 - 0.3, o: Math.random() * 0.5 + 0.25 });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 220, 255," + f.o + ")";
        ctx.fill();
        f.y += f.s; f.x += f.d;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        if (f.x > W + 4) f.x = -4; else if (f.x < -4) f.x = W + 4;
      }
      raf = requestAnimationFrame(draw);
    }
    resize(); make(); draw();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { resize(); make(); }, 200); });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) { cancelAnimationFrame(raf); } else { draw(); }
    });
  }

  function initYear() { var y = document.getElementById("year"); if (y) y.textContent = new Date().getFullYear(); }

  /* ── Splash intro (studio logo pred webom) ────────────── */
  function initSplash() {
    var el = document.getElementById("splash");
    if (!el) return;
    var done = false;
    function finish() {
      if (done) return; done = true;
      el.classList.add("out");
      setTimeout(function () { el.classList.add("gone"); }, 450);
    }
    el.addEventListener("pointerdown", finish, { once: true });
    setTimeout(finish, reduceMotion ? 500 : 1900);
  }

  /* ── Mobilná navigácia (hamburger) ────────────────────── */
  function initNav() {
    var nav = document.getElementById("nav");
    var toggle = document.getElementById("navToggle");
    var menu = document.getElementById("navMenu");
    if (!nav || !toggle) return;
    function close() { nav.classList.remove("open"); toggle.setAttribute("aria-expanded", "false"); }
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    if (menu) menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    document.addEventListener("click", function (e) { if (nav.classList.contains("open") && !nav.contains(e.target)) close(); });
  }

  /* ── Kontaktný formulár (Netlify Forms, AJAX) ─────────── */
  function initContactForm() {
    var form = document.getElementById("kontaktForm");
    if (!form) return;
    var statusEl = document.getElementById("formStatus");
    function t(key) { return (i18n[currentLang] && i18n[currentLang][key]) || i18n.sk[key] || ""; }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      var body = new URLSearchParams(new FormData(form)).toString();
      if (statusEl) { statusEl.textContent = t("form.sending"); statusEl.className = "form-status"; }
      if (btn) btn.disabled = true;
      fetch("/", { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: body })
        .then(function (r) {
          if (!r.ok) throw new Error("bad status");
          form.reset();
          if (statusEl) { statusEl.textContent = t("form.ok"); statusEl.className = "form-status ok"; }
        })
        .catch(function () {
          if (statusEl) { statusEl.textContent = t("form.err"); statusEl.className = "form-status err"; }
        })
        .then(function () { if (btn) btn.disabled = false; });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initSplash();
    initLang();
    initNav();
    initContactForm();
    initScroll();
    initReveal();
    initTilt();
    initMagnetic();
    initSnow();
    initYear();
  });
})();
