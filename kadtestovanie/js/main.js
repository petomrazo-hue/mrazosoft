// Madame hair & beauty — interakcie
// hlavička, reveal/curtain, sticky CTA, ring cursor, magnetic buttons, easter egg

(function () {
  "use strict";

  // Reveal štýly platia len s bežiacim JS — bez neho je obsah viditeľný hneď
  document.documentElement.classList.add("js");

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  // ---- pevná hlavička ----
  var head = document.querySelector(".site-head");
  var stickyCta = document.querySelector(".sticky-cta");
  var hero = document.querySelector(".hero");

  var onScroll = function () {
    head.classList.toggle("is-solid", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---- sticky CTA po odscrollovaní hero (na podstránkach po 400 px) ----
  if ("IntersectionObserver" in window && hero && stickyCta) {
    new IntersectionObserver(function (entries) {
      stickyCta.classList.toggle("is-on", !entries[0].isIntersecting);
    }, { threshold: 0.12 }).observe(hero);
  } else if (stickyCta) {
    window.addEventListener("scroll", function () {
      stickyCta.classList.toggle("is-on", window.scrollY > 400);
    }, { passive: true });
  }

  // ---- reveal + curtain (stagger cez --rvi) ----
  var targets = document.querySelectorAll(".rv, .curtain");
  if ("IntersectionObserver" in window) {
    targets.forEach(function (el, i) {
      el.style.setProperty("--rvi", i % 4);
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(function (el) { el.classList.add("is-in"); });
  }

  // ---- trblietky (bokeh žiaroviek zrkadla + ✦ záblesky) — myš aj dotyk ----
  if (!reduceMotion) {
    var gx = 0, gy = 0, gt = 0, gn = 0, live = 0;

    var spawnGlint = function (x, y) {
      if (live > 70) return;
      var star = (++gn % 6 === 0);
      var s = document.createElement("span");
      s.className = "glint" + (star ? " glint--star" : "");
      s.setAttribute("aria-hidden", "true");
      if (star) { s.textContent = "✦"; }
      else {
        var size = 4 + Math.random() * 6;
        s.style.width = size + "px";
        s.style.height = size + "px";
      }
      s.style.left = x + (Math.random() * 16 - 8) + "px";
      s.style.top = y + (Math.random() * 16 - 8) + "px";
      s.style.setProperty("--gx", (Math.random() * 18 - 9) + "px");
      s.style.setProperty("--gy", (7 + Math.random() * 14) + "px");
      s.style.setProperty("--life", (0.7 + Math.random() * 0.5) + "s");
      live += 1;
      document.body.appendChild(s);
      s.addEventListener("animationend", function () { this.remove(); live -= 1; });
    };

    var maybeSpawn = function (x, y) {
      var now = performance.now();
      var dx = x - gx, dy = y - gy;
      if (now - gt < 22 || dx * dx + dy * dy < 120) return;
      gt = now; gx = x; gy = y;
      spawnGlint(x, y);
      if (Math.random() < 0.7) spawnGlint(x, y);
    };

    document.addEventListener("mousemove", function (e) {
      maybeSpawn(e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener("touchmove", function (e) {
      var t = e.touches[0];
      if (t) maybeSpawn(t.clientX, t.clientY);
    }, { passive: true });

    document.addEventListener("touchstart", function (e) {
      var t = e.touches[0];
      if (!t) return;
      for (var i = 0; i < 9; i++) spawnGlint(t.clientX, t.clientY);
    }, { passive: true });
  }

  // ---- magnetic buttons ----
  if (finePointer && !reduceMotion) {
    document.querySelectorAll(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = "translate(" + dx * 0.18 + "px," + dy * 0.22 + "px)";
      });
      el.addEventListener("mouseleave", function () {
        el.style.transform = "";
      });
    });
  }

  // ---- mobilné menu (hamburger) ----
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.querySelector(".site-nav");
  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var open = siteNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    siteNav.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        siteNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ---- galéria filter podľa kategórií ----
  var chips = document.querySelectorAll(".gal-filter .chip");
  var galItems = document.querySelectorAll(".gal-item");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.getAttribute("data-filter");
      var visible = 0;
      galItems.forEach(function (it) {
        var off = f !== "vsetko" && it.getAttribute("data-cat") !== f;
        it.classList.toggle("is-off", off);
        if (!off) visible += 1;
      });
      var empty = document.querySelector(".gal-empty");
      if (empty) empty.hidden = visible > 0;
    });
  });

  // ---- easter egg: 3× ťuk na logo → zlatý dážď cez celý displej ----
  var brand = document.getElementById("brand");
  var taps = 0, tapTimer;
  var onHome = /(?:^|\/)(index\.html)?$/.test(location.pathname);

  var glitterShower = function () {
    for (var i = 0; i < 110; i++) {
      (function (i) {
        setTimeout(function () {
          var star = i % 5 === 0;
          var s = document.createElement("span");
          s.className = "glint glint--rain" + (star ? " glint--star" : "");
          s.setAttribute("aria-hidden", "true");
          if (star) { s.textContent = "✦"; }
          else {
            var size = 4 + Math.random() * 7;
            s.style.width = size + "px";
            s.style.height = size + "px";
          }
          s.style.left = Math.random() * 100 + "vw";
          s.style.top = "-3vh";
          s.style.setProperty("--fall", (55 + Math.random() * 55) + "vh");
          s.style.setProperty("--drift", (Math.random() * 90 - 45) + "px");
          s.style.setProperty("--life", (1.3 + Math.random() * 1.3) + "s");
          document.body.appendChild(s);
          s.addEventListener("animationend", function () { this.remove(); });
        }, i * 16);
      })(i);
    }
  };

  if (brand) {
    brand.addEventListener("click", function (e) {
      if (onHome) e.preventDefault(); // na domove logo nenaviguje — počítame ťuky
      taps += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { taps = 0; }, 700);
      if (taps >= 3) {
        e.preventDefault();
        taps = 0;
        if (!reduceMotion) glitterShower();
      }
    });
  }
})();
