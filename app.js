/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   MRAZOSOFT — app.js (v2 "wow")
   i18n SK/EN, frost častice, rotátor, count-up, tilt,
   magnetické tlačidlá, scroll progress. Žiadne závislosti.
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  /* Web3Forms access key — DOPLNIŤ pre reálne odosielanie e-mailov z formulára.
     Získaš zdarma na web3forms.com (zadáš svoj e-mail → príde access key).
     Kým je prázdny, formulár použije mailto (otvorí mailového klienta). */
  var WEB3FORMS_KEY = "";

  /* ── Prekladový slovník ───────────────────────────────── */
  var rotatePhrases = {
    sk: [
      "ktoré privádzajú zákazníkov, nie len návštevy.",
      "ktoré predávajú aj vtedy, keď nepracujete.",
      "ktoré menia návštevy na objednávky.",
      "ktoré dávajú vašej firme náskok."
    ],
    en: [
      "that bring customers, not just visitors.",
      "that sell even when you're off the clock.",
      "that turn visits into orders.",
      "that give your business an edge."
    ]
  };

  var i18n = {
    sk: {
      "nav.home": "Domov", "nav.about": "O mne", "nav.services": "Služby", "nav.projects": "Projekty", "nav.process": "Ako to funguje", "nav.faq": "FAQ", "nav.contact": "Kontakt", "nav.cta": "Nezáväzná ponuka", "nav.status": "Voľné kapacity", "splash.skip": "kliknite pre preskočenie",
      "page.about.sub": "Vývojár z Popradu — celý projekt v jedných rukách.", "page.contact.sub": "Napíšte mi pár riadkov o tom, čo potrebujete. Ozvem sa do 24 hodín.",
      "home.projects.title": "Vybrané projekty", "home.projects.sub": "Pár ukážok z praxe — celé portfólio nájdete na stránke Projekty.", "proj.all": "Pozrieť všetky projekty",
      "cta.title": "Premeňme váš nápad na výsledok.", "cta.text": "Napíšte mi pár viet o tom, čo potrebujete. Do 24 hodín máte návrh riešenia aj orientačnú cenu — nezáväzne a bez technického žargónu.",
      "hero.badge": "Peter Mráz · vývojár z Popradu — otvorený pre nové projekty",
      "hero.lead": "Tvorím", "hero.line1": "Tvorím weby, appky a e-shopy,", "hero.rest": "ktoré privádzajú zákazníkov, nie len návštevy.",
      "hero.sub": "Od nápadu po spustenie — všetko v jedných rukách. Dostanete web, appku alebo e-shop, ktorý pôsobí dôveryhodne, načíta sa okamžite a systematicky mení návštevníkov na zákazníkov.",
      "hero.cta1": "Chcem nezáväznú ponuku", "hero.cta2": "Pozrieť projekty",
      "hero.stat1": "nasadených projektov", "hero.stat2": "kód patrí klientovi", "hero.stat3": "odpoveď na dopyt",
      "services.eyebrow": "Čo pre vás spravím", "services.title": "Weby, appky a e-shopy na mieru", "services.sub": "Celý vývoj pod jednou strechou — od prvej skice po živý web.",
      "services.web.t": "Webové stránky", "services.web.d": "Rýchle prezentačné weby, landing pages a firemné stránky, ktoré jasne vysvetlia vašu ponuku a vedú návštevníka ku kontaktu.", "services.web.price": "od 390 €",
      "services.apps.t": "Webové & mobilné appky", "services.apps.d": "PWA a Android aplikácie na mieru — pre interné systémy, zákaznícke portály alebo jednoduché nástroje, ktoré fungujú aj v mobile.", "services.apps.price": "od 1 200 €",
      "services.ecom.t": "E-shopy & e-commerce", "services.ecom.d": "Úpravy, moduly a integrácie pre PrestaShop — produktové feedy, Heureka, exporty, importy, ERP napojenia a automatizácia rutiny.", "services.ecom.price": "od 45 €/hod",
      "services.tools.t": "Automatizácia & AI", "services.tools.d": "Python nástroje, scraping, reporty a AI integrácie, ktoré znižujú ručnú prácu a šetria hodiny každý týždeň.", "services.tools.price": "od 250 €",
      "services.from": "už od", "services.price": "Cena na vyžiadanie", "services.guarantee": "Presnú cenu dostanete po krátkej konzultácii. Vždy vopred, bez prekvapení.",
      "projects.eyebrow": "Moja tvorba", "projects.title": "Projekty z praxe", "projects.sub": "Žiadne mockupy z fotobanky — toto sú reálne weby, aplikácie a nástroje, ktoré som navrhol, vyvíjal alebo nasadil.",
      "proj.rytmiko.d": "PWA edukačná hra pre deti s Downovým syndrómom — sedem hier na vzory, počítanie a zvuky, slovenské neurónové hlasy a maskot Zajko. Funguje offline a inštaluje sa do telefónu.",
      "proj.harmony.d": "Web pre upratovaciu službu z Popradu — „víkendy sú na oddych\". Kompletný dizajn, copywriting, SEO a napojenie objednávok na WhatsApp. Stránka, ktorá premieňa návštevníkov na klientov.",
      "proj.esol.d": "Kompletný e-shop na PrestaShope pre esol.sk — stovky produktov, automatické napojenie na Oberon ERP a generovanie reklamných letákov pre Facebook a Instagram. Menej ručnej roboty, viac priestoru na predaj.",
      "proj.fleet.d": "PWA a Android appka na správu vozidiel — STK, emisie, diaľničná známka a servis s farebným semaforom, ktorý vás upozorní skôr, než vyprší termín.",
      "proj.heureka.d": "Python nástroj na opravu nesparovaných produktov pre Heureka.sk — spracuje XML feed a vyexportuje CSV pre PrestaShop Store Manager. Z hodín ručnej práce sú sekundy.",
      "case.problem": "Problém:", "case.solution": "Riešenie:", "case.result": "Výsledok:",
      "proj.rytmiko.p": "Deti s Downovým syndrómom potrebujú jednoduché, hravé a dostupné cvičenia na vzory, počítanie a zvuky.", "proj.rytmiko.s": "Vznikla PWA edukačná hra so siedmimi aktivitami, slovenskými neurónovými hlasmi, maskotom Zajkom a offline režimom.", "proj.rytmiko.r": "Aplikácia sa dá spustiť v prehliadači aj nainštalovať do telefónu. Projekt je pripravený na ďalšie testovanie a spätnú väzbu.",
      "proj.harmony.p": "Upratovacia služba potrebovala jednoduchý web, ktorý jasne vysvetlí ponuku a rýchlo privedie zákazníka ku kontaktu.", "proj.harmony.s": "Navrhol som web s jasnou štruktúrou, lokálnym SEO, copywritingom a napojením objednávok na WhatsApp.", "proj.harmony.r": "Návštevník vie rýchlo pochopiť služby, lokalitu aj spôsob objednania cez WhatsApp.",
      "proj.fleet.p": "Termíny STK, emisnej kontroly, diaľničnej známky a servisu sa ľahko stratia v poznámkach alebo kalendári.", "proj.fleet.s": "PWA a Android aplikácia sleduje vozidlá a zobrazuje stav termínov pomocou jednoduchého farebného semaforu.", "proj.fleet.r": "Používateľ vidí rizikové termíny skôr, než vznikne problém — STK, emisie, diaľničná aj servis pod kontrolou.",
      "proj.heureka.p": "Nespárované produkty z XML feedu bolo potrebné ručne opravovať a pripravovať pre PrestaShop Store Manager.", "proj.heureka.s": "Vytvoril som Python nástroj, ktorý načíta XML feed, spáruje produkty a vyexportuje pripravený CSV súbor.", "proj.heureka.r": "1 842 spracovaných položiek, 1 790 spárovaných, 52 nespárovaných. Práca, ktorá trvala hodiny, je hotová za sekundy.",
      "proj.tajny.p": "Hoaxy, mýty a polopravdy sa šíria rýchlejšie, než sa dajú overiť — a ručná kontrola faktov zaberie čas.", "proj.tajny.s": "macOS aplikácia, do ktorej vložíte tvrdenie. Overí ho cez web a umelú inteligenciu a vygeneruje PDF verdikt so skóre dôveryhodnosti, zdrojmi a zaradením do jednej zo 7 kategórií (pravda, mýtus, hoax, lož…).", "proj.tajny.r": "Z tvrdenia je do minúty prehľadný verdikt s vysvetlením, zdrojmi a PDF výstupom. Projekt slúži ako interný AI nástroj na overovanie tvrdení.",
      "proj.view": "Otvoriť naživo", "proj.private": "Na vyžiadanie", "proj.demo": "Ukážka", "status.live": "Live", "status.dev": "Vo vývoji", "status.exp": "AI experiment", "status.req": "Na vyžiadanie", "proj.preview": "Pozrieť ukážku",
      "process.eyebrow": "Spolupráca", "process.title": "Ako prebieha spolupráca", "process.sub": "Jednoducho, transparentne a bez stresu. Štyri kroky od nápadu k hotovému produktu.",
      "process.s1.t": "Nápad & konzultácia", "process.s1.d": "Prejdeme si cieľ, rozpočet a najjednoduchšiu cestu k funkčnému riešeniu. Bez technickej hmly.",
      "process.s2.t": "Návrh & dizajn", "process.s2.d": "Pripravím štruktúru a vizuál, aby ste pred vývojom videli, čo presne vznikne.",
      "process.s3.t": "Vývoj", "process.s3.d": "Naprogramujem riešenie čisto, rýchlo a bez zbytočností, ktoré by spomaľovali web alebo predražovali údržbu.",
      "process.s4.t": "Nasadenie & podpora", "process.s4.d": "Projekt spustím, odovzdám prístupy a zostávam k dispozícii na úpravy alebo rozšírenia.",
      "about.eyebrow": "O mne", "about.title": "Jeden človek. Celý projekt v jedných rukách.",
      "about.p1": "MRAZOSOFT je tvorba Petra Mráza — vývojára z Popradu. Od návrhu cez kód až po nasadenie riešite projekt priamo s človekom, ktorý ho aj reálne tvorí.",
      "about.p2": "Bez account manažérov, bez prehadzovania zodpovednosti a bez zbytočne nafúknutých cien. Výsledkom má byť web, aplikácia alebo automatizácia, ktorá je rýchla, zrozumiteľná a patrí klientovi.",
      "about.f1.t": "Rýchle načítanie", "about.f1.d": "Weby a aplikácie optimalizované na výkon, SEO a použiteľnosť.",
      "about.f2.t": "Vlastný kód", "about.f2.d": "Bez ťažkých frameworkov tam, kde nie sú potrebné.",
      "about.f3.t": "Osobný prístup", "about.f3.d": "Komunikujete priamo s autorom, nie s callcentrom.",
      "contact.eyebrow": "Poďme sa rozprávať", "contact.title": "Máte nápad? Premením ho na web, appku alebo automatizáciu, ktorá dáva obchodný zmysel.",
      "contact.text": "Napíšte mi pár riadkov o tom, čo potrebujete. Ozvem sa do 24 hodín s návrhom ďalšieho postupu a orientačnou cenou.",
      "contact.cta": "Napíšte e-mail", "contact.or": "alebo rovno",
      "form.name": "Vaše meno", "form.contact": "E-mail alebo telefón", "form.msg": "Čo potrebujete? Pár riadkov stačí.",
      "form.send": "Odoslať dopyt", "form.sending": "Odosielam…", "form.sent": "Ďakujem! Dopyt dorazil — ozvem sa do 24 hodín.", "form.ok": "Otváram váš e-mail — dopyt už len odošlite. (Ak sa klient neotvoril, napíšte na petermraz@mrazosoft.sk.)", "form.err": "Niečo sa pokazilo — napíšte priamo na petermraz@mrazosoft.sk.", "form.interest": "O čo máte záujem? (kliknite, čo sa hodí)",
      "trust.1": "✓ Pevná cena vopred", "trust.2": "✓ Odpoveď do 24 hodín", "trust.3": "✓ Kód je váš", "trust.4": "✓ Bez záväzkov",
      "why.eyebrow": "Výhody", "why.title": "Prečo MRAZOSOFT",
      "why.1.t": "Priama komunikácia", "why.1.d": "Komunikujete priamo s vývojárom, nie cez sprostredkovateľov.",
      "why.2.t": "Pevná cena vopred", "why.2.d": "Pred začiatkom viete, čo sa bude robiť, koľko to bude stáť a čo bude výsledkom.",
      "why.3.t": "Kód patrí vám", "why.3.d": "Žiadne zbytočné uzamknutie v platforme, ktorú nevlastníte.",
      "why.4.t": "Podpora po spustení", "why.4.d": "Po odovzdaní projektu viem riešiť úpravy, opravy aj ďalší rozvoj.",
      "faq.eyebrow": "Otázky", "faq.title": "Časté otázky",
      "faq.q1": "Koľko stojí web stránka?", "faq.a1": "Jednoduchá landing page začína od 390 €, firemný web od 690 €. Presná cena závisí od rozsahu, funkcií a obsahu.",
      "faq.q2": "Ako dlho trvá vytvorenie webu?", "faq.a2": "Menší web sa dá pripraviť približne za 1 až 3 týždne. Väčšie aplikácie a e-shopy závisia od rozsahu.",
      "faq.q3": "Budem si vedieť web upravovať?", "faq.a3": "Áno, ak to projekt vyžaduje. Pri WordPress alebo e-commerce riešeniach viem pripraviť správu obsahu tak, aby ste zvládli bežné úpravy sami.",
      "faq.q4": "Robíte aj úpravy existujúceho webu?", "faq.a4": "Áno. Riešim úpravy webov, PrestaShop, WordPress, rýchlosť, technické opravy, formuláre, napojenia aj automatizácie.",
      "faq.q5": "Čo je PWA aplikácia?", "faq.a5": "PWA je webová aplikácia, ktorá sa správa podobne ako mobilná appka. Dá sa používať v prehliadači, často aj nainštalovať do telefónu a pri správnom návrhu môže fungovať aj offline.",
      "faq.q6": "Bude web patriť mne?", "faq.a6": "Áno. Po dokončení dostanete prístupy a výsledok patrí vám. Rozsah odovzdaných súborov, prístupov a podpory si potvrdíme vopred.",
      "faq.q7": "Robíte aj SEO?", "faq.a7": "Áno, riešim základné technické SEO, štruktúru nadpisov, meta texty, rýchlosť a lokálne vyhľadávanie. Pri veľkých SEO kampaniach je vhodná dlhodobá spolupráca.",
      "faq.q8": "Ako prebieha spolupráca?", "faq.a8": "Najprv si prejdeme cieľ a rozsah. Potom pripravím návrh riešenia a cenu. Po schválení nasleduje návrh, vývoj, testovanie a spustenie.",
      "footer.tagline": "Weby a aplikácie na mieru. ❄",
      "footer.operator": "Prevádzkovateľ",
      "footer.privacy": "Zásady ochrany osobných údajov",
      "footer.cookies": "Nastavenia cookies"
    },
    en: {
      "nav.home": "Home", "nav.about": "About", "nav.services": "Services", "nav.projects": "Projects", "nav.process": "How it works", "nav.faq": "FAQ", "nav.contact": "Contact", "nav.cta": "Get a quote", "nav.status": "Open for work", "splash.skip": "click to skip",
      "page.about.sub": "A developer from Poprad — the whole project in one pair of hands.", "page.contact.sub": "Drop me a few lines about what you need. I'll get back within 24 hours.",
      "home.projects.title": "Selected projects", "home.projects.sub": "A few examples from real work — the full portfolio is on the Projects page.", "proj.all": "See all projects",
      "cta.title": "Let's turn your idea into results.", "cta.text": "Write me a few lines about what you need. Within 24 hours you'll have a proposed solution and a ballpark price — no commitment, no tech jargon.",
      "hero.badge": "Peter Mráz · developer from Poprad — open for new projects",
      "hero.lead": "I build", "hero.line1": "I build websites, apps and e-shops", "hero.rest": "that bring customers, not just visitors.",
      "hero.sub": "From idea to launch — all in one pair of hands. You get a website, app or e-shop that looks credible, loads instantly and steadily turns visitors into customers.",
      "hero.cta1": "Get a free quote", "hero.cta2": "See the projects",
      "hero.stat1": "shipped projects", "hero.stat2": "code belongs to the client", "hero.stat3": "reply to an enquiry",
      "services.eyebrow": "What I'll build for you", "services.title": "Custom websites, apps and e-shops", "services.sub": "The whole build under one roof — from the first sketch to a live site.",
      "services.web.t": "Websites", "services.web.d": "Fast presentation sites, landing pages and company websites that clearly explain your offer and lead the visitor to get in touch.", "services.web.price": "from €390",
      "services.apps.t": "Web & mobile apps", "services.apps.d": "Custom PWAs and Android apps — for internal systems, customer portals or simple tools that work on mobile too.", "services.apps.price": "from €1,200",
      "services.ecom.t": "E-shops & e-commerce", "services.ecom.d": "PrestaShop tweaks, modules and integrations — product feeds, Heureka, exports, imports, ERP connections and routine automation.", "services.ecom.price": "from €45/hr",
      "services.tools.t": "Automation & AI", "services.tools.d": "Python tools, scraping, reports and AI integrations that cut manual work and save hours every week.", "services.tools.price": "from €250",
      "services.from": "from", "services.price": "Price on request", "services.guarantee": "You get the exact price after a short consultation. Always up front, no surprises.",
      "projects.eyebrow": "My work", "projects.title": "Projects from real work", "projects.sub": "No stock mockups — these are real websites, apps and tools I designed, built or deployed.",
      "proj.rytmiko.d": "A PWA educational game for children with Down syndrome — seven games for patterns, counting and sounds, Slovak neural voices and the mascot Zajko. Works offline and installs to the phone.",
      "proj.harmony.d": "Website for a cleaning service from Poprad — \"weekends are for rest\". Full design, copywriting, SEO and WhatsApp order integration. A site that turns visitors into clients.",
      "proj.esol.d": "A complete PrestaShop store for esol.sk — hundreds of products, automatic Oberon ERP sync and auto-generated ad flyers for Facebook and Instagram. Less manual work, more time to sell.",
      "proj.fleet.d": "A PWA and Android app for fleet management — inspections, emissions, vignette and service with a colour traffic-light that warns you before a deadline expires.",
      "proj.heureka.d": "A Python tool to fix unmatched products for Heureka.sk — it processes the XML feed and exports CSV for PrestaShop Store Manager. Hours of manual work become seconds.",
      "case.problem": "Problem:", "case.solution": "Solution:", "case.result": "Result:",
      "proj.rytmiko.p": "Children with Down syndrome need simple, playful and accessible exercises for patterns, counting and sounds.", "proj.rytmiko.s": "A PWA educational game with seven activities, Slovak neural voices, the mascot Zajko and an offline mode.", "proj.rytmiko.r": "The app runs in the browser and installs to the phone. The project is ready for further testing and feedback.",
      "proj.harmony.p": "The cleaning service needed a simple website that clearly explains the offer and quickly leads the customer to get in touch.", "proj.harmony.s": "I designed a website with a clear structure, local SEO, copywriting and WhatsApp order integration.", "proj.harmony.r": "Visitors quickly understand the services, the location and how to order via WhatsApp.",
      "proj.fleet.p": "Deadlines for inspections, emissions, the vignette and service are easily lost in notes or a calendar.", "proj.fleet.s": "A PWA and Android app tracks the vehicles and shows the deadline status with a simple colour traffic-light.", "proj.fleet.r": "The user sees risky deadlines before a problem arises — inspections, emissions, vignette and service under control.",
      "proj.heureka.p": "Unmatched products from the XML feed had to be fixed by hand and prepared for PrestaShop Store Manager.", "proj.heureka.s": "I built a Python tool that loads the XML feed, matches products and exports a ready CSV file.", "proj.heureka.r": "1,842 items processed, 1,790 matched, 52 unmatched. Work that took hours is done in seconds.",
      "proj.tajny.p": "Hoaxes, myths and half-truths spread faster than they can be checked — and verifying facts by hand takes time.", "proj.tajny.s": "A macOS app where you paste a claim. It verifies it against the web and AI and generates a PDF verdict with a credibility score, sources and one of 7 categories (true, myth, hoax, lie…).", "proj.tajny.r": "A claim becomes a clear verdict — with reasoning, sources and a PDF output — within a minute. The project serves as an internal AI tool for fact-checking claims.",
      "proj.view": "Open live", "proj.private": "On request", "proj.demo": "Demo", "status.live": "Live", "status.dev": "In development", "status.exp": "AI experiment", "status.req": "On request", "proj.preview": "See the demo",
      "process.eyebrow": "Working together", "process.title": "How we work together", "process.sub": "Simple, transparent and stress-free. Four steps from idea to finished product.",
      "process.s1.t": "Idea & consultation", "process.s1.d": "We go over the goal, the budget and the simplest path to a working solution. No technical fog.",
      "process.s2.t": "Design & concept", "process.s2.d": "I prepare the structure and visuals so you see exactly what will be built before development.",
      "process.s3.t": "Development", "process.s3.d": "I build the solution cleanly, fast and without the clutter that would slow the site down or inflate maintenance.",
      "process.s4.t": "Launch & support", "process.s4.d": "I launch the project, hand over the access and stay available for changes or extensions.",
      "about.eyebrow": "About", "about.title": "One person. The whole project in one pair of hands.",
      "about.p1": "MRAZOSOFT is the work of Peter Mráz — a developer from Poprad. From design through code to deployment, you deal directly with the person who actually builds it.",
      "about.p2": "No account managers, no shifting of responsibility and no needlessly inflated prices. The result should be a website, app or automation that is fast, clear and belongs to the client.",
      "about.f1.t": "Blazing speed", "about.f1.d": "Sites and apps optimised for performance and Google.",
      "about.f2.t": "Own code", "about.f2.d": "No heavy frameworks where they aren't needed.",
      "about.f3.t": "Personal approach", "about.f3.d": "You talk directly to the author, not a call centre.",
      "contact.eyebrow": "Let's talk", "contact.title": "Got an idea? I'll turn it into a website, app or automation that makes business sense.",
      "contact.text": "Drop me a few lines about what you need. I'll get back within 24 hours with the next steps and a ballpark price.",
      "contact.cta": "Email me", "contact.or": "or just",
      "form.name": "Your name", "form.contact": "E-mail or phone", "form.msg": "What do you need? A few lines is enough.",
      "form.send": "Send enquiry", "form.sending": "Sending…", "form.sent": "Thanks! Your enquiry arrived — I'll get back within 24 hours.", "form.ok": "Opening your email — just hit send. (If it didn't open, write to petermraz@mrazosoft.sk.)", "form.err": "Something went wrong — email petermraz@mrazosoft.sk directly.", "form.interest": "What are you interested in? (tap what fits)",
      "trust.1": "✓ Fixed price up front", "trust.2": "✓ Reply within 24 h", "trust.3": "✓ The code is yours", "trust.4": "✓ No commitment",
      "why.eyebrow": "Advantages", "why.title": "Why MRAZOSOFT",
      "why.1.t": "Direct communication", "why.1.d": "You talk straight to the developer, not through intermediaries.",
      "why.2.t": "Fixed price up front", "why.2.d": "Before we start you know what will be done, what it'll cost and what the result will be.",
      "why.3.t": "The code is yours", "why.3.d": "No needless lock-in to a platform you don't own.",
      "why.4.t": "Support after launch", "why.4.d": "After hand-over I can handle changes, fixes and further development.",
      "faq.eyebrow": "Questions", "faq.title": "Frequently asked questions",
      "faq.q1": "How much does a website cost?", "faq.a1": "A simple landing page starts from €390, a company site from €690. The exact price depends on scope, features and content.",
      "faq.q2": "How long does it take to build a website?", "faq.a2": "A smaller site can be ready in roughly 1 to 3 weeks. Larger apps and e-shops depend on scope.",
      "faq.q3": "Will I be able to edit the site myself?", "faq.a3": "Yes, if the project calls for it. With WordPress or e-commerce solutions I can set up content management so you handle everyday edits yourself.",
      "faq.q4": "Do you also edit existing websites?", "faq.a4": "Yes. I handle website edits, PrestaShop, WordPress, speed, technical fixes, forms, integrations and automation.",
      "faq.q5": "What is a PWA app?", "faq.a5": "A PWA is a web app that behaves much like a mobile app. It can be used in the browser, often installed to the phone, and with the right design can work offline too.",
      "faq.q6": "Will the website belong to me?", "faq.a6": "Yes. Once finished you get the access and the result is yours. We'll confirm the scope of delivered files, access and support up front.",
      "faq.q7": "Do you do SEO?", "faq.a7": "Yes, I handle basic technical SEO, heading structure, meta texts, speed and local search. For large SEO campaigns a long-term collaboration is the way to go.",
      "faq.q8": "How does the collaboration work?", "faq.a8": "First we go over the goal and scope. Then I prepare a proposed solution and a price. Once approved, design, development, testing and launch follow.",
      "footer.tagline": "Custom websites and applications. ❄",
      "footer.operator": "Operator",
      "footer.privacy": "Privacy policy",
      "footer.cookies": "Cookie settings"
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
    var line2 = document.querySelector(".hero-line2");
    if (!line2) return;
    if (rotTimer) clearInterval(rotTimer);
    var phrases = rotatePhrases[currentLang] || rotatePhrases.sk;
    rotIdx = 0;
    line2.classList.remove("swapping");
    line2.textContent = phrases[0];
    if (reduceMotion || phrases.length < 2) return;
    rotTimer = setInterval(function () {
      // pevný 1. riadok (zoznam služieb); rotuje sa celý 2. riadok = benefit (cross-fade)
      line2.classList.add("swapping");
      setTimeout(function () {
        rotIdx = (rotIdx + 1) % phrases.length;
        line2.textContent = phrases[rotIdx];
        line2.classList.remove("swapping");
      }, 340);
    }, 4500);
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

  /* ── Rotujúce hero logo (Iron-Man štýl: klik = zrýchli, potom spomalí) ── */
  function initHeroLogo() {
    var logo = document.getElementById("heroFlake");
    if (!logo) return;
    if (reduceMotion) return;
    var svg = logo.querySelector("svg");
    var brakeBtn = document.getElementById("flakeBrake");
    var hub = brakeBtn ? brakeBtn.querySelector(".brake-hub") : null;

    var angle = 0, speed = 16, base = 16, last = null;     // stupne/s
    var mode = "idle";  // idle | brakingHold | stopping | settle | stopped
    var heat = 0, blur = 0;
    var settleV = 0, settleTarget = 0;                     // pružina pre overshoot
    var emitAcc = 0, skidAcc = 0, tDown = 0;
    var FR = 0.8, DRAG = 18;                                // ťuk → jemné brzdenie (dlho a hladko dobieha)
    var HARD_FR = 4.5, HARD_DRAG = 1100;                    // plná brzda (podržanie) → zahryzne a zaisí na mieste

    // klik na rameno (mimo stredu) = roztoč / prebuď zo stopu
    logo.addEventListener("click", function () {
      if (mode === "stopped" || mode === "settle") mode = "idle";
      if (mode === "idle") speed = Math.min(speed + 260, 1600);
    });

    if (brakeBtn) {
      var startBrake = function (e) {
        e.preventDefault(); e.stopPropagation();
        tDown = performance.now();
        mode = "brakingHold";
        if (navigator.vibrate) { try { navigator.vibrate(12); } catch (err) {} }
      };
      var endBrake = function (e) {
        if (mode !== "brakingHold") return;
        e.stopPropagation();
        var held = performance.now() - tDown;
        if (held < 180) mode = "stopping";              // ťuk → jemný dojazd až do stopu
        else mode = (speed <= 14) ? "stopped" : "stopping"; // plná brzda → ostane zaistené na mieste
      };
      brakeBtn.addEventListener("pointerdown", startBrake);
      brakeBtn.addEventListener("pointerup", endBrake);
      brakeBtn.addEventListener("pointercancel", endBrake);
      brakeBtn.addEventListener("pointerleave", endBrake);
    }

    function frame(ts) {
      if (last == null) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.05); last = ts;

      if (mode === "brakingHold") {
        speed -= (HARD_FR * speed + HARD_DRAG) * dt;     // PLNÁ brzda — zahryzne tvrdo
        if (speed < 0) speed = 0;                         // a drží zaistené NA MIESTE kým je stlačená
      } else if (mode === "stopping") {
        speed -= (FR * speed + DRAG) * dt;               // ťuk → jemný dojazd
        if (speed < 0) speed = 0;
        if (speed <= 14) {                                // prejdi do dosadnutia (až keď sa už takmer plazí)
          settleTarget = Math.round(angle / 60) * 60;     // najbližšie zapadnutie (6-násobná symetria)
          settleV = speed; speed = 0; mode = "settle";
        }
      } else if (mode === "settle") {
        var k = 120, c = 13;                              // tlmená pružina (mierny prekmit)
        settleV += (-k * (angle - settleTarget) - c * settleV) * dt;
        angle += settleV * dt;
        if (Math.abs(angle - settleTarget) < 0.15 && Math.abs(settleV) < 6) {
          angle = settleTarget; settleV = 0; mode = "stopped";
        }
      } else if (mode === "stopped") {
        speed = 0;
      } else {                                            // idle
        speed += (base - speed) * Math.min(1, dt * 0.9);  // plynulý návrat k base
      }

      if (mode !== "settle") angle = (angle + speed * dt) % 360;
      logo.style.transform = "rotate(" + angle.toFixed(2) + "deg)";

      // — efekt: motion blur ramien (250 → 1600 °/s dáva 0 → 4px) —
      var targetBlur = Math.max(0, Math.min(4, (speed - 250) / 1350 * 4));
      blur += (targetBlur - blur) * Math.min(1, dt * 12);
      if (svg) svg.style.filter = blur > 0.05 ? "blur(" + blur.toFixed(2) + "px)" : "";

      // — efekt: žeravá brzda —
      var braking = (mode === "brakingHold" || mode === "stopping");
      heat += ((braking ? 1 : 0) - heat) * Math.min(1, dt * (braking ? 6 : 1.6));
      if (heat < 0.01) heat = 0;
      if (hub) hub.style.setProperty("--heat", heat.toFixed(3));

      // — efekt: odstredivé vločky pri vysokých otáčkach —
      if (speed > 600) {
        emitAcc += dt;
        if (emitAcc >= 0.07) {
          emitAcc = 0;
          var r = logo.getBoundingClientRect();
          var cx = r.left + r.width / 2, cy = r.top + r.height / 2, rad = r.width * 0.46;
          var n = speed > 1100 ? 2 : 1;
          for (var i = 0; i < n; i++) {
            var a = Math.random() * Math.PI * 2;
            emitFlake(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad,
              { dx: Math.cos(a) * 42, dy: Math.sin(a) * 42, size: 10 + Math.random() * 8 });
          }
        }
      }

      // — efekt: flekovanie pri plnej brzde — úlomky odlietajú tangenciálne (šmyk) —
      if (mode === "brakingHold" && speed > 150) {
        skidAcc += dt;
        if (skidAcc >= 0.04) {
          skidAcc = 0;
          var rb = logo.getBoundingClientRect();
          var bcx = rb.left + rb.width / 2, bcy = rb.top + rb.height / 2, brad = rb.width * 0.46;
          var sa = Math.random() * Math.PI * 2;
          var mag = 50 + speed * 0.14;
          emitFlake(bcx + Math.cos(sa) * brad, bcy + Math.sin(sa) * brad,
            { dx: -Math.sin(sa) * mag, dy: Math.cos(sa) * mag, size: 7 + Math.random() * 7 });
        }
      }

      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ── Splash intro (studio logo pred webom) ────────────── */
  function initSplash() {
    var el = document.getElementById("splash");
    if (!el) return;
    var done = false;
    function finish() {
      if (done) return; done = true;
      var sFlake = el.querySelector(".splash-flake");
      var word = el.querySelector(".splash-word");
      var skip = el.querySelector(".splash-skip");
      var bFlake = document.querySelector(".nav .brand-flake");

      // 1) nápis + skip sa jemne odfadeujú prvé (nech neodlietajú s vločkou)
      if (word) { word.style.transition = "opacity .35s ease, transform .35s ease"; word.style.opacity = "0"; word.style.transform = "translateY(8px)"; }
      if (skip) { skip.style.transition = "opacity .3s ease"; skip.style.opacity = "0"; }

      // 2) FLIP: len vločka preletí a „pristane" na ikonu v hlavičke
      if (!reduceMotion && sFlake && bFlake) {
        var s = sFlake.getBoundingClientRect();
        var b = bFlake.getBoundingClientRect();
        var scale = b.width / s.width;
        var dx = (b.left + b.width / 2) - (s.left + s.width / 2);
        var dy = (b.top + b.height / 2) - (s.top + s.height / 2);
        sFlake.style.animation = "none";                 // ukonči vstupnú animáciu, nech FLIP nepreskočí
        sFlake.style.transformOrigin = "50% 50%";
        sFlake.style.transition = "transform .85s cubic-bezier(.7,0,.18,1)";
        requestAnimationFrame(function () {
          sFlake.style.transform = "translate(" + dx + "px," + dy + "px) scale(" + scale.toFixed(3) + ")";
        });
      }

      // 3) pozadie sa stmaví až keď už vločka letí — odhalí stránku popod ňou
      setTimeout(function () { el.classList.add("out"); }, 240);
      setTimeout(function () { el.classList.add("gone"); }, 1050);
    }
    el.addEventListener("pointerdown", finish, { once: true });
    setTimeout(finish, reduceMotion ? 500 : 1700);
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

    // klikacie „o čo mám záujem" chipy
    var chips = form.querySelectorAll(".interest-chip");
    chips.forEach(function (c) {
      c.addEventListener("click", function () {
        c.classList.toggle("is-on");
        c.setAttribute("aria-pressed", c.classList.contains("is-on") ? "true" : "false");
      });
    });
    function interests() {
      return Array.prototype.filter.call(chips, function (c) { return c.classList.contains("is-on"); })
        .map(function (c) { return c.getAttribute("data-val"); });
    }

    function mailtoFallback(subject, body) {
      window.location.href = "mailto:petermraz@mrazosoft.sk?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (statusEl) { statusEl.textContent = t("form.ok"); statusEl.className = "form-status ok"; }
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var meno = (form.meno && form.meno.value || "").trim();
      var kontakt = (form.kontakt && form.kontakt.value || "").trim();
      var sprava = (form.sprava && form.sprava.value || "").trim();
      var ints = interests();
      var subject = "Dopyt z webu — " + (meno || "MRAZOSOFT");
      var body = "Meno: " + meno + "\nKontakt: " + kontakt + "\nZáujem: " + (ints.join(", ") || "—") + "\n\nSpráva:\n" + (sprava || "—");

      if (WEB3FORMS_KEY) {
        // reálne odoslanie e-mailu (funguje aj bez mailového klienta)
        if (statusEl) { statusEl.textContent = t("form.sending"); statusEl.className = "form-status"; }
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: subject,
            from_name: "MRAZOSOFT web",
            meno: meno, kontakt: kontakt, zaujem: (ints.join(", ") || "—"), sprava: (sprava || "—")
          })
        }).then(function (r) { return r.json(); })
          .then(function (j) {
            if (j && j.success) {
              form.reset();
              chips.forEach(function (c) { c.classList.remove("is-on"); c.setAttribute("aria-pressed", "false"); });
              if (statusEl) { statusEl.textContent = t("form.sent"); statusEl.className = "form-status ok"; }
            } else { mailtoFallback(subject, body); }
          })
          .catch(function () { mailtoFallback(subject, body); });
      } else {
        mailtoFallback(subject, body);
      }
    });
  }

  /* ── Vločka: zdieľaný spawn (kurzor + odstredivý efekt loga) ── */
  var FLAKE_SVG = (function () {
    var ARM = '<line x1="32" y1="32" x2="32" y2="8"/><line x1="32" y1="15" x2="27" y2="10"/><line x1="32" y1="15" x2="37" y2="10"/>';
    var arms = "";
    for (var d = 0; d < 360; d += 60) arms += '<g transform="rotate(' + d + ' 32 32)">' + ARM + "</g>";
    return '<svg viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
      arms + '<circle cx="32" cy="32" r="2" fill="currentColor" stroke="none"/></g></svg>';
  })();
  function emitFlake(x, y, opts) {
    opts = opts || {};
    var el = document.createElement("span");
    el.className = "cursor-flake";
    var size = opts.size || (12 + Math.random() * 10);
    el.style.left = x + "px"; el.style.top = y + "px";
    el.style.width = el.style.height = size + "px";
    el.style.setProperty("--rot", (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 140) + "deg");
    if (opts.dx != null) el.style.setProperty("--dx", opts.dx + "px");
    if (opts.dy != null) el.style.setProperty("--dy", opts.dy + "px");
    el.innerHTML = FLAKE_SVG;
    document.body.appendChild(el);
    el.addEventListener("animationend", function () { el.remove(); });
  }

  /* ── Vločky letiace okolo kurzora (mobile: pri tapnutí) ── */
  function initCursorFlakes() {
    if (reduceMotion) return;
    if (isTouch) {
      window.addEventListener("pointerdown", function (e) {
        for (var i = 0; i < 5; i++) {
          (function (i) { setTimeout(function () { emitFlake(e.clientX + (Math.random() * 44 - 22), e.clientY + (Math.random() * 44 - 22)); }, i * 45); })(i);
        }
      }, { passive: true });
    } else {
      var last = 0;
      window.addEventListener("mousemove", function (e) {
        var now = Date.now();
        if (now - last < 60) return;
        last = now;
        emitFlake(e.clientX, e.clientY);
      }, { passive: true });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (window.__UC__) return;   // under construction → nespúšťať web pod overlayom
    initSplash();
    initCursorFlakes();
    initLang();
    initNav();
    initContactForm();
    initScroll();
    initReveal();
    initTilt();
    initMagnetic();
    initSnow();
    initYear();
    initHeroLogo();
  });
})();
