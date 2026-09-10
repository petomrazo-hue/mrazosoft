// Brunchic Poprad — návrh webu (mrazosoft.sk)
// hlavička, mobilné menu, reveal, stav otvorenia, filtre menu, mapa na klik, lightbox

(function () {
  "use strict";

  document.documentElement.classList.add("js");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── prilepená hlavička ──────────────────────────────────────
  var head = document.querySelector(".hlavicka");
  if (head) {
    var onScroll = function () {
      head.classList.toggle("je-prilepena", window.scrollY > 30);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── mobilné menu ────────────────────────────────────────────
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("je-otvorene");
      burger.classList.toggle("je-otvoreny", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        nav.classList.remove("je-otvorene");
        burger.classList.remove("je-otvoreny");
        burger.setAttribute("aria-expanded", "false");
      });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("je-otvorene")) {
        nav.classList.remove("je-otvorene");
        burger.classList.remove("je-otvoreny");
        burger.setAttribute("aria-expanded", "false");
        burger.focus();
      }
    });
  }

  // ── reveal pri scrollovaní ──────────────────────────────────
  var ciele = document.querySelectorAll(".rv");
  if ("IntersectionObserver" in window && !reduceMotion) {
    ciele.forEach(function (el, i) { el.style.setProperty("--rvi", i % 4); });
    var io = new IntersectionObserver(function (zaznamy) {
      zaznamy.forEach(function (z) {
        if (z.isIntersecting) {
          z.target.classList.add("je-vnutri");
          io.unobserve(z.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -5% 0px" });
    ciele.forEach(function (el) { io.observe(el); });
  } else {
    ciele.forEach(function (el) { el.classList.add("je-vnutri"); });
  }

  // ── stav otvorenia (počíta sa z hodín v data atribútoch) ────
  document.querySelectorAll(".stav").forEach(function (box) {
    var o = (box.getAttribute("data-otvara") || "07:00").split(":");
    var z = (box.getAttribute("data-zatvara") || "19:00").split(":");
    var teraz = new Date();
    var minuty = teraz.getHours() * 60 + teraz.getMinutes();
    var od = parseInt(o[0], 10) * 60 + parseInt(o[1], 10);
    var doo = parseInt(z[0], 10) * 60 + parseInt(z[1], 10);
    var otvorene = minuty >= od && minuty < doo;
    var text = box.querySelector(".text");
    box.classList.add(otvorene ? "je-otvorene" : "je-zatvorene");
    if (text) {
      if (otvorene) {
        var doZatvorenia = doo - minuty;
        text.textContent = doZatvorenia <= 60
          ? "Máme otvorené, zatvárame o " + doZatvorenia + " minút"
          : "Práve máme otvorené, do " + z[0].replace(/^0/, "") + ":" + z[1];
      } else {
        text.textContent = "Teraz zatvorené, otvárame o " + o[0].replace(/^0/, "") + ":" + o[1];
      }
    }
  });

  // ── zvýraznenie dnešného dňa v tabuľke hodín ────────────────
  var dnes = (new Date().getDay() + 6) % 7; // pondelok = 0
  var riadok = document.querySelector('.hodiny-tab tr[data-den="' + dnes + '"]');
  if (riadok) riadok.classList.add("je-dnes");

  // ── filtre menu ─────────────────────────────────────────────
  var chipy = document.querySelectorAll(".menu-filtre .chip");
  var sekcie = document.querySelectorAll(".menu-sekcia");
  chipy.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var f = chip.getAttribute("data-filter");
      chipy.forEach(function (c) { c.classList.remove("je-aktivny"); });
      chip.classList.add("je-aktivny");
      sekcie.forEach(function (s) {
        s.classList.toggle("je-skryta", f !== "vsetko" && s.getAttribute("data-sekcia") !== f);
      });
    });
  });

  // ── mapa: Google embed až po kliknutí ───────────────────────
  document.querySelectorAll(".mapa-fasada button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var box = btn.closest(".mapa-fasada");
      var f = document.createElement("iframe");
      f.src = box.getAttribute("data-embed");
      f.loading = "lazy";
      f.title = "Mapa — Brunchic, Námestie svätého Egídia 5/9, Poprad";
      f.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      box.appendChild(f);
      box.querySelectorAll("p, button, .spendlik, .adresa").forEach(function (el) { el.remove(); });
    });
  });

  // ── lightbox galérie ────────────────────────────────────────
  var lb = document.getElementById("svetlo");
  if (lb) {
    var lbImg = lb.querySelector("img");
    var obrazky = Array.prototype.slice.call(document.querySelectorAll(".galeria img"));
    var idx = 0;

    var ukaz = function (i) {
      if (!obrazky.length) return;
      idx = (i + obrazky.length) % obrazky.length;
      var o = obrazky[idx];
      lbImg.src = o.getAttribute("data-plna") || o.src;
      lbImg.alt = o.alt;
      lbImg.hidden = false;
      lb.classList.add("je-otvorene");
      lb.setAttribute("aria-hidden", "false");
    };
    var zavri = function () {
      lb.classList.remove("je-otvorene");
      lb.setAttribute("aria-hidden", "true");
    };

    obrazky.forEach(function (o, i) {
      o.parentElement.addEventListener("click", function () { ukaz(i); });
    });
    lb.querySelector(".zavri").addEventListener("click", zavri);
    lb.querySelector(".predch").addEventListener("click", function (e) { e.stopPropagation(); ukaz(idx - 1); });
    lb.querySelector(".dalsi").addEventListener("click", function (e) { e.stopPropagation(); ukaz(idx + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) zavri(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("je-otvorene")) return;
      if (e.key === "Escape") zavri();
      if (e.key === "ArrowLeft") ukaz(idx - 1);
      if (e.key === "ArrowRight") ukaz(idx + 1);
    });
  }

  // ── formulár je v ukážke nefunkčný ──────────────────────────
  document.querySelectorAll(".formular").forEach(function (f) {
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var p = f.querySelector(".form-pozn");
      if (p) {
        p.textContent = "Toto je ukážka, formulár zatiaľ nikam neodosiela. Na ostrom webe by dopyt "
          + "prišiel na manazer@brunchic.sk do minúty.";
        p.style.color = "#E6007E";
        p.style.fontWeight = "600";
      }
    });
  });
})();

