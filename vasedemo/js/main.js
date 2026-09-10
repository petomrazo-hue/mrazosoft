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
