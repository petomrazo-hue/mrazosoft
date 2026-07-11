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
  var WEB3FORMS_KEY = "a801edbc-d2f8-477b-8260-5a68f7246d7e";

  /* ── Prekladový slovník ───────────────────────────────── */
  var rotatePhrases = {
    sk: [
      "Postavím okolo neho weby, appky a AI, ktoré sa točia za zákazníkmi.",
      "Web, e-shop, AI agent aj dronové video — na jednej obežnej dráhe.",
      "Technológie, ktoré obiehajú okolo vašej firmy. Nie naopak."
    ],
    en: [
      "I build the sites, apps and AI that orbit around your customers.",
      "Website, e-shop, AI agent and drone video — all in one orbit.",
      "Technology that orbits your business. Not the other way round."
    ]
  };

  var i18n = {
    sk: {
      "nav.home": "Domov", "nav.about": "O mne", "nav.services": "Služby", "nav.projects": "Projekty", "nav.blog": "Blog", "nav.process": "Ako to funguje", "nav.faq": "FAQ", "nav.contact": "Kontakt", "nav.cta": "Napíšte mi", "nav.status": "Voľné kapacity", "splash.skip": "kliknite pre preskočenie",
      "page.about.sub": "Vývojár z Popradu — celý projekt v jedných rukách.", "page.contact.sub": "Napíšte mi pár riadkov o tom, čo potrebujete. Ozvem sa do pár hodín.",
      "home.projects.title": "Vybrané projekty", "home.projects.sub": "Pár ukážok z praxe — celé portfólio nájdete na stránke Projekty.", "proj.all": "Pozrieť všetky projekty",
      "cta.title": "Máte projekt alebo nápad? Napíšme si.", "cta.text": "Povedzte mi pár viet o tom, čo potrebujete. Do pár hodín máte odpoveď a návrh ďalšieho kroku — nezáväzne a bez žargónu.", "cta.wa": "Napíšte na WhatsApp", "cta.trust": "Odpoveď do pár hodín · Bez záväzku · Kód patrí vám",
      "hero.badge": "Peter Mráz · vývojár z Popradu — otvorený pre nové projekty",
      "hero.lead": "Tvorím", "hero.line1": "Váš biznis, stred vesmíru.", "hero.rest": "Postavím okolo neho weby, appky a AI, ktoré sa točia za zákazníkmi.",
      "hero.sub": "Som Peter Mráz — vývojár z Popradu. Dostanem vašu firmu online: navrhnem a postavím web, e-shop alebo appku, ktorá pôsobí dôveryhodne, načíta sa okamžite a privádza dopyty. Všetko v jedných rukách, bez agentúrnych cien.",
      "cat.web.t": "Weby & appky", "cat.web.d": "Prezentačné weby, landing pages, PWA aplikácie a e-shopy — od návrhu po spustenie.",
      "cat.ai.t": "AI & automatizácia", "cat.ai.d": "Chatboty a AI agenti napojení na vaše dáta, n8n automatizácie a Python nástroje.",
      "cat.video.t": "Video & drony", "cat.video.d": "Dronové promo zábery (DJI Avata 2 + Neo), strih a hudba — video pripravené na web aj sociálne siete.",
      "cat.care.t": "Správa & údržba", "cat.care.d": "Mesačná starostlivosť o web a úpravy existujúcich stránok — Umbraco, WordPress, PrestaShop.",
      "cat.more": "Viac o službe",
      "showreel.eyebrow": "O štúdiu", "showreel.title": "MRAZOSOFT za 30 sekúnd", "showreel.sub": "Krátky príbeh štúdia — pustite si ho so zvukom.", "showreel.play": "Prehrať príbeh", "showreel.drone": "Pozrieť dronové videá", "showreel.more": "Ďalšie klipy z našej AI dielne",
      "hero.trust": "Odpoveď do pár hodín · nezáväzne · kód patrí vám",
      "hero.cta1": "Ozvite sa mi", "hero.cta2": "Pozrieť projekty",
      "hero.stat1": "nasadených projektov", "hero.stat2": "recenzie na Google", "hero.stat3": "odpoveď na dopyt", "hero.stat3v": "pár hodín",
      "services.eyebrow": "Čo pre vás spravím", "services.title": "Tvorba webov, aplikácií a e-shopov na mieru", "services.sub": "Celý vývoj pod jednou strechou — od prvej skice po živý web. Vývojár z Popradu pre klientov z celého Slovenska.",
      "services.web.t": "Tvorba web stránok", "services.web.d": "Tvorba web stránok na mieru — rýchle prezentačné weby, firemné stránky a landing pages, ktoré jasne vysvetlia vašu ponuku a vedú návštevníka ku kontaktu.", "services.web.price": "od 390 €",
      "services.apps.t": "Mobilné a webové aplikácie (PWA)", "services.apps.d": "Tvorba mobilných a webových aplikácií na mieru — PWA a Android appky pre interné systémy, zákaznícke portály alebo jednoduché nástroje, ktoré fungujú aj v mobile.", "services.apps.price": "od 1 200 €",
      "services.ecom.t": "Tvorba a úpravy e-shopov (PrestaShop)", "services.ecom.d": "Tvorba e-shopov a úpravy PrestaShop — moduly a integrácie, produktové feedy, Heureka, exporty, importy, ERP napojenia a automatizácia rutiny.", "services.ecom.price": "od 45 €/hod",
      "services.tools.t": "Python automatizácia & scraping", "services.tools.d": "Python nástroje, scraping, generovanie reportov a prepojenia medzi systémami, ktoré znižujú ručnú prácu a šetria hodiny každý týždeň.", "services.tools.price": "od 250 €",
      "catsec.web.sub": "Od jednostranovej vizitky po e-shop — všetko na mieru, rýchle a pripravené privádzať zákazníkov.",
      "catsec.ai.sub": "AI, ktorá reálne pracuje pre vašu firmu — odpovedá zákazníkom, presúva dáta a šetrí hodiny ručnej práce.",
      "catsec.video.sub": "Letecké zábery, ktoré predávajú — prevádzky, reality, podujatia a krajina v okolí Popradu a Tatier.",
      "catsec.care.sub": "Váš web žije aj po spustení — a nemusí byť odo mňa, aby som sa oň postaral.",
      "svc.eshop.t": "E-shop na mieru", "svc.eshop.d": "Nový e-shop (PrestaShop) s katalógom, platbami, dopravou a napojením na Heureku — postavený tak, aby ste ho vedeli spravovať bez programátora.", "svc.eshop.price": "od 1 200 €",
      "svc.aiimpl.t": "AI implementácie", "svc.aiimpl.d": "Chatbot na webe, AI agent napojený na vaše dáta a dokumenty alebo AI asistent pre váš tím — navrhnem, nasadím a naučím vás s ním pracovať.", "svc.aiimpl.price": "od 490 €",
      "svc.n8n.t": "AI automatizácie (n8n)", "svc.n8n.d": "Prepojím vaše systémy do automatických tokov: objednávky → sklad, leady → CRM, reporty na e-mail. Nastavím to raz a beží to samo, 24/7.", "svc.n8n.price": "od 350 €",
      "svc.drone.t": "Dronové promo video", "svc.drone.d": "Natáčanie dronom (DJI Avata 2 + DJI Neo), strih, hudba a odovzdanie v 4K — video pripravené na web, sociálne siete aj reklamu. Región Poprad / Vysoké Tatry, iné lokality po dohode.", "svc.drone.price": "od 290 €",
      "svc.cms.t": "Správa CMS — Umbraco / WordPress / PrestaShop", "svc.cms.d": "Úpravy existujúcich firemných webov bez výmeny dodávateľa: nové sekcie a funkcie, moduly, produktové feedy, opravy rýchlosti aj migrácie obsahu.", "svc.cms.price": "od 45 €/hod",
      "embed.note": "Kliknutím na ukážku sa načíta video z YouTube (youtube-nocookie.com) — dovtedy sa nič neposiela tretím stranám.",
      "services.starter.t": "Starter landing page", "services.starter.d": "Profesionálna 1-stranová stránka pre malé firmy a živnostníkov — s kontaktným formulárom, SSL certifikátom a napojením na Google Maps. Do 72 hodín online.", "services.starter.price": "od 199 €",
      "services.audit.t": "Audit webu", "services.audit.d": "Nezávislá kontrola vášho webu — rýchlosť, SEO, bezpečnosť a GDPR. Do 48 hodín dostanete zrozumiteľný report so zoznamom opráv podľa priority. Pri objednávke opráv u mňa cenu auditu odpočítam.", "services.audit.price": "149 €",
      "services.retainer.t": "Správa webu & mesačná starostlivosť", "services.retainer.d": "Hosting monitoring, drobné aktualizácie obsahu, bezpečnostné záplaty (WP, PS) a rýchle opravy. Žiadne čakanie na termíny a ponuky.", "services.retainer.price": "od 50 €/mesiac",
      "region.eyebrow": "Kde pôsobím", "region.title": "Tvorba webov pre Poprad a celé Slovensko", "region.sub": "Sídlim v Poprade, no pracujem online — weby, e-shopy a aplikácie robím pre klientov z celého Slovenska. Osobné stretnutie v regióne Spiš a Vysoké Tatry je možné po dohode.",
      "audience.eyebrow": "Pre koho", "audience.title": "Pre koho tvorím riešenia", "audience.sub": "Pomáham menším firmám a podnikateľom dostať sa online — jednoducho a bez zbytočností.",
      "audience.1.t": "Lokálne firmy a živnostníci", "audience.1.d": "Web, ktorý vás predstaví a privedie zákazníkov z okolia — dizajn, texty aj lokálne SEO.",
      "audience.2.t": "Remeslá a služby", "audience.2.d": "Kaderníctvo, upratovanie, montáže… jednoduchý web s jasnou ponukou a objednaním cez formulár či WhatsApp.",
      "audience.3.t": "Malé e-shopy", "audience.3.d": "Predávate produkty a chcete aj online — postavím alebo upravím e-shop s napojením na Heureku a platby.",
      "audience.4.t": "Ľudia s nápadom", "audience.4.d": "Máte nápad na appku alebo nástroj? Premením ho na PWA, ktorá beží na mobile aj počítači.",
      "pkg.eyebrow": "Riešenia na mieru", "pkg.title": "S čím vám pomôžem", "pkg.sub": "Vyberte, čo vás zaujíma — cenu prispôsobím rozsahu po krátkej konzultácii.", "pkg.price": "Cena podľa rozsahu", "pkg.cta": "Mám záujem",
      "pkg.web.t": "Prezentačný web", "pkg.web.for": "Pre firmy a živnostníkov, ktorí chcú pôsobiť dôveryhodne.", "pkg.web.l1": "Dizajn na mieru", "pkg.web.l2": "Texty, ktoré predávajú", "pkg.web.l3": "Mobilná verzia", "pkg.web.l4": "Formulár + WhatsApp", "pkg.web.l5": "Základné SEO",
      "pkg.ecom.t": "E-shop", "pkg.ecom.for": "Pre tých, čo chcú predávať produkty aj online.", "pkg.ecom.l1": "Katalóg a košík", "pkg.ecom.l2": "Platby a doprava", "pkg.ecom.l3": "Napojenie na Heureku", "pkg.ecom.l4": "Úpravy PrestaShopu", "pkg.ecom.l5": "Správa obsahu",
      "pkg.app.t": "Webová aplikácia / PWA", "pkg.app.for": "Pre nástroje, portály a nápady, ktoré majú fungovať všade.", "pkg.app.l1": "Appka pre mobil aj počítač", "pkg.app.l2": "Offline režim", "pkg.app.l3": "Inštalácia bez obchodu", "pkg.app.l4": "Prihlásenie používateľov", "pkg.app.l5": "Riešenie na mieru",
      "services.from": "už od", "services.price": "Cena na vyžiadanie", "services.guarantee": "Máte projekt alebo nápad? Rád sa o ňom pozhováram — stačí sa ozvať.",
      "projects.eyebrow": "Moja tvorba", "projects.title": "Projekty z praxe", "projects.sub": "Žiadne mockupy z fotobanky — toto sú reálne weby, aplikácie a nástroje, ktoré som navrhol, vyvíjal alebo nasadil.",
      "proj.rytmiko.d": "PWA edukačná hra pre deti s Downovým syndrómom — sedem hier na vzory, počítanie a zvuky, slovenské neurónové hlasy a maskot Zajko. Funguje offline a inštaluje sa do telefónu.",
      "proj.harmony.d": "Web pre upratovaciu službu z Popradu — „víkendy sú na oddych\". Kompletný dizajn, copywriting, SEO a napojenie objednávok na WhatsApp. Stránka, ktorá premieňa návštevníkov na klientov.",
      "proj.fleet.d": "PWA a Android appka na správu vozidiel — STK, emisie, diaľničná známka a servis s farebným semaforom, ktorý vás upozorní skôr, než vyprší termín.",
      "proj.heureka.d": "Python nástroj na opravu nesparovaných produktov pre Heureka.sk — spracuje XML feed a vyexportuje CSV pre PrestaShop Store Manager. Z hodín ručnej práce sú sekundy.",
      "case.problem": "Problém:", "case.solution": "Riešenie:", "case.result": "Výsledok:",
      "proj.rytmiko.p": "Deti s Downovým syndrómom potrebujú jednoduché, hravé a dostupné cvičenia na vzory, počítanie a zvuky.", "proj.rytmiko.s": "Vznikla PWA edukačná hra so siedmimi aktivitami, slovenskými neurónovými hlasmi, maskotom Zajkom a offline režimom.", "proj.rytmiko.r": "Aplikácia sa dá spustiť v prehliadači aj nainštalovať do telefónu. Projekt je pripravený na ďalšie testovanie a spätnú väzbu.",
      "proj.harmony.p": "Upratovacia služba potrebovala jednoduchý web, ktorý jasne vysvetlí ponuku a rýchlo privedie zákazníka ku kontaktu.", "proj.harmony.s": "Navrhol som web s jasnou štruktúrou, lokálnym SEO, copywritingom a napojením objednávok na WhatsApp.", "proj.harmony.r": "Návštevník vie rýchlo pochopiť služby, lokalitu aj spôsob objednania cez WhatsApp.",
      "proj.fleet.p": "Termíny STK, emisnej kontroly, diaľničnej známky a servisu sa ľahko stratia v poznámkach alebo kalendári.", "proj.fleet.s": "PWA a Android aplikácia sleduje vozidlá a zobrazuje stav termínov pomocou jednoduchého farebného semaforu.", "proj.fleet.r": "Používateľ vidí rizikové termíny skôr, než vznikne problém — STK, emisie, diaľničná aj servis pod kontrolou.",
      "proj.heureka.p": "Nespárované produkty z XML feedu bolo potrebné ručne opravovať a pripravovať pre PrestaShop Store Manager.", "proj.heureka.s": "Vytvoril som Python nástroj, ktorý načíta XML feed, spáruje produkty a vyexportuje pripravený CSV súbor.", "proj.heureka.r": "1 842 spracovaných položiek, 1 790 spárovaných, 52 nespárovaných. Práca, ktorá trvala hodiny, je hotová za sekundy.",
      "proj.tajny.p": "Hoaxy, mýty a polopravdy sa šíria rýchlejšie, než sa dajú overiť — a ručná kontrola faktov zaberie čas.", "proj.tajny.s": "macOS aplikácia, do ktorej vložíte tvrdenie. Overí ho cez web a umelú inteligenciu a vygeneruje PDF verdikt so skóre dôveryhodnosti, zdrojmi a zaradením do jednej zo 7 kategórií (pravda, mýtus, hoax, lož…).", "proj.tajny.r": "Z tvrdenia je do minúty prehľadný verdikt s vysvetlením, zdrojmi a PDF výstupom. Projekt slúži ako interný AI nástroj na overovanie tvrdení.",
      "proj.rytmiko.home": "Deti s Downovým syndrómom potrebovali hravé a dostupné cvičenia — vznikla PWA so 7 aktivitami, slovenskými hlasmi a offline režimom.",
      "proj.harmony.home": "Upratovacia firma nemala web, ktorý privádza zákazníkov — vznikla prehľadná stránka s lokálnym SEO a objednaním cez WhatsApp.",
      "proj.tajny.home": "Overiť tvrdenie ručne zaberie čas — vznikol AI nástroj, ktorý z tvrdenia spraví verdikt so zdrojmi a PDF do minúty.",
      "proj.view": "Otvoriť naživo", "proj.private": "Na vyžiadanie", "proj.demo": "Ukážka", "status.live": "Live", "status.dev": "Vo vývoji", "status.exp": "AI experiment", "status.req": "Na vyžiadanie", "proj.preview": "Pozrieť ukážku",
      "process.eyebrow": "Spolupráca", "process.title": "Ako prebieha spolupráca", "process.sub": "Jednoducho, transparentne a bez stresu. Štyri kroky od nápadu k hotovému produktu.",
      "process.s1.t": "Nápad & konzultácia", "process.s1.d": "Prejdeme si cieľ, rozpočet a najjednoduchšiu cestu k funkčnému riešeniu. Bez technickej hmly.",
      "process.s2.t": "Návrh & dizajn", "process.s2.d": "Pripravím štruktúru a vizuál, aby ste pred vývojom videli, čo presne vznikne.",
      "process.s3.t": "Vývoj", "process.s3.d": "Naprogramujem riešenie čisto, rýchlo a bez zbytočností, ktoré by spomaľovali web alebo predražovali údržbu.",
      "process.s4.t": "Nasadenie & podpora", "process.s4.d": "Projekt spustím, odovzdám prístupy a zostávam k dispozícii na úpravy alebo rozšírenia.",
      "about.eyebrow": "O mne", "about.title": "Jeden človek. Celý projekt v jedných rukách.",
      "about.p1": "MRAZOSOFT je tvorba Petra Mráza — vývojára z Popradu. Od návrhu cez kód až po nasadenie riešite projekt priamo s človekom, ktorý ho aj reálne tvorí.",
      "about.p2": "Bez account manažérov, bez prehadzovania zodpovednosti a bez zbytočne nafúknutých cien. Výsledkom má byť web, aplikácia, AI riešenie, automatizácia či dronové video — rýchle, zrozumiteľné a patriace klientovi.",
      "about.f1.t": "Rýchle načítanie", "about.f1.d": "Weby a aplikácie optimalizované na výkon, SEO a použiteľnosť.",
      "about.f2.t": "Vlastný kód", "about.f2.d": "Bez ťažkých frameworkov tam, kde nie sú potrebné.",
      "about.f3.t": "Osobný prístup", "about.f3.d": "Komunikujete priamo s autorom, nie s callcentrom.",
      "contact.eyebrow": "Poďme sa rozprávať", "contact.title": "Máte nápad? Premením ho na web, appku alebo automatizáciu, ktorá dáva obchodný zmysel.",
      "contact.text": "Napíšte mi pár riadkov o tom, čo potrebujete. Ozvem sa do pár hodín s návrhom ďalšieho postupu a orientačnou cenou.",
      "contact.cta": "Napíšte e-mail", "contact.or": "alebo rovno",
      "form.name": "Vaše meno", "form.contact": "E-mail alebo telefón", "form.msg": "Čo potrebujete? Pár riadkov stačí.",
      "form.send": "Odoslať dopyt", "form.sending": "Odosielam…", "form.sent": "Ďakujem! Dopyt dorazil — ozvem sa do pár hodín.", "form.ok": "Otváram váš e-mail — dopyt už len odošlite. (Ak sa klient neotvoril, napíšte na petermraz@mrazosoft.sk.)", "form.err": "Niečo sa pokazilo — napíšte priamo na petermraz@mrazosoft.sk.", "form.interest": "O čo máte záujem? (kliknite, čo sa hodí)",
      "stop.mercury": "Merkúr · Služby", "stop.venus": "Venuša · Projekty", "stop.earth": "Zem · O mne", "stop.mars": "Mars · Blog",
      "stop.jupiter": "Jupiter · Pre koho", "stop.saturn": "Saturn · Spolupráca", "stop.uranus": "Urán · Recenzie", "stop.neptune": "Neptún · Kontakt",
      "stop.exit": "Mliečna dráha · Pohľad domov", "exit.top": "Späť na začiatok", "exit.contact": "Napísať dopyt",
      "exit.line1": "Mliečna dráha — 200 miliárd hviezd.", "exit.line2": "Tá modrá iskra v ramene? To sme my.",
      "blogteaser.title": "Rady pred kúpou webu", "blogteaser.sub": "Píšem zrozumiteľne, bez žargónu — nech presne viete, do čoho idete.", "blogteaser.open": "Otvoriť blog",
      "cta.price": "Vyžiadať nezáväznú cenu", "cta.similar": "Chcem podobný projekt", "cta.collab": "Začať spoluprácu",
      "nudge.eyebrow": "Ešte než odletíte", "nudge.t": "Bezplatná 15-minútová konzultácia",
      "nudge.p": "Poviete mi, čo potrebujete — poviem vám, čo by som postavil, za koľko a dokedy. Nezáväzne a ľudskou rečou.",
      "nudge.cta": "Napísať dopyt", "skip.flight": "Preskočiť let", "fm.title": "Mapa letu", "fm.home": "Mliečna dráha · Domov", "a11y.skip": "Preskočiť na obsah", "hint.swipe": "Potiahnite prstom — letíte sústavou",
      "faqm.q1": "Koľko stojí web stránka?", "faqm.a1": "Jednostranová landing page od 199 €, viacstranový web od 390 €, e-shop od 1 200 € — presná cena závisí od rozsahu a napojení.",
      "faqm.q2": "Web alebo e-shop — čo skôr?", "faqm.a2": "Ak služby prezentujete, stačí web s kontaktom. Ak chcete predávať produkty online, dáva zmysel e-shop — dá sa začať webom a predaj doplniť neskôr.",
      "faqm.q3": "Čo je PWA aplikácia?", "faqm.a3": "Webová aplikácia, ktorá sa správa ako mobilná appka — nainštaluje sa na plochu a funguje aj offline, bez App Store a poplatkov zaň.",
      "faqm.more": "Celý článok →",
      "trust.1": "✓ Pevná cena vopred", "trust.2": "✓ Odpoveď do pár hodín", "trust.3": "✓ Kód je váš", "trust.4": "✓ Bez záväzkov",
      "why.eyebrow": "Výhody", "why.title": "Prečo MRAZOSOFT",
      "why.1.t": "Priama komunikácia", "why.1.d": "Komunikujete priamo s vývojárom, nie cez sprostredkovateľov.",
      "why.2.t": "Pevná cena vopred", "why.2.d": "Pred začiatkom viete, čo sa bude robiť, koľko to bude stáť a čo bude výsledkom.",
      "why.3.t": "Kód patrí vám", "why.3.d": "Žiadne zbytočné uzamknutie v platforme, ktorú nevlastníte.",
      "why.4.t": "Podpora po spustení", "why.4.d": "Po odovzdaní projektu viem riešiť úpravy, opravy aj ďalší rozvoj.",
      "pkg.web.price": "od 390 €", "pkg.ecom.price": "od 1 200 €", "pkg.app.price": "od 1 200 €",
      "pkg.note": "Orientačné ceny — finálna suma závisí od rozsahu, počtu stránok, funkcií a napojení. Presnú ponuku dostanete po krátkej konzultácii.",
      "testi.eyebrow": "Recenzie", "testi.title": "Čo hovoria klienti", "testi.sub": "Žiadne vymyslené citáty — hodnotenia sú priamo na Googli.",
      "testi.1.q": "Z 1 842 položiek feedu sa 1 790 spárovalo automaticky — práca na hodiny je hotová za pár sekúnd.", "testi.1.who": "Heureka Patcher", "testi.1.role": "nástroj pre e-shop",
      "testi.2.q": "Upratovacia firma z Popradu dostala prehľadný web s lokálnym SEO a objednávaním cez WhatsApp — zákazník sa objedná na pár klikov.", "testi.2.who": "Harmony Home", "testi.2.role": "živý web · harmonyhome.sk",
      "testi.3.q": "PWA pre deti s Downovým syndrómom: sedem hier, slovenské hlasy, funguje offline aj po inštalácii do telefónu.", "testi.3.who": "Rytmiko", "testi.3.role": "živá PWA · rytmiko.mrazosoft.sk",
      "greview.count": "4 recenzie na Google", "greview.q": "„Potreboval som aplikáciu — rýchly návrh a kvalitný výsledok. Zákaznícka podpora a ochota top.\"", "greview.by": "— recenzia klienta na Google", "greview.link": "Všetky recenzie ↗",
      "about.risk.eyebrow": "Istota", "about.risk.title": "Jeden človek — a čo keď nebude čas alebo zdravie?",
      "about.risk.p1": "Férová otázka. Keď stojí za projektom jeden vývojár, je namieste vedieť, čo sa stane, ak raz vypadnem. Beriem to vážne — preto je spolupráca nastavená tak, aby ste neostali visieť vo vzduchu.",
      "about.risk.p2": "Všetko podstatné je vaše a u vás: kód, prístupy, doména aj hosting sú vedené na vás, nie uzamknuté u mňa. Web či aplikácia stojí na štandardných technológiách bez exotických závislostí, takže ich v prípade potreby dokáže prevziať a upraviť ktorýkoľvek iný vývojár.",
      "about.risk.p3": "A naopak — to, že nie ste jednou z dvadsiatich zákaziek v agentúre, je výhoda: komunikujete priamo so mnou, viete kedy čo robím, dohody platia a po spustení som k dispozícii na úpravy aj ďalší rozvoj. Pri väčších projektoch sa vopred dohodneme na realistických termínoch a v prípade potreby viem prizvať preverených kolegov.",
      "faq.eyebrow": "Otázky", "faq.title": "Časté otázky",
      "faq.q1": "Koľko stojí web stránka?", "faq.a1": "Závisí od rozsahu, funkcií a obsahu. Konkrétne si to vieme prejsť, keď sa ozvete — nezáväzne.",
      "faq.q2": "Ako dlho trvá vytvorenie webu?", "faq.a2": "Menší web sa dá pripraviť približne za 1 až 3 týždne. Väčšie aplikácie a e-shopy závisia od rozsahu.",
      "faq.q3": "Budem si vedieť web upravovať?", "faq.a3": "Áno, ak to projekt vyžaduje. Pri WordPress alebo e-commerce riešeniach viem pripraviť správu obsahu tak, aby ste zvládli bežné úpravy sami.",
      "faq.q4": "Robíte aj úpravy existujúceho webu?", "faq.a4": "Áno. Riešim úpravy webov — Umbraco, WordPress aj PrestaShop: rýchlosť, technické opravy, formuláre, napojenia aj automatizácie.",
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
      "nav.home": "Home", "nav.about": "About", "nav.services": "Services", "nav.projects": "Projects", "nav.blog": "Blog", "nav.process": "How it works", "nav.faq": "FAQ", "nav.contact": "Contact", "nav.cta": "Get in touch", "nav.status": "Open for work", "splash.skip": "click to skip",
      "page.about.sub": "A developer from Poprad — the whole project in one pair of hands.", "page.contact.sub": "Drop me a few lines about what you need. I'll get back within a few hours.",
      "home.projects.title": "Selected projects", "home.projects.sub": "A few examples from real work — the full portfolio is on the Projects page.", "proj.all": "See all projects",
      "cta.title": "Got a project or an idea? Let's talk.", "cta.text": "Tell me a few lines about what you need. Within a few hours you'll have a reply and a suggested next step — no commitment, plain language.", "cta.wa": "Message on WhatsApp", "cta.trust": "Reply within hours · No commitment · The code is yours",
      "hero.badge": "Peter Mráz · developer from Poprad — open for new projects",
      "hero.lead": "I build", "hero.line1": "Your business, the centre of the universe.", "hero.rest": "I build the sites, apps and AI that orbit around your customers.",
      "hero.sub": "I'm Peter Mráz — a developer from Poprad. I'll get your business online: I design and build a website, e-shop or app that looks credible, loads instantly and brings inquiries. All in one pair of hands, without agency prices.",
      "cat.web.t": "Websites & apps", "cat.web.d": "Presentation sites, landing pages, PWA apps and e-shops — from design to launch.",
      "cat.ai.t": "AI & automation", "cat.ai.d": "Chatbots and AI agents connected to your data, n8n automations and Python tools.",
      "cat.video.t": "Video & drones", "cat.video.d": "Drone promo footage (DJI Avata 2 + Neo), editing and music — ready for the web and social media.",
      "cat.care.t": "Care & maintenance", "cat.care.d": "Monthly website care and changes to existing sites — Umbraco, WordPress, PrestaShop.",
      "cat.more": "Learn more",
      "showreel.eyebrow": "About the studio", "showreel.title": "MRAZOSOFT in 30 seconds", "showreel.sub": "A short story of the studio — play it with the sound on.", "showreel.play": "Play the story", "showreel.drone": "See drone videos", "showreel.more": "More clips from our AI workshop",
      "hero.trust": "Reply within hours · no commitment · the code is yours",
      "hero.cta1": "Get in touch", "hero.cta2": "See the projects",
      "hero.stat1": "shipped projects", "hero.stat2": "reviews on Google", "hero.stat3": "reply to an enquiry", "hero.stat3v": "a few hours",
      "services.eyebrow": "What I'll build for you", "services.title": "Custom website, app and e-shop development", "services.sub": "The whole build under one roof — from the first sketch to a live site. A developer from Poprad for clients across Slovakia.",
      "services.web.t": "Web development", "services.web.d": "Custom website development — fast presentation sites, company websites and landing pages that clearly explain your offer and lead the visitor to get in touch.", "services.web.price": "from €390",
      "services.apps.t": "Mobile & web apps (PWA)", "services.apps.d": "Custom mobile and web app development — PWAs and Android apps for internal systems, customer portals or simple tools that work on mobile too.", "services.apps.price": "from €1,200",
      "services.ecom.t": "E-shop development (PrestaShop)", "services.ecom.d": "E-shop development and PrestaShop work — modules and integrations, product feeds, Heureka, exports, imports, ERP connections and routine automation.", "services.ecom.price": "from €45/hr",
      "services.tools.t": "Python automation & scraping", "services.tools.d": "Python tools, scraping, report generation and system integrations that cut manual work and save hours every week.", "services.tools.price": "from €250",
      "catsec.web.sub": "From a one-page site to an e-shop — all custom-built, fast and ready to bring customers.",
      "catsec.ai.sub": "AI that actually works for your business — answering customers, moving data and saving hours of manual work.",
      "catsec.video.sub": "Aerial footage that sells — venues, real estate, events and landscapes around Poprad and the Tatras.",
      "catsec.care.sub": "Your website lives on after launch — and it doesn't have to be built by me for me to take care of it.",
      "svc.eshop.t": "Custom e-shop", "svc.eshop.d": "A new e-shop (PrestaShop) with catalogue, payments, shipping and Heureka integration — built so you can manage it without a developer.", "svc.eshop.price": "from €1,200",
      "svc.aiimpl.t": "AI implementations", "svc.aiimpl.d": "A chatbot on your website, an AI agent connected to your data and documents, or an AI assistant for your team — I design it, deploy it and teach you to work with it.", "svc.aiimpl.price": "from €490",
      "svc.n8n.t": "AI automations (n8n)", "svc.n8n.d": "I connect your systems into automated flows: orders → warehouse, leads → CRM, reports → e-mail. Set up once, runs on its own, 24/7.", "svc.n8n.price": "from €350",
      "svc.drone.t": "Drone promo video", "svc.drone.d": "Drone filming (DJI Avata 2 + DJI Neo), editing, music and 4K delivery — video ready for the web, social media and ads. Poprad / High Tatras region, other locations by agreement.", "svc.drone.price": "from €290",
      "svc.cms.t": "CMS care — Umbraco / WordPress / PrestaShop", "svc.cms.d": "Changes to existing business websites without switching suppliers: new sections and features, modules, product feeds, speed fixes and content migrations.", "svc.cms.price": "from €45/hour",
      "embed.note": "Clicking a preview loads the video from YouTube (youtube-nocookie.com) — until then, nothing is sent to third parties.",
      "services.starter.t": "Starter landing page", "services.starter.d": "A professional single-page site for small businesses and freelancers — with a contact form, SSL and Google Maps integration. Live within 72 hours.", "services.starter.price": "from €199",
      "services.audit.t": "Website audit", "services.audit.d": "An independent check of your website — speed, SEO, security and GDPR. Within 48 hours you get a clear report with a prioritized fix list. Order the fixes from me and the audit price is deducted.", "services.audit.price": "€149",
      "services.retainer.t": "Maintenance & monthly care", "services.retainer.d": "Hosting monitoring, small content updates, security patches (WP, PS) and quick fixes. No waiting for quotes and deadlines.", "services.retainer.price": "from €50/month",
      "region.eyebrow": "Where I work", "region.title": "Web development for Poprad and all of Slovakia", "region.sub": "I'm based in Poprad but work online — I build websites, e-shops and apps for clients across Slovakia. An in-person meeting in the Spiš and High Tatras region is possible by arrangement.",
      "audience.eyebrow": "Who it's for", "audience.title": "Who I build solutions for", "audience.sub": "I help smaller businesses and entrepreneurs get online — simply and without the clutter.",
      "audience.1.t": "Local businesses & sole traders", "audience.1.d": "A website that introduces you and brings in customers from the area — design, copy and local SEO.",
      "audience.2.t": "Trades & services", "audience.2.d": "Hairdressers, cleaning, installations… a simple website with a clear offer and ordering via a form or WhatsApp.",
      "audience.3.t": "Small e-shops", "audience.3.d": "You sell products and want to sell online too — I'll build or improve an e-shop with Heureka and payments.",
      "audience.4.t": "People with an idea", "audience.4.d": "Got an idea for an app or tool? I'll turn it into a PWA that runs on mobile and desktop.",
      "pkg.eyebrow": "Tailored solutions", "pkg.title": "What I can help with", "pkg.sub": "Pick what interests you — I'll match the price to the scope after a short consultation.", "pkg.price": "Price by scope", "pkg.cta": "I'm interested",
      "pkg.web.t": "Presentation website", "pkg.web.for": "For businesses and sole traders who want to look credible.", "pkg.web.l1": "Custom design", "pkg.web.l2": "Copy that sells", "pkg.web.l3": "Mobile version", "pkg.web.l4": "Form + WhatsApp", "pkg.web.l5": "Basic SEO",
      "pkg.ecom.t": "E-shop", "pkg.ecom.for": "For those who want to sell products online.", "pkg.ecom.l1": "Catalogue & cart", "pkg.ecom.l2": "Payments & shipping", "pkg.ecom.l3": "Heureka integration", "pkg.ecom.l4": "PrestaShop tweaks", "pkg.ecom.l5": "Content management",
      "pkg.app.t": "Web app / PWA", "pkg.app.for": "For tools, portals and ideas that should work everywhere.", "pkg.app.l1": "App for mobile & desktop", "pkg.app.l2": "Offline mode", "pkg.app.l3": "Install without a store", "pkg.app.l4": "User login", "pkg.app.l5": "Tailor-made",
      "services.from": "from", "services.price": "Price on request", "services.guarantee": "Got a project or an idea? Happy to talk it through — just get in touch.",
      "projects.eyebrow": "My work", "projects.title": "Projects from real work", "projects.sub": "No stock mockups — these are real websites, apps and tools I designed, built or deployed.",
      "proj.rytmiko.d": "A PWA educational game for children with Down syndrome — seven games for patterns, counting and sounds, Slovak neural voices and the mascot Zajko. Works offline and installs to the phone.",
      "proj.harmony.d": "Website for a cleaning service from Poprad — \"weekends are for rest\". Full design, copywriting, SEO and WhatsApp order integration. A site that turns visitors into clients.",
      "proj.fleet.d": "A PWA and Android app for fleet management — inspections, emissions, vignette and service with a colour traffic-light that warns you before a deadline expires.",
      "proj.heureka.d": "A Python tool to fix unmatched products for Heureka.sk — it processes the XML feed and exports CSV for PrestaShop Store Manager. Hours of manual work become seconds.",
      "case.problem": "Problem:", "case.solution": "Solution:", "case.result": "Result:",
      "proj.rytmiko.p": "Children with Down syndrome need simple, playful and accessible exercises for patterns, counting and sounds.", "proj.rytmiko.s": "A PWA educational game with seven activities, Slovak neural voices, the mascot Zajko and an offline mode.", "proj.rytmiko.r": "The app runs in the browser and installs to the phone. The project is ready for further testing and feedback.",
      "proj.harmony.p": "The cleaning service needed a simple website that clearly explains the offer and quickly leads the customer to get in touch.", "proj.harmony.s": "I designed a website with a clear structure, local SEO, copywriting and WhatsApp order integration.", "proj.harmony.r": "Visitors quickly understand the services, the location and how to order via WhatsApp.",
      "proj.fleet.p": "Deadlines for inspections, emissions, the vignette and service are easily lost in notes or a calendar.", "proj.fleet.s": "A PWA and Android app tracks the vehicles and shows the deadline status with a simple colour traffic-light.", "proj.fleet.r": "The user sees risky deadlines before a problem arises — inspections, emissions, vignette and service under control.",
      "proj.heureka.p": "Unmatched products from the XML feed had to be fixed by hand and prepared for PrestaShop Store Manager.", "proj.heureka.s": "I built a Python tool that loads the XML feed, matches products and exports a ready CSV file.", "proj.heureka.r": "1,842 items processed, 1,790 matched, 52 unmatched. Work that took hours is done in seconds.",
      "proj.tajny.p": "Hoaxes, myths and half-truths spread faster than they can be checked — and verifying facts by hand takes time.", "proj.tajny.s": "A macOS app where you paste a claim. It verifies it against the web and AI and generates a PDF verdict with a credibility score, sources and one of 7 categories (true, myth, hoax, lie…).", "proj.tajny.r": "A claim becomes a clear verdict — with reasoning, sources and a PDF output — within a minute. The project serves as an internal AI tool for fact-checking claims.",
      "proj.rytmiko.home": "Children with Down syndrome needed playful, accessible exercises — so I built a PWA with 7 activities, Slovak voices and an offline mode.",
      "proj.harmony.home": "A cleaning company had no website that brings customers — so I built a clear site with local SEO and WhatsApp ordering.",
      "proj.tajny.home": "Verifying a claim by hand takes time — so I built an AI tool that turns a claim into a verdict with sources and a PDF in a minute.",
      "proj.view": "Open live", "proj.private": "On request", "proj.demo": "Demo", "status.live": "Live", "status.dev": "In development", "status.exp": "AI experiment", "status.req": "On request", "proj.preview": "See the demo",
      "process.eyebrow": "Working together", "process.title": "How we work together", "process.sub": "Simple, transparent and stress-free. Four steps from idea to finished product.",
      "process.s1.t": "Idea & consultation", "process.s1.d": "We go over the goal, the budget and the simplest path to a working solution. No technical fog.",
      "process.s2.t": "Design & concept", "process.s2.d": "I prepare the structure and visuals so you see exactly what will be built before development.",
      "process.s3.t": "Development", "process.s3.d": "I build the solution cleanly, fast and without the clutter that would slow the site down or inflate maintenance.",
      "process.s4.t": "Launch & support", "process.s4.d": "I launch the project, hand over the access and stay available for changes or extensions.",
      "about.eyebrow": "About", "about.title": "One person. The whole project in one pair of hands.",
      "about.p1": "MRAZOSOFT is the work of Peter Mráz — a developer from Poprad. From design through code to deployment, you deal directly with the person who actually builds it.",
      "about.p2": "No account managers, no shifting of responsibility and no needlessly inflated prices. The result should be a website, app, AI solution, automation or drone video — fast, clear and belonging to the client.",
      "about.f1.t": "Blazing speed", "about.f1.d": "Sites and apps optimised for performance and Google.",
      "about.f2.t": "Own code", "about.f2.d": "No heavy frameworks where they aren't needed.",
      "about.f3.t": "Personal approach", "about.f3.d": "You talk directly to the author, not a call centre.",
      "contact.eyebrow": "Let's talk", "contact.title": "Got an idea? I'll turn it into a website, app or automation that makes business sense.",
      "contact.text": "Drop me a few lines about what you need. I'll get back within a few hours with the next steps and a ballpark price.",
      "contact.cta": "Email me", "contact.or": "or just",
      "form.name": "Your name", "form.contact": "E-mail or phone", "form.msg": "What do you need? A few lines is enough.",
      "form.send": "Send enquiry", "form.sending": "Sending…", "form.sent": "Thanks! Your enquiry arrived — I'll get back within a few hours.", "form.ok": "Opening your email — just hit send. (If it didn't open, write to petermraz@mrazosoft.sk.)", "form.err": "Something went wrong — email petermraz@mrazosoft.sk directly.", "form.interest": "What are you interested in? (tap what fits)",
      "stop.mercury": "Mercury · Services", "stop.venus": "Venus · Projects", "stop.earth": "Earth · About", "stop.mars": "Mars · Blog",
      "stop.jupiter": "Jupiter · Who it's for", "stop.saturn": "Saturn · Process", "stop.uranus": "Uranus · Reviews", "stop.neptune": "Neptune · Contact",
      "stop.exit": "Milky Way · Looking home", "exit.top": "Back to the start", "exit.contact": "Send an enquiry",
      "exit.line1": "The Milky Way — 200 billion stars.", "exit.line2": "That blue spark in the arm? That's us.",
      "blogteaser.title": "Advice before buying a website", "blogteaser.sub": "Written in plain language, no jargon — so you know exactly what you're getting into.", "blogteaser.open": "Open the blog",
      "cta.price": "Request a free quote", "cta.similar": "I want a similar project", "cta.collab": "Start a collaboration",
      "nudge.eyebrow": "Before you fly away", "nudge.t": "Free 15-minute consultation",
      "nudge.p": "Tell me what you need — I'll tell you what I'd build, for how much and by when. No obligation.",
      "nudge.cta": "Send an enquiry", "skip.flight": "Skip the flight", "fm.title": "Flight map", "fm.home": "Milky Way · Home", "a11y.skip": "Skip to content", "hint.swipe": "Swipe — you are flying the system",
      "faqm.q1": "How much does a website cost?", "faqm.a1": "A single-page landing from €199, a multi-page site from €390, an e-shop from €1,200 — the exact price depends on scope and integrations.",
      "faqm.q2": "Website or e-shop — which first?", "faqm.a2": "If you present services, a website with contact is enough. To sell products online, an e-shop makes sense — you can start with a website and add sales later.",
      "faqm.q3": "What is a PWA app?", "faqm.a3": "A web application that behaves like a mobile app — installs to the home screen and works offline, no App Store needed.",
      "faqm.more": "Full article →",
      "trust.1": "✓ Fixed price up front", "trust.2": "✓ Reply within hours", "trust.3": "✓ The code is yours", "trust.4": "✓ No commitment",
      "why.eyebrow": "Advantages", "why.title": "Why MRAZOSOFT",
      "why.1.t": "Direct communication", "why.1.d": "You talk straight to the developer, not through intermediaries.",
      "why.2.t": "Fixed price up front", "why.2.d": "Before we start you know what will be done, what it'll cost and what the result will be.",
      "why.3.t": "The code is yours", "why.3.d": "No needless lock-in to a platform you don't own.",
      "why.4.t": "Support after launch", "why.4.d": "After hand-over I can handle changes, fixes and further development.",
      "pkg.web.price": "from €390", "pkg.ecom.price": "from €1,200", "pkg.app.price": "from €1,200",
      "pkg.note": "Guide prices — the final figure depends on scope, number of pages, features and integrations. You'll get an exact quote after a short consultation.",
      "testi.eyebrow": "Reviews", "testi.title": "What clients say", "testi.sub": "No made-up quotes — the ratings live on Google.",
      "testi.1.q": "Out of 1,842 feed items, 1,790 were matched automatically — work that took hours is done in seconds.", "testi.1.who": "Heureka Patcher", "testi.1.role": "tool for an e-shop",
      "testi.2.q": "A cleaning company from Poprad got a clear website with local SEO and WhatsApp ordering — a customer books in a few clicks.", "testi.2.who": "Harmony Home", "testi.2.role": "live site · harmonyhome.sk",
      "testi.3.q": "A PWA for children with Down syndrome: seven games, Slovak voices, works offline and installs to the phone.", "testi.3.who": "Rytmiko", "testi.3.role": "live PWA · rytmiko.mrazosoft.sk",
      "greview.count": "4 reviews on Google", "greview.q": "“I needed an app — quick design and a quality result. Customer support and helpfulness top.” (translated from Slovak)", "greview.by": "— a client review on Google", "greview.link": "All reviews ↗",
      "about.risk.eyebrow": "Peace of mind", "about.risk.title": "One person — what if there's no time or health?",
      "about.risk.p1": "A fair question. When a single developer stands behind a project, it's reasonable to know what happens if I'm ever out. I take it seriously — the collaboration is set up so you're never left hanging.",
      "about.risk.p2": "Everything essential is yours and with you: the code, access, domain and hosting are in your name, not locked away with me. The site or app is built on standard technologies with no exotic dependencies, so any other developer can take it over and modify it if needed.",
      "about.risk.p3": "And the flip side is an advantage: you're not one of twenty jobs at an agency — you talk directly to me, you know what I'm working on, agreements hold, and after launch I'm available for changes and further development. On larger projects we agree on realistic deadlines up front and, if needed, I can bring in trusted colleagues.",
      "faq.eyebrow": "Questions", "faq.title": "Frequently asked questions",
      "faq.q1": "How much does a website cost?", "faq.a1": "It depends on scope, features and content. We can go through the specifics when you get in touch — no commitment.",
      "faq.q2": "How long does it take to build a website?", "faq.a2": "A smaller site can be ready in roughly 1 to 3 weeks. Larger apps and e-shops depend on scope.",
      "faq.q3": "Will I be able to edit the site myself?", "faq.a3": "Yes, if the project calls for it. With WordPress or e-commerce solutions I can set up content management so you handle everyday edits yourself.",
      "faq.q4": "Do you also edit existing websites?", "faq.a4": "Yes. I edit existing websites — Umbraco, WordPress and PrestaShop: speed, technical fixes, forms, integrations and automation.",
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

  /* ── Scroll progress + nav stav + parallax ────────────── */
  function initScroll() {
    var bar = document.querySelector(".scroll-progress");
    var nav = document.getElementById("nav");

    // Parallax — bg vrstva (aurora+snow+grid) sa pohybuje pomalšie ako stránka,
    // flake logo sa pohybuje o niečo rýchlejšie → 3-vrstvová hĺbka (ITcity-style).
    var pxBg    = document.querySelector(".hero-bg-layer");
    var pxFlake = document.querySelector(".hero-flake-wrap");
    var heroEl  = document.querySelector(".hero:not(.pagehead)");

    /* Layout reads (scrollHeight/offsetHeight) NIE per scroll event — počas
       scroll-flight tweenu chodí event každý frame a čítania nútili layout.
       Cache + rAF throttle; výška dokumentu sa obnovuje ~1×/s (FAQ accordion). */
    var hasParallax = !!(heroEl && (pxBg || pxFlake));   // cosmos index ich nemá — nečítaj offsetHeight zbytočne
    var docMax = 0, heroH = 0, tick = 0, rafPending = false, scrolledState = null;
    function measure() {
      docMax = document.documentElement.scrollHeight - window.innerHeight;
      heroH = hasParallax ? heroEl.offsetHeight : 0;
    }
    function apply() {
      rafPending = false;
      if (++tick % 60 === 0) measure();
      var st = window.scrollY || document.documentElement.scrollTop;
      if (bar) bar.style.width = (docMax > 0 ? (st / docMax) * 100 : 0) + "%";
      if (nav) {
        var sc = st > 20;
        if (sc !== scrolledState) { scrolledState = sc; nav.classList.toggle("scrolled", sc); }
      }
      if (!reduceMotion && hasParallax && heroH > 0) {
        var s = Math.min(st, heroH);
        var p = s / heroH;
        // bg vrstva (aurora+snow) — pohybuje sa len 30 % rýchlosťou, ostáva dlho viditeľná
        if (pxBg)    pxBg.style.transform    = "translateY(" + (s * 0.7) + "px)";
        // flake letí preč + zmenšuje sa na 40 % → dramatický "astronaut odlieta" efekt
        if (pxFlake) pxFlake.style.transform = "translateY(" + (-s * 0.45) + "px) scale(" + Math.max(0.1, 1 - p * 0.6) + ")";
      }
    }
    function onScroll() {
      if (!rafPending) { rafPending = true; requestAnimationFrame(apply); }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", function () { measure(); onScroll(); }, { passive: true });
    measure();
    apply();
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
    function vh() { return window.innerHeight || document.documentElement.clientHeight; }
    function show(el) {
      if (el.classList.contains("in")) return;
      el.classList.add("in");
      el.querySelectorAll && el.querySelectorAll("[data-count]").forEach(countUp);
    }
    if (!("IntersectionObserver" in window)) {
      items.forEach(show);
      return;
    }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px 45% 0px" });
    items.forEach(function (el) { obs.observe(el); });
    // Poistka proti „čiernej diere“ pri rýchlom načítaní: čokoľvek, čo je už vo viewporte,
    // odhaľ okamžite (keď observer callback ešte nedobehol) a ešte raz po 1,2 s ako záchranná sieť.
    // Prvky pod záhybom ostávajú skryté a odkryjú sa normálne pri scrollovaní.
    function revealInView() {
      items.forEach(function (el) {
        if (!el.classList.contains("in") && el.getBoundingClientRect().top < vh() * 0.95) {
          show(el); obs.unobserve(el);
        }
      });
    }
    revealInView();
    setTimeout(revealInView, 1200);
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
      // hviezdy: pomalý drift + twinkle (frozen cosmos), nie padajúci sneh
      var count = Math.min(90, Math.floor(W / 14));
      flakes = [];
      for (var i = 0; i < count; i++) {
        flakes.push({
          x: Math.random() * W, y: Math.random() * H,
          r: Math.random() * 1.4 + 0.4,
          d: (Math.random() * 0.14 + 0.02) * (Math.random() < 0.5 ? -1 : 1),
          o: Math.random() * 0.45 + 0.25,
          tw: Math.random() * 0.012 + 0.003,
          ph: Math.random() * Math.PI * 2
        });
      }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        f.ph += f.tw * 16;
        var tw = 0.65 + 0.35 * Math.sin(f.ph);
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(207, 230, 255," + (f.o * tw).toFixed(3) + ")";
        ctx.fill();
        f.x += f.d;
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
    // splash už videný v tejto session → preskoč animáciu, ukáž obsah hneď
    if (document.documentElement.classList.contains("no-splash")) { el.classList.add("gone"); return; }
    try { sessionStorage.setItem("ms_splash_seen", "1"); } catch (e) {}
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

  /* ── YouTube fasády (GDPR): iframe sa načíta až po kliknutí ── */
  function initEmbeds() {
    document.querySelectorAll(".yt-facade[data-yt-id]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-yt-id");
        if (!id) return;
        var frame = document.createElement("iframe");
        frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
        frame.title = btn.getAttribute("aria-label") || "YouTube video";
        frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
        frame.allowFullscreen = true;
        frame.className = "yt-frame";
        var wrap = document.createElement("div");
        wrap.className = "yt-facade yt-embedded";
        wrap.appendChild(frame);
        btn.replaceWith(wrap);
      });
    });
  }

  /* ── Showreel (presunuté hero video, in-page prehrávač) ── */
  function initShowreel() {
    var wrap = document.querySelector(".showreel");
    if (!wrap) return;
    var video = wrap.querySelector("video");
    var overlay = wrap.querySelector(".showreel-cover");
    if (!video || !overlay) return;
    overlay.addEventListener("click", function () {
      wrap.classList.add("is-playing");
      video.controls = true;
      video.muted = false;
      video.play().catch(function () {});
    });
    video.addEventListener("ended", function () {
      wrap.classList.remove("is-playing");
      video.controls = false;
    });
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
    initShowreel();
    initEmbeds();
  });
})();

/* ── PWA: service worker (offline fallback + cache statických assetov).
   Root scope; /testovanie/ má vlastnú kópiu s vlastným scope. Assety nesú ?v=
   verzie, takže cache-first je bezpečný (nová verzia = nová URL). ── */
if ('serviceWorker' in navigator && location.pathname.indexOf('/testovanie/') !== 0) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function () {});
  });
}
