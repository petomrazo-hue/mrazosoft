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

  // ---- ring cursor (len desktop, bez reduced motion) ----
  if (finePointer && !reduceMotion) {
    var ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.setAttribute("aria-hidden", "true");
    document.body.appendChild(ring);

    var mx = -100, my = -100, rx = -100, ry = -100;

    document.addEventListener("mousemove", function (e) {
      mx = e.clientX; my = e.clientY;
      ring.classList.add("is-live");
    }, { passive: true });

    document.addEventListener("mouseleave", function () {
      ring.classList.remove("is-live");
    });

    document.addEventListener("mouseover", function (e) {
      ring.classList.toggle("is-hot", !!e.target.closest("a, button"));
    });

    (function follow() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = "translate(" + rx + "px," + ry + "px)";
      requestAnimationFrame(follow);
    })();
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
