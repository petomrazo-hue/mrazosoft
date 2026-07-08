/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   MRAZOSOFT — hero slnečná sústava (frozen cosmos)
   Three.js ES modul, nulová väzba na app.js.
   Fallbacky: reduced-motion / bez WebGL / context lost
   → trieda `solar-fallback` na <html> (statický CSS starfield).
   ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ */

import * as THREE from '../vendor/three.module.min.js';

(function () {
  'use strict';

  if (window.__UC__) return;
  var canvas = document.getElementById('solar');
  if (!canvas) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { fallback(); return; }

  var isMobile = window.innerWidth < 768 || window.matchMedia('(pointer: coarse)').matches;

  /* portrét (úzky viewport) = kompaktná stavba scény — užšie orbity, väčšie planéty,
     menšie slnko, aby bolo vidieť SÚSTAVU a nie len slnko */
  var compact = (window.innerWidth / window.innerHeight) < 0.8;

  var CFG = isMobile
    ? { stars: 600, dpr: 1.5, antialias: false, parallax: false, seg: 20 }
    : { stars: 2000, dpr: 2, antialias: true, parallax: true, seg: 40 };

  var COL = { star: 0xCFE6FF };

  /* ─── REALISTICKÁ FYZIKA — škálovacie konštanty (všetko sa odvodzuje odtiaľto) ───
     Reálne POMERY sú zachované, len časy sú zrýchlené a rozmery komprimované,
     inak by Neptún obehol raz za 165 rokov a Slnko by malo 109× priemer Zeme. */
  /* na mobile beží časozber rýchlejšie (1 rok = 10 s), aby planéty často prechádzali
     úzkym záberom — Keplerove POMERY periód ostávajú presné */
  var YEAR_S = compact ? 10 : 30;  // 1 pozemský rok obehov [s animácie]
  var DAY_S  = compact ? 4 : 8;    // 1 pozemský deň rotácie [s animácie]
  var PLANET_SCALE = compact ? 0.24 : 0.22;  // vizuálna veľkosť: r = k · √(polomer v polomeroch Zeme)
  var SUN_R = compact ? 0.85 : 1.5;          // Slnko NIE JE v mierke (reálne 109× Zem — nezmestilo by sa)
  var ORBIT_MIN = compact ? 1.6 : 3.3;       // log-kompresia vzdialeností 0.39–30 AU
  var ORBIT_SPAN = compact ? 5.4 : 13.4;

  function orbitOf(au) {           // logaritmická mapa AU → jednotky scény
    return ORBIT_MIN + ORBIT_SPAN * (Math.log10(au / 0.35) / Math.log10(30 / 0.35));
  }

  /* ─── INFO KARTY — reálne fakty (NASA), SK + EN ─── */
  var INFO = {
    sun: {
      sk: { name: 'Slnko', sub: 'hviezda typu G2V', rows: [['Priemer', '1 392 700 km (109× Zem)'], ['Rotácia', '25,4 dňa (na rovníku)'], ['Povrch', '~5 500 °C'], ['Zaujímavosť', 'Tvorí 99,86 % hmotnosti celej sústavy.']] },
      en: { name: 'Sun', sub: 'G2V star', rows: [['Diameter', '1,392,700 km (109× Earth)'], ['Rotation', '25.4 days (at equator)'], ['Surface', '~5,500 °C'], ['Fun fact', 'Holds 99.86 % of the system’s mass.']] }
    },
    mercury: {
      sk: { name: 'Merkúr', sub: 'najmenšia planéta', rows: [['Priemer', '4 879 km'], ['Vzdialenosť', '0,39 AU (58 mil. km)'], ['Rok', '88 dní'], ['Deň', '59 dní'], ['Zaujímavosť', 'Teploty od −173 °C do +427 °C.']] },
      en: { name: 'Mercury', sub: 'the smallest planet', rows: [['Diameter', '4,879 km'], ['Distance', '0.39 AU (58 M km)'], ['Year', '88 days'], ['Day', '59 days'], ['Fun fact', 'Temperatures swing from −173 °C to +427 °C.']] }
    },
    venus: {
      sk: { name: 'Venuša', sub: 'najhorúcejšia planéta', rows: [['Priemer', '12 104 km'], ['Vzdialenosť', '0,72 AU'], ['Rok', '225 dní'], ['Deň', '243 dní — dlhší než jej rok'], ['Zaujímavosť', 'Točí sa opačne (retrográdne), povrch má 464 °C.']] },
      en: { name: 'Venus', sub: 'the hottest planet', rows: [['Diameter', '12,104 km'], ['Distance', '0.72 AU'], ['Year', '225 days'], ['Day', '243 days — longer than its year'], ['Fun fact', 'Spins backwards (retrograde); surface hits 464 °C.']] }
    },
    earth: {
      sk: { name: 'Zem', sub: 'náš domov', rows: [['Priemer', '12 742 km'], ['Vzdialenosť', '1 AU (150 mil. km)'], ['Rok', '365,25 dňa'], ['Deň', '24 hodín'], ['Zaujímavosť', 'Jediné známe miesto so životom. 1 mesiac — Mesiac.']] },
      en: { name: 'Earth', sub: 'our home', rows: [['Diameter', '12,742 km'], ['Distance', '1 AU (150 M km)'], ['Year', '365.25 days'], ['Day', '24 hours'], ['Fun fact', 'The only known place with life. One moon — the Moon.']] }
    },
    mars: {
      sk: { name: 'Mars', sub: 'červená planéta', rows: [['Priemer', '6 779 km'], ['Vzdialenosť', '1,52 AU'], ['Rok', '687 dní'], ['Deň', '24,6 hodiny'], ['Zaujímavosť', 'Olympus Mons — najvyššia sopka sústavy (21 km).']] },
      en: { name: 'Mars', sub: 'the red planet', rows: [['Diameter', '6,779 km'], ['Distance', '1.52 AU'], ['Year', '687 days'], ['Day', '24.6 hours'], ['Fun fact', 'Olympus Mons — the tallest volcano in the system (21 km).']] }
    },
    jupiter: {
      sk: { name: 'Jupiter', sub: 'najväčšia planéta', rows: [['Priemer', '139 820 km (11× Zem)'], ['Vzdialenosť', '5,2 AU'], ['Rok', '11,9 roka'], ['Deň', '9,9 hodiny — najrýchlejšia rotácia'], ['Zaujímavosť', 'Veľká červená škvrna je búrka väčšia než Zem. 95 mesiacov.']] },
      en: { name: 'Jupiter', sub: 'the largest planet', rows: [['Diameter', '139,820 km (11× Earth)'], ['Distance', '5.2 AU'], ['Year', '11.9 years'], ['Day', '9.9 hours — fastest spin'], ['Fun fact', 'The Great Red Spot is a storm bigger than Earth. 95 moons.']] }
    },
    saturn: {
      sk: { name: 'Saturn', sub: 'pán prstencov', rows: [['Priemer', '116 460 km'], ['Vzdialenosť', '9,5 AU'], ['Rok', '29,5 roka'], ['Deň', '10,7 hodiny'], ['Zaujímavosť', 'Prstence z ľadu a prachu; hustota menšia než voda — plával by.']] },
      en: { name: 'Saturn', sub: 'lord of the rings', rows: [['Diameter', '116,460 km'], ['Distance', '9.5 AU'], ['Year', '29.5 years'], ['Day', '10.7 hours'], ['Fun fact', 'Rings of ice and dust; less dense than water — it would float.']] }
    },
    uranus: {
      sk: { name: 'Urán', sub: 'prevrátená planéta', rows: [['Priemer', '50 724 km'], ['Vzdialenosť', '19,2 AU'], ['Rok', '84 rokov'], ['Deň', '17,2 hodiny (retrográdne)'], ['Zaujímavosť', 'Os má sklon 98° — po dráhe sa doslova gúľa. −224 °C.']] },
      en: { name: 'Uranus', sub: 'the sideways planet', rows: [['Diameter', '50,724 km'], ['Distance', '19.2 AU'], ['Year', '84 years'], ['Day', '17.2 hours (retrograde)'], ['Fun fact', 'Tilted 98° — it literally rolls along its orbit. −224 °C.']] }
    },
    neptune: {
      sk: { name: 'Neptún', sub: 'najveternejšia planéta', rows: [['Priemer', '49 244 km'], ['Vzdialenosť', '30,1 AU'], ['Rok', '165 rokov'], ['Deň', '16,1 hodiny'], ['Zaujímavosť', 'Vetry až 2 100 km/h — najsilnejšie v sústave.']] },
      en: { name: 'Neptune', sub: 'the windiest planet', rows: [['Diameter', '49,244 km'], ['Distance', '30.1 AU'], ['Year', '165 years'], ['Day', '16.1 hours'], ['Fun fact', 'Winds up to 2,100 km/h — the strongest in the system.']] }
    }
  };
  function lang() {
    try { var l = localStorage.getItem('mrazosoft-lang'); return (l === 'en') ? 'en' : 'sk'; } catch (e) { return 'sk'; }
  }
  function orbitSpeed(periodYears) { return (Math.PI * 2) / (periodYears * YEAR_S); }   // rad/s
  function spinSpeed(days) { return (Math.PI * 2) / (days * DAY_S); }                   // rad/s (záporné dni = retrográdna rotácia)

  function fallback() {
    document.documentElement.classList.add('solar-fallback');
    canvas.style.display = 'none';
  }

  /* ── lazy init: až po load + idle, hero text (LCP) nečaká ── */
  function whenIdle(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2500 });
    else setTimeout(fn, 350);
  }
  if (document.readyState === 'complete') whenIdle(init);
  else window.addEventListener('load', function () { whenIdle(init); });

  function init() {
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas: canvas, alpha: true, antialias: CFG.antialias, powerPreference: 'high-performance'
      });
    } catch (e) { fallback(); return; }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, CFG.dpr));

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 200);

    /* ── svetlá: teplé slnko + jemný ambient na čitateľnosť nočných strán ── */
    scene.add(new THREE.AmbientLight(0x36405c, 1.6));
    var sunLight = new THREE.PointLight(0xFFE9C0, 300, 0, 1.75);
    scene.add(sunLight);

    /* ── SLNKO: realistická žltá hviezda (granulácia + oranžový okraj) ── */
    var sunUniforms = { uTime: { value: 0 } };
    var sun = new THREE.Mesh(
      new THREE.SphereGeometry(SUN_R, 48, 48),
      new THREE.ShaderMaterial({
        uniforms: sunUniforms,
        vertexShader: [
          'varying vec3 vN; varying vec3 vP; varying vec3 vOP;',
          'void main(){ vN = normalize(normalMatrix * normal); vOP = normalize(position);',
          '  vec4 mv = modelViewMatrix * vec4(position,1.0); vP = mv.xyz;',
          '  gl_Position = projectionMatrix * mv; }'
        ].join('\n'),
        fragmentShader: [
          /* granulácia v OBJEKTOVOM priestore (vOP) → rotácia mesh-u reálne otáča povrch */
          'uniform float uTime; varying vec3 vN; varying vec3 vP; varying vec3 vOP;',
          'float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }',
          'float noise(vec3 p){ vec3 i = floor(p); vec3 f = fract(p); f = f*f*(3.0-2.0*f);',
          '  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),',
          '             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }',
          'void main(){',
          '  vec3 eye = normalize(-vP);',
          '  float fres = pow(1.0 - abs(dot(vN, eye)), 1.6);',
          /* granulácia UKOTVENÁ na povrchu (len jemný časový shimmer) → rotáciu vidno */
          '  float n = noise(vOP * 5.0 + uTime * 0.015) * 0.6 + noise(vOP * 11.0 - uTime * 0.01) * 0.4;',
          '  vec3 core = mix(vec3(1.0, 0.99, 0.92), vec3(1.0, 0.78, 0.38), n * 0.9);',
          /* slnečné škvrny — statické tmavé fľaky v objektovom priestore (otáčajú sa s meshom) */
          '  float sp1 = smoothstep(0.66, 0.80, noise(vOP * 2.6 + vec3(7.31, 1.7, 3.9)));',
          '  float sp2 = smoothstep(0.70, 0.82, noise(vOP * 3.7 + vec3(2.2, 9.1, 5.4)));',
          '  core *= 1.0 - (sp1 * 0.5 + sp2 * 0.35);',
          '  vec3 rim  = vec3(1.0, 0.45, 0.10);',
          '  vec3 col = mix(core, rim, fres * 0.85);',
          '  gl_FragColor = vec4(col, 1.0); }'
        ].join('\n')
      })
    );
    /* skutočný sklon slnečnej osi ~7.25° voči ekliptike */
    sun.rotation.z = THREE.MathUtils.degToRad(7.25);
    scene.add(sun);
    /* reálna rotácia Slnka = 25.38 dňa → pri našom časozbere ~1 otáčka za 3+ min,
       čo oko nepostrehne — ×4 prezentačný násobok, nech je otáčanie viditeľné */
    var SUN_SPIN = spinSpeed(25.38) * 4;

    /* ── korona: aditívne billboard sprity z offscreen canvasu (fake bloom) ── */
    function glowTexture(inner, outer) {
      var c = document.createElement('canvas'); c.width = c.height = 256;
      var g = c.getContext('2d');
      var grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
      grd.addColorStop(0, inner); grd.addColorStop(0.35, outer); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
      var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    }
    function addGlow(size, tex, opacity) {
      var s = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: opacity
      }));
      s.scale.set(size, size, 1); sun.add(s); return s;
    }
    addGlow(7.5, glowTexture('rgba(255,240,200,0.85)', 'rgba(255,170,60,0.30)'), 0.9);
    addGlow(13, glowTexture('rgba(255,205,120,0.38)', 'rgba(255,120,40,0.10)'), 0.5);
    var pulse = addGlow(5.2, glowTexture('rgba(255,252,235,0.95)', 'rgba(255,190,90,0.32)'), 0.75);

    /* ── VŠETKÝCH 8 PLANÉT — reálne dáta (NASA): polomer [R⊕], vzdialenosť [AU],
       obežná doba [roky], rotácia [dni, − = retrográdna], osový sklon [°],
       sklon dráhy [°], farby podľa skutočného vzhľadu ── */
    var PLANET_DEFS = [
      { name: 'mercury', radiusE: 0.383, au: 0.39,  periodY: 0.241,  spinD: 58.6,   tilt: 0.03, incl: 7.0, col: 0x8C8680, rough: 0.95 },
      { name: 'venus',   radiusE: 0.949, au: 0.72,  periodY: 0.615,  spinD: -243,   tilt: 2.6,  incl: 3.4, col: 0xE6D3A8, rough: 0.7 },
      { name: 'earth',   radiusE: 1.0,   au: 1.0,   periodY: 1.0,    spinD: 1.0,    tilt: 23.4, incl: 0.0, col: 0x2E66B8, rough: 0.5, atmo: 0x6FB4FF, moon: true },
      { name: 'mars',    radiusE: 0.532, au: 1.52,  periodY: 1.881,  spinD: 1.026,  tilt: 25.2, incl: 1.9, col: 0xB4552D, rough: 0.9 },
      { name: 'jupiter', radiusE: 11.21, au: 5.20,  periodY: 11.862, spinD: 0.414,  tilt: 3.1,  incl: 1.3, col: 0xC7B29A, rough: 0.65,
        bands: ['#C7B29A','#A67F5C','#DDD0BC','#9C6E4C','#C9A97F','#B58A66'] },
      { name: 'saturn',  radiusE: 9.45,  au: 9.54,  periodY: 29.457, spinD: 0.444,  tilt: 26.7, incl: 2.5, col: 0xD9C293, rough: 0.65,
        ring: { col: 0xC2B280, inner: 1.24, outer: 2.27, opacity: 0.55 },
        bands: ['#E3D3AB','#CBB689','#EFE3C0','#BFA372','#D8C79B'] },
      { name: 'uranus',  radiusE: 4.01,  au: 19.19, periodY: 84.02,  spinD: -0.718, tilt: 97.8, incl: 0.8, col: 0x9FD6D9, rough: 0.55, atmo: 0xB8E4E6,
        ring: { col: 0x9FB9BC, inner: 1.6, outer: 2.0, opacity: 0.18 } },
      { name: 'neptune', radiusE: 3.88,  au: 30.07, periodY: 164.8,  spinD: 0.671,  tilt: 28.3, incl: 1.8, col: 0x3D5EF5, rough: 0.5, atmo: 0x5A7FF0 }
    ];

    /* procedurálna pásiková textúra pre plynné obry (žiadne image assety) */
    function bandTexture(colors) {
      var c = document.createElement('canvas'); c.width = 8; c.height = 128;
      var g = c.getContext('2d');
      var y = 0;
      while (y < 128) {
        var h = 6 + Math.random() * 18;
        g.fillStyle = colors[Math.floor(Math.random() * colors.length)];
        g.fillRect(0, y, 8, h);
        y += h;
      }
      var t = new THREE.CanvasTexture(c);
      t.colorSpace = THREE.SRGBColorSpace;
      return t;
    }

    function planetMaterial(def) {
      var opts = { color: def.col, transparent: true };
      if (def.bands) { opts.map = bandTexture(def.bands); opts.color = 0xFFFFFF; }
      if (isMobile) return new THREE.MeshLambertMaterial(opts);
      opts.roughness = def.rough; opts.metalness = 0.05;
      return new THREE.MeshStandardMaterial(opts);
    }

    var planets = [];
    PLANET_DEFS.forEach(function (def, i) {
      var orbit = orbitOf(def.au);
      var r = PLANET_SCALE * Math.sqrt(def.radiusE);   // kompresia veľkostí (√), inak Jupiter = 11× Zem zožerie scénu

      /* pivot = obežná dráha so skutočným sklonom dráhy voči ekliptike */
      var pivot = new THREE.Object3D();
      pivot.rotation.x = THREE.MathUtils.degToRad(def.incl);
      pivot.rotation.y = Math.random() * Math.PI * 2;  // náhodná štartová pozícia na dráhe
      scene.add(pivot);

      /* tiltGroup drží osový sklon planéty — mesh rotuje okolo vlastnej naklonenej osi */
      var tiltGroup = new THREE.Object3D();
      tiltGroup.position.x = orbit;
      tiltGroup.rotation.z = THREE.MathUtils.degToRad(def.tilt);
      pivot.add(tiltGroup);

      var mesh = new THREE.Mesh(new THREE.SphereGeometry(r, CFG.seg, CFG.seg), planetMaterial(def));
      tiltGroup.add(mesh);

      if (def.atmo && !isMobile) {
        var atmo = new THREE.Mesh(
          new THREE.SphereGeometry(r * 1.16, 32, 32),
          new THREE.ShaderMaterial({
            uniforms: { uCol: { value: new THREE.Color(def.atmo) } },
            vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }',
            fragmentShader: 'uniform vec3 uCol; varying vec3 vN; varying vec3 vP; void main(){ float f = pow(1.0 - abs(dot(vN, normalize(-vP))), 3.0); gl_FragColor = vec4(uCol, f * 0.5); }',
            transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false
          })
        );
        tiltGroup.add(atmo);
      }
      if (def.ring) {
        /* prstenec leží v rovine rovníka planéty → dedí osový sklon z tiltGroup
           (Saturn 26.7°, Urán 97.8° = prstence "nastojato" — presne ako v skutočnosti) */
        var ring = new THREE.Mesh(
          new THREE.RingGeometry(r * def.ring.inner, r * def.ring.outer, 96),
          new THREE.MeshBasicMaterial({ color: def.ring.col, transparent: true, opacity: def.ring.opacity, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2;
        tiltGroup.add(ring);
      }
      if (def.moon) {
        /* Mesiac: reálna perióda 27.3 dňa, vzdialenosť komprimovaná aby ostal v zábere */
        var moonPivot = new THREE.Object3D();
        var moon = new THREE.Mesh(
          new THREE.SphereGeometry(PLANET_SCALE * Math.sqrt(0.273), 16, 16),
          planetMaterial({ col: 0xBDB7AE, rough: 0.95 })
        );
        moon.position.x = r * 2.7;
        moonPivot.add(moon);
        tiltGroup.add(moonPivot);
        def._moonPivot = moonPivot;
        def._moonSpeed = orbitSpeed(27.32 / 365.25);
      }

      /* orbitálna čiara — robí „sústavu", nie šetrič */
      var pts = [];
      for (var a = 0; a <= 160; a++) {
        var t = (a / 160) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(t) * orbit, 0, Math.sin(t) * orbit));
      }
      var line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: COL.star, transparent: true, opacity: (i % 2 ? 0.09 : 0.13) + (compact ? 0.07 : 0) })
      );
      pivot.add(line);

      planets.push({
        pivot: pivot, mesh: mesh, def: def,
        speed: orbitSpeed(def.periodY),   // skutočná obežná doba (Kepler pomery zachované)
        spin: spinSpeed(def.spinD)        // skutočná rotácia (Venuša/Urán retrográdne = záporná)
      });
    });

    /* ── HVIEZDY: 2 vrstvy Points, protichodná rotácia, twinkle ── */
    function starLayer(count, radiusMin, radiusMax, size) {
      var pos = new Float32Array(count * 3), phase = new Float32Array(count);
      for (var i = 0; i < count; i++) {
        var R = radiusMin + Math.random() * (radiusMax - radiusMin);
        var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        pos[i * 3] = R * Math.sin(ph) * Math.cos(th);
        pos[i * 3 + 1] = R * Math.cos(ph);
        pos[i * 3 + 2] = R * Math.sin(ph) * Math.sin(th);
        phase[i] = Math.random() * Math.PI * 2;
      }
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      geo.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1));
      var mat = new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uSize: { value: size } },
        vertexShader: [
          'uniform float uTime; uniform float uSize; attribute float aPhase; varying float vTw;',
          'void main(){ vTw = 0.55 + 0.45 * sin(uTime * 1.4 + aPhase);',
          '  vec4 mv = modelViewMatrix * vec4(position,1.0);',
          '  gl_PointSize = uSize * (34.0 / -mv.z); gl_Position = projectionMatrix * mv; }'
        ].join('\n'),
        fragmentShader: [
          'varying float vTw;',
          'void main(){ float d = length(gl_PointCoord - 0.5); if (d > 0.5) discard;',
          '  float a = smoothstep(0.5, 0.0, d) * vTw;',
          '  gl_FragColor = vec4(0.81, 0.90, 1.0, a); }'
        ].join('\n'),
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending
      });
      var p = new THREE.Points(geo, mat);
      scene.add(p); return p;
    }
    var stars1 = starLayer(Math.floor(CFG.stars * 0.6), 30, 80, 2.6);
    var stars2 = starLayer(Math.floor(CFG.stars * 0.4), 40, 90, 1.7);

    /* ── KLIKATEĽNÉ TELESÁ: raycaster + info karta s reálnymi faktami ── */
    sun.userData.info = 'sun';
    planets.forEach(function (p) { p.mesh.userData.info = p.def.name; });
    var pickables = [sun].concat(planets.map(function (p) { return p.mesh; }));

    var raycaster = new THREE.Raycaster();
    var pointerV = new THREE.Vector2();
    canvas.style.pointerEvents = 'auto';   // CSS má pointer-events:none, klikanie zapíname až tu (fallback ho nemá)

    var panel = document.createElement('div');
    panel.className = 'solar-info';
    panel.hidden = true;
    canvas.parentElement.appendChild(panel);

    function pick(e) {
      var rect = canvas.getBoundingClientRect();
      pointerV.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      pointerV.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerV, camera);
      var hits = raycaster.intersectObjects(pickables, false);
      return hits.length ? hits[0].object : null;
    }

    canvas.addEventListener('click', function (e) {
      var obj = pick(e);
      if (!obj) { panel.hidden = true; return; }
      var d = INFO[obj.userData.info];
      if (!d) return;
      var loc = d[lang()];

      panel.textContent = '';
      var close = document.createElement('button');
      close.className = 'solar-info-close';
      close.type = 'button';
      close.setAttribute('aria-label', 'Zavrieť / Close');
      close.textContent = '×';
      close.addEventListener('click', function (ev) { ev.stopPropagation(); panel.hidden = true; });
      panel.appendChild(close);

      var name = document.createElement('strong');
      name.className = 'solar-info-name';
      name.textContent = loc.name;
      panel.appendChild(name);

      var sub = document.createElement('span');
      sub.className = 'solar-info-sub';
      sub.textContent = loc.sub;
      panel.appendChild(sub);

      var dl = document.createElement('dl');
      loc.rows.forEach(function (r) {
        var dt = document.createElement('dt'); dt.textContent = r[0];
        var dd = document.createElement('dd'); dd.textContent = r[1];
        dl.appendChild(dt); dl.appendChild(dd);
      });
      panel.appendChild(dl);
      panel.hidden = false;
    });

    if (CFG.parallax) {
      var hoverT = 0;
      canvas.addEventListener('pointermove', function (e) {
        var now = Date.now(); if (now - hoverT < 90) return; hoverT = now;
        canvas.style.cursor = pick(e) ? 'pointer' : 'default';
      }, { passive: true });
    }

    /* ── kamera: nad ekliptikou, pomalý auto-orbit + mouse parallax + scroll dolly ──
       ŠKÁLOVANIE: dist/elev/lookY sa priebežne odvodzujú z pomeru strán viewportu —
       úzky portrét = kamera bližšie a viac zhora (orbity ako elipsy cez výšku displeja),
       lookY pod stredom drží slnko v hornej tretine nad textom. */
    var camAngle = 0.6, camElev = 6, camDist = 21, lookY = -5.4;

    function lerp(a, b, t) { return a + (b - a) * t; }
    function frameByAspect() {
      var aspect = (canvas.clientWidth || window.innerWidth) / (canvas.clientHeight || window.innerHeight);
      var t = Math.min(Math.max((1.1 - aspect) / 0.65, 0), 1);   // 0 = široký desktop, 1 = úzky portrét
      if (compact) {
        camDist = lerp(18, 16.5, t);
        camElev = lerp(8, 11, t);
        lookY   = lerp(-4.4, -5.0, t);
      } else {
        camDist = lerp(21, 34, t);
        camElev = lerp(6, 10, t);
        lookY   = lerp(-5.4, -6.5, t);
      }
    }
    var mouseX = 0, mouseY = 0, curX = 0, curY = 0;
    var scrollP = 0;

    if (CFG.parallax) {
      window.addEventListener('pointermove', function (e) {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = (e.clientY / window.innerHeight) * 2 - 1;
      }, { passive: true });
    }
    function onScroll() {
      var h = canvas.clientHeight || window.innerHeight;
      scrollP = Math.min(Math.max(window.scrollY / h, 0), 1);
      canvas.style.opacity = String(1 - scrollP * 0.9);
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── resize / pauzy ── */
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      frameByAspect();
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 200); });

    var running = false, visible = true, raf = null;
    var clock = new THREE.Clock();
    var _tmpV = new THREE.Vector3();

    function loop() {
      raf = null;
      if (!running || !visible || document.hidden) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      var t = clock.elapsedTime;

      sunUniforms.uTime.value = t;
      sun.rotation.y += dt * SUN_SPIN;
      pulse.material.opacity = 0.6 + 0.15 * Math.sin(t * 1.1);

      planets.forEach(function (p) {
        p.pivot.rotation.y += dt * p.speed;   // obeh: reálne periódy (Merkúr 0.24 r → Neptún 165 r)
        p.mesh.rotation.y += dt * p.spin;     // rotácia: reálne dni (Jupiter 9.9 h, Venuša −243 d)
        if (p.def._moonPivot) p.def._moonPivot.rotation.y += dt * p.def._moonSpeed;
        /* planéta tesne pred kamerou by zaclonila text — do blízka sa stlmí na ducha
           (prahy relatívne ku vzdialenosti kamery → škáluje sa s každým viewportom) */
        var wp = p.mesh.getWorldPosition(_tmpV);
        var d = wp.distanceTo(camera.position);
        p.mesh.material.opacity = Math.min(Math.max((d - camDist * 0.40) / (camDist * 0.18), 0.12), 1);
      });

      stars1.material.uniforms.uTime.value = t;
      stars2.material.uniforms.uTime.value = t;
      stars1.rotation.y += dt * 0.004;
      stars2.rotation.y -= dt * 0.003;

      camAngle += dt * 0.03;
      curX += (mouseX - curX) * 0.05;
      curY += (mouseY - curY) * 0.05;
      var dist = camDist - scrollP * 4.5;
      camera.position.set(
        Math.sin(camAngle + curX * 0.18) * dist,
        camElev - curY * 1.6 - scrollP * 1.5,
        Math.cos(camAngle + curX * 0.18) * dist
      );
      camera.lookAt(0, lookY, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && running && visible && !document.hidden) { clock.getDelta(); raf = requestAnimationFrame(loop); } }

    var io = new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      kick();
    }, { threshold: 0.02 });
    io.observe(canvas);

    document.addEventListener('visibilitychange', kick);

    canvas.addEventListener('webglcontextlost', function (e) {
      e.preventDefault();
      running = false;
      try { renderer.dispose(); } catch (err) {}
      fallback();
    }, false);

    resize();
    onScroll();
    running = true;
    canvas.classList.add('is-live');   /* CSS fade-in canvasu */
    kick();
  }
})();
