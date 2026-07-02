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

  // ---- sticky CTA po odscrollovaní hero ----
  if ("IntersectionObserver" in window && hero && stickyCta) {
    new IntersectionObserver(function (entries) {
      stickyCta.classList.toggle("is-on", !entries[0].isIntersecting);
    }, { threshold: 0.12 }).observe(hero);
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

  // ---- galéria filter podľa kategórií ----
  var chips = document.querySelectorAll(".gal-filter .chip");
  var galItems = document.querySelectorAll(".gal-item");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("is-active"); });
      chip.classList.add("is-active");
      var f = chip.getAttribute("data-filter");
      galItems.forEach(function (it) {
        it.classList.toggle("is-off", f !== "vsetko" && it.getAttribute("data-cat") !== f);
      });
    });
  });

  // ---- easter egg: 3× ťuk na logo → glitter bloom ----
  var brand = document.getElementById("brand");
  var taps = 0, tapTimer;
  if (brand) {
    brand.addEventListener("click", function (e) {
      taps += 1;
      clearTimeout(tapTimer);
      tapTimer = setTimeout(function () { taps = 0; }, 700);
      if (taps >= 3) {
        e.preventDefault();
        taps = 0;
        if (reduceMotion) return;
        var r = brand.getBoundingClientRect();
        var cx = r.left + r.width / 2;
        var cy = r.top + r.height / 2;
        for (var i = 0; i < 26; i++) {
          var s = document.createElement("span");
          s.className = "spark";
          var ang = Math.random() * Math.PI * 2;
          var dist = 60 + Math.random() * 160;
          s.style.left = cx + "px";
          s.style.top = cy + "px";
          s.style.setProperty("--dx", Math.cos(ang) * dist + "px");
          s.style.setProperty("--dy", Math.sin(ang) * dist + "px");
          document.body.appendChild(s);
          s.addEventListener("animationend", function () { this.remove(); });
        }
      }
    });
  }
})();