// ── kalendár akcií a prihlasovanie ────────────────────────────
(function () {
  "use strict";

  var kalendar = document.querySelector(".kalendar");
  var dialog = document.getElementById("prihlaska");
  if (!kalendar || !dialog) return;

  var KLUC = "brunchic-prihlasky";
  var vnutro = dialog.querySelector(".prihlaska-vnutro");
  var form = dialog.querySelector(".prihlaska-form");
  var hotovo = dialog.querySelector(".prihlaska-hotovo");
  var zoznamBox = document.querySelector(".moje-rezervacie");
  var zoznamUl = zoznamBox ? zoznamBox.querySelector("ul") : null;
  var mesiac = kalendar.querySelector(".kal-hlava h2").textContent.trim().split(" ")[0];
  var poslednyOtvarac = null;

  var nacitaj = function () {
    try { return JSON.parse(localStorage.getItem(KLUC) || "[]"); }
    catch (e) { return []; }
  };
  var uloz = function (data) {
    try { localStorage.setItem(KLUC, JSON.stringify(data)); }
    catch (e) { /* súkromné okno — prihláška ostane len do zatvorenia stránky */ }
  };

  var vykresli = function () {
    var data = nacitaj();
    kalendar.querySelectorAll(".kal-bunka.je-akcia").forEach(function (b) {
      var den = b.getAttribute("data-den");
      b.classList.toggle("je-obsadena", data.some(function (r) { return r.den === den; }));
    });
    if (!zoznamBox || !zoznamUl) return;
    zoznamBox.hidden = data.length === 0;
    zoznamBox.classList.add("je-vnutri");  // poistka: prvok, ktorý sa odkrýva až teraz,
                                           // nesmie zostať v reveal stave s nulovou viditeľnosťou
    zoznamUl.innerHTML = "";
    data.forEach(function (r, i) {
      var li = document.createElement("li");
      var d = document.createElement("span");
      d.className = "rez-datum";
      d.textContent = r.den + ". " + mesiac.toLowerCase();
      var n = document.createElement("span");
      n.textContent = (r.typ === "stol" ? "Stôl" : r.nazov) + ", " + r.cas
        + " (" + r.osoby + (r.osoby === 1 ? " osoba" : " osoby") + ")";
      var z = document.createElement("button");
      z.type = "button";
      z.className = "rez-zrus";
      z.textContent = "zrušiť";
      z.addEventListener("click", function () {
        var akt = nacitaj();
        akt.splice(i, 1);
        uloz(akt);
        vykresli();
      });
      li.appendChild(d); li.appendChild(n); li.appendChild(z);
      zoznamUl.appendChild(li);
    });
  };

  // ── čas rezervácie: v rámci otváracích hodín ────────────────
  var vyberCasu = dialog.querySelector("#r-cas");
  (function naplnCasy() {
    if (!vyberCasu) return;
    for (var h = 7; h <= 18; h++) {
      [0, 30].forEach(function (m) {
        var o = document.createElement("option");
        o.value = h + ":" + (m === 0 ? "00" : "30");
        o.textContent = o.value;
        vyberCasu.appendChild(o);
      });
    }
    vyberCasu.value = "10:00";
  })();

  var POPISY = {
    akcia: "",
    stol: "Otvorené máme od 7:00 do 19:00. Napíšte, o koľkej prídete a koľko vás bude.",
    priestor: "Priestor prenajímame na oslavy, kurzy aj firemné stretnutia. "
      + "Toto je dopyt, termín vám potvrdíme."
  };

  var volbaTypu = dialog.querySelector(".volba-typu");
  var poleCas = dialog.querySelector(".pole-cas");
  var volbaText = dialog.querySelector(".volba-text");
  var aktualnyTyp = "akcia";

  var nastavTyp = function (typ) {
    aktualnyTyp = typ;
    volbaTypu.querySelectorAll(".typ-tl").forEach(function (b) {
      b.classList.toggle("je-aktivny", b.getAttribute("data-typ") === typ);
      b.setAttribute("aria-pressed", b.getAttribute("data-typ") === typ ? "true" : "false");
    });
    // na akciu je čas daný programom, pri stole aj priestore si ho hosť vyberá
    poleCas.hidden = typ === "akcia";
    dialog.querySelector("#r-cas").required = typ !== "akcia";
    volbaText.textContent = typ === "akcia"
      ? "Pošlite mi pripomienku deň pred akciou"
      : "Pošlite mi pripomienku deň vopred";
    dialog.querySelector(".prihlaska-form button[type=submit]").textContent =
      typ === "akcia" ? "Prihlásiť sa"
      : (typ === "stol" ? "Rezervovať stôl" : "Poslať dopyt");
    var poznamka = dialog.querySelector("#r-poznamka");
    poznamka.placeholder = typ === "priestor"
      ? "aká akcia to bude, čo potrebujete"
      : "detská stolička, pes, oslava";
    // pri prenájme priestoru nesľubujeme rezerváciu, je to dopyt
    dialog.querySelector(".prihlaska-popis").textContent = POPISY[typ] || "";
  };

  volbaTypu.querySelectorAll(".typ-tl").forEach(function (b) {
    b.addEventListener("click", function () { nastavTyp(b.getAttribute("data-typ")); });
  });

  var otvor = function (btn, vynutTyp) {
    poslednyOtvarac = btn;
    var den = btn.getAttribute("data-den");
    var akcia = btn.querySelector(".kal-akcia");
    var maAkciu = !!akcia;

    var nazov = maAkciu ? akcia.childNodes[0].textContent.trim() : "";
    var cas = maAkciu ? akcia.querySelector(".kal-cas").textContent.trim() : "";

    dialog.setAttribute("data-den", den);
    dialog.setAttribute("data-nazov", nazov);
    dialog.setAttribute("data-cas", cas);
    dialog.setAttribute("data-ma-akciu", maAkciu ? "1" : "0");

    // v deň bez programu sa na akciu prihlásiť nedá
    var tlAkcia = volbaTypu.querySelector('.typ-tl[data-typ="akcia"]');
    tlAkcia.hidden = !maAkciu;
    nastavTyp(vynutTyp || (maAkciu ? "akcia" : "stol"));

    dialog.querySelector(".prihlaska-datum").textContent =
      den + ". " + mesiac.toLowerCase() + (maAkciu ? ", " + cas : "");
    dialog.querySelector("#prihlaska-nazov").textContent =
      maAkciu ? nazov : (den + ". " + mesiac.toLowerCase());
    POPISY.akcia = maAkciu ? (btn.getAttribute("data-popis") || "") : "";

    form.hidden = false;
    hotovo.hidden = true;
    form.reset();
    if (vyberCasu) vyberCasu.value = "10:00";
    dialog.hidden = false;
    document.body.style.overflow = "hidden";
    var prve = form.querySelector("input");
    if (prve) prve.focus();
  };

  var zavri = function () {
    dialog.hidden = true;
    document.body.style.overflow = "";
    if (poslednyOtvarac) poslednyOtvarac.focus();
  };

  // klikať sa dá na každý deň: s akciou aj na obyčajný stôl
  kalendar.querySelectorAll(".kal-bunka.je-akcia, .kal-bunka.je-volny").forEach(function (b) {
    b.addEventListener("click", function () {
      if (b.disabled) return;
      otvor(b);
    });
  });

  // Dni, ktoré už boli, sa rezervovať nedajú. Blokujeme ich len vtedy, keď je
  // zobrazený práve bežiaci mesiac — inak by sa demo o pár týždňov nedalo vyskúšať.
  (function zamkniMinule() {
    var MESIACE = ["januar", "februar", "marec", "april", "maj", "jun", "juli",
                   "august", "september", "oktober", "november", "december"];
    var teraz = new Date();
    var bezDiakritiky = mesiac.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    var rokPrvok = kalendar.querySelector(".kal-rok");
    var rok = rokPrvok ? parseInt(rokPrvok.textContent, 10) : 0;
    if (MESIACE.indexOf(bezDiakritiky) !== teraz.getMonth() || rok !== teraz.getFullYear()) return;
    kalendar.querySelectorAll(".kal-bunka[data-den]").forEach(function (b) {
      if (parseInt(b.getAttribute("data-den"), 10) < teraz.getDate()) {
        b.disabled = true;
        b.classList.add("je-minuly");
      }
    });
  })();

  dialog.querySelector(".prihlaska-zavri").addEventListener("click", zavri);
  dialog.querySelector(".prihlaska-dalsia").addEventListener("click", zavri);
  dialog.addEventListener("click", function (e) { if (e.target === dialog) zavri(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !dialog.hidden) zavri();
  });

  // fokus neuteká z otvoreného dialógu
  dialog.addEventListener("keydown", function (e) {
    if (e.key !== "Tab" || dialog.hidden) return;
    var body = vnutro.querySelectorAll("button, input, select, [href]");
    var vid = Array.prototype.filter.call(body, function (el) { return el.offsetParent !== null; });
    if (!vid.length) return;
    var prvy = vid[0], posledny = vid[vid.length - 1];
    if (e.shiftKey && document.activeElement === prvy) { e.preventDefault(); posledny.focus(); }
    else if (!e.shiftKey && document.activeElement === posledny) { e.preventDefault(); prvy.focus(); }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!form.reportValidity()) return;

    var meno = form.querySelector("#r-meno").value.trim();
    var mail = form.querySelector("#r-mail").value.trim();
    var telefon = form.querySelector("#r-telefon").value.trim();
    var poznamka = form.querySelector("#r-poznamka").value.trim();
    var osoby = parseInt(form.querySelector("#r-osoby").value, 10) || 1;
    var pripomienka = form.querySelector("#r-pripomienka").checked;
    var den = dialog.getAttribute("data-den");
    var jeAkcia = aktualnyTyp === "akcia";
    var NAZVY = { stol: "Stôl", priestor: "Prenájom priestoru" };
    var nazov = jeAkcia ? dialog.getAttribute("data-nazov") : NAZVY[aktualnyTyp];
    var cas = jeAkcia ? dialog.getAttribute("data-cas") : form.querySelector("#r-cas").value;
    var kedy = den + ". " + mesiac.toLowerCase();

    var data = nacitaj();
    data.push({
      typ: aktualnyTyp, den: den, nazov: nazov, cas: cas, meno: meno, mail: mail,
      telefon: telefon, poznamka: poznamka, osoby: osoby, pripomienka: pripomienka
    });
    uloz(data);
    vykresli();

    var osobText = osoby === 1 ? "jednu osobu" : (osoby < 5 ? osoby + " osoby" : osoby + " osôb");

    var krstne = meno.split(" ")[0];
    dialog.querySelector(".prihlaska-sprava").textContent =
      jeAkcia ? "Ďakujeme, " + krstne + ". Miesto na akciu " + nazov + " máte rezervované."
      : aktualnyTyp === "stol"
        ? "Ďakujeme, " + krstne + ". Stôl pre " + osobText + " máme " + kedy + " o " + cas + " zapísaný."
        : "Ďakujeme, " + krstne + ". Dopyt na prenájom priestoru " + kedy + " sme prijali, "
          + "termín vám potvrdíme.";

    // Ukážka toho, čo by na ostrom webe odišlo. Nič sa reálne neodosiela.
    dialog.querySelector(".posta-hostovi").textContent =
      jeAkcia ? "Potvrdenie prihlášky na " + nazov + ", " + kedy + " o " + cas
                + ", pre " + osobText + ". S odkazom na zrušenie."
      : aktualnyTyp === "stol"
        ? "Potvrdenie rezervácie stola na " + kedy + " o " + cas + ", pre " + osobText
          + ". S odkazom na zrušenie."
        : "Prijali sme váš dopyt na prenájom priestoru " + kedy + ". Ozveme sa s potvrdením.";

    dialog.querySelector(".posta-podniku").textContent = (jeAkcia
      ? "Nová prihláška: "
      : aktualnyTyp === "stol" ? "Nová rezervácia stola: " : "Nový dopyt na priestor: ")
      + meno + ", " + osobText + ", " + (jeAkcia ? nazov + " " : "") + kedy
      + " o " + cas
      + (telefon ? ", telefón " + telefon : "")
      + (poznamka ? ", poznámka: " + poznamka : "") + ".";

    var riadokPripomienka = dialog.querySelector(".posta-riadok--neskor");
    riadokPripomienka.hidden = !pripomienka;
    if (pripomienka) {
      dialog.querySelector(".posta-pripomienka").textContent = jeAkcia
        ? "Zajtra o " + cas + " vás čakáme na akcii " + nazov + "."
        : "Zajtra o " + cas + " máte u nás rezervovaný stôl.";
    }

    form.hidden = true;
    hotovo.hidden = false;
    hotovo.querySelector("button").focus();
  });

  // tlačidlá v kartách akcií otvárajú tú istú prihlášku (hlavná cesta na telefóne)
  document.querySelectorAll(".akcia-prihlas").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var bunka = kalendar.querySelector('.kal-bunka[data-den="' + btn.getAttribute("data-den") + '"]');
      if (bunka) { otvor(bunka); poslednyOtvarac = btn; }
    });
  });

  vykresli();
})();

