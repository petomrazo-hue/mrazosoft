/* ░░ WIZARD „Poskladajte si svoj web" — Duncan Hines efekt: zákazník vloží prácu, návrh rastie pred očami ░░ */
(function () {
  'use strict';

  var W3F_KEY = 'a801edbc-d2f8-477b-8260-5a68f7246d7e'; // verejný klient-side kľúč (rovnaký ako kontaktný formulár)
  var LS_KEY = 'mzs_wizard_v1';
  var KROKOV = 6;

  /* ── Konfigurácia volieb ── */
  var TYPY = [
    { id: 'web',    label: 'Webová stránka', ic: '🌐' },
    { id: 'eshop',  label: 'E-shop',         ic: '🛒' },
    { id: 'appka',  label: 'Aplikácia',      ic: '📱' },
    { id: 'neviem', label: 'Neviem, poradíte mi', ic: '💬' }
  ];
  var SMERY = [
    { id: 'ciste',   label: 'Čisté & dôveryhodné', pop: 'vzdušné, prehľadné, seriózne', font: "'Inter', sans-serif",         radius: '8px',  weight: 600 },
    { id: 'odvazne', label: 'Odvážne & moderné',   pop: 'výrazné, technologické',       font: "'Space Grotesk', sans-serif", radius: '0px',  weight: 700 },
    { id: 'teple',   label: 'Teplé & rodinné',     pop: 'mäkké, priateľské, oblé',      font: "'Inter', sans-serif",         radius: '20px', weight: 500 },
    { id: 'lux',     label: 'Luxusné & elegantné', pop: 'serif, decentné, prémiové',    font: "Georgia, 'Times New Roman', serif", radius: '2px', weight: 400 }
  ];
  var PALETY = [
    { id: 'polnoc',   label: 'Polnočná',   bg: '#0F172A', surface: '#1E293B', accent: '#38BDF8', text: '#F1F5F9', muted: '#94A3B8', light: false },
    { id: 'les',      label: 'Lesná',      bg: '#122117', surface: '#1D3324', accent: '#4ADE80', text: '#EDF7EF', muted: '#93AC9B', light: false },
    { id: 'terakota', label: 'Terakota',   bg: '#FFF7F0', surface: '#FBE7D8', accent: '#C2551F', text: '#3B2416', muted: '#8C6F5D', light: true },
    { id: 'kremova',  label: 'Krémová',    bg: '#FAF7F0', surface: '#EFE9DC', accent: '#3F6B4F', text: '#25301F', muted: '#7C8377', light: true },
    { id: 'noczlato', label: 'Čierna & zlatá', bg: '#0B0B0D', surface: '#1A181A', accent: '#D4AF37', text: '#F4EFE6', muted: '#9A927F', light: false },
    { id: 'ruzfial',  label: 'Ružovo-fialová', bg: '#1A1023', surface: '#2A1B38', accent: '#E879B9', text: '#F6EEFA', muted: '#A791B8', light: false }
  ];
  var SEKCIE = [
    { id: 'cennik',     label: 'Cenník' },
    { id: 'galeria',    label: 'Galéria / fotky' },
    { id: 'rezervacie', label: 'Rezervácie / objednávka' },
    { id: 'referencie', label: 'Referencie' },
    { id: 'onas',       label: 'O nás' },
    { id: 'blog',       label: 'Blog / novinky' },
    { id: 'kontakt',    label: 'Kontakt + mapa' }
  ];
  var ANO_NIE = [ { id: 'ano', label: 'Mám ✓' }, { id: 'nie', label: 'Nemám — pomôžete mi' } ];
  var TERMINY = [
    { id: 'asap',   label: 'Čo najskôr' },
    { id: 'do2m',   label: 'Do 1–2 mesiacov' },
    { id: 'kludne', label: 'Neponáhľa to' }
  ];

  var state = { v: 1, step: 0, typ: null, styl: null, paleta: null, sekcie: [], texty: null, fotky: null, termin: null, nazov: '' };

  /* ── Pomôcky ── */
  function $(id) { return document.getElementById(id); }
  function najdi(pole, id) { for (var i = 0; i < pole.length; i++) if (pole[i].id === id) return pole[i]; return null; }
  function uloz() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  function obnov() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (d && d.v === 1) { for (var k in state) if (k in d) state[k] = d[k]; if (state.step > 5) state.step = 5; }
    } catch (e) {}
  }

  /* ── Render chipov z konfigurácie ── */
  function renderChips(elId, pole, extra) {
    var box = $(elId);
    box.textContent = '';
    pole.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'wz-chip' + (extra === 'card' ? ' wz-card' : extra === 'swatch' ? ' wz-swatch' : '');
      b.dataset.id = o.id;
      b.setAttribute('aria-pressed', 'false');
      if (extra === 'card') {
        var t = document.createElement('b'); t.textContent = o.label;
        var s = document.createElement('span'); s.textContent = o.pop;
        var sam = document.createElement('span'); sam.className = 'wz-card-sample'; sam.textContent = 'Aa';
        sam.style.fontFamily = o.font; sam.style.fontWeight = o.weight;
        b.appendChild(t); b.appendChild(s); b.appendChild(sam);
      } else if (extra === 'swatch') {
        var pr = document.createElement('span'); pr.className = 'pruhy';
        [o.bg, o.surface, o.accent, o.text].forEach(function (farba) {
          var i = document.createElement('i'); i.style.background = farba; pr.appendChild(i);
        });
        var lb = document.createElement('small'); lb.textContent = o.label;
        b.appendChild(pr); b.appendChild(lb);
      } else {
        b.textContent = (o.ic ? o.ic + ' ' : '') + o.label;
      }
      box.appendChild(b);
    });
  }

  /* ── Náhľad ── */
  function renderPreview() {
    var prev = $('wzPreview');
    var p = najdi(PALETY, state.paleta);
    if (p) {
      prev.style.setProperty('--p-bg', p.bg);
      prev.style.setProperty('--p-surface', p.surface);
      prev.style.setProperty('--p-accent', p.accent);
      prev.style.setProperty('--p-text', p.text);
      prev.style.setProperty('--p-muted', p.muted);
      prev.classList.toggle('is-light', !!p.light);
    }
    var s = najdi(SMERY, state.styl);
    if (s) {
      prev.style.setProperty('--p-font', s.font);
      prev.style.setProperty('--p-radius', s.radius);
      prev.style.setProperty('--p-weight', s.weight);
    }
    var nazov = state.nazov.trim() || 'Vaša firma';
    $('wzpLogo').textContent = nazov;
    $('wzpTitle').textContent = nazov;
    $('wzpUrl').textContent = state.nazov.trim()
      ? state.nazov.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '') .slice(0, 22) + '.sk'
      : 'vasafirma.sk';

    var typ = state.typ;
    $('wzpCta').textContent = typ === 'eshop' ? 'Do košíka' : typ === 'appka' ? 'Stiahnuť appku' : 'Kontaktujte nás';
    $('wzpSub').textContent = typ === 'eshop' ? 'Váš tovar, prehľadne a s košíkom'
      : typ === 'appka' ? 'Vaša appka pre web aj mobil'
      : 'Tu bude vaša ponuka jednou vetou';

    // menu z sekcií (max 4 + ⋯)
    var menu = $('wzpMenu');
    menu.textContent = '';
    var zvolene = SEKCIE.filter(function (x) { return state.sekcie.indexOf(x.id) > -1; });
    zvolene.slice(0, 4).forEach(function (x) {
      var sp = document.createElement('span'); sp.textContent = x.label.split(' ')[0]; menu.appendChild(sp);
    });
    if (zvolene.length > 4) { var d = document.createElement('span'); d.textContent = '⋯'; menu.appendChild(d); }

    // telo: e-shop kartičky + bloky sekcií
    var body = $('wzpBody');
    body.textContent = '';
    if (typ === 'eshop') {
      var prods = document.createElement('div'); prods.className = 'wzp-prods';
      for (var i = 0; i < 3; i++) { var pd = document.createElement('span'); pd.className = 'wzp-prod'; pd.appendChild(document.createElement('span')); prods.appendChild(pd); }
      body.appendChild(prods);
    }
    zvolene.slice(0, 4).forEach(function (x) {
      var bl = document.createElement('span'); bl.className = 'wzp-blok';
      var t = document.createElement('b'); t.textContent = x.label;
      bl.appendChild(t); bl.appendChild(document.createElement('i')); bl.appendChild(document.createElement('i'));
      body.appendChild(bl);
    });
  }

  /* ── Kroky ── */
  function renderKrok(focus) {
    var steps = document.querySelectorAll('.wz-step');
    steps.forEach(function (sec) {
      var n = parseInt(sec.dataset.step, 10);
      sec.hidden = n !== state.step;
    });
    $('wzProgressText').textContent = state.step >= KROKOV ? 'Odoslané' : 'Krok ' + (state.step + 1) + ' z ' + KROKOV;
    var dots = $('wzDots');
    dots.textContent = '';
    for (var i = 0; i < KROKOV; i++) { var sp = document.createElement('span'); if (i <= Math.min(state.step, KROKOV - 1)) sp.className = 'on'; dots.appendChild(sp); }
    // označenia chipov podľa stavu
    oznac('wzTyp', [state.typ]); oznac('wzStyl', [state.styl]); oznac('wzPaleta', [state.paleta]);
    oznac('wzSekcie', state.sekcie); oznac('wzTexty', [state.texty]); oznac('wzFotky', [state.fotky]); oznac('wzTermin', [state.termin]);
    if (state.step === 5) renderSumar();
    if (focus) { var h = $('wzH' + state.step); if (h) h.focus(); }
    uloz();
  }
  function oznac(elId, ids) {
    var box = $(elId); if (!box) return;
    box.querySelectorAll('.wz-chip').forEach(function (b) {
      b.setAttribute('aria-pressed', ids.indexOf(b.dataset.id) > -1 ? 'true' : 'false');
    });
  }
  function chod(n, focus) { state.step = Math.max(0, Math.min(6, n)); renderKrok(focus !== false); }

  /* ── Súhrn + brief ── */
  function labelOf(pole, id, fallback) { var o = najdi(pole, id); return o ? o.label : (fallback || '—'); }
  function sekcieText() {
    var z = SEKCIE.filter(function (x) { return state.sekcie.indexOf(x.id) > -1; }).map(function (x) { return x.label; });
    return z.length ? z.join(', ') : '—';
  }
  function renderSumar() {
    var el = $('wzSumar');
    el.textContent = '';
    var dl = document.createElement('dl');
    [['Typ projektu', labelOf(TYPY, state.typ)],
     ['Názov', state.nazov.trim() || '—'],
     ['Vizuálny smer', labelOf(SMERY, state.styl)],
     ['Farebnosť', labelOf(PALETY, state.paleta)],
     ['Sekcie', sekcieText()],
     ['Texty / fotky', labelOf(ANO_NIE, state.texty) + ' / ' + labelOf(ANO_NIE, state.fotky)],
     ['Termín', labelOf(TERMINY, state.termin)]
    ].forEach(function (r) {
      var dt = document.createElement('dt'); dt.textContent = r[0];
      var dd = document.createElement('dd'); dd.textContent = r[1];
      dl.appendChild(dt); dl.appendChild(dd);
    });
    el.appendChild(dl);
  }
  function buildBrief(meno, kontakt, poznamka) {
    var p = najdi(PALETY, state.paleta);
    return [
      'NOVÝ DOPYT — wizard „Poskladajte si svoj web" (/testovanie)', '',
      'Typ projektu:  ' + labelOf(TYPY, state.typ),
      'Názov firmy:   ' + (state.nazov.trim() || '—'),
      'Vizuálny smer: ' + labelOf(SMERY, state.styl),
      'Farebnosť:     ' + labelOf(PALETY, state.paleta) + (p ? ' (pozadie ' + p.bg + ', akcent ' + p.accent + ')' : ''),
      'Sekcie:        ' + sekcieText(),
      'Texty:         ' + labelOf(ANO_NIE, state.texty),
      'Fotky:         ' + labelOf(ANO_NIE, state.fotky),
      'Termín:        ' + labelOf(TERMINY, state.termin), '',
      'Meno:     ' + meno,
      'Kontakt:  ' + kontakt,
      'Poznámka: ' + (poznamka || '—')
    ].join('\n');
  }

  /* ── Interakcie ── */
  function chipHandler(elId, kluc, multi, autoNext) {
    $(elId).addEventListener('click', function (e) {
      var b = e.target.closest('.wz-chip'); if (!b) return;
      var id = b.dataset.id;
      if (multi) {
        var idx = state.sekcie.indexOf(id);
        if (idx > -1) state.sekcie.splice(idx, 1); else state.sekcie.push(id);
      } else {
        state[kluc] = (state[kluc] === id && !autoNext) ? null : id;
      }
      renderKrok(false); renderPreview();
      if (autoNext && !multi) setTimeout(function () { chod(state.step + 1); }, 450);
    });
  }

  function init() {
    obnov();
    renderChips('wzTyp', TYPY); renderChips('wzStyl', SMERY, 'card'); renderChips('wzPaleta', PALETY, 'swatch');
    renderChips('wzSekcie', SEKCIE); renderChips('wzTexty', ANO_NIE); renderChips('wzFotky', ANO_NIE); renderChips('wzTermin', TERMINY);

    chipHandler('wzTyp', 'typ', false, false);
    chipHandler('wzStyl', 'styl', false, true);
    chipHandler('wzPaleta', 'paleta', false, true);
    chipHandler('wzSekcie', null, true, false);
    chipHandler('wzTexty', 'texty', false, false);
    chipHandler('wzFotky', 'fotky', false, false);
    chipHandler('wzTermin', 'termin', false, false);

    var naz = $('wzNazov');
    naz.value = state.nazov;
    naz.addEventListener('input', function () { state.nazov = naz.value; renderPreview(); uloz(); });

    document.querySelectorAll('.wz-next').forEach(function (b) { b.addEventListener('click', function () { chod(state.step + 1); }); });
    document.querySelectorAll('.wz-back').forEach(function (b) { b.addEventListener('click', function () { chod(state.step - 1); }); });

    $('wzForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target;
      if (f.botcheck.checked) return; // honeypot
      var meno = f.meno.value.trim(), kontakt = f.kontakt.value.trim();
      var status = $('wzStatus');
      if (!meno || !kontakt) { status.textContent = 'Doplňte prosím meno a kontakt — nech sa vám viem ozvať.'; return; }
      var brief = buildBrief(meno, kontakt, f.poznamka.value.trim());
      var btn = f.querySelector('button[type="submit"]');
      btn.disabled = true; btn.textContent = 'Odosielam…';
      var hotovo = function () {
        chod(6); // najprv krok (renderKrok ukladá stav), až potom zmazať rozpracovanosť
        try { localStorage.removeItem(LS_KEY); } catch (err) {}
        if (typeof gtag === 'function') { try { gtag('event', 'conversion_wizard_lead'); } catch (err) {} }
      };
      var zlyhanie = function () {
        btn.disabled = false; btn.textContent = 'Odoslať môj návrh';
        var mailto = 'mailto:petermraz@mrazosoft.sk?subject=' + encodeURIComponent('Návrh webu — wizard') + '&body=' + encodeURIComponent(brief);
        status.textContent = '';
        status.appendChild(document.createTextNode('Odoslanie nevyšlo — pošlite mi návrh '));
        var a = document.createElement('a'); a.href = mailto; a.textContent = 'jedným klikom e-mailom'; status.appendChild(a);
        status.appendChild(document.createTextNode(' alebo cez WhatsApp +421 948 459 082.'));
      };
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ access_key: W3F_KEY, subject: 'Wizard dopyt — ' + meno, from_name: 'MRAZOSOFT wizard', meno: meno, kontakt: kontakt, message: brief })
      }).then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.success) hotovo(); else zlyhanie(); })
        .catch(zlyhanie);
    });

    renderKrok(false); renderPreview();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
