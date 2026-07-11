/* MRAZOSOFT — orchestrácia scroll-flightu (rail, snap, pill+mapa letu,
   exit-intent, ambient, haptika). Extrahované z inline <script> v index.html
   kvôli cacheovaniu a menšiemu HTML (P2 audit 10.7.2026). */
/* scrollspy: planéta ↔ položka menu — pri dolete ku konkrétnej planéte sa
   v hlavnom menu rozsvieti JEJ položka (Merkúr=Služby, Venuša=Projekty,
   Zem=O mne, Mars=Blog, Neptún=Kontakt; Slnko/hero a ostatné planéty=Domov) */
(function () {
  /* let vždy začína od hero (galaxia) — obnova scrollu by hodila návštevníka
     doprostred sústavy bez kontextu */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  var map = {
    'stop-mercury': 'sluzby.html',
    'stop-venus': 'projekty.html',
    'stop-earth': 'o-mne.html',
    'stop-mars': 'blog.html',
    'stop-neptune': 'kontakt.html'
  };
  /* plynulý LET na cieľ: natívny smooth scroll letí 9000 px za ~0,5 s =
     extrémny prelet (Peto 10.7.); vlastný tween škáluje trvanie vzdialenosťou */
  var _flyRaf = null, _flyDone = null;
  var _reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var _coarsePtr = window.matchMedia('(pointer: coarse)').matches;
  function flyScroll(top, done) {
    var start = window.scrollY, dist = top - start;
    if (Math.abs(dist) < 4) { if (done) done(); return; }
    if (_reduceMotion) { window.scrollTo(0, top); if (done) done(); return; }
    /* mobil: ŽIADEN tween cez trasu — scroll skočí hneď a kameru dorieši
       warp-cut v solar.js (krátky dojazd ~0,3 s); tween cez celú vzdialenosť
       robil medzi vzdialenými planétami dlhé prázdne prelety (Peto 11.7.) */
    if (_coarsePtr) { window.scrollTo(0, top); if (done) done(); return; }
    var dur = Math.min(2600, 600 + Math.abs(dist) * 0.35);
    var t0 = performance.now();
    if (_flyRaf) cancelAnimationFrame(_flyRaf);
    _flyDone = done || null;
    (function step(now) {
      var f = Math.min((now - t0) / dur, 1);
      var e = f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;   // easeInOutCubic
      window.scrollTo(0, start + dist * e);
      if (f < 1) { _flyRaf = requestAnimationFrame(step); }
      else { _flyRaf = null; if (_flyDone) { var d = _flyDone; _flyDone = null; d(); } }
    })(t0);
  }
  /* zásah používateľa let okamžite preruší (žiadny boj o scroll);
     done callback treba dobehnúť, inak by ostal visieť snap lock.
     lock je ZDIEĽANÝ so snapom: počas snap letu vlastné wheel/key eventy
     tween nesmú zrušiť (wheel stream by ho zabil na prvom frame). */
  var lock = false;
  function cancelFly() {
    if (!_flyRaf || lock) return;
    cancelAnimationFrame(_flyRaf);
    _flyRaf = null;
    if (_flyDone) { var d = _flyDone; _flyDone = null; d(); }
  }
  ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
    window.addEventListener(ev, cancelFly, { passive: true });
  });
  var links = {};
  document.querySelectorAll('.nav-links a').forEach(function (a) { links[a.getAttribute('href')] = a; });
  function setActive(href) {
    Object.keys(links).forEach(function (k) {
      links[k].classList.toggle('is-active', k === href);
      if (k === href) links[k].setAttribute('aria-current', 'true');
      else links[k].removeAttribute('aria-current');
    });
  }
  /* planétová lišta vpravo: bodka za bodkou = Slnko + planéty; klik = dolet */
  var stops = [{ el: document.querySelector('.hero-cosmos'), label: 'Mliečna dráha · Domov' }];
  document.querySelectorAll('main .section[id^="stop-"]').forEach(function (sec) {
    var lbl = sec.querySelector('.stop-label');
    var name = lbl ? lbl.textContent.trim() : sec.id;
    sec.setAttribute('aria-label', name);
    stops.push({ el: sec, label: name });
  });
  var rail = document.createElement('nav');
  rail.className = 'planet-rail';
  rail.setAttribute('aria-label', 'Cesta slnečnou sústavou');
  stops.forEach(function (s) {
    var b = document.createElement('button');
    b.type = 'button';
    b.innerHTML = '<i></i><span>' + s.label + '</span>';
    b.setAttribute('aria-label', s.label);
    b.addEventListener('click', function () {
      flyScroll(s.el.offsetTop);
    });
    s.btn = b;
    rail.appendChild(b);
  });
  document.body.appendChild(rail);

  function railActivate(target) {
    stops.forEach(function (s) {
      var here = s.el === target;
      s.btn.classList.toggle('is-here', here);
      if (here) s.btn.setAttribute('aria-current', 'true');
      else s.btn.removeAttribute('aria-current');
    });
  }
  /* klávesnica na lište: šípky prechádzajú zastávky, Enter/Space letí (button default) */
  rail.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    var btns = [].slice.call(rail.querySelectorAll('button'));
    var i = btns.indexOf(document.activeElement);
    if (i < 0) return;
    e.preventDefault();
    btns[e.key === 'ArrowDown' ? Math.min(i + 1, btns.length - 1) : Math.max(i - 1, 0)].focus();
  });
  /* WhatsApp FAB: predvyplnený text podľa planéty, pri ktorej návštevník je */
  var waFab = document.querySelector('.wa-fab');
  var waTexts = {
    'stop-mercury': 'Dobrý deň, mám záujem o vaše služby (web / AI / video).',
    'stop-venus': 'Dobrý deň, chcem podobný projekt, ako máte v portfóliu.',
    'stop-earth': 'Dobrý deň, rád by som prebral možnú spoluprácu.',
    'stop-mars': 'Dobrý deň, mám otázku k webu — píšete o tom na blogu.',
    'stop-jupiter': 'Dobrý deň, potrebujem riešenie pre moju firmu.',
    'stop-saturn': 'Dobrý deň, mám záujem o spoluprácu na projekte.',
    'stop-uranus': 'Dobrý deň, mám záujem o web — presvedčili ma hodnotenia.',
    'stop-neptune': 'Dobrý deň, posielam dopyt na projekt.'
  };
  function setWa(id) {
    if (!waFab) return;
    var txt = waTexts[id] || 'Dobrý deň, mám záujem o web/appku.';
    waFab.href = 'https://wa.me/421948459082?text=' + encodeURIComponent(txt);
  }

  /* haptika na mobile: jemné ťuknutie pri dolete k novej zastávke */
  var lastStopId = null;
  var canBuzz = window.matchMedia('(pointer: coarse)').matches && 'vibrate' in navigator;

  var curStopEl = stops[0].el;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        setActive(map[e.target.id] || 'index.html');
        railActivate(e.target);
        setWa(e.target.id);
        if (canBuzz && e.target.id && e.target.id !== lastStopId) {
          try { navigator.vibrate(8); } catch (err) {}
        }
        lastStopId = e.target.id;
        curStopEl = e.target;
        pillUpdate(e.target);
      }
    });
  }, { rootMargin: '-45% 0px -45% 0px' });
  stops.forEach(function (s) { io.observe(s.el); });

  /* ── PALUBNÝ NAVIGÁTOR: letový pill + mapa letu (záchranná navigácia —
     používateľ vždy vie, kde v sústave je, a vie sa jedným ťukom presunúť) ── */
  var pill = document.getElementById('flightPill');
  var fpLabel = document.getElementById('fpLabel');
  var fmap = document.getElementById('flightMap');
  var fmList = document.getElementById('fmList');
  var fmClose = document.getElementById('fmClose');
  var beaconT = null;
  function stopFor(el) {
    for (var i = 0; i < stops.length; i++) if (stops[i].el === el) return stops[i];
    return stops[0];
  }
  function liveLabel(s) {
    /* čítaj AKTUÁLNY text (data-i18n mohol medzitým prepnúť jazyk) */
    if (s.el === stops[0].el) {
      var home = document.getElementById('fmHome');
      return (home && home.textContent.trim()) || s.label;
    }
    var lbl = s.el.querySelector && s.el.querySelector('.stop-label');
    return (lbl ? lbl.textContent.trim() : s.label) || s.label;
  }
  var pillFadeT = null;
  function pillUpdate(el) {
    if (fpLabel) {
      var next = liveLabel(stopFor(el));
      if (next !== fpLabel.textContent) {
        /* crossfade namiesto tvrdého swapu textu */
        fpLabel.style.opacity = '0';
        clearTimeout(pillFadeT);
        pillFadeT = setTimeout(function () {
          fpLabel.textContent = next;
          fpLabel.style.opacity = '1';
        }, 160);
      }
    }
    hopBounds(el);   // šípky ‹ › na krajoch trasy zhasnú (function hoisting)
    armBeacon();
  }
  /* maják strateného používateľa: 25 s v lete bez zmeny zastávky → pill pulzne (1×/session) */
  function armBeacon() {
    clearTimeout(beaconT);
    beaconT = setTimeout(function () {
      try {
        if (sessionStorage.getItem('ms_beacon_seen')) return;
        if (window.scrollY < window.innerHeight * 0.5) return;   // v hero sa nikto nestráca
        sessionStorage.setItem('ms_beacon_seen', '1');
        pill.classList.add('is-beacon');
        setTimeout(function () { pill.classList.remove('is-beacon'); }, 5200);
      } catch (err) {}
    }, 25000);
  }
  armBeacon();
  function fmBuild() {
    fmList.innerHTML = '';
    stops.forEach(function (s) {
      var li = document.createElement('li');
      li.className = 'fm-item';
      if (s.el === curStopEl) li.classList.add('is-here');
      else if (s.el.offsetTop < window.scrollY - 10) li.classList.add('is-past');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'fm-go';
      b.innerHTML = '<i aria-hidden="true"></i><span></span>';
      b.querySelector('span').textContent = liveLabel(s);
      b.addEventListener('click', function () {
        fmHide();
        flyScroll(s.el === stops[0].el ? 0 : s.el.offsetTop);
      });
      li.appendChild(b);
      var page = s.el.id && map[s.el.id];
      if (page) {
        var a = document.createElement('a');
        a.className = 'fm-open';
        a.href = page;
        a.textContent = '↗';
        a.setAttribute('aria-label', 'Otvoriť stránku: ' + liveLabel(s));
        li.appendChild(a);
      }
      fmList.appendChild(li);
    });
  }
  function fmShow() {
    fmBuild();
    fmap.hidden = false;
    pill.setAttribute('aria-expanded', 'true');
    if (canBuzz) { try { navigator.vibrate(8); } catch (err) {} }
    var here = fmList.querySelector('.is-here .fm-go');
    (here || fmClose).focus();
  }
  function fmHide() {
    fmap.hidden = true;
    pill.setAttribute('aria-expanded', 'false');
    pill.focus();
  }
  /* swipe nápoveda (mobil): ukáž po nábehu, skry po prvom reálnom scrolle */
  var swipeHint = document.getElementById('swipeHint');
  if (swipeHint) {
    var hintSeen = false;
    try { hintSeen = !!sessionStorage.getItem('ms_swipe_seen'); } catch (err) {}
    if (!hintSeen && window.matchMedia('(pointer: coarse)').matches) {
      setTimeout(function () {
        if (window.scrollY < 60) swipeHint.classList.add('show');
      }, 2200);
      var hideHint = function () {
        if (window.scrollY < 60) return;
        swipeHint.classList.remove('show');
        swipeHint.classList.add('gone');
        try { sessionStorage.setItem('ms_swipe_seen', '1'); } catch (err) {}
        window.removeEventListener('scroll', hideHint);
      };
      window.addEventListener('scroll', hideHint, { passive: true });
    }
  }

  /* pill uhni pätičke — prekrýval jej text (Peto 10.7.) */
  var footer = document.querySelector('.footer');
  if (footer && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle('footer-in-view', entries[0].isIntersecting);
    }, { threshold: 0.1 }).observe(footer);
  }
  pill.addEventListener('click', function () { fmap.hidden ? fmShow() : fmHide(); });
  fmClose.addEventListener('click', fmHide);
  fmap.addEventListener('click', function (e) { if (e.target === fmap) fmHide(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !fmap.hidden) fmHide(); });

  /* preskočiť let: plynulý dolet na prvý obsah (Merkúr) — okamžitý skok pôsobil surovo */
  var skip = document.getElementById('skipFlight');
  if (skip) skip.addEventListener('click', function () {
    var m = document.getElementById('stop-mercury');
    if (m) flyScroll(m.offsetTop);
  });
  /* exit zastávka: reálne akcie (label sám vyzeral ako tlačidlo a nedal sa stlačiť) */
  var exitTop = document.getElementById('exitTop');
  if (exitTop) exitTop.addEventListener('click', function () { flyScroll(0); });
  var exitContact = document.getElementById('exitContact');
  if (exitContact) exitContact.addEventListener('click', function () { flyToForm(''); });

  /* vesmírny ambient (WebAudio drone — žiadny asset, default VYPNUTÝ,
     štartuje len z kliknutia = v súlade s autoplay pravidlami) */
  var ambBtn = document.getElementById('ambientToggle');
  if (ambBtn) {
    var actx = null, ambMaster = null, ambOn = false;
    var buildAmbient = function () {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      ambMaster = actx.createGain();
      ambMaster.gain.value = 0;
      ambMaster.connect(actx.destination);
      var o1 = actx.createOscillator(); o1.type = 'sine'; o1.frequency.value = 55;
      var g1 = actx.createGain(); g1.gain.value = 0.5; o1.connect(g1); g1.connect(ambMaster);
      var o2 = actx.createOscillator(); o2.type = 'sine'; o2.frequency.value = 82.4;
      var g2 = actx.createGain(); g2.gain.value = 0.2; o2.connect(g2); g2.connect(ambMaster);
      var len = actx.sampleRate * 4, buf = actx.createBuffer(1, len, actx.sampleRate);
      var ch = buf.getChannelData(0), last = 0;
      for (var i = 0; i < len; i++) { var w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; ch[i] = last * 3; }
      var noise = actx.createBufferSource(); noise.buffer = buf; noise.loop = true;
      var lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 150;
      var gn = actx.createGain(); gn.gain.value = 0.6;
      noise.connect(lp); lp.connect(gn); gn.connect(ambMaster);
      o1.start(); o2.start(); noise.start();
    };
    ambBtn.addEventListener('click', function () {
      if (!actx) buildAmbient();
      if (actx.state === 'suspended') actx.resume();
      ambOn = !ambOn;
      ambMaster.gain.cancelScheduledValues(actx.currentTime);
      ambMaster.gain.linearRampToValueAtTime(ambOn ? 0.055 : 0, actx.currentTime + 1.4);
      ambBtn.classList.toggle('is-on', ambOn);
      ambBtn.setAttribute('aria-pressed', String(ambOn));
      ambBtn.setAttribute('aria-label', ambOn ? 'Vypnúť vesmírny zvuk' : 'Zapnúť vesmírny zvuk');
    });
    /* skrytý tab = ticho (šetrí batériu aj nervy) */
    document.addEventListener('visibilitychange', function () {
      if (!actx) return;
      if (document.hidden) actx.suspend();
      else if (ambOn) actx.resume();
    });
  }

  /* mikro-CTA na kartách: predvyplní dopyt a zletí na Neptún (formulár) */
  var neptune = document.getElementById('stop-neptune');
  function flyToForm(tema) {
    var ta = document.querySelector('#kontaktForm textarea[name="sprava"]');
    if (ta && tema && !ta.value.trim()) ta.value = 'Mám záujem o ' + tema + '.';
    if (neptune) flyScroll(neptune.offsetTop);
  }
  document.querySelectorAll('.stop-cta').forEach(function (b) {
    b.addEventListener('click', function () { flyToForm(b.getAttribute('data-tema')); });
  });

  /* exit-intent (desktop, raz za session, až po 8 s): bezplatná konzultácia */
  var nudge = document.getElementById('exitNudge');
  if (nudge && window.matchMedia('(min-width: 1100px) and (pointer: fine)').matches) {
    var nudgeArmed = false;
    setTimeout(function () { nudgeArmed = true; }, 8000);
    function hideNudge() { nudge.hidden = true; }
    document.addEventListener('mouseout', function (e) {
      if (!nudgeArmed || e.relatedTarget || e.clientY > 8) return;
      try { if (sessionStorage.getItem('ms_exit_seen')) return; sessionStorage.setItem('ms_exit_seen', '1'); } catch (err) {}
      nudge.hidden = false;
    });
    nudge.addEventListener('click', function (e) { if (e.target === nudge) hideNudge(); });
    document.getElementById('exitClose').addEventListener('click', hideNudge);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hideNudge(); });
    document.getElementById('exitToForm').addEventListener('click', function () {
      hideNudge();
      flyToForm('bezplatnú konzultáciu');
    });
  }

  /* zdieľaná zastávková navigácia (desktop snap + mobilný horizontálny švih) */
  var maxScroll = function () { return document.documentElement.scrollHeight - window.innerHeight; };
  var idxFor = function (y) {
    var best = 0, bd = 1e9;
    stops.forEach(function (s, i) {
      var d = Math.abs(s.el.offsetTop - y);
      if (d < bd) { bd = d; best = i; }
    });
    if (Math.abs(maxScroll() - y) < bd) best = stops.length;   // dno (pätička)
    return best;
  };
  var go = function (i) {
    i = Math.max(0, Math.min(i, stops.length));
    var top = i === stops.length ? maxScroll() : stops[i].el.offsetTop;
    if (Math.abs(top - window.scrollY) < 4) { lock = false; return; }
    lock = true;
    /* filmový tween namiesto natívneho smooth — ten letel hop za ~0,4 s
       a prechody na PC pôsobili prudko (Peto 10.7.) */
    flyScroll(top, function () { setTimeout(function () { lock = false; }, 120); });
  };

  /* MOBIL (portrét): HORNÁ ZÓNA (planéta/scéna) sa ovláda švihom DOĽAVA/DOPRAVA
     — doľava = ďalšia zastávka, doprava = predošlá; ZVISLÝ švih v hornej zóne
     stránku neposúva (Peto 11.7.). Karta dole a jej okolie = zvislý scroll ako
     doteraz. Tap (bez pohybu) prejde — klik na planétu ostáva funkčný. */
  /* viditeľné šípky ‹ › po bokoch hornej zóny (mobil portrét) — švih do strany
     nie je objaviteľný sám od seba, šípky ukazujú smer aj možnosť (Peto 11.7.) */
  var hopPrev = document.getElementById('hopPrev');
  var hopNext = document.getElementById('hopNext');
  function hop(dir) { if (!lock) go(idxFor(window.scrollY) + dir); }
  if (hopPrev) hopPrev.addEventListener('click', function () { hop(-1); });
  if (hopNext) hopNext.addEventListener('click', function () { hop(1); });
  function hopBounds(el) {
    if (!hopPrev) return;
    var ci = stops.indexOf(stopFor(el));
    hopPrev.disabled = ci <= 0;
    hopNext.disabled = ci >= stops.length - 1;
  }

  var hswipeOn = window.matchMedia('(pointer: coarse)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hswipeOn) {
    var hsX = 0, hsY = 0, hsActive = false, hsAxis = '';
    var inTopZone = function (y) {
      if (!window.matchMedia('(max-width: 979px) and (orientation: portrait)').matches) return false;
      return y > 70 && y < window.innerHeight * 0.45;   // pod hlavičkou, nad kartou
    };
    window.addEventListener('touchstart', function (e) {
      hsActive = false;
      if (e.touches.length !== 1) return;
      /* karta, pill, mapa, hlavička a FABy si dotyk riešia po svojom */
      if (e.target.closest && e.target.closest('.container.is-anchored, .flight-pill, .flight-map, .nav, .wa-fab, .ambient-toggle, #exitNudge')) return;
      hsActive = inTopZone(e.touches[0].clientY);
      hsAxis = '';
      hsX = e.touches[0].clientX; hsY = e.touches[0].clientY;
    }, { passive: true });
    window.addEventListener('touchmove', function (e) {
      if (!hsActive) return;
      var dx = e.touches[0].clientX - hsX, dy = e.touches[0].clientY - hsY;
      /* mikropohyb tapu nechaj tak (klik na planétu musí prejsť) */
      if (!hsAxis) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        hsAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
      }
      e.preventDefault();   // horná zóna: žiadny zvislý posun stránky
    }, { passive: false });
    window.addEventListener('touchend', function (e) {
      if (!hsActive) return;
      hsActive = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - hsX, dy = t.clientY - hsY;
      if (hsAxis !== 'x' || Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (lock) return;
      go(idxFor(window.scrollY) + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* JEDNO SKROLNUTIE = JEDNA PLANÉTA (desktop) — koliesko/klávesy skáču
     medzi zastávkami; vnútro dlhej karty sa najprv dočíta natívne */
  var snapOn = window.matchMedia('(min-width: 1100px) and (pointer: fine)').matches
    && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (snapOn) {
    var acc = 0, accT = 0;
    window.addEventListener('wheel', function (e) {
      var card = e.target.closest ? e.target.closest('.container.is-anchored') : null;
      if (card && card.scrollHeight > card.clientHeight + 4) {
        var down = e.deltaY > 0;
        var can = down
          ? card.scrollTop + card.clientHeight < card.scrollHeight - 2
          : card.scrollTop > 2;
        if (can) return;   // karta má ešte čo čítať — scrolluje jej vnútro
      }
      e.preventDefault();
      if (lock) return;
      var now = performance.now();
      if (now - accT > 280) acc = 0;
      accT = now;
      acc += e.deltaY;
      if (Math.abs(acc) < 60) return;
      var dir = acc > 0 ? 1 : -1;
      acc = 0;
      go(idxFor(window.scrollY) + dir);
    }, { passive: false });
    window.addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test((document.activeElement || {}).tagName || '')) return;
      var dir = 0;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || (e.key === ' ' && !e.shiftKey)) dir = 1;
      else if (e.key === 'ArrowUp' || e.key === 'PageUp' || (e.key === ' ' && e.shiftKey)) dir = -1;
      if (!dir) return;
      e.preventDefault();
      if (!lock) go(idxFor(window.scrollY) + dir);
    });
  }
})();
