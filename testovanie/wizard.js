/* ░░ WIZARD „Poskladajte si svoj web" v2 — zákazník skladá, náhľad vyzerá ako skutočný web ░░ */
(function () {
  'use strict';

  var W3F_KEY = 'a801edbc-d2f8-477b-8260-5a68f7246d7e'; // verejný klient-side kľúč (rovnaký ako kontaktný formulár)
  var LS_KEY = 'mzs_wizard_v2';
  var KROKOV = 7;

  /* ── Konfigurácia ── */
  var TYPY = [
    { id: 'web',    label: 'Webová stránka', ic: '🌐', cta: 'Nezáväzná ponuka' },
    { id: 'eshop',  label: 'E-shop',         ic: '🛒', cta: 'Do košíka' },
    { id: 'appka',  label: 'Aplikácia',      ic: '📱', cta: 'Vyskúšať appku' },
    { id: 'neviem', label: 'Neviem, poradíte mi', ic: '💬', cta: 'Kontaktujte nás' }
  ];
  var ODVETVIA = [
    { id: 'gastro',   label: 'Reštaurácia / kaviareň', ic: '🍽️', tag: 'Domáca kuchyňa, na ktorú sa ľudia vracajú', sub: 'Denné menu · Rezervácie · Rozvoz',
      cennik: [['Obedové menu', '7,90 €'], ['Degustačné menu', '39 €'], ['Rodinná pizza', '12,50 €']], galeria: 'Fotky jedál a interiéru' },
    { id: 'beauty',   label: 'Kaderníctvo / beauty', ic: '💇', tag: 'Doprajte si deň, keď žiarite', sub: 'Objednajte sa online za minútu',
      cennik: [['Dámsky strih', '28 €'], ['Farbenie + fúkaná', '55 €'], ['Pánsky strih', '17 €']], galeria: 'Premeny našich klientok' },
    { id: 'remeslo',  label: 'Remeslo / stavba', ic: '🔨', tag: 'Prídeme, zameriame, dodržíme termín', sub: 'Strechy · Rekonštrukcie · Obhliadka zdarma',
      cennik: [['Obhliadka a cenová ponuka', 'zdarma'], ['Montáž — bežný rozsah', 'od 350 €'], ['Havarijný výjazd', 'do 24 h']], galeria: 'Naše hotové realizácie' },
    { id: 'obchod',   label: 'Obchod / výroba', ic: '📦', tag: 'Kvalita, ktorú si zamilujete', sub: 'Doprava do 48 hodín · Osobný odber',
      cennik: [['Bestseller mesiaca', '24,90 €'], ['Darčekový set', '39 €'], ['Doprava nad 60 €', 'zdarma']], galeria: 'Naše produkty' },
    { id: 'sluzby',   label: 'Služby / poradenstvo', ic: '💼', tag: 'Vyriešime to za vás — spoľahlivo a načas', sub: 'Konzultácia zdarma · Jasné ceny',
      cennik: [['Úvodná konzultácia', 'zdarma'], ['Balík START', '190 €'], ['Mesačná starostlivosť', '90 €/mes']], galeria: 'Ako pracujeme' },
    { id: 'fitness',  label: 'Šport / fitness', ic: '💪', tag: 'Prvý tréning je na nás', sub: 'Skupinové lekcie · Osobný tréner',
      cennik: [['Jednorazový vstup', '6 €'], ['Mesačná permanentka', '39 €'], ['Osobný tréning', '25 €']], galeria: 'Z našich tréningov' },
    { id: 'zdravie',  label: 'Zdravie / ambulancia', ic: '🩺', tag: 'Starostlivosť, ktorej môžete dôverovať', sub: 'Objednanie online · Krátke čakacie doby',
      cennik: [['Vstupné vyšetrenie', '35 €'], ['Kontrola', '20 €'], ['Konzultácia online', '15 €']], galeria: 'Naša ambulancia' },
    { id: 'ine',      label: 'Niečo iné', ic: '✨', tag: 'Ponuka, ktorá zaujme na prvý pohľad', sub: 'Tu bude vaša ponuka jednou vetou',
      cennik: [['Základný balík', '99 €'], ['Rozšírený balík', '190 €'], ['Na mieru', 'dohodou']], galeria: 'Galéria' }
  ];
  var SMERY = [
    { id: 'ciste',   label: 'Čisté & dôveryhodné', pop: 'vzdušné, prehľadné, seriózne', font: "'Inter', sans-serif",               radius: '10px', weight: 600, upper: false },
    { id: 'odvazne', label: 'Odvážne & moderné',   pop: 'výrazné, technologické',       font: "'Space Grotesk', sans-serif",       radius: '2px',  weight: 700, upper: true },
    { id: 'teple',   label: 'Teplé & rodinné',     pop: 'mäkké, priateľské, oblé',      font: "'Inter', sans-serif",               radius: '22px', weight: 500, upper: false },
    { id: 'lux',     label: 'Luxusné & elegantné', pop: 'serif, decentné, prémiové',    font: "Georgia, 'Times New Roman', serif", radius: '0px',  weight: 400, upper: false }
  ];
  var PALETY = [
    { id: 'polnoc',   label: 'Polnočná',       bg: '#0F172A', surface: '#1E293B', accent: '#38BDF8', accent2: '#818CF8', text: '#F1F5F9', muted: '#94A3B8', light: false },
    { id: 'les',      label: 'Lesná',          bg: '#10201A', surface: '#1B332A', accent: '#34D399', accent2: '#A3E635', text: '#ECFDF5', muted: '#8FB3A5', light: false },
    { id: 'terakota', label: 'Terakota',       bg: '#FFF6EE', surface: '#FFFFFF', accent: '#C2551F', accent2: '#E8A87C', text: '#3B2416', muted: '#8C6F5D', light: true },
    { id: 'kremova',  label: 'Krémová',        bg: '#FAF7F0', surface: '#FFFFFF', accent: '#3F6B4F', accent2: '#C9A227', text: '#25301F', muted: '#7C8377', light: true },
    { id: 'noczlato', label: 'Čierna & zlatá', bg: '#0C0B0E', surface: '#191721', accent: '#D4AF37', accent2: '#F0D98C', text: '#F4EFE6', muted: '#9A927F', light: false },
    { id: 'ruzfial',  label: 'Ružovo-fialová', bg: '#190F22', surface: '#2A1B38', accent: '#E879B9', accent2: '#A78BFA', text: '#F6EEFA', muted: '#A791B8', light: false }
  ];
  var SEKCIE = [
    { id: 'cennik',     label: 'Cenník',                  menu: 'Cenník' },
    { id: 'galeria',    label: 'Galéria / fotky',         menu: 'Galéria' },
    { id: 'rezervacie', label: 'Rezervácie / objednávka', menu: 'Rezervácie' },
    { id: 'referencie', label: 'Referencie',              menu: 'Referencie' },
    { id: 'onas',       label: 'O nás',                   menu: 'O nás' },
    { id: 'blog',       label: 'Blog / novinky',          menu: 'Blog' },
    { id: 'kontakt',    label: 'Kontakt + mapa',          menu: 'Kontakt' }
  ];
  var ANO_NIE = [ { id: 'ano', label: 'Mám ✓' }, { id: 'nie', label: 'Nemám — pomôžete mi' } ];
  var TERMINY = [ { id: 'asap', label: 'Čo najskôr' }, { id: 'do2m', label: 'Do 1–2 mesiacov' }, { id: 'kludne', label: 'Neponáhľa to' } ];

  var state = { v: 2, step: 0, typ: null, odvetvie: null, styl: null, paleta: null, sekcie: [], texty: null, fotky: null, termin: null, nazov: '' };

  /* ── Pomôcky ── */
  function $(id) { return document.getElementById(id); }
  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function najdi(pole, id) { for (var i = 0; i < pole.length; i++) if (pole[i].id === id) return pole[i]; return null; }
  function uloz() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }
  function obnov() {
    try {
      var d = JSON.parse(localStorage.getItem(LS_KEY) || 'null');
      if (d && d.v === 2) { for (var k in state) if (k in d) state[k] = d[k]; if (state.step > KROKOV - 1) state.step = KROKOV - 1; }
    } catch (e) {}
  }
  function luminancia(hex) {
    var n = parseInt(hex.slice(1), 16);
    return (0.2126 * (n >> 16 & 255) + 0.7152 * (n >> 8 & 255) + 0.0722 * (n & 255)) / 255;
  }

  /* ── Render volieb ── */
  function renderChips(elId, pole, druh) {
    var box = $(elId);
    box.textContent = '';
    pole.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'wz-chip' + (druh === 'card' ? ' wz-card' : druh === 'swatch' ? ' wz-swatch' : druh === 'odv' ? ' wz-odv' : '');
      b.dataset.id = o.id;
      b.setAttribute('aria-pressed', 'false');
      if (druh === 'card') {
        var sam = el('span', 'wz-card-sample', 'Aa');
        sam.style.fontFamily = o.font; sam.style.fontWeight = o.weight;
        var tvary = el('span', 'wz-card-tvary'); tvary.style.setProperty('--r', o.radius);
        tvary.appendChild(el('i')); tvary.appendChild(el('i')); tvary.appendChild(el('i'));
        b.appendChild(sam); b.appendChild(el('b', null, o.label)); b.appendChild(el('span', 'pop', o.pop)); b.appendChild(tvary);
      } else if (druh === 'swatch') {
        var mini = el('span', 'wz-mini');
        mini.style.background = o.bg;
        var mh = el('i', 'wz-mini-h'); mh.style.background = 'linear-gradient(120deg,' + o.accent + ',' + o.accent2 + ')';
        var ml1 = el('i', 'wz-mini-l'); ml1.style.background = o.text; ml1.style.opacity = '0.85';
        var ml2 = el('i', 'wz-mini-l k'); ml2.style.background = o.muted;
        var mb = el('i', 'wz-mini-b'); mb.style.background = o.accent;
        mini.appendChild(mh); mini.appendChild(ml1); mini.appendChild(ml2); mini.appendChild(mb);
        b.appendChild(mini); b.appendChild(el('small', null, o.label));
      } else if (druh === 'odv') {
        b.appendChild(el('span', 'ic', o.ic));
        b.appendChild(el('span', null, o.label));
      } else {
        b.textContent = (o.ic ? o.ic + ' ' : '') + o.label;
      }
      box.appendChild(b);
    });
  }

  /* ── Náhľad — mini web ── */
  function sekciaBlok(id, odv, typ) {
    var w = el('div', 'wzp-sec wzp-' + id);
    if (id === 'cennik') {
      w.appendChild(el('b', 'wzp-sec-t', 'Cenník'));
      var row = el('div', 'wzp-cenrow');
      (odv.cennik).forEach(function (c) {
        var card = el('span', 'wzp-cencard');
        card.appendChild(el('i', 'wzp-cen-n', c[0]));
        card.appendChild(el('i', 'wzp-cen-p', c[1]));
        row.appendChild(card);
      });
      w.appendChild(row);
    } else if (id === 'galeria') {
      w.appendChild(el('b', 'wzp-sec-t', odv.galeria));
      var g = el('div', 'wzp-galrow');
      for (var i = 0; i < 4; i++) { var t = el('span', 'wzp-galtile t' + i); t.appendChild(el('i', 'wzp-galic', '🖼')); g.appendChild(t); }
      w.appendChild(g);
    } else if (id === 'rezervacie') {
      w.appendChild(el('b', 'wzp-sec-t', typ === 'eshop' ? 'Objednávka' : 'Rezervácia'));
      var r = el('div', 'wzp-rezrow');
      r.appendChild(el('span', 'wzp-rezpole', 'Vyberte termín…'));
      r.appendChild(el('span', 'wzp-rezbtn', typ === 'eshop' ? 'Objednať' : 'Rezervovať'));
      w.appendChild(r);
    } else if (id === 'referencie') {
      var q = el('div', 'wzp-ref');
      q.appendChild(el('i', 'wzp-stars', '★★★★★'));
      q.appendChild(el('span', 'wzp-refq', '„Presne toto sme potrebovali. Odporúčame každému."'));
      q.appendChild(el('i', 'wzp-refby', '— spokojný zákazník'));
      w.appendChild(q);
    } else if (id === 'onas') {
      var o = el('div', 'wzp-onas');
      o.appendChild(el('span', 'wzp-avatar', '👋'));
      var tx = el('span', 'wzp-onastx');
      tx.appendChild(el('b', null, 'O nás'));
      tx.appendChild(el('i')); tx.appendChild(el('i'));
      o.appendChild(tx);
      w.appendChild(o);
    } else if (id === 'blog') {
      w.appendChild(el('b', 'wzp-sec-t', 'Novinky'));
      var bl = el('div', 'wzp-blogrow');
      for (var j = 0; j < 2; j++) { var bc = el('span', 'wzp-blogcard'); bc.appendChild(el('b')); bc.appendChild(el('i')); bc.appendChild(el('i')); bl.appendChild(bc); }
      w.appendChild(bl);
    } else if (id === 'kontakt') {
      var k = el('div', 'wzp-kont');
      var map = el('span', 'wzp-mapa'); map.appendChild(el('i', 'wzp-pin', '📍'));
      var kd = el('span', 'wzp-kontx');
      kd.appendChild(el('b', null, 'Kontakt'));
      kd.appendChild(el('i', null, 'Hlavná 1, Poprad'));
      kd.appendChild(el('i', null, '+421 900 000 000'));
      k.appendChild(map); k.appendChild(kd);
      w.appendChild(k);
    }
    return w;
  }

  function renderPreview() {
    var prev = $('wzPreview');
    var p = najdi(PALETY, state.paleta) || PALETY[0];
    prev.style.setProperty('--p-bg', p.bg);
    prev.style.setProperty('--p-surface', p.surface);
    prev.style.setProperty('--p-accent', p.accent);
    prev.style.setProperty('--p-accent2', p.accent2);
    prev.style.setProperty('--p-text', p.text);
    prev.style.setProperty('--p-muted', p.muted);
    prev.style.setProperty('--p-oncolor', luminancia(p.accent) > 0.62 ? '#111319' : '#FFFFFF');
    prev.classList.toggle('is-light', !!p.light);
    prev.classList.toggle('ma-paletu', !!state.paleta);

    var s = najdi(SMERY, state.styl) || SMERY[0];
    prev.style.setProperty('--p-font', s.font);
    prev.style.setProperty('--p-radius', s.radius);
    prev.style.setProperty('--p-weight', s.weight);
    prev.classList.toggle('is-upper', !!s.upper);

    var odv = najdi(ODVETVIA, state.odvetvie) || ODVETVIA[ODVETVIA.length - 1];
    var nazov = state.nazov.trim() || 'Vaša firma';
    $('wzpLogo').textContent = nazov;
    $('wzpTitle').textContent = state.odvetvie ? odv.tag : 'Ponuka, ktorá zaujme na prvý pohľad';
    $('wzpSub').textContent = odv.sub;
    $('wzpUrl').textContent = state.nazov.trim()
      ? state.nazov.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '').slice(0, 22) + '.sk'
      : 'vasafirma.sk';

    var typ = najdi(TYPY, state.typ);
    $('wzpCta').textContent = typ ? typ.cta : 'Kontaktujte nás';
    $('wzpCta2').textContent = state.typ === 'eshop' ? 'Prezrieť ponuku' : 'Viac o nás';

    // menu
    var menu = $('wzpMenu');
    menu.textContent = '';
    menu.appendChild(el('span', null, 'Domov'));
    var zvolene = SEKCIE.filter(function (x) { return state.sekcie.indexOf(x.id) > -1; });
    zvolene.slice(0, 3).forEach(function (x) { menu.appendChild(el('span', null, x.menu)); });
    if (zvolene.length > 3) menu.appendChild(el('span', null, '⋯'));

    // telo
    var body = $('wzpBody');
    body.textContent = '';
    if (state.typ === 'eshop') {
      var prods = el('div', 'wzp-prods');
      odv.cennik.slice(0, 3).forEach(function (c) {
        var pd = el('span', 'wzp-prod');
        pd.appendChild(el('span', 'wzp-prodimg', '🛍'));
        pd.appendChild(el('i', 'wzp-prodn', c[0]));
        pd.appendChild(el('i', 'wzp-prodp', c[1]));
        prods.appendChild(pd);
      });
      body.appendChild(prods);
    }
    zvolene.forEach(function (x) { body.appendChild(sekciaBlok(x.id, odv, state.typ)); });

    var patka = $('wzpFoot');
    patka.textContent = '© ' + new Date().getFullYear() + ' ' + nazov;
  }

  /* ── Kroky ── */
  function renderKrok(focus) {
    document.querySelectorAll('.wz-step').forEach(function (sec) {
      sec.hidden = parseInt(sec.dataset.step, 10) !== state.step;
    });
    $('wzProgressText').textContent = state.step >= KROKOV ? 'Odoslané ✓' : 'Krok ' + (state.step + 1) + ' z ' + KROKOV;
    var dots = $('wzDots');
    dots.textContent = '';
    for (var i = 0; i < KROKOV; i++) { var sp = el('span'); if (i <= Math.min(state.step, KROKOV - 1)) sp.className = 'on'; dots.appendChild(sp); }
    oznac('wzTyp', [state.typ]); oznac('wzOdvetvie', [state.odvetvie]); oznac('wzStyl', [state.styl]); oznac('wzPaleta', [state.paleta]);
    oznac('wzSekcie', state.sekcie); oznac('wzTexty', [state.texty]); oznac('wzFotky', [state.fotky]); oznac('wzTermin', [state.termin]);
    if (state.step === 6) renderSumar();
    if (focus) { var h = $('wzH' + state.step); if (h) h.focus({ preventScroll: false }); }
    uloz();
  }
  function oznac(elId, ids) {
    var box = $(elId); if (!box) return;
    box.querySelectorAll('.wz-chip').forEach(function (b) {
      b.setAttribute('aria-pressed', ids.indexOf(b.dataset.id) > -1 ? 'true' : 'false');
    });
  }
  function chod(n, focus) { state.step = Math.max(0, Math.min(KROKOV, n)); renderKrok(focus !== false); }

  /* ── Súhrn + brief ── */
  function labelOf(pole, id) { var o = najdi(pole, id); return o ? o.label : '—'; }
  function sekcieText() {
    var z = SEKCIE.filter(function (x) { return state.sekcie.indexOf(x.id) > -1; }).map(function (x) { return x.label; });
    return z.length ? z.join(', ') : '—';
  }
  function renderSumar() {
    var elx = $('wzSumar');
    elx.textContent = '';
    var dl = document.createElement('dl');
    [['Typ projektu', labelOf(TYPY, state.typ)],
     ['Odvetvie', labelOf(ODVETVIA, state.odvetvie)],
     ['Názov', state.nazov.trim() || '—'],
     ['Vizuálny smer', labelOf(SMERY, state.styl)],
     ['Farebnosť', labelOf(PALETY, state.paleta)],
     ['Sekcie', sekcieText()],
     ['Texty / fotky', labelOf(ANO_NIE, state.texty) + ' / ' + labelOf(ANO_NIE, state.fotky)],
     ['Termín', labelOf(TERMINY, state.termin)]
    ].forEach(function (r) {
      dl.appendChild(el('dt', null, r[0]));
      dl.appendChild(el('dd', null, r[1]));
    });
    elx.appendChild(dl);
  }
  function buildBrief(meno, kontakt, poznamka) {
    var p = najdi(PALETY, state.paleta);
    return [
      'NOVÝ DOPYT — wizard „Poskladajte si svoj web" (/testovanie)', '',
      'Typ projektu:  ' + labelOf(TYPY, state.typ),
      'Odvetvie:      ' + labelOf(ODVETVIA, state.odvetvie),
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
  function pulzNahladu() {
    var f = document.querySelector('.wzp-frame');
    if (!f) return;
    f.classList.remove('pulz'); void f.offsetWidth; f.classList.add('pulz');
  }
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
      renderKrok(false); renderPreview(); pulzNahladu();
      if (autoNext && !multi) setTimeout(function () { chod(state.step + 1); }, 520);
    });
  }

  function init() {
    obnov();
    renderChips('wzTyp', TYPY); renderChips('wzOdvetvie', ODVETVIA, 'odv'); renderChips('wzStyl', SMERY, 'card'); renderChips('wzPaleta', PALETY, 'swatch');
    renderChips('wzSekcie', SEKCIE); renderChips('wzTexty', ANO_NIE); renderChips('wzFotky', ANO_NIE); renderChips('wzTermin', TERMINY);

    chipHandler('wzTyp', 'typ', false, true);
    chipHandler('wzOdvetvie', 'odvetvie', false, false);
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
        chod(KROKOV); // najprv krok (renderKrok ukladá stav), až potom zmazať rozpracovanosť
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