// ── prehľad prihlášok pre obsluhu ─────────────────────────────
(function () {
  "use strict";

  var tabulka = document.querySelector(".prehlad-tabulka");
  if (!tabulka) return;

  var KLUC = "brunchic-prihlasky";
  var prazdny = document.querySelector(".prehlad-prazdny");
  var telo = tabulka.querySelector("tbody");
  var MESIAC = "september";

  var nacitaj = function () {
    try { return JSON.parse(localStorage.getItem(KLUC) || "[]"); }
    catch (e) { return []; }
  };

  var vykresli = function () {
    var data = nacitaj();
    var naAkcie = 0, stoly = 0, osoby = 0;
    data.forEach(function (r) {
      if (r.typ === "stol") stoly += 1; else naAkcie += 1;
      osoby += (parseInt(r.osoby, 10) || 1);
    });

    document.querySelector('[data-suhrn="akcie"]').textContent = naAkcie;
    document.querySelector('[data-suhrn="stoly"]').textContent = stoly;
    document.querySelector('[data-suhrn="osoby"]').textContent = osoby;

    prazdny.hidden = data.length > 0;
    tabulka.hidden = data.length === 0;

    telo.innerHTML = "";
    data.forEach(function (r) {
      var tr = document.createElement("tr");
      [
        r.den + ". " + MESIAC + ", " + r.cas,
        r.typ === "stol" ? "Stôl" : r.nazov,
        r.meno,
        r.mail || r.telefon || "",
        String(r.osoby),
        r.poznamka || ""
      ].forEach(function (hodnota) {
        var td = document.createElement("td");
        td.textContent = hodnota;
        tr.appendChild(td);
      });
      var td = document.createElement("td");
      td.textContent = r.pripomienka ? "áno" : "nie";
      if (r.pripomienka) td.className = "je-pripomienka";
      tr.appendChild(td);
      telo.appendChild(tr);
    });
  };

  // export do CSV — to isté, čo by podnik dostal z ostrého webu
  tabulka.querySelector(".prehlad-export").addEventListener("click", function () {
    var data = nacitaj();
    if (!data.length) return;
    var riadky = [["Kedy", "Na co", "Meno", "Mail", "Telefon", "Osob", "Poznamka", "Pripomienka"]];
    data.forEach(function (r) {
      riadky.push([
        r.den + ". " + MESIAC + " " + r.cas,
        r.typ === "stol" ? "Stol" : r.nazov, r.meno,
        r.mail || "", r.telefon || "", r.osoby, r.poznamka || "",
        r.pripomienka ? "ano" : "nie"
      ]);
    });
    var csv = "﻿" + riadky.map(function (radek) {
      return radek.map(function (b) { return '"' + String(b).replace(/"/g, '""') + '"'; }).join(";");
    }).join("\r\n");
    var odkaz = document.createElement("a");
    odkaz.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    odkaz.download = "prihlasky-brunchic.csv";
    document.body.appendChild(odkaz);
    odkaz.click();
    document.body.removeChild(odkaz);
    URL.revokeObjectURL(odkaz.href);
  });

  tabulka.querySelector(".prehlad-vymaz").addEventListener("click", function () {
    try { localStorage.removeItem(KLUC); } catch (e) { /* súkromné okno */ }
    vykresli();
  });

  vykresli();
})();
