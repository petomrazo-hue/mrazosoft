/* Tajný Agent Web — DEMO režim.
   Reálne overovanie (Anthropic API cez serverless funkciu) pribudne neskôr.
   Zatiaľ: vzorové tvrdenia majú pripravený verdikt; neznáme tvrdenie vráti
   "NEOVERENÉ" s vysvetlením, že ide o ukážku. Žiadne závislosti. */
(function () {
  "use strict";

  // 7 kategórií verdiktu → CSS trieda + label
  var CATS = {
    pravda:  { cls: "cat-pravda",  label: "PRAVDA" },
    ciast:   { cls: "cat-ciast",   label: "ČIASTOČNE PRAVDA" },
    mytus:   { cls: "cat-mytus",   label: "MÝTUS" },
    hoax:    { cls: "cat-hoax",    label: "HOAX" },
    loz:     { cls: "cat-loz",     label: "LOŽ" },
    neover:  { cls: "cat-neover",  label: "NEOVERENÉ" },
    zastar:  { cls: "cat-zastar",  label: "ZASTARANÁ PRAVDA" }
  };

  // Vzorová DB otázok (mód ODPOVED)
  var DB_OTAZKY = [
    {
      keys: ["čierna diera", "cierna diera", "čiernej diery"],
      titul: "Čo je čierna diera?",
      odpoved: "Čierna diera je oblasť vesmíru s tak silnou gravitáciou, že z nej nemôže uniknúť nič — ani svetlo. Vzniká zväčša zhrútením masívnej hviezdy na konci jej života. Hranica, za ktorou niet úniku, sa volá horizont udalostí. Čierne diery môžeme pozorovať nepriamo — podľa vplyvu na okolité hviezdy a plyn, alebo pomocou gravitačných vĺn. V roku 2019 bol zverejnený prvý skutočný snímok čiernej diery (galaxia M87).",
      fakty: [
        "Najmenšie čierne diery (hviezdne) môžu mať hmotnosť len niekoľkokrát väčšiu ako Slnko.",
        "Supermasívne čierne diery v centrách galaxií môžu vážiť miliardy slnečných hmotností.",
        "Čas blízko čiernej diery plynie pomalšie — relativisická dilatácia času.",
        "V strede Mliečnej cesty sa nachádza supermasívna čierna diera Sagittarius A* (4 mil. Slniec).",
        "Stephen Hawking predpovedal, že čierne diery pomaly vyžarujú energiu — tzv. Hawkingovo žiarenie."
      ],
      zdroje: ["NASA — Black Holes", "ESO — First Image of a Black Hole"]
    },
    {
      keys: ["nikola tesla", "tesla inventor", "tesla vedec"],
      titul: "Kto bol Nikola Tesla?",
      odpoved: "Nikola Tesla (1856–1943) bol srbsko-americký vynálezca, elektrotechnik a fyzik, ktorý zásadne prispel k rozvoju elektriny. Je tvorcom systému striedavého prúdu (AC), viacfázového elektromotora a transformátora. Spolupracoval aj súperil s Thomasom Edisonom počas tzv. 'vojny prúdov'. Mnohé jeho patenty a myšlienky (bezdrôtový prenos energie, rádio) boli vo svojej dobe predbehnuté o desaťročia.",
      fakty: [
        "Tesla bol autorom viac ako 300 patentov v 26 krajinách.",
        "Jednotka magnetickej indukcie Tesla (T) je pomenovaná po ňom.",
        "Teslov systém AC prúdu dnes používa celý svet — porazil Edisonov DC.",
        "Posledné roky života strávil v hoteli New Yorker, kde aj zomrel v roku 1943.",
        "V roku 1943 súd uznal, že Tesla (nie Marconi) bol vynálezcom rádia."
      ],
      zdroje: ["Encyclopaedia Britannica — Nikola Tesla", "IEEE — Tesla's AC System"]
    },
    {
      keys: ["mariana priekopa", "marianská priekopa", "najhlbší", "najhlbsie miesto"],
      titul: "Kde leží Mariánska priekopa?",
      odpoved: "Mariánska priekopa (Mariana Trench) je najhlbšie miesto na Zemi, nachádzajúce sa v západnom Tichom oceáne, východne od Mariánskych ostrovov. Jej najhlbší bod — Challengerova hlbina — dosahuje hĺbku približne 10 935 metrov pod hladinou mora. Priekopa je dlhá okolo 2 550 km a vznikla subdukciou Tichomorskej platne pod Filipínsku.",
      fakty: [
        "Challegerova hlbina je hlbšia ako Mount Everest je vysoký (8 849 m).",
        "Na dne je tlak viac ako 1 000-krát vyšší ako na hladine mora (~1 086 barov).",
        "Prví ľudia zostúpili na dno v roku 1960 (Piccard & Walsh v batyscafe Trieste).",
        "V roku 2012 James Cameron zostúpil sám v ponorke Deepsea Challenger.",
        "Napriek extrémnym podmienkam tam žijú organizmy — baktérie, krevety, rybičky."
      ],
      zdroje: ["NOAA — Mariana Trench", "National Geographic — Deepest Place on Earth"]
    }
  ];

  // Vzorová databáza tvrdení (mód VERDIKT). key = kľúčové slová na voľné rozpoznanie.
  var DB = [
    {
      keys: ["čínsky múr", "cinsky mur", "múr", "vesmír", "vesmir"],
      cat: "mytus", score: 96,
      reason: "Veľký čínsky múr je z nízkej obežnej dráhy <strong>príliš úzky</strong> na to, aby ho bolo vidno voľným okom. Tvrdenie sa traduje desaťročia, ale astronauti ho potvrdzujú len výnimočne a s priblížením.",
      sources: ["NASA — Earth Observatory: viditeľnosť objektov z ISS", "Scientific American: „Can you see the Great Wall from space?“"]
    },
    {
      keys: ["med", "nezhnije", "nezkazí", "nepokazí"],
      cat: "pravda", score: 92,
      reason: "Med pri správnom uskladnení <strong>prakticky nezhnije</strong> — nízka vlhkosť, kyslé pH a peroxid vodíka bránia rastu baktérií. Našli sa jedlé vzorky staré tisíce rokov.",
      sources: ["Smithsonian Magazine: „The science behind honey’s eternal shelf life“", "National Honey Board — vlastnosti medu"]
    },
    {
      keys: ["10 %", "10%", "desať percent", "mozg", "mozog"],
      cat: "mytus", score: 98,
      reason: "Človek <strong>nevyužíva len 10 % mozgu</strong>. Zobrazovacie metódy (fMRI) ukazujú aktivitu naprieč celým mozgom; aj počas spánku je väčšina oblastí činná. Ide o populárny, ale nepravdivý mýtus.",
      sources: ["Scientific American: „Do we use only 10 percent of our brains?“", "BBC Future — neuromýty"]
    },
    {
      keys: ["blesk", "dvakrát", "to isté miesto", "to iste miesto"],
      cat: "mytus", score: 95,
      reason: "Blesk <strong>môže</strong> udrieť na to isté miesto opakovane — vysoké a vodivé objekty (napr. Empire State Building) zasiahne aj desiatky ráz ročne.",
      sources: ["NOAA / National Weather Service — Lightning Myths", "NASA — lightning research"]
    },
    {
      keys: ["ryb", "pamäť", "pamat", "trojsekund", "3 sekund", "3-sekund"],
      cat: "mytus", score: 90,
      reason: "Ryby <strong>nemajú trojsekundovú pamäť</strong>. Pokusy ukazujú, že si dokážu zapamätať veci týždne až mesiace (napr. cestu v bludisku, čas kŕmenia).",
      sources: ["The Guardian: „Fish memory myth busted“", "štúdie o pamäti rýb, Macquarie University"]
    },
    {
      keys: ["vakcín", "vakcin", "očkovan", "ockovan", "autizm"],
      cat: "loz", score: 98,
      reason: "Tvrdenie pochádza z <strong>podvodnej štúdie Andrewa Wakefielda (1998)</strong>, ktorá bola stiahnutá a vyvrátená desiatkami rozsiahlych výskumov. Súvislosť medzi očkovaním a autizmom neexistuje.",
      sources: ["The Lancet — stiahnutie Wakefieldovej štúdie", "WHO / CDC — vakcíny a autizmus"]
    },
    {
      keys: ["antibiotik", "chrípk", "chripk", "vírus", "virus"],
      cat: "mytus", score: 95,
      reason: "Antibiotiká účinkujú <strong>len na baktérie, nie na vírusy</strong>. Pri chrípke ani nádche nezaberajú a ich zbytočné užívanie zvyšuje rezistenciu.",
      sources: ["WHO — antibiotická rezistencia", "CDC — antibiotic use"]
    },
    {
      keys: ["pluto"],
      cat: "zastar", score: 92,
      reason: "Pluto bolo planétou do roku 2006, kedy ho Medzinárodná astronomická únia <strong>preradila medzi trpasličie planéty</strong>. Kedysi pravda, dnes prekonané.",
      sources: ["IAU — definícia planéty (2006)", "NASA — Pluto"]
    },
    {
      keys: ["žuvačk", "zuvack", "7 rok", "sedem rok", "žalúd", "zalud"],
      cat: "mytus", score: 90,
      reason: "Prehltnutá žuvačka sa <strong>nestrávi, ale za pár dní prejde tráviacim traktom</strong> ako iná nestráviteľná potrava. Sedem rokov je výmysel.",
      sources: ["Scientific American — gum myth", "Mayo Clinic"]
    },
    {
      keys: ["holen", "brit", "chlp", "fúz", "fuz", "hrubš", "hrubs"],
      cat: "mytus", score: 92,
      reason: "Holenie <strong>nemení hrúbku ani farbu</strong> chlpov — len odstrihne koniec, ktorý potom pôsobí tuhšie a tmavšie, kým dorastie.",
      sources: ["Mayo Clinic — shaving myths", "BMJ"]
    },
    {
      keys: ["z chladu", "chlad", "prechladn", "nachladn", "studen"],
      cat: "mytus", score: 80,
      reason: "Prechladnutie spôsobujú <strong>vírusy, nie chladný vzduch</strong>. V zime sa viac zdržiavame spolu vnútri, čo šíreniu pomáha — samotný chlad chorobu nespôsobí.",
      sources: ["Harvard Health", "NHS — common cold"]
    },
    {
      keys: ["bermud", "trojuholník", "trojuholnik"],
      cat: "mytus", score: 85,
      reason: "V Bermudskom trojuholníku <strong>nezaniká viac lodí ani lietadiel</strong> než inde pri porovnateľnej premávke. Nadprirodzené vysvetlenia nemajú oporu v dátach.",
      sources: ["NOAA — Bermuda Triangle", "Lloyd's of London — štatistiky"]
    },
    {
      keys: ["einstein", "prepadol", "matematik"],
      cat: "mytus", score: 88,
      reason: "Einstein <strong>v matematike vynikal</strong> už ako dieťa; mýtus vznikol z nepochopenia inej známkovej škály. Sám ho za života vyvracal.",
      sources: ["TIME — Einstein math myth", "Snopes"]
    },
    {
      keys: ["nabíja", "nabija", "cez noc", "batér", "bateri"],
      cat: "ciast", score: 65,
      reason: "Moderné telefóny <strong>po nabití prúd odpoja</strong>, takže nočné nabíjanie ich nezničí. Životnosť však mierne znižuje dlhodobé držanie na 100 % a teplo — preto „čiastočne pravda“.",
      sources: ["Battery University", "Apple — battery & performance"]
    },
    {
      keys: ["banán", "banan", "bobuľa", "bobula", "jahoda"],
      cat: "pravda", score: 82,
      reason: "Botanicky je <strong>banán bobuľa</strong> (vzniká z jedného semenníka), zatiaľ čo jahoda je súplodie — botanicky bobuľou nie je.",
      sources: ["Encyclopaedia Britannica — berry (botany)", "Live Science"]
    },
    {
      keys: ["mozgov bunk", "neurón", "neuron", "neobnov", "neurogenéz", "neurogenez"],
      cat: "zastar", score: 80,
      reason: "Dlho sa verilo, že nové neuróny v dospelosti nevznikajú. Výskum <strong>neurogenézy</strong> ukázal, že v niektorých oblastiach (hipokampus) vznikajú aj v dospelosti — staršie tvrdenie je prekonané.",
      sources: ["Nature — adult neurogenesis", "Scientific American"]
    }
  ];

  var form = document.getElementById("form");
  var input = document.getElementById("claim");
  var btn = document.getElementById("submitBtn");
  var out = document.getElementById("output");

  function norm(s) {
    return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  function isQuestion(s) {
    var n = norm(s);
    if (n.indexOf("?") !== -1) return true;
    var qWords = ["čo ", "kto ", "kde ", "kedy ", "prečo ", "ako ", "odkedy ", "koľko ", "aký ", "aká ", "aké "];
    for (var i = 0; i < qWords.length; i++) {
      if (n.indexOf(norm(qWords[i])) === 0) return true;
    }
    return false;
  }

  function lookupOtazka(input) {
    var n = norm(input);
    for (var i = 0; i < DB_OTAZKY.length; i++) {
      var hit = DB_OTAZKY[i].keys.some(function (k) { return n.indexOf(norm(k)) !== -1; });
      if (hit) return DB_OTAZKY[i];
    }
    return null;
  }

  function lookup(claim) {
    var n = norm(claim);
    for (var i = 0; i < DB.length; i++) {
      var hit = DB[i].keys.some(function (k) { return n.indexOf(norm(k)) !== -1; });
      if (hit) return DB[i];
    }
    return null; // neznáme → demo NEOVERENÉ
  }

  function esc(s) {
    return (s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  function renderThinking() {
    out.innerHTML = '<div class="verdict thinking"><span class="spinner"></span> Agent overuje tvrdenie…</div>';
  }

  function render(claim, data) {
    var cat = CATS[data.cat] || CATS.neover;
    var sources = (data.sources || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var sourcesBlock = sources
      ? '<div class="sources-title">Zdroje</div><ul class="sources">' + sources + "</ul>"
      : "";
    out.innerHTML =
      '<div class="verdict">' +
        '<div class="v-eyebrow">Overené tvrdenie</div>' +
        '<p class="v-claim">„' + esc(claim) + '“</p>' +
        '<div class="v-badge ' + cat.cls + '">' + cat.label + "</div>" +
        '<p class="v-reason">' + data.reason + "</p>" +
        '<div class="meter-label"><span>Dôveryhodnosť verdiktu</span><span>' + data.score + ' %</span></div>' +
        '<div class="meter"><span></span></div>' +
        sourcesBlock +
        '<div class="v-foot">' + (data.note || "Reálny agent k tomuto pridá aj PDF report s podrobným rozborom.") + "</div>" +
      "</div>";
    requestAnimationFrame(function () {
      var bar = out.querySelector(".meter span");
      if (bar) bar.style.width = data.score + "%";
    });
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function renderOdpoved(input, data) {
    var faktyHtml = (data.fakty || []).map(function (f) {
      return "<li>" + esc(f) + "</li>";
    }).join("");
    var faktyBlock = faktyHtml
      ? '<div class="sources-title">Kľúčové fakty</div><ul class="sources facts-list">' + faktyHtml + "</ul>"
      : "";
    var sources = (data.sources || []).map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("");
    var sourcesBlock = sources
      ? '<div class="sources-title">Zdroje</div><ul class="sources">' + sources + "</ul>"
      : "";
    out.innerHTML =
      '<div class="verdict odpoved">' +
        '<div class="v-eyebrow">Odpoveď na otázku</div>' +
        '<p class="v-claim">„' + esc(input) + '“</p>' +
        '<div class="v-odpoved-titul">' + esc(data.titul || "Odpoveď") + "</div>" +
        '<p class="v-reason">' + esc(data.odpoved || "") + "</p>" +
        faktyBlock +
        sourcesBlock +
        '<div class="v-foot">' + (data.note || "Overené v reálnom čase cez AI a web.") + "</div>" +
      "</div>";
    out.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  var VERDIKT_MAP = {
    "PRAVDA": "pravda", "ČIASTOČNE PRAVDA": "ciast", "MÝTUS": "mytus",
    "HOAX": "hoax", "LOŽ": "loz", "NEOVERENÉ": "neover", "ZASTARANÁ PRAVDA": "zastar"
  };

  function fromApi(j) {
    var cat = VERDIKT_MAP[(j.verdikt || "").toUpperCase().trim()] || "neover";
    var reason = esc(j.vysvetlenie || "");
    if (j.povod_mytu) reason += ' <em>Pôvod: ' + esc(j.povod_mytu) + "</em>";
    var sources = (j.zdroje || []).map(function (z) {
      if (!z) return "";
      return z.nazov ? z.nazov : (z.url || String(z));
    }).filter(Boolean);
    return {
      cat: cat,
      score: (typeof j.skore_doveryhodnosti === "number" ? j.skore_doveryhodnosti : 50),
      reason: reason, sources: sources,
      note: "Overené v reálnom čase cez AI a web."
    };
  }

  function fromApiOdpoved(j) {
    var fakty = (j.klucove_fakty || []).map(function (f) { return String(f); }).filter(Boolean);
    var sources = (j.zdroje || []).map(function (z) {
      if (!z) return "";
      return z.nazov ? z.nazov : (z.url || String(z));
    }).filter(Boolean);
    return {
      titul: j.titul || "Odpoveď",
      odpoved: j.odpoved || "",
      fakty: fakty,
      sources: sources,
      note: "Overené v reálnom čase cez AI a web."
    };
  }

  function demoFallbackOtazka(input) {
    var data = lookupOtazka(input);
    if (data) return {
      titul: data.titul,
      odpoved: data.odpoved,
      fakty: data.fakty || [],
      sources: data.zdroje || [],
      note: "Ukážková odpoveď — reálna AI odpoveď pribudne po pripojení API kľúča."
    };
    return {
      titul: "Otázka prijatá",
      odpoved: "Toto je ukážková (demo) verzia — reálne odpovedanie cez AI práve nebeží. Skús niektorú zo vzorových otázok vyššie.",
      fakty: [],
      sources: [],
      note: "Reálne odpovedanie ľubovoľnej otázky pribudne po pripojení API kľúča."
    };
  }

  function demoFallback(claim) {
    if (isQuestion(claim)) return null; // signál pre volajúceho
    var data = lookup(claim);
    if (data) return data;
    return {
      cat: "neover", score: 40,
      reason: "Toto je <strong>ukážková (demo) verzia</strong> — reálne overovanie cez AI práve nebeží (chýba pripojenie k backendu). Skús niektoré zo <strong>vzorových tvrdení</strong> nad formulárom.",
      sources: [],
      note: "Reálne overovanie ľubovoľného tvrdenia pribudne po pripojení API kľúča."
    };
  }

  function verify(claim) {
    if (!claim.trim()) { input.focus(); return; }
    btn.disabled = true;
    renderThinking();
    fetch("/.netlify/functions/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claim: claim })
    })
      .then(function (r) { if (!r.ok) throw new Error("backend " + r.status); return r.json(); })
      .then(function (j) {
        var rezim = (j.rezim || "").toUpperCase();
        if (rezim === "ODPOVED") {
          if (!j.odpoved) throw new Error("bad shape odpoved");
          renderOdpoved(claim, fromApiOdpoved(j));
        } else {
          if (!j.verdikt) throw new Error("bad shape verdikt");
          render(claim, fromApi(j));
        }
      })
      .catch(function () {
        if (isQuestion(claim)) {
          renderOdpoved(claim, demoFallbackOtazka(claim));
        } else {
          render(claim, demoFallback(claim) || {
            cat: "neover", score: 40,
            reason: "Toto je <strong>ukážková (demo) verzia</strong> — reálne overovanie cez AI práve nebeží.",
            sources: [],
            note: "Reálne overovanie pribudne po pripojení API kľúča."
          });
        }
      })
      .then(function () { btn.disabled = false; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    verify(input.value);
  });

  input.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); verify(input.value); }
  });

  document.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      input.value = chip.textContent.trim();
      verify(input.value);
    });
  });

  /* ── Vločky letiace okolo kurzora (mobile: len pri tapnutí) ── */
  function flakeSVG() {
    var ARM = '<line x1="32" y1="32" x2="32" y2="8"/><line x1="32" y1="15" x2="27" y2="10"/><line x1="32" y1="15" x2="37" y2="10"/>';
    var arms = "";
    for (var d = 0; d < 360; d += 60) arms += '<g transform="rotate(' + d + ' 32 32)">' + ARM + "</g>";
    return '<svg viewBox="0 0 64 64"><g fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round">' +
      arms + '<circle cx="32" cy="32" r="2" fill="currentColor" stroke="none"/></g></svg>';
  }

  function initCursorFlakes() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var touch = matchMedia("(hover: none)").matches;
    var svg = flakeSVG();
    function spawn(x, y) {
      var el = document.createElement("span");
      el.className = "cursor-flake";
      var size = 12 + Math.random() * 10;
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.width = el.style.height = size + "px";
      el.style.setProperty("--rot", (Math.random() < 0.5 ? -1 : 1) * (120 + Math.random() * 140) + "deg");
      el.innerHTML = svg;
      document.body.appendChild(el);
      el.addEventListener("animationend", function () { el.remove(); });
    }
    if (touch) {
      // na dotyk: malý „rozsyp" vločiek pri tapnutí
      window.addEventListener("pointerdown", function (e) {
        for (var i = 0; i < 5; i++) {
          (function (i) {
            setTimeout(function () {
              spawn(e.clientX + (Math.random() * 44 - 22), e.clientY + (Math.random() * 44 - 22));
            }, i * 45);
          })(i);
        }
      }, { passive: true });
    } else {
      var last = 0;
      window.addEventListener("mousemove", function (e) {
        var now = Date.now();
        if (now - last < 60) return;
        last = now;
        spawn(e.clientX, e.clientY);
      }, { passive: true });
    }
  }
  /* ── Frost častice (sneh) — ako hero na mrazosoft ── */
  function initSnow() {
    var canvas = document.querySelector(".snow");
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
      for (var i = 0; i < count; i++) flakes.push({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.8 + 0.6, s: Math.random() * 0.5 + 0.2, d: Math.random() * 0.6 - 0.3, o: Math.random() * 0.5 + 0.25 });
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < flakes.length; i++) {
        var f = flakes[i];
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 220, 255," + f.o + ")"; ctx.fill();
        f.y += f.s; f.x += f.d;
        if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
        if (f.x > W + 4) f.x = -4; else if (f.x < -4) f.x = W + 4;
      }
      raf = requestAnimationFrame(draw);
    }
    resize(); make(); draw();
    var rt;
    window.addEventListener("resize", function () { clearTimeout(rt); rt = setTimeout(function () { resize(); make(); }, 200); });
    document.addEventListener("visibilitychange", function () { if (document.hidden) cancelAnimationFrame(raf); else draw(); });
  }

  /* ── Rotujúce hero logo (klik = zrýchli) ── */
  function initHeroLogo() {
    var logo = document.getElementById("heroFlake");
    if (!logo || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    var angle = 0, speed = 16, base = 16, last = null;
    logo.addEventListener("click", function () { speed = Math.min(speed + 260, 1600); });
    function frame(ts) {
      if (last == null) last = ts;
      var dt = Math.min((ts - last) / 1000, 0.05); last = ts;
      angle = (angle + speed * dt) % 360;
      speed += (base - speed) * Math.min(1, dt * 0.9);
      logo.style.transform = "rotate(" + angle.toFixed(2) + "deg)";
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  initCursorFlakes();
  initSnow();
  initHeroLogo();
})();
