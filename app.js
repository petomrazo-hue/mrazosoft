/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   MRAZOSOFT — app.js (v2 "wow")
   i18n SK/EN, frost častice, rotátor, count-up, tilt,
   magnetické tlačidlá, scroll progress. Žiadne závislosti.
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(hover: none)").matches;

  /* Formulár sa odosiela cez /api/kontakt (Cloudflare Pages Function) —
     Web3Forms kľúč žije len na serveri (env WEB3FORMS_KEY), nie v prehliadači.
     Keď endpoint nebeží (napr. lokálny statický náhľad), použije sa mailto fallback. */

  /* ── Prekladový slovník ───────────────────────────────── */
  var rotatePhrases = {
    sk: [
      "Chyba býva tam, kam sa nikto nepozerá.",
      "Feed hlási skladom to, čo na sklade nie je.",
      "Karty nemajú text, ktorý by Google našiel.",
      "Meranie po cookies klame a čísla nesedia."
    ],
    en: [
      "The fault is usually where nobody looks.",
      "The feed says in stock when it is not.",
      "Product pages have no text for Google.",
      "Tracking breaks after cookies and the numbers lie."
    ]
  };

  var i18n = {
    sk: {
      "nav.home": "Domov", "nav.about": "O mne", "nav.services": "Služby", "nav.projects": "Projekty", "nav.blog": "Blog", "nav.process": "Ako to funguje", "nav.faq": "FAQ", "nav.contact": "Kontakt", "nav.cta": "Napíšte mi", "nav.status": "Voľné kapacity", "splash.skip": "kliknite pre preskočenie",
      "page.about.sub": "Vývojár z Popradu — celý projekt v jedných rukách.", "page.contact.sub": "Napíšte mi pár riadkov o tom, čo potrebujete. Ozvem sa do pár hodín.",
      "home.projects.title": "Čo som opravil a čo z toho vyšlo", "home.projects.sub": "Tri konkrétne prípady. Vždy v rovnakom poradí: čo bolo zle, čo som postavil, čo sa zmerlo.", "proj.all": "Pozrieť všetky prípady",
      "cta.title": "Pošlite mi adresu svojho e-shopu.", "cta.text": "Pozriem sa naň a do pár hodín vám napíšem, čo som našiel a čo by som s tým robil ako prvé. Zadarmo, po slovensky a bez toho, aby ste sa k čomukoľvek zaviazali.", "cta.wa": "Napíšte na WhatsApp", "cta.trust": "Odpoveď do pár hodín · Bez záväzku · Kód patrí vám",
      "hero.badge": "Peter Mráz · vývojár z Popradu — otvorený pre nové projekty",
      "hero.lead": "Návštevy máte", "hero.line1": "Návštevy máte. Objednávky nie.", "hero.rest": "Chyba býva tam, kam sa nikto nepozerá.",
      "hero.sub": "Som Peter Mráz, vývojár z Popradu. Roky ladím e-shop s 12 000 produktmi — feed, produktové karty, fotky aj meranie. Napíšte mi a pozriem sa na ten váš. Zadarmo a nezáväzne.",
      "hero.trust": "Odpoveď do pár hodín · nezáväzne · nič nepredávam dopredu",
      "hero.cta1": "Chcem bezplatnú kontrolu e-shopu", "hero.cta2": "Pozrieť, čo som opravil",
      "hero.stat1": "produktov v e-shope, ktorý ladím", "hero.stat2": "recenzie na Google", "hero.stat3": "odpoveď na dopyt", "hero.stat3v": "pár hodín",
      "services.eyebrow": "Čo pre vás spravím", "services.title": "Tvorba webov, aplikácií a e-shopov na mieru", "services.sub": "Celý vývoj pod jednou strechou — od prvej skice po živý web. Vývojár z Popradu pre klientov z celého Slovenska.",
      "services.web.t": "Tvorba web stránok", "services.web.d": "Tvorba web stránok na mieru — rýchle prezentačné weby, firemné stránky a landing pages, ktoré jasne vysvetlia vašu ponuku a vedú návštevníka ku kontaktu.",
      "services.apps.t": "Mobilné a webové aplikácie (PWA)", "services.apps.d": "Tvorba mobilných a webových aplikácií na mieru — PWA a Android appky pre interné systémy, zákaznícke portály alebo jednoduché nástroje, ktoré fungujú aj v mobile.",
      "services.ecom.t": "Tvorba a úpravy e-shopov (PrestaShop)", "services.ecom.d": "Tvorba e-shopov a úpravy PrestaShop — moduly a integrácie, produktové feedy, Heureka, exporty, importy, ERP napojenia a automatizácia rutiny.",
      "services.tools.t": "Automatizácia & AI", "services.tools.d": "Python nástroje, scraping, reporty a AI integrácie, ktoré znižujú ručnú prácu a šetria hodiny každý týždeň.",
      "services.starter.t": "Starter landing page", "services.starter.d": "Profesionálna 1-stranová stránka pre malé firmy a živnostníkov — s kontaktným formulárom, SSL certifikátom a napojením na Google Maps. Do 72 hodín online.",
      "services.audit.t": "Audit webu", "services.audit.d": "Nezávislá kontrola vášho webu — rýchlosť, SEO, bezpečnosť a GDPR. Do 48 hodín dostanete zrozumiteľný report so zoznamom opráv podľa priority. Pri objednávke opráv u mňa cenu auditu odpočítam.",
      "services.retainer.t": "Správa webu & mesačná starostlivosť", "services.retainer.d": "Hosting monitoring, drobné aktualizácie obsahu, bezpečnostné záplaty (WP, PS) a rýchle opravy. Žiadne čakanie na termíny a ponuky.",
      "region.eyebrow": "Kde pôsobím", "region.title": "Pracujem online, sedím v Poprade", "region.sub": "Do e-shopu sa dostanem odkiaľkoľvek a väčšina spolupráce prebehne bez jediného stretnutia. Keď chcete človeka vidieť, v regióne Spiš a Vysoké Tatry sa stretneme osobne.",
      "audience.eyebrow": "Diagnóza", "audience.title": "Kde e-shopy strácajú peniaze", "audience.sub": "Štyri veci, ktoré na e-shope nevidno, kým ich niekto nezmeria. Všetky štyri som našiel a opravil na živom e-shope.",
      "audience.1.t": "Feed klame o sklade", "audience.1.d": "Porovnávač ukazuje „skladom, expedujeme dnes\", hoci tovar nie je. Zákazník objedná, vy rušíte a hodnotenie klesá. V jednom feede som takých položiek našiel 356.",
      "audience.2.t": "Karty, ktoré Google nemá za čo chytiť", "audience.2.d": "Produkt bez popisu a parametrov nemá ako vyjsť vo vyhľadávaní. Na 1 313 kartách sa dá kvalita textu zdvihnúť aj bez toho, aby ich niekto písal ručne.",
      "audience.3.t": "Fotka z cudzieho produktu", "audience.3.d": "Automatické dopĺňanie fotiek z katalógu vie priradiť úplne iný výrobok. Pri kontrole malo cudziu fotku 18 kariet z 93 — zákazník si objedná niečo iné, než dostane.",
      "audience.4.t": "Meranie, ktoré sa po cookies rozsype", "audience.4.d": "Bez správne nastaveného súhlasu platíte za reklamu, ktorej výsledok už nikto nevidí. Rozhodujete sa potom podľa čísel, ktoré nesedia.",
      "pkg.eyebrow": "Čo s tým viem spraviť", "pkg.title": "S čím vám pomôžem", "pkg.sub": "Začína sa to vždy kontrolou zadarmo. Až keď obaja vidíme, čo e-shop brzdí, má zmysel baviť sa o práci a rozsahu.", "pkg.cta": "Mám záujem",
      "pkg.start.t": "Jednostránkový web", "pkg.start.for": "Pre živnostníkov, ktorí potrebujú byť online tento týždeň.", "pkg.start.l1": "Jedna stránka", "pkg.start.l2": "Texty aj fotky", "pkg.start.l3": "Formulár alebo WhatsApp", "pkg.start.l4": "Doména a spustenie", "pkg.start.l5": "Online do 72 hodín",
      "pkg.web.t": "Web alebo appka od nuly", "pkg.web.for": "Keď treba postaviť niečo nové, nie opravovať staré.", "pkg.web.l1": "Web, ktorý vedie návštevníka ku kontaktu", "pkg.web.l2": "Appka pre mobil aj počítač", "pkg.web.l3": "Texty a dizajn na mieru", "pkg.web.l4": "Meranie a súhlas s cookies podľa zákona", "pkg.web.l5": "Nasadenie a odovzdanie prístupov",
      "pkg.ecom.t": "Oprava a úpravy e-shopu", "pkg.ecom.for": "Pre e-shopy, ktoré už bežia, ale nesú menej, než by mali.", "pkg.ecom.l1": "Feed do Heureky a Google Nákupov", "pkg.ecom.l2": "Produktové karty, popisy a parametre", "pkg.ecom.l3": "Fotky, duplicity a poriadok v katalógu", "pkg.ecom.l4": "Úpravy a moduly PrestaShopu", "pkg.ecom.l5": "Napojenie na sklad a účtovníctvo",
      "pkg.app.t": "Automatizácia a AI", "pkg.app.for": "Pre prácu, ktorú niekto u vás robí ručne každý deň.", "pkg.app.l1": "Asistent, ktorý odpovedá z vášho katalógu", "pkg.app.l2": "Dopĺňanie popisov a parametrov hromadne", "pkg.app.l3": "Kontrola skladu a cien, ktorá beží sama", "pkg.app.l4": "Reporty namiesto ručných tabuliek", "pkg.app.l5": "Strážca, ktorý chybu nájde aj opraví", "services.guarantee": "Máte projekt alebo nápad? Rád sa o ňom pozhováram — stačí sa ozvať.",
      "projects.eyebrow": "Dôkazy", "projects.title": "Projekty z praxe", "projects.sub": "Žiadne mockupy z fotobanky — toto sú reálne weby, aplikácie a nástroje, ktoré som navrhol, vyvíjal alebo nasadil.",
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
      "proj.feed.home": "Problém: e-shop s 12 000 produktmi posielal do porovnávača tovar, ktorý nemal na sklade. Riešenie: strážca, ktorý každú hodinu porovná feed so skutočným skladom a nájdenú položku rovno opraví. Výsledok: 356 klamlivých položiek preč.",
      "proj.karty.home": "Problém: tisíce produktov bez popisu a parametrov. Riešenie: doplnenie textov tak, aby každý údaj mal doložiteľný zdroj z katalógu. Výsledok: hodnotenie obsahu kariet stúplo z 65 na 88 bodov zo 100.",
      "proj.harmony.home": "Problém: upratovacia firma platila roky za doménu a web nemala žiadny. Riešenie: web s piatimi stránkami podľa služieb, meraním a súhlasom s cookies. Výsledok: za prvých desať dní 18 návštev z Googlu a priemerná 4. pozícia.",
      "proj.tajny.home": "Overiť tvrdenie ručne zaberie čas — vznikol AI nástroj, ktorý z tvrdenia spraví verdikt so zdrojmi a PDF do minúty.",
      "proj.view": "Otvoriť naživo", "proj.private": "Na vyžiadanie", "proj.demo": "Ukážka", "status.live": "Live", "status.dev": "Vo vývoji", "status.exp": "AI experiment", "status.req": "Na vyžiadanie", "proj.preview": "Pozrieť ukážku",
      "proj.eliska.p": "Pri desiatkach paralelných projektov a bežiacich AI sessions v štúdiu sa ľahko stratí prehľad — čo práve beží, kde sú nepushnuté zmeny a čo čaká na moje rozhodnutie.", "proj.eliska.s": "Eliška je živá palubná doska celého štúdia. Pulzujúce jadro sleduje aktivitu, orbitálne uzly sú jednotlivé projekty — signalizujú bežiace sessions, nekomitnuté zmeny aj nepushnuté commity. Bočné panely ukazujú sessions, aktivitu za 24 hodín a denník; nové udalosti Eliška prečíta nahlas.", "proj.eliska.r": "Na jeden pohľad vidím stav celého štúdia naživo — ktorý projekt pracuje, čo treba pushnúť a čo čaká na mňa. Zároveň slúži ako vizuálna rekvizita pre obsahovú sériu.", "proj.internal": "Interný nástroj",
      "films.eyebrow": "Filmová identita", "films.title": "Filmy", "films.sub": "Krátke atmosférické filmy, ktoré som vytvoril pomocou generatívnej AI — vizuálny jazyk štúdia v pohybe. Ktorýkoľvek prehráte kliknutím.", "films.featured": "Vybraný film", "films.stavba.cap": "Web ako architektúra — z ľadového svetla po žiariace veže.", "films.hint": "Klik = prehrať so zvukom",
      "process.eyebrow": "Spolupráca", "process.title": "Ako prebieha spolupráca", "process.sub": "Jednoducho, transparentne a bez stresu. Štyri kroky od nápadu k hotovému produktu.",
      "process.s1.t": "Nápad & konzultácia", "process.s1.d": "Prejdeme si cieľ, rozpočet a najjednoduchšiu cestu k funkčnému riešeniu. Bez technickej hmly.",
      "process.s2.t": "Návrh & dizajn", "process.s2.d": "Pripravím štruktúru a vizuál, aby ste pred vývojom videli, čo presne vznikne.",
      "process.s3.t": "Vývoj", "process.s3.d": "Naprogramujem riešenie čisto, rýchlo a bez zbytočností, ktoré by spomaľovali web alebo predražovali údržbu.",
      "process.s4.t": "Nasadenie & podpora", "process.s4.d": "Projekt spustím, odovzdám prístupy a zostávam k dispozícii na úpravy alebo rozšírenia.",
      "about.eyebrow": "O mne", "about.title": "Jeden človek. Celý projekt v jedných rukách.",
      "about.p1": "MRAZOSOFT je tvorba Petra Mráza — vývojára z Popradu. Od návrhu cez kód až po nasadenie riešite projekt priamo s človekom, ktorý ho aj reálne tvorí.",
      "about.p2": "Bez account manažérov, bez prehadzovania zodpovednosti a bez zbytočných medzikrokov. Výsledkom má byť web, aplikácia alebo automatizácia, ktorá je rýchla, zrozumiteľná a patrí klientovi.",
      "about.f1.t": "Rýchle načítanie", "about.f1.d": "Weby a aplikácie optimalizované na výkon, SEO a použiteľnosť.",
      "about.f2.t": "Vlastný kód", "about.f2.d": "Bez ťažkých frameworkov tam, kde nie sú potrebné.",
      "about.f3.t": "Osobný prístup", "about.f3.d": "Komunikujete priamo s autorom, nie s callcentrom.",
      "contact.eyebrow": "Poďme sa rozprávať", "contact.title": "Máte nápad? Premením ho na web, appku alebo automatizáciu, ktorá dáva obchodný zmysel.",
      "contact.text": "Napíšte mi pár riadkov o tom, čo potrebujete. Ozvem sa do pár hodín s návrhom ďalšieho postupu.",
      "contact.cta": "Napíšte e-mail", "contact.or": "alebo rovno",
      "form.name": "Vaše meno", "form.contact": "E-mail alebo telefón", "form.msg": "Čo potrebujete? Pár riadkov stačí.",
      "form.send": "Odoslať dopyt", "form.sending": "Odosielam…", "form.sent": "Ďakujem! Dopyt dorazil — ozvem sa do pár hodín.", "form.ok": "Otváram váš e-mail — dopyt už len odošlite. (Ak sa klient neotvoril, napíšte na petermraz@mrazosoft.sk.)", "form.err": "Niečo sa pokazilo — napíšte priamo na petermraz@mrazosoft.sk.", "form.err.name": "Vyplňte, prosím, meno.", "form.err.email": "Vyplňte, prosím, platný e-mail.", "form.err.generic": "Skontrolujte, prosím, vyplnené údaje a skúste znova.", "form.interest": "O čo máte záujem? (kliknite, čo sa hodí)",
      "trust.1": "✓ Nezáväzná konzultácia", "trust.2": "✓ Odpoveď do pár hodín", "trust.3": "✓ Kód je váš", "trust.4": "✓ Bez záväzkov",
      "why.eyebrow": "Výhody", "why.title": "Prečo MRAZOSOFT",
      "why.1.t": "Priama komunikácia", "why.1.d": "Komunikujete priamo s vývojárom, nie cez sprostredkovateľov.",
      "why.2.t": "Jasný rozsah vopred", "why.2.d": "Pred začiatkom viete, čo sa bude robiť, v akom poradí a čo bude výsledkom.",
      "why.3.t": "Kód patrí vám", "why.3.d": "Žiadne zbytočné uzamknutie v platforme, ktorú nevlastníte.",
      "why.4.t": "Podpora po spustení", "why.4.d": "Po odovzdaní projektu viem riešiť úpravy, opravy aj ďalší rozvoj.",
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
      "faq.q4": "Robíte aj úpravy existujúceho webu?", "faq.a4": "Áno. Riešim úpravy webov, PrestaShop, WordPress, rýchlosť, technické opravy, formuláre, napojenia aj automatizácie.",
      "faq.q5": "Čo je PWA aplikácia?", "faq.a5": "PWA je webová aplikácia, ktorá sa správa podobne ako mobilná appka. Dá sa používať v prehliadači, často aj nainštalovať do telefónu a pri správnom návrhu môže fungovať aj offline.",
      "faq.q6": "Bude web patriť mne?", "faq.a6": "Áno. Po dokončení dostanete prístupy a výsledok patrí vám. Rozsah odovzdaných súborov, prístupov a podpory si potvrdíme vopred.",
      "faq.q7": "Robíte aj SEO?", "faq.a7": "Áno, riešim základné technické SEO, štruktúru nadpisov, meta texty, rýchlosť a lokálne vyhľadávanie. Pri veľkých SEO kampaniach je vhodná dlhodobá spolupráca.",
      "faq.q8": "Ako prebieha spolupráca?", "faq.a8": "Najprv si prejdeme cieľ a rozsah. Potom pripravím návrh riešenia a postup. Po schválení nasleduje návrh, vývoj, testovanie a spustenie.",
      "footer.tagline": "Weby a aplikácie na mieru. ❄",
      "footer.operator": "Prevádzkovateľ",
      "footer.privacy": "Zásady ochrany osobných údajov",
      "footer.cookies": "Nastavenia cookies"
    },
    en: {
      "nav.home": "Home", "nav.about": "About", "nav.services": "Services", "nav.projects": "Projects", "nav.blog": "Blog", "nav.process": "How it works", "nav.faq": "FAQ", "nav.contact": "Contact", "nav.cta": "Get in touch", "nav.status": "Open for work", "splash.skip": "click to skip",
      "page.about.sub": "A developer from Poprad — the whole project in one pair of hands.", "page.contact.sub": "Drop me a few lines about what you need. I'll get back within a few hours.",
      "home.projects.title": "What I fixed and what came of it", "home.projects.sub": "Three concrete cases. Always in the same order: what was wrong, what I built, what was measured.", "proj.all": "See all cases",
      "cta.title": "Send me your shop's address.", "cta.text": "I will look at it and within a few hours write you what I found and what I would do first. Free, in plain language, and without committing you to anything.", "cta.wa": "Message on WhatsApp", "cta.trust": "Reply within hours · No commitment · The code is yours",
      "hero.badge": "Peter Mráz · developer from Poprad — open for new projects",
      "hero.lead": "You get the visits", "hero.line1": "You get the visits. Not the orders.", "hero.rest": "The fault is usually where nobody looks.",
      "hero.sub": "I'm Peter Mráz, a developer from Poprad. For years I have been tuning an online shop with 12,000 products — feeds, product pages, photos and tracking. Write to me and I will look at yours. Free, no commitment.",
      "hero.trust": "Reply within hours · no commitment · nothing sold up front",
      "hero.cta1": "I want a free shop check", "hero.cta2": "See what I fixed",
      "hero.stat1": "products in the shop I maintain", "hero.stat2": "reviews on Google", "hero.stat3": "reply to an enquiry", "hero.stat3v": "a few hours",
      "services.eyebrow": "What I'll build for you", "services.title": "Custom website, app and e-shop development", "services.sub": "The whole build under one roof — from the first sketch to a live site. A developer from Poprad for clients across Slovakia.",
      "services.web.t": "Web development", "services.web.d": "Custom website development — fast presentation sites, company websites and landing pages that clearly explain your offer and lead the visitor to get in touch.",
      "services.apps.t": "Mobile & web apps (PWA)", "services.apps.d": "Custom mobile and web app development — PWAs and Android apps for internal systems, customer portals or simple tools that work on mobile too.",
      "services.ecom.t": "E-shop development (PrestaShop)", "services.ecom.d": "E-shop development and PrestaShop work — modules and integrations, product feeds, Heureka, exports, imports, ERP connections and routine automation.",
      "services.tools.t": "Automation & AI", "services.tools.d": "Python tools, scraping, reports and AI integrations that cut manual work and save hours every week.",
      "services.starter.t": "Starter landing page", "services.starter.d": "A professional single-page site for small businesses and freelancers — with a contact form, SSL and Google Maps integration. Live within 72 hours.",
      "services.audit.t": "Website audit", "services.audit.d": "An independent check of your website — speed, SEO, security and GDPR. Within 48 hours you get a clear report with a prioritized fix list. Order the fixes from me and the audit price is deducted.",
      "services.retainer.t": "Maintenance & monthly care", "services.retainer.d": "Hosting monitoring, small content updates, security patches (WP, PS) and quick fixes. No waiting for quotes and deadlines.",
      "region.eyebrow": "Where I work", "region.title": "I work online, based in Poprad", "region.sub": "I can reach your online shop from anywhere and most of the work happens without a single meeting. If you want to meet the person behind it, I'm in the Spiš and High Tatras region.",
      "audience.eyebrow": "Diagnosis", "audience.title": "Where online shops lose money", "audience.sub": "Four things you cannot see in a shop until someone measures them. I found and fixed all four on a live shop.",
      "audience.1.t": "The feed lies about stock", "audience.1.d": "The price comparison site says \"in stock, ships today\" when it is not. The customer orders, you cancel, your rating drops. I found 356 such items in one feed.",
      "audience.2.t": "Product pages Google cannot grip", "audience.2.d": "A product with no description and no parameters has no way to show up in search. On 1,313 pages the text quality can be lifted without anyone writing them by hand.",
      "audience.3.t": "A photo of somebody else's product", "audience.3.d": "Automatic photo matching from a catalogue can attach a completely different product. In one check, 18 of 93 pages had the wrong photo — the customer orders one thing and receives another.",
      "audience.4.t": "Tracking that breaks after the cookie banner", "audience.4.d": "Without consent wired up correctly you pay for ads whose result nobody sees. Then you decide based on numbers that do not add up.",
      "pkg.eyebrow": "What I can do about it", "pkg.title": "What I can help with", "pkg.sub": "It always starts with a free check. Only once we both see what holds the shop back does it make sense to talk about the work.", "pkg.cta": "I'm interested",
      "pkg.start.t": "One-page website", "pkg.start.for": "For sole traders who need to be online this week.", "pkg.start.l1": "One page", "pkg.start.l2": "Copy and photos", "pkg.start.l3": "Form or WhatsApp", "pkg.start.l4": "Domain and launch", "pkg.start.l5": "Online within 72 hours",
      "pkg.web.t": "A website or app from scratch", "pkg.web.for": "When something new has to be built, not repaired.", "pkg.web.l1": "A site that leads the visitor to contact", "pkg.web.l2": "An app for mobile and desktop", "pkg.web.l3": "Copy and design made to measure", "pkg.web.l4": "Tracking and cookie consent by the book", "pkg.web.l5": "Deployment and handover of access",
      "pkg.ecom.t": "Fixing and improving your shop", "pkg.ecom.for": "For shops that already run but earn less than they should.", "pkg.ecom.l1": "Feeds for price comparison and Google Shopping", "pkg.ecom.l2": "Product pages, descriptions and parameters", "pkg.ecom.l3": "Photos, duplicates and order in the catalogue", "pkg.ecom.l4": "PrestaShop modules and tweaks", "pkg.ecom.l5": "Links to stock and accounting",
      "pkg.app.t": "Automation and AI", "pkg.app.for": "For the work somebody on your team does by hand every day.", "pkg.app.l1": "An assistant that answers from your catalogue", "pkg.app.l2": "Descriptions and parameters filled in in bulk", "pkg.app.l3": "Stock and price checks that run themselves", "pkg.app.l4": "Reports instead of manual spreadsheets", "pkg.app.l5": "A watchdog that finds the fault and fixes it", "services.guarantee": "Got a project or an idea? Happy to talk it through — just get in touch.",
      "projects.eyebrow": "Evidence", "projects.title": "Projects from real work", "projects.sub": "No stock mockups — these are real websites, apps and tools I designed, built or deployed.",
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
      "proj.feed.home": "Problem: a shop with 12,000 products was sending goods to a comparison site that were not in stock. Solution: a watchdog that compares the feed against real stock every hour and fixes what it finds. Result: 356 false items gone.",
      "proj.karty.home": "Problem: thousands of products with no description or parameters. Solution: filling in the text so every value has a traceable source in the catalogue. Result: content score rose from 65 to 88 out of 100.",
      "proj.harmony.home": "Problem: a cleaning company paid for a domain for years and had no website at all. Solution: a site with five service pages, tracking and cookie consent. Result: 18 visits from Google in the first ten days and an average position of 4.",
      "proj.tajny.home": "Verifying a claim by hand takes time — so I built an AI tool that turns a claim into a verdict with sources and a PDF in a minute.",
      "proj.view": "Open live", "proj.private": "On request", "proj.demo": "Demo", "status.live": "Live", "status.dev": "In development", "status.exp": "AI experiment", "status.req": "On request", "proj.preview": "See the demo",
      "proj.eliska.p": "With dozens of parallel projects and running AI sessions in the studio, it's easy to lose track — what's running, where there are unpushed changes and what's waiting for my decision.", "proj.eliska.s": "Eliška is a live mission-control board for the whole studio. A pulsing core tracks activity and orbiting nodes are individual projects — flagging running sessions, uncommitted changes and unpushed commits. Side panels show sessions, 24-hour activity and the work log; new events are read out loud.", "proj.eliska.r": "At a glance I see the whole studio live — which project is working, what needs pushing and what's waiting for me. It also doubles as a visual prop for a content series.", "proj.internal": "Internal tool",
      "films.eyebrow": "Visual identity", "films.title": "Films", "films.sub": "Short atmospheric films I created with generative AI — the studio's visual language in motion. Click any one to play.", "films.featured": "Featured film", "films.stavba.cap": "The web as architecture — from ice-light to glowing towers.", "films.hint": "Click to play with sound",
      "process.eyebrow": "Working together", "process.title": "How we work together", "process.sub": "Simple, transparent and stress-free. Four steps from idea to finished product.",
      "process.s1.t": "Idea & consultation", "process.s1.d": "We go over the goal, the budget and the simplest path to a working solution. No technical fog.",
      "process.s2.t": "Design & concept", "process.s2.d": "I prepare the structure and visuals so you see exactly what will be built before development.",
      "process.s3.t": "Development", "process.s3.d": "I build the solution cleanly, fast and without the clutter that would slow the site down or inflate maintenance.",
      "process.s4.t": "Launch & support", "process.s4.d": "I launch the project, hand over the access and stay available for changes or extensions.",
      "about.eyebrow": "About", "about.title": "One person. The whole project in one pair of hands.",
      "about.p1": "MRAZOSOFT is the work of Peter Mráz — a developer from Poprad. From design through code to deployment, you deal directly with the person who actually builds it.",
      "about.p2": "No account managers, no shifting of responsibility and no needless middlemen. The result should be a website, app or automation that is fast, clear and belongs to the client.",
      "about.f1.t": "Blazing speed", "about.f1.d": "Sites and apps optimised for performance and Google.",
      "about.f2.t": "Own code", "about.f2.d": "No heavy frameworks where they aren't needed.",
      "about.f3.t": "Personal approach", "about.f3.d": "You talk directly to the author, not a call centre.",
      "contact.eyebrow": "Let's talk", "contact.title": "Got an idea? I'll turn it into a website, app or automation that makes business sense.",
      "contact.text": "Drop me a few lines about what you need. I'll get back within a few hours with the next steps.",
      "contact.cta": "Email me", "contact.or": "or just",
      "form.name": "Your name", "form.contact": "E-mail or phone", "form.msg": "What do you need? A few lines is enough.",
      "form.send": "Send enquiry", "form.sending": "Sending…", "form.sent": "Thanks! Your enquiry arrived — I'll get back within a few hours.", "form.ok": "Opening your email — just hit send. (If it didn't open, write to petermraz@mrazosoft.sk.)", "form.err": "Something went wrong — email petermraz@mrazosoft.sk directly.", "form.err.name": "Please fill in your name.", "form.err.email": "Please enter a valid e-mail.", "form.err.generic": "Please check the details and try again.", "form.interest": "What are you interested in? (tap what fits)",
      "trust.1": "✓ No-commitment consultation", "trust.2": "✓ Reply within hours", "trust.3": "✓ The code is yours", "trust.4": "✓ No commitment",
      "why.eyebrow": "Advantages", "why.title": "Why MRAZOSOFT",
      "why.1.t": "Direct communication", "why.1.d": "You talk straight to the developer, not through intermediaries.",
      "why.2.t": "Clear scope up front", "why.2.d": "Before we start you know what will be done, in what order and what the result will be.",
      "why.3.t": "The code is yours", "why.3.d": "No needless lock-in to a platform you don't own.",
      "why.4.t": "Support after launch", "why.4.d": "After hand-over I can handle changes, fixes and further development.",
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
      "faq.q4": "Do you also edit existing websites?", "faq.a4": "Yes. I handle website edits, PrestaShop, WordPress, speed, technical fixes, forms, integrations and automation.",
      "faq.q5": "What is a PWA app?", "faq.a5": "A PWA is a web app that behaves much like a mobile app. It can be used in the browser, often installed to the phone, and with the right design can work offline too.",
      "faq.q6": "Will the website belong to me?", "faq.a6": "Yes. Once finished you get the access and the result is yours. We'll confirm the scope of delivered files, access and support up front.",
      "faq.q7": "Do you do SEO?", "faq.a7": "Yes, I handle basic technical SEO, heading structure, meta texts, speed and local search. For large SEO campaigns a long-term collaboration is the way to go.",
      "faq.q8": "How does the collaboration work?", "faq.a8": "First we go over the goal and scope. Then I prepare a proposed solution and the steps. Once approved, design, development, testing and launch follow.",
      "footer.tagline": "Custom websites and applications. ❄",
      "footer.operator": "Operator",
      "footer.privacy": "Privacy policy",
      "footer.cookies": "Cookie settings"
    }
  };

  /* Jazyk je daný staticky per stránka (<html lang>) — EN verzia žije na /en/
     ako samostatné HTML. Žiadny klientsky prepis obsahu, žiadny localStorage. */
  var currentLang = "sk";

  function initLang() {
    currentLang = (document.documentElement.lang === "en") ? "en" : "sk";
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

    function onScroll() {
      var st = window.scrollY || document.documentElement.scrollTop;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (st / h) * 100 : 0) + "%";
      if (nav) nav.classList.toggle("scrolled", st > 20);

      if (!reduceMotion && heroEl) {
        var s = Math.min(st, heroEl.offsetHeight);
        var p = heroEl.offsetHeight > 0 ? s / heroEl.offsetHeight : 0;
        // bg vrstva (aurora+snow) — pohybuje sa len 30 % rýchlosťou, ostáva dlho viditeľná
        if (pxBg)    pxBg.style.transform    = "translateY(" + (s * 0.7) + "px)";
        // flake letí preč + zmenšuje sa na 40 % → dramatický "astronaut odlieta" efekt
        if (pxFlake) pxFlake.style.transform = "translateY(" + (-s * 0.45) + "px) scale(" + Math.max(0.1, 1 - p * 0.6) + ")";
      }
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
    if (window.innerWidth < 768) return; // mobil: dekoratívne častice vypnuté
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
    var visible = true;
    resize(); make(); draw();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { resize(); make(); }, 200); });
    document.addEventListener("visibilitychange", function () {
      cancelAnimationFrame(raf);
      if (!document.hidden && visible) draw();
    });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visible = entries[0].isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !document.hidden) draw();
      }).observe(canvas);
    }
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

      if (running) rafId = requestAnimationFrame(frame);
    }

    // slučka beží len keď je logo vo viewporte a karta aktívna
    var running = false, rafId = 0, inView = true;
    function setRunning(on) {
      if (on === running) return;
      running = on;
      if (on) { last = null; rafId = requestAnimationFrame(frame); }
      else cancelAnimationFrame(rafId);
    }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        setRunning(!document.hidden && inView);
      }).observe(logo);
    }
    document.addEventListener("visibilitychange", function () {
      setRunning(!document.hidden && inView);
    });
    setRunning(true);
  }

  /* ── Splash intro (studio logo pred webom) ────────────── */
  function initSplash() {
    var el = document.getElementById("splash");
    if (!el) return;
    // splash už videný v tejto session → preskoč animáciu, ukáž obsah hneď
    if (document.documentElement.classList.contains("no-splash")) { el.classList.add("gone"); return; }
    try { sessionStorage.setItem("ms_splash_seen", "1"); } catch (e) {}
    // reduced-motion: žiadne intro, obsah okamžite
    if (reduceMotion) { el.classList.add("out"); el.classList.add("gone"); return; }
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
      setTimeout(function () { el.classList.add("gone"); }, 900);
    }
    el.addEventListener("pointerdown", finish, { once: true });
    setTimeout(finish, 900); // slim intro — obsah je pod overlayom renderovaný od začiatku
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

    // predvolený záujem z odkazu (napr. /kontakt?zaujem=ai-asistent)
    // pomlčky a podčiarkovníky v parametri sa berú ako medzera, aby „ai-asistent"
    // trafilo chip „AI asistent pre e-shop…" (bez toho by prefill ticho nespravil nič)
    function normZaujem(s) { return (s || "").toLowerCase().replace(/[-_]+/g, " ").trim(); }
    (function preselect() {
      var want = "";
      try { want = normZaujem(new URLSearchParams(location.search).get("zaujem")); } catch (e) { return; }
      if (!want) return;
      var hit = Array.prototype.filter.call(chips, function (c) {
        return normZaujem(c.getAttribute("data-val")).indexOf(want) === 0;
      })[0];
      if (!hit) return;
      hit.classList.add("is-on");
      hit.setAttribute("aria-pressed", "true");
      if (want === "ai asistent" && form.sprava && !form.sprava.value) {
        form.sprava.value = "Zaujíma ma AI predajný asistent do e-shopu — chcem ukážku na svojom tovare.\nAdresa e-shopu: ";
      }
      if (want === "zmeranie" && form.sprava && !form.sprava.value) {
        form.sprava.value = "Prihlasujem svoj web na bezplatné verejné zmeranie (mrazosoft.sk/pomixuje).\nAdresa webu: ";
      }
      if (want === "audit" && form.sprava && !form.sprava.value) {
        form.sprava.value = "Mám záujem o kontrolu webu — napíšte mi, prosím, ďalší postup.\nAdresa webu: ";
      }
    })();

    function mailtoFallback(subject, body) {
      window.location.href = "mailto:petermraz@mrazosoft.sk?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      if (statusEl) { statusEl.textContent = t("form.ok"); statusEl.className = "form-status ok"; }
    }

    // čas zobrazenia formulára — server odmietne odoslanie rýchlejšie než 3 s (bot check)
    if (form.ts) form.ts.value = String(Date.now());

    var submitBtn = form.querySelector('button[type="submit"]');
    var sending = false;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (sending) return; // ochrana proti dvojitému odoslaniu

      var meno = (form.meno && form.meno.value || "").trim();
      var email = (form.email && form.email.value || "").trim();
      var tel = (form.tel && form.tel.value || "").trim();
      var sprava = (form.sprava && form.sprava.value || "").trim();
      var ints = interests();
      var subject = "Dopyt z webu — " + (meno || "MRAZOSOFT");
      var body = "Meno: " + meno + "\nE-mail: " + email + "\nTelefón: " + (tel || "—") + "\nZáujem: " + (ints.join(", ") || "—") + "\n\nSpráva:\n" + (sprava || "—");

      // klientska validácia s prístupnou chybou + focus na pole
      if (!meno) { showError(t("form.err.name") || "Vyplňte, prosím, meno.", form.meno); return; }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        showError(t("form.err.email") || "Vyplňte, prosím, platný e-mail.", form.email); return;
      }

      var tsToken = (form.querySelector('[name="cf-turnstile-response"]') || {}).value || "";

      sending = true;
      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) { statusEl.textContent = t("form.sending"); statusEl.className = "form-status"; }

      fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          meno: meno, email: email, tel: tel, sprava: sprava,
          zaujem: ints.join(", "),
          ts: form.ts ? form.ts.value : "",
          website: form.website && form.website.checked ? "1" : "",
          turnstileToken: tsToken
        })
      }).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (res) {
          sending = false;
          if (submitBtn) submitBtn.disabled = false;
          if (res.ok && res.j && res.j.success) {
            form.reset();
            if (form.ts) form.ts.value = String(Date.now());
            chips.forEach(function (c) { c.classList.remove("is-on"); c.setAttribute("aria-pressed", "false"); });
            if (window.turnstile && window.turnstile.reset) { try { window.turnstile.reset(); } catch (err) {} }
            if (statusEl) { statusEl.textContent = t("form.sent"); statusEl.className = "form-status ok"; statusEl.focus && statusEl.focus(); }
          } else if (res.j && res.j.error === "validation") {
            showError(t("form.err.generic") || "Skontrolujte, prosím, vyplnené údaje a skúste znova.");
          } else {
            web3formsFallback();
          }
        })
        .catch(function () {
          // endpoint nebeží (GitHub Pages medzistav / výpadok) → Web3Forms → mailto
          web3formsFallback();
        });

      // Prechodný fallback kým beží GH Pages bez /api/kontakt: klientske odoslanie
      // cez Web3Forms (kľúč je u nich dizajnovo verejný). Po CF migrácii sa nepoužije.
      function web3formsFallback() {
        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({
            access_key: "a801edbc-d2f8-477b-8260-5a68f7246d7e",
            subject: subject,
            from_name: "MRAZOSOFT web",
            botcheck: form.website && form.website.checked ? "1" : "",
            meno: meno, email: email, telefon: tel || "—",
            zaujem: (ints.join(", ") || "—"), sprava: (sprava || "—")
          })
        }).then(function (r) { return r.json(); })
          .then(function (j) {
            sending = false;
            if (submitBtn) submitBtn.disabled = false;
            if (j && j.success) {
              form.reset();
              if (form.ts) form.ts.value = String(Date.now());
              chips.forEach(function (c) { c.classList.remove("is-on"); c.setAttribute("aria-pressed", "false"); });
              if (statusEl) { statusEl.textContent = t("form.sent"); statusEl.className = "form-status ok"; }
            } else { mailtoFallback(subject, body); }
          })
          .catch(function () {
            sending = false;
            if (submitBtn) submitBtn.disabled = false;
            mailtoFallback(subject, body);
          });
      }
    });

    function showError(msg, field) {
      if (statusEl) { statusEl.textContent = msg; statusEl.className = "form-status err"; }
      if (field && field.focus) field.focus();
    }
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
