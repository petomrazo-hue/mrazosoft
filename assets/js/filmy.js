/* ── Filmová galéria (projekty.html) ──
   Obsah je zbalený za tlačidlom — 0 bajtov z assets/films pri načítaní stránky.
   MP4 sa sťahuje až po kliku na konkrétny film (lightbox). */
(function () {
  var lb = document.getElementById('filmLightbox');
  if (!lb) return;
  var BASE = 'assets/films/', V = '?v=1';
  var lbVid = document.getElementById('filmLbVideo');
  var lbTitle = document.getElementById('filmLbTitle');
  var hero = document.getElementById('filmHeroVid');
  var lastFocus = null;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;
  var heroLoaded = false, heroVisible = false;

  // rozbalenie galérie na explicitný klik
  var toggle = document.getElementById('filmyToggle');
  var content = document.getElementById('filmyObsah');
  if (toggle && content) {
    toggle.addEventListener('click', function () {
      content.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      toggle.parentElement.hidden = true;
      content.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
    });
  }

  function playHero() {
    if (!hero || reduce || saveData || lb.classList.contains('open') || !heroVisible) return;
    if (!heroLoaded) { hero.src = BASE + 'stavba.mp4' + V; heroLoaded = true; }
    var p = hero.play(); if (p && p.catch) p.catch(function () {});
  }
  function openFilm(slug, title) {
    lastFocus = document.activeElement;
    if (hero) { try { hero.pause(); } catch (e) {} }
    lbVid.src = BASE + slug + '.mp4' + V;
    lbTitle.textContent = title || '';
    lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false');
    var p = lbVid.play(); if (p && p.catch) p.catch(function () {});
    document.getElementById('filmLbClose').focus();
  }
  function closeFilm() {
    lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true');
    try { lbVid.pause(); } catch (e) {}
    lbVid.removeAttribute('src'); lbVid.load();
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    playHero();
  }
  document.querySelectorAll('[data-film]').forEach(function (el) {
    el.addEventListener('click', function () { openFilm(el.getAttribute('data-film'), el.getAttribute('data-title')); });
  });
  document.getElementById('filmLbClose').addEventListener('click', closeFilm);
  lb.addEventListener('click', function (e) { if (e.target === lb) closeFilm(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('open')) closeFilm(); });
  if (hero && !reduce && !saveData && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        heroVisible = en.isIntersecting;
        if (en.isIntersecting) { playHero(); } else { try { hero.pause(); } catch (e) {} }
      });
    }, { threshold: 0.35 }).observe(hero);
  }
})();
