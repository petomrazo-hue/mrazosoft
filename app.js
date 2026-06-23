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
    sk: ["weby", "appky", "e-shopy", "PWA"],
    en: ["websites", "apps", "e-shops", "PWAs"]
  };

  var i18n = {
    sk: {
      "nav.services": "Služby", "nav.projects": "Projekty", "nav.process": "Ako to funguje", "nav.faq": "FAQ", "nav.contact": "Kontakt", "nav.cta": "Nezáväzná ponuka", "nav.status": "Voľné kapacity", "splash.skip": "kliknite pre preskočenie",
      "hero.badge": "Peto Mráz · vývojár z Popradu — otvorené pre nové projekty",
      "hero.lead": "Tvorím rýchle", "hero.rest": "ktoré prinášajú výsledky.",
      "hero.sub": "Od prvého návrhu po spustenie. Navrhnem aj naprogramujem web, appku či e-shop — rýchly, prehľadný a postavený tak, aby z návštevníkov robil zákazníkov.",
      "hero.cta1": "Chcem nezáväznú ponuku", "hero.cta2": "Pozrieť projekty",
      "hero.stat1": "nasadených projektov", "hero.stat2": "vlastný, čistý kód", "hero.stat3": "priemerná odozva",
      "services.eyebrow": "Čo pre vás spravím", "services.title": "Weby, appky a e-shopy na mieru", "services.sub": "Celý vývoj pod jednou strechou — od prvého skicu po živý web.",
      "services.web.t": "Webové stránky", "services.web.d": "Rýchly a prehľadný web, ktorý návštevníka dovedie k dopytu alebo nákupu — nie len pekná online vizitka. Prezentačné stránky, landing pages aj firemné weby.", "services.web.price": "Landing page od 390 € · firemný web od 690 €",
      "services.apps.t": "Webové & mobilné appky", "services.apps.d": "PWA a Android aplikácie, ktoré fungujú aj offline a inštalujú sa ako natívne — bez poplatkov a byrokracie app store. Šetria čas vám aj zákazníkom.", "services.apps.price": "PWA aplikácia od 1 200 €",
      "services.ecom.t": "E-shopy & e-commerce", "services.ecom.d": "PrestaShop úpravy, moduly a integrácie — napojenie na ERP, feedy a Heureka. Menej ručnej práce, viac dokončených objednávok.", "services.ecom.price": "PrestaShop úpravy od 45 €/hod",
      "services.tools.t": "Automatizácia & AI", "services.tools.d": "Python skripty, reporty a AI integrácie, ktoré odbúrajú opakovanú prácu — z hodín úloh týždenne spravia minúty.", "services.tools.price": "Automatizácie od 250 €",
      "services.from": "už od", "services.price": "Cena na vyžiadanie", "services.guarantee": "Presnú cenu dostanete po krátkej konzultácii. Vždy vopred, bez prekvapení.",
      "projects.eyebrow": "Moja tvorba", "projects.title": "Projekty, ktoré žijú naživo", "projects.sub": "Žiadne mockupy z fotobanky — toto sú reálne nasadené produkty, ktoré práve teraz niekomu slúžia.",
      "proj.rytmiko.d": "PWA edukačná hra pre deti s Downovým syndrómom — sedem hier na vzory, počítanie a zvuky, slovenské neurónové hlasy a maskot Zajko. Funguje offline a inštaluje sa do telefónu.",
      "proj.harmony.d": "Web pre upratovaciu službu z Popradu — „víkendy sú na oddych\". Kompletný dizajn, copywriting, SEO a napojenie objednávok na WhatsApp. Stránka, ktorá premieňa návštevníkov na klientov.",
      "proj.esol.d": "Kompletný e-shop na PrestaShope pre esol.sk — stovky produktov, automatické napojenie na Oberon ERP a generovanie reklamných letákov pre Facebook a Instagram. Menej ručnej roboty, viac priestoru na predaj.",
      "proj.fleet.d": "PWA a Android appka na správu vozidiel — STK, emisie, diaľničná známka a servis s farebným semaforom, ktorý vás upozorní skôr, než vyprší termín.",
      "proj.heureka.d": "Python nástroj na opravu nesparovaných produktov pre Heureka.sk — spracuje XML feed a vyexportuje CSV pre PrestaShop Store Manager. Z hodín ručnej práce sú sekundy.",
      "case.problem": "Problém", "case.solution": "Riešenie", "case.result": "Výsledok",
      "proj.rytmiko.p": "Deti s Downovým syndrómom potrebujú jednoduché, trpezlivé cvičenia na vzory, počítanie a zvuky — bežné appky sú prerýchle a presložité.", "proj.rytmiko.s": "PWA so 7 hrami, slovenskými neurónovými hlasmi a maskotom Zajkom. Funguje offline, inštaluje sa do telefónu, bez reklám.", "proj.rytmiko.r": "Reálne nasadená a používaná appka. (merateľný výsledok doplniť)",
      "proj.harmony.p": "Upratovacia služba z Popradu nemala web, ktorý by premieňal záujem na objednávky.", "proj.harmony.s": "Kompletný web — dizajn, copywriting, SEO a napojenie objednávok na WhatsApp.", "proj.harmony.r": "Web vedie návštevníka priamo k dopytu. (merateľný výsledok doplniť)",
      "proj.fleet.p": "STK, emisie, diaľničná a servis pre viac vozidiel sa ľahko zmeškajú, keď sú „v hlave“ alebo v exceli.", "proj.fleet.s": "PWA a Android appka s farebným semaforom, ktorá upozorní skôr, než termín vyprší.", "proj.fleet.r": "Vo vývoji. (merateľný výsledok doplniť)",
      "proj.heureka.p": "Nespárované produkty v Heureka feede znamenajú hodiny ručného dohľadávania.", "proj.heureka.s": "Python nástroj — spracuje XML feed a vyexportuje CSV pre PrestaShop Store Manager.", "proj.heureka.r": "1 842 položiek spracovaných · 1 790 spárovaných · 52 nespárovaných do CSV — z hodín ručnej práce na sekundy.",
      "proj.view": "Otvoriť naživo", "proj.private": "Na vyžiadanie", "proj.demo": "Ukážka", "status.live": "Live", "status.dev": "Vo vývoji",
      "process.eyebrow": "Spolupráca", "process.title": "Ako prebieha spolupráca", "process.sub": "Jednoducho, transparentne a bez stresu. Štyri kroky od nápadu k hotovému produktu.",
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
      "contact.cta": "Napísať Petrovi", "contact.or": "alebo rovno",
      "form.name": "Vaše meno", "form.contact": "E-mail alebo telefón", "form.msg": "Čo potrebujete? Pár riadkov stačí.",
      "form.send": "Odoslať dopyt", "form.sending": "Odosielam…", "form.ok": "Otváram váš e-mail — dopyt už len odošlite. (Ak sa klient neotvoril, napíšte na petermraz@mrazosoft.sk.)", "form.err": "Niečo sa pokazilo — napíšte priamo na petermraz@mrazosoft.sk.",
      "trust.1": "✓ Pevná cena vopred", "trust.2": "✓ Odpoveď do 24 hodín", "trust.3": "✓ Kód je váš", "trust.4": "✓ Bez záväzkov",
      "why.eyebrow": "Výhody", "why.title": "Prečo MRAZOSOFT",
      "why.1": "Priama komunikácia s vývojárom", "why.2": "Rýchle rozhodovanie", "why.3": "Žiadne preplatené agentúrne vrstvy", "why.4": "Čistý kód a jasné vlastníctvo", "why.5": "Podpora aj po spustení",
      "faq.eyebrow": "Otázky", "faq.title": "Časté otázky",
      "faq.q1": "Koľko stojí web stránka?", "faq.a1": "Landing page od 390 €, firemný web od 690 €. Presnú cenu poviem po krátkej konzultácii — vždy vopred, bez prekvapení.",
      "faq.q2": "Ako dlho trvá výroba webu?", "faq.a2": "Jednoduchý web zvyčajne 1–2 týždne, väčší projekt podľa rozsahu. Termín si dohodneme vopred.",
      "faq.q3": "Budem si vedieť stránku upravovať?", "faq.a3": "Áno. Odovzdám vám prístup a ukážem, ako meniť texty a obsah; zložitejšie úpravy rád spravím za vás.",
      "faq.q4": "Robíte aj úpravy existujúceho webu?", "faq.a4": "Áno, preberiem aj rozrobený alebo cudzí web a doladím dizajn, rýchlosť či funkcie.",
      "faq.q5": "Čo znamená PWA?", "faq.a5": "Progresívna webová aplikácia — beží v prehliadači, funguje aj offline a dá sa nainštalovať do telefónu bez app store.",
      "faq.q6": "Bude web môj?", "faq.a6": "Úplne. Kód, doména aj obsah patria vám, bez viazania na dodávateľa.",
      "faq.q7": "Robíte aj SEO?", "faq.a7": "Áno, základné on-page SEO (štruktúra, rýchlosť, meta, lokálne kľúčové slová) je súčasťou každého webu.",
      "faq.q8": "Ako prebieha spolupráca?", "faq.a8": "Krátka konzultácia → návrh a cena vopred → vývoj → spustenie → podpora. Po celý čas komunikujete priamo so mnou.",
      "footer.tagline": "Weby a aplikácie na mieru. ❄"
    },
    en: {
      "nav.services": "Services", "nav.projects": "Projects", "nav.process": "How it works", "nav.faq": "FAQ", "nav.contact": "Contact", "nav.cta": "Get a quote", "nav.status": "Open for work", "splash.skip": "click to skip",
      "hero.badge": "Peto Mráz · developer from Poprad — open for new projects",
      "hero.lead": "I build fast", "hero.rest": "that deliver results.",
      "hero.sub": "From first sketch to launch. I design and build the website, app or store — fast, clear and built to turn visitors into customers.",
      "hero.cta1": "Get a free quote", "hero.cta2": "See the projects",
      "hero.stat1": "shipped projects", "hero.stat2": "own, clean code", "hero.stat3": "average response",
      "services.eyebrow": "What I'll build for you", "services.title": "Custom websites, apps and e-shops", "services.sub": "The whole build under one roof — from the first sketch to a live site.",
      "services.web.t": "Websites", "services.web.d": "A fast, clear website that leads visitors to an enquiry or purchase — not just a pretty online business card. Presentation pages, landing pages and company sites.", "services.web.price": "Landing page from €390 · company site from €690",
      "services.apps.t": "Web & mobile apps", "services.apps.d": "PWAs and Android apps that work offline and install like native ones — no app-store fees or bureaucracy. They save time for you and your customers.", "services.apps.price": "PWA app from €1,200",
      "services.ecom.t": "E-shops & e-commerce", "services.ecom.d": "PrestaShop tweaks, modules and integrations — ERP, feeds and Heureka. Less manual work, more completed orders.", "services.ecom.price": "PrestaShop work from €45/hr",
      "services.tools.t": "Automation & AI", "services.tools.d": "Python scripts, reports and AI integrations that remove repetitive work — turning hours of weekly tasks into minutes.", "services.tools.price": "Automations from €250",
      "services.from": "from", "services.price": "Price on request", "services.guarantee": "You get the exact price after a short consultation. Always up front, no surprises.",
      "projects.eyebrow": "My work", "projects.title": "Projects that live in the wild", "projects.sub": "No stock mockups — these are real, deployed products serving someone right now.",
      "proj.rytmiko.d": "A PWA educational game for children with Down syndrome — seven games for patterns, counting and sounds, Slovak neural voices and the mascot Zajko. Works offline and installs to the phone.",
      "proj.harmony.d": "Website for a cleaning service from Poprad — \"weekends are for rest\". Full design, copywriting, SEO and WhatsApp order integration. A site that turns visitors into clients.",
      "proj.esol.d": "A complete PrestaShop store for esol.sk — hundreds of products, automatic Oberon ERP sync and auto-generated ad flyers for Facebook and Instagram. Less manual work, more time to sell.",
      "proj.fleet.d": "A PWA and Android app for fleet management — inspections, emissions, vignette and service with a colour traffic-light that warns you before a deadline expires.",
      "proj.heureka.d": "A Python tool to fix unmatched products for Heureka.sk — it processes the XML feed and exports CSV for PrestaShop Store Manager. Hours of manual work become seconds.",
      "case.problem": "Problem", "case.solution": "Solution", "case.result": "Result",
      "proj.rytmiko.p": "Children with Down syndrome need simple, patient exercises for patterns, counting and sounds — common apps are too fast and too complex.", "proj.rytmiko.s": "A PWA with 7 games, Slovak neural voices and the mascot Zajko. Works offline, installs to the phone, no ads.", "proj.rytmiko.r": "A real, deployed and used app. (measurable result to be added)",
      "proj.harmony.p": "A cleaning service from Poprad had no website that turned interest into orders.", "proj.harmony.s": "A complete website — design, copywriting, SEO and WhatsApp order integration.", "proj.harmony.r": "The site leads visitors straight to an enquiry. (measurable result to be added)",
      "proj.fleet.p": "Inspections, emissions, vignette and service for several vehicles are easily missed when kept in your head or a spreadsheet.", "proj.fleet.s": "A PWA and Android app with a colour traffic-light that warns you before a deadline expires.", "proj.fleet.r": "In development. (measurable result to be added)",
      "proj.heureka.p": "Unmatched products in the Heureka feed mean hours of manual lookup.", "proj.heureka.s": "A Python tool — processes the XML feed and exports CSV for PrestaShop Store Manager.", "proj.heureka.r": "1,842 items processed · 1,790 matched · 52 unmatched to CSV — hours of manual work down to seconds.",
      "proj.view": "Open live", "proj.private": "On request", "proj.demo": "Demo", "status.live": "Live", "status.dev": "In development",
      "process.eyebrow": "Working together", "process.title": "How we work together", "process.sub": "Simple, transparent and stress-free. Four steps from idea to finished product.",
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
      "contact.cta": "Message Peter", "contact.or": "or just",
      "form.name": "Your name", "form.contact": "E-mail or phone", "form.msg": "What do you need? A few lines is enough.",
      "form.send": "Send enquiry", "form.sending": "Sending…", "form.ok": "Opening your email — just hit send. (If it didn't open, write to petermraz@mrazosoft.sk.)", "form.err": "Something went wrong — email petermraz@mrazosoft.sk directly.",
      "trust.1": "✓ Fixed price up front", "trust.2": "✓ Reply within 24 h", "trust.3": "✓ The code is yours", "trust.4": "✓ No commitment",
      "why.eyebrow": "Advantages", "why.title": "Why MRAZOSOFT",
      "why.1": "Direct communication with the developer", "why.2": "Fast decisions", "why.3": "No overpriced agency layers", "why.4": "Clean code and clear ownership", "why.5": "Support after launch too",
      "faq.eyebrow": "Questions", "faq.title": "Frequently asked questions",
      "faq.q1": "How much does a website cost?", "faq.a1": "Landing page from €390, company site from €690. I'll give the exact price after a short consultation — always up front, no surprises.",
      "faq.q2": "How long does a website take?", "faq.a2": "A simple site usually 1–2 weeks, a bigger project depending on scope. We agree the timeline up front.",
      "faq.q3": "Will I be able to edit the site myself?", "faq.a3": "Yes. I hand over access and show you how to change text and content; trickier edits I'm happy to do for you.",
      "faq.q4": "Do you also edit existing websites?", "faq.a4": "Yes, I'll take over an unfinished or third-party site and improve the design, speed or features.",
      "faq.q5": "What does PWA mean?", "faq.a5": "A progressive web app — runs in the browser, works offline and installs to the phone without an app store.",
      "faq.q6": "Will the website be mine?", "faq.a6": "Completely. The code, domain and content are yours, with no vendor lock-in.",
      "faq.q7": "Do you do SEO?", "faq.a7": "Yes, basic on-page SEO (structure, speed, meta, local keywords) is part of every website.",
      "faq.q8": "How does the collaboration work?", "faq.a8": "Short consultation → proposal and price up front → development → launch → support. You talk to me directly the whole time.",
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
      var meno = (form.meno && form.meno.value || "").trim();
      var kontakt = (form.kontakt && form.kontakt.value || "").trim();
      var sprava = (form.sprava && form.sprava.value || "").trim();
      var subject = "Dopyt z webu — " + (meno || "MRAZOSOFT");
      var bodyText = "Meno: " + meno + "\nKontakt: " + kontakt + "\n\nSpráva:\n" + sprava;
      window.location.href = "mailto:petermraz@mrazosoft.sk?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyText);
      if (statusEl) { statusEl.textContent = t("form.ok"); statusEl.className = "form-status ok"; }
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
