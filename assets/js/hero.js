/* ── Hero video controller (spoločný pre všetky stránky) ──
   Video sa NIKDY nesťahuje pred window.load; vôbec sa nespustí pri
   reduced-motion, Save-Data alebo pomalom pripojení (ostáva poster).
   Prehráva sa len keď je hero vo viewporte a karta je aktívna. */
(function () {
  var video = document.getElementById('heroVideo');
  var dots = document.querySelectorAll('.demo-dots span');
  var soundBtn = document.getElementById('soundToggle');
  var replayBtn = document.getElementById('replayToggle');
  if (!video) return;

  var AUDIO_MS = 900;   // zvukový fade
  var soundOn = true;   // preferencia používateľa (tlačidlo)
  var unlocked = false; // či prehliadač povolil neztlmený zvuk (po prvom geste)
  // hranice 3 dejstiev v jednom súbore (po odčítaní dissolve prekryvu 0.6 s)
  var SEG = [0, 5.013889, 10.027778, 15.041667];
  var END = SEG[SEG.length - 1];

  var conn = navigator.connection || {};
  var slowNet = conn.saveData === true || /(^|-)2g$|^3g$/.test(conn.effectiveType || '');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var autoplayAllowed = !reduceMotion && !slowNet;

  video.muted = true;
  video.playsInline = true;

  function fadeVolume(v, from, to, dur, onDone) {
    var start = null;
    v.volume = from;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      v.volume = from + (to - from) * t;
      if (t < 1) requestAnimationFrame(step); else if (onDone) onDone();
    }
    requestAnimationFrame(step);
  }

  function unlockSound() {
    if (unlocked) return;
    unlocked = true;
    if (soundBtn) soundBtn.classList.remove('is-muted');
    if (!soundOn) return;
    video.muted = false; fadeVolume(video, 0, 1, AUDIO_MS);
  }
  document.addEventListener('click', unlockSound, { once: true });
  document.addEventListener('keydown', unlockSound, { once: true });

  if (soundBtn) {
    soundBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!unlocked) {
        // prvý klik na tlačidlo = vždy odomknúť/zapnúť zvuk, nie prepnúť
        unlocked = true;
        soundOn = true;
        soundBtn.classList.remove('is-muted');
        video.muted = false; fadeVolume(video, 0, 1, AUDIO_MS);
        return;
      }
      soundOn = !soundOn;
      soundBtn.classList.toggle('is-muted', !soundOn);
      if (soundOn) { video.muted = false; fadeVolume(video, 0, 1, AUDIO_MS); }
      else { fadeVolume(video, video.volume, 0, AUDIO_MS, function () { video.muted = true; }); }
    });
  }

  // spoločná časová os naprieč stránkami (sessionStorage) — pri prechode cez
  // menu video pokračuje "od teraz", nie odznova na každej novej stránke
  var STORE_KEY = 'ms_hero_t0';
  var t0;
  try {
    var saved = sessionStorage.getItem(STORE_KEY);
    if (saved) { t0 = parseInt(saved, 10); }
    else { t0 = Date.now(); sessionStorage.setItem(STORE_KEY, String(t0)); }
  } catch (e) { t0 = Date.now(); }

  if (replayBtn) {
    replayBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      // explicitná interakcia — prehrať smie aj používateľ so Save-Data/reduced-motion
      video.currentTime = 0;
      video.play().catch(function () {});
      t0 = Date.now();
      try { sessionStorage.setItem(STORE_KEY, String(t0)); } catch (err) {}
    });
  }

  video.addEventListener('timeupdate', function () {
    var idx = 0;
    for (var i = 0; i < SEG.length - 1; i++) { if (video.currentTime >= SEG[i]) idx = i; }
    dots.forEach(function (d, di) { d.classList.toggle('is-on', di === idx); });
  });

  if (!autoplayAllowed) return; // poster ostáva; replay tlačidlo funguje ďalej

  var started = false;
  function startFromTimeline() {
    if (started) return;
    started = true;
    var elapsed = (Date.now() - t0) / 1000;
    if (elapsed >= END) {
      // video už raz dobehlo v tejto session — posledný záber, žiadny loop
      video.currentTime = Math.max(0, END - 0.05);
    } else {
      video.currentTime = elapsed;
      video.play().catch(function () {});
    }
  }

  // štart až po window.load + idle (nesúperí s LCP/kritickou cestou)
  // a len keď je hero reálne vo viewporte; mimo viewportu/karty pauza
  function arm() {
    var idle = window.requestIdleCallback || function (fn) { setTimeout(fn, 250); };
    idle(function () {
      if (!('IntersectionObserver' in window)) { startFromTimeline(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) { startFromTimeline(); if (started && video.paused && video.currentTime < END - 0.1) video.play().catch(function () {}); }
          else if (!video.paused) { video.pause(); }
        });
      }, { threshold: 0.15 });
      io.observe(video);
    });
  }
  if (document.readyState === 'complete') arm();
  else window.addEventListener('load', arm, { once: true });

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) { if (!video.paused) video.pause(); }
    else if (started && video.paused && video.currentTime < END - 0.1) { video.play().catch(function () {}); }
  });
})();
