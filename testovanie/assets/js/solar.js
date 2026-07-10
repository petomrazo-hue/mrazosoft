/* ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
   MRAZOSOFT — scroll-flight slnečná sústava
   Three.js ES modul, nulová väzba na app.js.
   Kamera lieta po dráhe (Catmull-Rom) synchronizovanej so scrollom celej
   stránky — canvas je position:fixed pozadie, obsahové sekcie plynú nad ním.
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

  /* ŽIVÉ layout prahy (prepočítavané pri resize/rotácii — const rozbíjal otočenie telefónu):
     compact  = portrétny framing kamery (planéta hore, karta dole)
     portraitLayout = karta pripnutá dole (zhodné s CSS breakpointom 979px)
     landscapePhone = nízky široký viewport — desktop dráha karty s užšou kartou (CSS) */
  var compact, portraitLayout;
  function computeLayoutFlags() {
    compact = (window.innerWidth / window.innerHeight) < 0.8;
    portraitLayout = window.matchMedia('(max-width: 979px)').matches
      && window.innerHeight >= window.innerWidth;
  }
  computeLayoutFlags();

  /* seg vyššie: pri NASA close-upoch bolo na siluete planéty vidieť polygóny */
  var CFG = isMobile
    ? { stars: 1700, dpr: 1.5, antialias: false, seg: 48 }
    : { stars: 5500, dpr: 2, antialias: true, seg: 96 };

  /* ─── REALISTICKÁ FYZIKA — škálovacie konštanty (všetko sa odvodzuje odtiaľto) ───
     Reálne POMERY sú zachované, len časy sú zrýchlené a rozmery komprimované,
     inak by Neptún obehol raz za 165 rokov a Slnko by malo 109× priemer Zeme. */
  /* rovnaké tempo aj na mobile — pri per-planet close-upoch rýchle obehy
     (Merkúr 2,4 s/obeh) nútili kameru naháňať teleso = trhaný záber */
  var YEAR_S = 30;  // 1 pozemský rok obehov [s animácie]
  var DAY_S  = 8;   // 1 pozemský deň rotácie [s animácie]
  var SHRINK = 0.50;                     // sústava zmenšená (0.7 × 0.8 × 0.9 — Petov feedback 9.7., trikrát)
  /* JEDNOTNÁ stavba scény pre desktop aj mobil — kompaktné (užšie) orbity boli
     pre starý celo-sústavový záber; pri per-planet close-upoch tlačili kameru
     vnútorných planét priamo do slnečnej koróny (prepálený biely záber).
     Mobil sa odlišuje už len framingom kamery (odstup ×1.8, planéta hore). */
  var PLANET_SCALE = 0.22 * SHRINK;      // vizuálna veľkosť: r = k · √(polomer v polomeroch Zeme)
  var SUN_R = 1.5 * SHRINK;              // Slnko NIE JE v mierke (reálne 109× Zem — nezmestilo by sa)
  var ORBIT_MIN = 3.3 * SHRINK;          // log-kompresia vzdialeností 0.39–30 AU
  var ORBIT_SPAN = 13.4 * SHRINK;

  function orbitOf(au) {           // logaritmická mapa AU → jednotky scény
    return ORBIT_MIN + ORBIT_SPAN * (Math.log10(au / 0.35) / Math.log10(30 / 0.35));
  }

  function orbitSpeed(periodYears) { return (Math.PI * 2) / (periodYears * YEAR_S); }   // rad/s
  function spinSpeed(days) { return (Math.PI * 2) / (days * DAY_S); }                   // rad/s (záporné dni = retrográdna rotácia)
  /* „vizuálna logika" namiesto tvrdého realizmu: PORADIE rýchlostí zostáva reálne,
     ale tempo je stlačené treťou odmocninou — Phobos/Io už nie sú mixér, Venuša sa
     stále vlečie. Referencia = Zem (1 deň / 27.3 dňa). */
  function spinVisual(days) {
    var base = (Math.PI * 2) / DAY_S;                       // rýchlosť rotácie Zeme
    return Math.sign(days) * base * Math.cbrt(1 / Math.abs(days));
  }
  function moonVisual(periodD) {
    var base = 0.32;                                        // rýchlosť nášho Mesiaca [rad/s]
    return Math.sign(periodD) * base * Math.cbrt(27.32 / Math.abs(periodD));
  }

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
    /* filmový tone mapping = bohatšie farby a mäkšie prechody */
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 3000);   // far 3000 kvôli pohľadu na Mliečnu dráhu

    /* ── svetlá: neutrálny jemný ambient (fotorealizmus — nech vynikajú reálne
       textúry planét, nie farebný "frozen cosmos" nádych) + teplé slnko ── */
    scene.add(new THREE.AmbientLight(0x45464e, 0.6));
    var sunLight = new THREE.PointLight(0xFFE9C0, 300, 0, 1.75);
    scene.add(sunLight);

    /* ── SLNKO: fotorealistická hviezda (5778K ≈ takmer biela, jemná granulácia,
       bez sýteho oranžového okraja — vo vesmíre bez atmosféry Slnko nie je žlté) ── */
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
          /* granulácia UKOTVENÁ na povrchu (len jemný časový shimmer) → rotáciu vidno; bez tmavých škvŕn */
          '  float n = noise(vOP * 5.0 + uTime * 0.015) * 0.6 + noise(vOP * 11.0 - uTime * 0.01) * 0.4;',
          '  vec3 core = mix(vec3(1.0, 0.96, 0.86), vec3(1.0, 0.90, 0.72), n * 0.45);',
          '  vec3 rim  = vec3(1.0, 0.85, 0.60);',
          '  vec3 col = mix(core, rim, fres * 0.30);',
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
    addGlow(7.5 * SHRINK, glowTexture('rgba(255,247,225,0.85)', 'rgba(255,214,150,0.22)'), 0.9);
    addGlow(13 * SHRINK, glowTexture('rgba(255,235,205,0.30)', 'rgba(255,200,140,0.06)'), 0.5);
    var pulse = addGlow(5.2 * SHRINK, glowTexture('rgba(255,251,240,0.9)', 'rgba(255,220,175,0.24)'), 0.75);

    /* ── VŠETKÝCH 8 PLANÉT — reálne dáta (NASA): polomer [R⊕], vzdialenosť [AU],
       obežná doba [roky], rotácia [dni, − = retrográdna], osový sklon [°],
       sklon dráhy [°], farby podľa skutočného vzhľadu ── */
    /* mesiace: dist v polomeroch planéty, size relatívne k planéte, period v dňoch (− = retrográdny) */
    var PLANET_DEFS = [
      { name: 'mercury', radiusE: 0.383, au: 0.39,  periodY: 0.241,  spinD: 58.6,   tilt: 0.03, incl: 7.0, col: 0x8C8680, rough: 0.95, texture: 'assets/textures/mercury.webp' },
      { name: 'venus',   radiusE: 0.949, au: 0.72,  periodY: 0.615,  spinD: -243,   tilt: 2.6,  incl: 3.4, col: 0xE6D3A8, rough: 0.7,  texture: 'assets/textures/venus.webp' },
      { name: 'earth',   radiusE: 1.0,   au: 1.0,   periodY: 1.0,    spinD: 1.0,    tilt: 23.4, incl: 0.0, col: 0x2E66B8, rough: 0.5, atmo: 0x6FB4FF, texture: 'assets/textures/earth.webp', clouds: 'assets/textures/earth-clouds.webp',
        moons: [ { dist: 2.7, size: 0.27, periodD: 27.32, col: 0xBDB7AE, texture: 'assets/textures/moon.webp' } ] },
      { name: 'mars',    radiusE: 0.532, au: 1.52,  periodY: 1.881,  spinD: 1.026,  tilt: 25.2, incl: 1.9, col: 0xB4552D, rough: 0.9,  texture: 'assets/textures/mars.webp',
        moons: [ { dist: 2.0, size: 0.10, periodD: 0.319, col: 0x8A7F76 }, { dist: 3.0, size: 0.08, periodD: 1.263, col: 0x9A8F85 } ] },   // Phobos, Deimos
      { name: 'jupiter', radiusE: 11.21, au: 5.20,  periodY: 11.862, spinD: 0.414,  tilt: 3.1,  incl: 1.3, col: 0xC7B29A, rough: 0.65, texture: 'assets/textures/jupiter.webp',
        moons: [ { dist: 1.8, size: 0.10, periodD: 1.77, col: 0xD8C46A }, { dist: 2.3, size: 0.09, periodD: 3.55, col: 0xC9BFA8 },
                 { dist: 2.9, size: 0.14, periodD: 7.15, col: 0x9E938A }, { dist: 3.6, size: 0.13, periodD: 16.69, col: 0x6E6258 } ] },    // Io, Europa, Ganymede, Callisto
      { name: 'saturn',  radiusE: 9.45,  au: 9.54,  periodY: 29.457, spinD: 0.444,  tilt: 26.7, incl: 2.5, col: 0xD9C293, rough: 0.65, texture: 'assets/textures/saturn.webp',
        ring: { texture: 'assets/textures/saturn-ring.webp', inner: 1.24, outer: 2.27, opacity: 0.9 },
        moons: [ { dist: 3.4, size: 0.14, periodD: 15.95, col: 0xC8955A } ] },                                                             // Titan
      { name: 'uranus',  radiusE: 4.01,  au: 19.19, periodY: 84.02,  spinD: -0.718, tilt: 97.8, incl: 0.8, col: 0x9FD6D9, rough: 0.55, atmo: 0xB8E4E6, texture: 'assets/textures/uranus.webp',
        ring: { col: 0x9FB9BC, inner: 1.6, outer: 2.0, opacity: 0.18 },
        moons: [ { dist: 2.6, size: 0.12, periodD: 8.71, col: 0xA8A29B } ] },                                                              // Titania
      { name: 'neptune', radiusE: 3.88,  au: 30.07, periodY: 164.8,  spinD: 0.671,  tilt: 28.3, incl: 1.8, col: 0x3D5EF5, rough: 0.5, atmo: 0x5A7FF0, texture: 'assets/textures/neptune.webp',
        moons: [ { dist: 2.4, size: 0.15, periodD: -5.88, col: 0xC7C3BC } ] }                                                              // Triton (retrográdny!)
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

    var texLoader = new THREE.TextureLoader();
    /* LAZY textúry: materiály štartujú len s reálnou farbou telesa, mapa povrchu
       sa načíta až keď sa let blíži k danej planéte (ensureTex) — init nesťahuje
       ~2 MB naraz. Po 12 s idle sa v pozadí dohrejú všetky. */
    function planetMaterial(def) {
      var opts = { color: def.col, transparent: true };
      if (def.bands) { opts.map = bandTexture(def.bands); opts.color = 0xFFFFFF; }
      if (isMobile) return new THREE.MeshLambertMaterial(opts);
      opts.roughness = def.rough; opts.metalness = 0.05;
      return new THREE.MeshStandardMaterial(opts);
    }
    function ensureTex(p) {
      if (!p || p._texDone) return;
      p._texDone = true;
      (p.lazyTex || []).forEach(function (it) {
        var tex = texLoader.load(it.path, function () { if (it.reveal) it.mesh.visible = true; });
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.anisotropy = 8;
        it.mesh.material.map = tex;
        it.mesh.material.color.set(0xFFFFFF);
        it.mesh.material.needsUpdate = true;
      });
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
      var lazyTex = [];
      if (def.texture) lazyTex.push({ mesh: mesh, path: def.texture });

      if (def.clouds) {
        /* Zem: samostatná pomaly rotujúca vrstva oblakov — skrytá, kým sa
           nenačíta textúra (additive materiál bez mapy by žiaril nabielo) */
        var clouds = new THREE.Mesh(
          new THREE.SphereGeometry(r * 1.02, CFG.seg, CFG.seg),
          new THREE.MeshLambertMaterial({ transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })
        );
        clouds.visible = false;
        tiltGroup.add(clouds);
        def._clouds = clouds;
        lazyTex.push({ mesh: clouds, path: def.clouds, reveal: true });
      }
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
        var ringGeo = new THREE.RingGeometry(r * def.ring.inner, r * def.ring.outer, 96);
        var ringOpts = { transparent: true, opacity: def.ring.opacity, side: THREE.DoubleSide, depthWrite: false };
        if (def.ring.texture) {
          /* radiálne UV: textúra prstenca je pás vnútro→vonkajšok */
          var pos = ringGeo.attributes.position, uv = ringGeo.attributes.uv;
          var inR = r * def.ring.inner, outR = r * def.ring.outer, v3 = new THREE.Vector3();
          for (var vi = 0; vi < pos.count; vi++) {
            v3.fromBufferAttribute(pos, vi);
            uv.setXY(vi, (v3.length() - inR) / (outR - inR), 0.5);
          }
          var ringTex = texLoader.load(def.ring.texture);
          ringTex.colorSpace = THREE.SRGBColorSpace;
          ringOpts.map = ringTex;
          ringOpts.color = 0xFFFFFF;
        } else {
          ringOpts.color = def.ring.col;
        }
        var ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial(ringOpts));
        ring.rotation.x = Math.PI / 2;
        tiltGroup.add(ring);
      }
      if (def.moons) {
        /* mesiace: reálne periódy (Io 1.77 d … Triton −5.88 d retrográdny), vzdialenosti komprimované */
        def._moons = def.moons.map(function (m, mi) {
          var mp = new THREE.Object3D();
          mp.rotation.y = (mi / def.moons.length) * Math.PI * 2;   // rozhodené po orbite
          var moonR = Math.max(r * m.size, 0.02);
          var moon = new THREE.Mesh(
            new THREE.SphereGeometry(moonR, 14, 14),
            planetMaterial({ col: m.col, rough: 0.95 })
          );
          if (m.texture) lazyTex.push({ mesh: moon, path: m.texture });
          moon.position.x = r * m.dist;
          mp.add(moon);
          tiltGroup.add(mp);
          return { pivot: mp, speed: moonVisual(m.periodD) };
        });
      }

      planets.push({
        pivot: pivot, mesh: mesh, tiltGroup: tiltGroup, def: def, r: r, orbit: orbit,
        lazyTex: lazyTex,
        speed: orbitSpeed(def.periodY),   // skutočná obežná doba (Kepler pomery zachované)
        spin: spinVisual(def.spinD)       // rotácia: reálne PORADIE, tempo stlačené (žiadny mixér)
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
          'void main(){ vTw = 0.78 + 0.22 * sin(uTime * 1.4 + aPhase);',
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
    /* bližšie polomery + väčšie body — hviezdy musia byť VIDITEĽNÉ aj pri
       close-upe planéty (predtým: čierna prázdnota, Petov feedback 9.7.) */
    var stars1 = starLayer(Math.floor(CFG.stars * 0.55), 18, 60, 4.6);
    var stars2 = starLayer(Math.floor(CFG.stars * 0.45), 30, 85, 3.0);

    /* ── MLIEČNA DRÁHA: priečková špirála s prachovými pásmi a hviezdokopami ──
       Viditeľná LEN na konci letu (posledná zastávka scrollu) — plynulý fade.
       Stred odsadený tak, aby Slnko (origin) sedelo ~2/3 od stredu v ramene — ako v skutočnosti. */
    var GALAXY_C = new THREE.Vector3(-260, -40, -160);
    var galaxyMats = [];
    function galaxyLayer(group, opts) {
      var geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(opts.pos, 3));
      if (opts.col) geo.setAttribute('color', new THREE.BufferAttribute(opts.col, 3));
      var mat = new THREE.PointsMaterial({
        size: opts.size, map: opts.map, transparent: true, opacity: 0,
        depthWrite: false, depthTest: false, sizeAttenuation: true,
        blending: opts.blending || THREE.AdditiveBlending
      });
      if (opts.col) mat.vertexColors = true; else mat.color = new THREE.Color(opts.color);
      galaxyMats.push({ mat: mat, base: opts.opacity });
      group.add(new THREE.Points(geo, mat));
    }
    var galaxy = (function () {
      var group = new THREE.Group();
      var R = 420;
      /* FOTOREALISTICKÁ Mliečna dráha: NASA/JPL-Caltech/ESO/R. Hurt render
         (public domain, credit v CREDITS.md) na ploche disku. Aditívne blendovanie
         = čierne pozadie obrázka zmizne a hviezdy za galaxiou presvitajú.
         Particle verzia pôsobila ako „bodkovaná kostra" — nahradená 9.7. */
      var mwTex = texLoader.load('assets/textures/milkyway.webp', function () { _mwReady = true; });
      mwTex.colorSpace = THREE.SRGBColorSpace;
      mwTex.anisotropy = 8;
      var diskMat = new THREE.MeshBasicMaterial({
        map: mwTex, transparent: true, opacity: 0,
        blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
      });
      galaxyMats.push({ mat: diskMat, base: 1 });
      var disk = new THREE.Mesh(new THREE.PlaneGeometry(R * 2.3, R * 2.3), diskMat);
      disk.rotation.x = -Math.PI / 2;
      group.add(disk);

      /* halo — riedke skutočné 3D hviezdy nad/pod diskom, nech má záber hĺbku */
      var softDot = (function () {
        var c = document.createElement('canvas'); c.width = c.height = 64;
        var g = c.getContext('2d');
        var grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
        grd.addColorStop(0, 'rgba(255,255,255,1)');
        grd.addColorStop(0.4, 'rgba(255,255,255,0.55)');
        grd.addColorStop(1, 'rgba(255,255,255,0)');
        g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
        var t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
      })();
      var rng = function (sp) { return Math.random() * sp - sp / 2; };
      var hN = isMobile ? 500 : 1400;
      var hPos = new Float32Array(hN * 3);
      for (var hh = 0; hh < hN; hh++) {
        var hr = Math.pow(Math.random(), 0.5) * R * 1.1;
        var th = Math.random() * Math.PI * 2, ph = Math.acos(2 * Math.random() - 1);
        hPos[hh * 3] = hr * Math.sin(ph) * Math.cos(th) + rng(6);
        hPos[hh * 3 + 1] = hr * Math.cos(ph) * 0.4;
        hPos[hh * 3 + 2] = hr * Math.sin(ph) * Math.sin(th) + rng(6);
      }
      galaxyLayer(group, { pos: hPos, size: 1.6, map: softDot, color: 0xD8DCE8, opacity: 0.4 });

      group.position.copy(GALAXY_C);
      group.rotation.set(-0.42, 0.2, 0.12);
      group.visible = false;                 /* skrytá kým sa k nej let nedostane */
      scene.add(group);
      return group;
    })();
    /* pulzujúca značka „tu sme" — vidno ju len z diaľky (posledná zastávka letu).
       Je DIEŤAŤOM galaxie: keď sa galaxia točí, iskra jazdí v ramene s ňou —
       statická iskra nad rotujúcimi ramenami pôsobila nelogicky (Peto 10.7.). */
    var hereMark = new THREE.Sprite(new THREE.SpriteMaterial({
      map: glowTexture('rgba(56,189,248,1)', 'rgba(56,189,248,0.25)'),
      blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, opacity: 0
    }));
    hereMark.scale.set(26, 26, 1);
    galaxy.updateMatrixWorld(true);
    hereMark.position.copy(galaxy.worldToLocal(new THREE.Vector3(0, 0, 0)));
    galaxy.add(hereMark);

    /* ─────────────────────────────────────────────────────────────────
       SCROLL-FLIGHT: kamera lieta po Catmull-Rom dráhe cez zastávky, jedna
       na každý obsahový "checkpoint" na stránke. Planéty reálne OBIEHAJÚ
       (Kepler rýchlosti), takže zastávky NIE SÚ pevné body v priestore —
       každý frame sa prepočítajú z AKTUÁLNEJ (živej) pozície danej planéty,
       s kamerou blízko na dramatickú, "NASA close-up" vzdialenosť
       (násobok polomeru TELESA, nie obežnej dráhy — inak je planéta len
       bodka v diagrame).
       ───────────────────────────────────────────────────────────────── */
    var planetByName = {};
    planets.forEach(function (p) { planetByName[p.def.name] = p; });

    /* hero = pohľad na MLIEČNU DRÁHU (banner „Váš biznis je stred vesmíru" sedí
       na galaxii); scroll potom kameru vnorí do sústavy k Merkúru — hyperskok */
    var heroCam = {
      pos: new THREE.Vector3(GALAXY_C.x + 240, GALAXY_C.y + 620, GALAXY_C.z + 420),
      look: new THREE.Vector3(GALAXY_C.x, GALAXY_C.y - 210, GALAXY_C.z)
    };
    var wpExit = {                                         // von zo sústavy → Mliečna dráha
      pos: new THREE.Vector3(GALAXY_C.x + 240, GALAXY_C.y + 620, GALAXY_C.z + 420),
      look: new THREE.Vector3(GALAXY_C.x, GALAXY_C.y - 210, GALAXY_C.z)
    };
    /* dynamické zastávky — Vector3 inštancie sa prepisujú in-place každý frame.
       Planéty ZA RADOM ako v sústave: Merkúr → Venuša → Zem → Mars → Jupiter →
       Saturn → Urán → Neptún — každá má vlastný close-up (NASA „Eyes" štýl). */
    var wpMe = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    var wpVe = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    var wpEa = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    var wpMa = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    var wpJu = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    var wpSa = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    var wpUr = { pos: new THREE.Vector3(), look: new THREE.Vector3() };
    var wpNe = { pos: new THREE.Vector3(), look: new THREE.Vector3() };

    /* MEDZIPRISTÁTIE: nadhľad na celú sústavu medzi galaxiou a prvou planétou
       (a symetricky pri odlete) — priamy skok galaxia→Merkúr v jednom segmente
       bol „úplne nahovno" (Peto 10.7.): kamera preletela pol vesmíru naslepo.
       Teraz let číta: galaxia → celá sústava so Slnkom → close-up Merkúru. */
    var wpOvIn = {
      pos: new THREE.Vector3(-15, 9.5, -10),
      look: new THREE.Vector3(0, 0, 0)
    };
    var wpOvOut = {
      pos: new THREE.Vector3(-13, 11, -12),
      look: new THREE.Vector3(0, 0, 0)
    };
    var WAYPOINTS = [heroCam, wpOvIn, wpMe, wpVe, wpEa, wpMa, wpJu, wpSa, wpUr, wpNe, wpOvOut, wpExit];
    /* mapovanie hraníc scroll-zastávok na uzly krivky: dlhé úseky (hero→Merkúr,
       Neptún→exit) prechádzajú CEZ prehľadový uzol */
    var NODE_OF_STOP = [0, 2, 3, 4, 5, 6, 7, 8, 9, 11];
    var curvePos = new THREE.CatmullRomCurve3(WAYPOINTS.map(function (w) { return w.pos; }));
    var curveLook = new THREE.CatmullRomCurve3(WAYPOINTS.map(function (w) { return w.look; }));

    var _wpA = new THREE.Vector3(), _wpDir = new THREE.Vector3(), _wpRight = new THREE.Vector3();
    var _wpUp = new THREE.Vector3(0, 1, 0);
    /* jedna planéta: kamera vo vzdialenosti ~distK× jej polomeru, mierne zhora-zboku.
       Cieľ pohľadu je posunutý mierne od telesa tak, aby planéta vychádzala v zábere
       DOPRAVA — obsahová sklenená karta je layoutom pri ĽAVOM okraji, planéta má
       voľnú pravú polovicu obrazovky (na úzkych viewportoch menší posun). */
    function sideK() { return compact ? 1.1 : 1.7; }   // 2.4 tlačilo planétu do pravého rohu — kompozícia karta|planéta má sedieť okolo stredu
    /* kamera NIE za planétou (tam svieti Slnko do objektívu a planéta je silueta),
       ale zo SLNEČNEJ strany pod uhlom ~140° od radiály — planéta je osvetlená
       s mäkkým terminátorom a Slnko ostáva mimo záberu (NASA „Eyes" look) */
    var PHASE = THREE.MathUtils.degToRad(140);
    var _cosP = Math.cos(PHASE), _sinP = Math.sin(PHASE);
    function trackSingle(target, name, distK) {
      var p = planetByName[name];
      p.mesh.getWorldPosition(_wpA);
      _wpDir.copy(_wpA).normalize();
      /* rotácia radiálneho smeru okolo Y o PHASE → kamera na slnečnej strane */
      var ox = _wpDir.x * _cosP + _wpDir.z * _sinP;
      var oz = -_wpDir.x * _sinP + _wpDir.z * _cosP;
      /* kompakt (portrét): horizontálne FOV je len ~17° — bez väčšieho odstupu
         planéta vyplní celú šírku; 1.8× = teleso ~55 % šírky, pekne v hornej časti */
      var d = p.r * distK * (compact ? 2.1 : 1);
      target.pos.set(_wpA.x + ox * d, _wpA.y + d * 0.35, _wpA.z + oz * d);
      if (compact) {
        /* mobil: karta je dole cez celú šírku → planéta do HORNEJ ~40 % výšky
           (cieľ pohľadu POD teleso; 1.55 r namiesto 1.0 r — pri 1.0 sa spodok
           telesa strácal za kartou pripnutou od ~42 % výšky) */
        target.look.copy(_wpA).addScaledVector(_wpUp, -p.r * 1.55);
      } else {
        /* cieľ pohľadu posunutý od telesa tak, aby planéta vychádzala v zábere
           VPRAVO (karta je vľavo) — znamienko overené empiricky cez __solarDbg
           (planetXY 19 %→zlé / ~72 %→dobré), cross-product intuícia tu klame */
        _wpRight.set(ox, 0, oz).cross(_wpUp).normalize();
        target.look.copy(_wpA).addScaledVector(_wpRight, p.r * sideK());
      }
    }
    function updateWaypoints() {
      trackSingle(wpMe, 'mercury', 7);
      trackSingle(wpVe, 'venus', 6.5);
      trackSingle(wpEa, 'earth', 6);
      trackSingle(wpMa, 'mars', 6.5);
      trackSingle(wpJu, 'jupiter', 5);
      trackSingle(wpSa, 'saturn', 8);     // prstence (2.27 r) sa musia zmestiť do záberu
      trackSingle(wpUr, 'uranus', 6.5);
      trackSingle(wpNe, 'neptune', 6);
    }

    /* zastávky = reálne DOM sekcie na stránke (id="stop-...") — ich offsetTop voči
       celkovej výške dokumentu určuje PRESNE kedy má kamera dorazovať na danú planétu,
       bez ohľadu na dĺžku textu/viewport (nie hardcoded percentá scrollu) */
    var STOP_IDS = ['stop-mercury', 'stop-venus', 'stop-earth', 'stop-mars', 'stop-jupiter', 'stop-saturn', 'stop-uranus', 'stop-neptune', 'stop-exit'];
    var stopT = [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 1];   // núdzový fallback, prepočíta computeStops()

    function computeStops() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      var t = [0];
      STOP_IDS.forEach(function (id) {
        var el = document.getElementById(id);
        t.push(el ? el.offsetTop / max : t[t.length - 1] + 0.001);
      });
      for (var i = 1; i < t.length; i++) {
        if (t[i] <= t[i - 1]) t[i] = t[i - 1] + 0.001;   // zaisti rastúcu postupnosť
      }
      t[t.length - 1] = 1;
      stopT = t.map(function (v) { return Math.min(Math.max(v, 0), 1); });
    }

    /* rozklad scroll progressu na segment k + lokálnu frakciu f (0..1) */
    function segInfo(p) {
      var n = stopT.length - 1;
      var k = 0;
      while (k < n - 1 && p > stopT[k + 1]) k++;
      var span = stopT[k + 1] - stopT[k];
      var f = span > 0 ? (p - stopT[k]) / span : 0;
      return { k: k, f: Math.min(Math.max(f, 0), 1) };
    }
    /* PLATÓ pri každej zastávke: prvých/posledných 30 % segmentu kamera PARKUJE
       presne na waypointe (planéta pekne centrovaná v kompozícii), prelet je len
       v strednej časti — voľný scroll už neukazuje planéty odseknuté na kraji */
    function curveParam(p) {
      var s = segInfo(p);
      var n = WAYPOINTS.length - 1;
      var g = Math.min(Math.max((s.f - 0.3) / 0.4, 0), 1);
      g = g * g * g * (g * (g * 6 - 15) + 10);   // smootherstep — nulové zrýchlenie na krajoch, mäkší rozjazd aj dojazd
      var a = NODE_OF_STOP[s.k], b = NODE_OF_STOP[s.k + 1];
      return (a + g * (b - a)) / n;
    }

    /* ── KARTY UKOTVENÉ NA PLANÉTE: obsahová karta aktívnej zastávky sa každý
       frame premieta k svojej planéte (projekcia world→screen) a pláva s ňou —
       ako menovky teles v NASA „Eyes". Na mobile/kompaktne ostáva bežný layout. ── */
    var STOP_PLANET = {
      'stop-mercury': 'mercury', 'stop-venus': 'venus', 'stop-earth': 'earth',
      'stop-mars': 'mars', 'stop-jupiter': 'jupiter', 'stop-saturn': 'saturn',
      'stop-uranus': 'uranus', 'stop-neptune': 'neptune'
    };
    /* klik na planétu = otvorenie jej menu stránky (overlay link polohovaný na teleso) */
    var STOP_PAGE = {
      'stop-mercury': ['sluzby.html', 'Merkúr — otvoriť Služby'],
      'stop-venus': ['projekty.html', 'Venuša — otvoriť Projekty'],
      'stop-earth': ['o-mne.html', 'Zem — otvoriť O mne'],
      'stop-mars': ['blog.html', 'Mars — otvoriť Blog'],
      'stop-neptune': ['kontakt.html', 'Neptún — otvoriť Kontakt']
    };
    var planetLink = document.getElementById('planetLink');
    var stopCards = STOP_IDS.map(function (id) {
      var el = document.getElementById(id);
      var planet = STOP_PLANET[id] || null;
      if (el && planet) el.classList.add('planet-stop');
      return { card: el ? el.querySelector('.container') : null, planet: planet };
    });
    var anchorOn = true;   // aj mobil — karta fixed pri spodku (sticky rozbíja overflow-x:hidden)
    document.documentElement.classList.add('cosmos-anchored');
    var _scr = new THREE.Vector3();
    var _linkShown = false;
    function anchorCards() {
      if (!anchorOn) return;
      _linkShown = false;
      /* aktívny waypoint + váha zosúladená s kamerovým plató: v parkovacej zóne
         w=1 (karta plná), fade len počas preletu v strede segmentu */
      var s = segInfo(scrollP);
      var best, w;
      if (s.f < 0.5) {
        best = s.k;
        w = 1 - Math.min(Math.max((s.f - 0.3) / 0.2, 0), 1);
      } else {
        best = s.k + 1;
        w = Math.min(Math.max((s.f - 0.5) / 0.2, 0), 1);
      }
      window.__solarDbg = { scrollP: scrollP.toFixed(4), best: best, w: w.toFixed(3), f: s.f.toFixed(2), stopT: stopT.map(function (v) { return +v.toFixed(3); }) };
      /* debug: kde na obrazovke je Slnko a aktívna planéta (percentá viewportu) */
      var dbgP = stopCards[best - 1] && stopCards[best - 1].planet;
      if (dbgP) {
        var _d = new THREE.Vector3();
        planetByName[dbgP].mesh.getWorldPosition(_d);
        _d.project(camera);
        window.__solarDbg.planetXY = [(_d.x * 50 + 50).toFixed(0), (-_d.y * 50 + 50).toFixed(0)];
        _d.set(0, 0, 0).project(camera);
        window.__solarDbg.sunXY = [(_d.x * 50 + 50).toFixed(0), (-_d.y * 50 + 50).toFixed(0), _d.z.toFixed(2)];
      }
      for (var s = 0; s < stopCards.length; s++) {
        var sc = stopCards[s];
        if (!sc.card || !sc.planet) continue;
        if (best - 1 !== s) {   // waypoint index s+1 patrí zastávke s
          sc.card.classList.remove('is-anchored');
          sc.card.style.opacity = '';
          sc.card.style.transform = '';
          continue;
        }
        var p = planetByName[sc.planet];
        /* lazy textúry: aktívna planéta + susedné zastávky (prefetch pred doletom) */
        ensureTex(p);
        if (stopCards[best] && stopCards[best].planet) ensureTex(planetByName[stopCards[best].planet]);
        if (best > 1 && stopCards[best - 2] && stopCards[best - 2].planet) ensureTex(planetByName[stopCards[best - 2].planet]);
        p.mesh.getWorldPosition(_scr);
        var dist = _scr.distanceTo(camera.position);
        _scr.project(camera);
        var vw = canvas.clientWidth, vh = canvas.clientHeight;
        var px = (_scr.x * 0.5 + 0.5) * vw;
        var py = (-_scr.y * 0.5 + 0.5) * vh;
        var rPx = (p.r / Math.max(dist, 0.001)) * (vh / 2) / Math.tan(camera.fov * Math.PI / 360);
        if (!sc.card.classList.contains('is-anchored')) {
          sc.card.classList.add('is-anchored');
          sc.card.scrollTop = 0;   // karta vždy začína od vrchu (scroll restoration)
        }
        var cw = sc.card.offsetWidth || 520, ch = sc.card.offsetHeight || 420;
        var left, top;
        if (portraitLayout) {
          /* mobil portrét: karta v strede dole (nad FAB zónou), planéta nad ňou */
          left = (vw - cw) / 2;
          top = vh - ch - 10;
        } else {
          /* desktop + landscape telefón: karta medzi ľavým okrajom a planétou */
          left = Math.max(vw * 0.04, Math.min(px - rPx - 64 - cw, vw - cw - 20));
          top = Math.max(64, Math.min(py - ch * 0.5, vh - ch - 16));
        }
        /* karta PRILIETA (slide + mäkší fade), nie „pukne" — offset mizne s váhou */
        top += (1 - w) * 26;
        sc.card.style.transform = 'translate(' + left.toFixed(1) + 'px,' + top.toFixed(1) + 'px)';
        sc.card.style.opacity = Math.pow(w, 1.6).toFixed(3);
        /* indikátor „karta má ďalší obsah" — gradient + šípka cez CSS */
        var more = sc.card.scrollHeight - sc.card.scrollTop - sc.card.clientHeight > 6;
        sc.card.classList.toggle('has-more', more);
        /* scrollovateľná karta si drží dotyk pre seba (overscroll contain cez CSS)
           — swipe v boxe skroluje box (formulár!), swipe nad ním letí sústavou */
        sc.card.classList.toggle('is-scrollable', sc.card.scrollHeight > sc.card.clientHeight + 4);

        /* overlay link na planéte — klik otvorí stránku danej menu položky */
        if (planetLink) {
          var stopId = STOP_IDS[s];
          var page = STOP_PAGE[stopId];
          if (page && w > 0.5) {
            var lr = Math.max(rPx, 30);
            var lx = px - lr, ly = py - lr, lw = lr * 2, lh = lr * 2;
            /* karta pripnutá dole nesmie mať link overlay nad sebou (falošné tapy):
               orež výšku linku po horný okraj karty */
            if (portraitLayout) {
              var cardTop = vh - ch - 10;
              lh = Math.min(lh, cardTop - ly - 6);
            }
            if (lh >= 44) {
              planetLink.href = page[0];
              planetLink.setAttribute('aria-label', page[1]);
              planetLink.title = page[1];
              planetLink.style.width = lw.toFixed(0) + 'px';
              planetLink.style.height = lh.toFixed(0) + 'px';
              planetLink.style.transform = 'translate(' + lx.toFixed(1) + 'px,' + ly.toFixed(1) + 'px)';
              planetLink.hidden = false;
              _linkShown = true;
            }
          }
        }
      }
      if (planetLink && !_linkShown) planetLink.hidden = true;
    }

    /* ── resize / pauzy ── */
    function resize() {
      var w = canvas.clientWidth, h = canvas.clientHeight;
      if (!w || !h) return;
      computeLayoutFlags();   // rotácia telefónu / zmena okna → prepni framing aj dráhu karty
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      computeStops();
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 200); });

    var scrollRaw = 0, scrollP = 0;
    function onScroll() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      scrollRaw = max > 0 ? Math.min(Math.max(window.scrollY / max, 0), 1) : 0;
    }
    window.addEventListener('scroll', onScroll, { passive: true });

    function galaxyTargetFor(p) {
      /* okná fade posunuté tak, aby medzi hero a Merkúrom (a pred exitom)
         nebola náhla čierna diera — galaxia drží dlhšie a nabieha skôr */
      return Math.max(
        THREE.MathUtils.smoothstep(p, 0.86, 0.97),
        1 - THREE.MathUtils.smoothstep(p, 0.06, 0.20)
      );
    }
    var galaxyFade = 0, _frameNo = 0, _liveShown = false, _mwReady = false;
    var _prevCam = new THREE.Vector3(), _speedS = 0, _liveAt = 0;
    var running = false, visible = true, raf = null;
    /* vlastný časovač namiesto THREE.Clock (deprecated warning v konzole) */
    var _lastNow = 0, _elapsedT = 0;
    var _desPos = new THREE.Vector3(), _lookCur = new THREE.Vector3(0, -3, 0), _desLook = new THREE.Vector3();

    function loop() {
      raf = null;
      if (!running || !visible || document.hidden) return;
      var _now = performance.now() / 1000;
      var dt = Math.min(_now - (_lastNow || _now), 0.05);
      _lastNow = _now;
      _elapsedT += dt;
      var t = _elapsedT;

      sunUniforms.uTime.value = t;
      sun.rotation.y += dt * SUN_SPIN;
      pulse.material.opacity = 0.6 + 0.15 * Math.sin(t * 1.1);

      planets.forEach(function (p) {
        p.pivot.rotation.y += dt * p.speed;   // obeh: reálne periódy (Merkúr 0.24 r → Neptún 165 r)
        p.mesh.rotation.y += dt * p.spin;     // rotácia: reálne dni (Jupiter 9.9 h, Venuša −243 d)
        if (p.def._clouds) p.def._clouds.rotation.y += dt * p.spin * 0.85;   // oblaky driftujú voči povrchu
        if (p.def._moons) p.def._moons.forEach(function (m) { m.pivot.rotation.y += dt * m.speed; });
      });

      stars1.material.uniforms.uTime.value = t;
      stars2.material.uniforms.uTime.value = t;
      stars1.rotation.y += dt * 0.004;
      stars2.rotation.y -= dt * 0.003;

      /* vyhladený scroll progress → parameter krivky → pozícia/cieľ kamery
         (zastávky sledujú AKTUÁLNU obiehajúcu pozíciu planét, preto sa
         prepočítavajú tu, po aktualizácii ich rotácie vyššie) */
      /* offsety sekcií sa hýbu s načítaním fontov/obrázkov — priebežne prepočítavať,
         inak kamera dorazí k inej planéte než hovorí karta (drift stopT) */
      if ((_frameNo++ & 63) === 0) computeStops();
      updateWaypoints();
      scrollP += (scrollRaw - scrollP) * 0.085;   // jemnejší dojazd kamery (0.10 pôsobilo surovo)
      /* adaptácia expozície ako ľudské oko: pri vnútorných planétach (blízko
         Slnka) stiahnuť, pri vonkajších naplno — inak je Venuša prepálená */
      var camR = camera.position.length();
      var expoT = THREE.MathUtils.clamp(THREE.MathUtils.mapLinear(camR, 1.2, 6.0, 0.34, 1.15), 0.34, 1.15);
      expoT *= 1 - 0.4 * _speedS;   // hyperjump dip (viď _speedS nižšie v slučke)
      renderer.toneMappingExposure += (expoT - renderer.toneMappingExposure) * 0.05;
      var u = curveParam(scrollP);
      curvePos.getPoint(u, _desPos);
      curveLook.getPoint(u, _desLook);
      /* kamera sedí na krivke PRIAMO — hladkosť dodáva scrollP lerp + plató easing.
         Pozičný lerp tu robil trvalý sklz za obiehajúcou planétou (Merkúr 7 s/obeh)
         → planéta nikdy nesedela v kompozícii */
      camera.position.copy(_desPos);
      /* hero „dýcha": po dofáde intra jemný kamerový drift (statický záber na
         rotujúcej galaxii pôsobil mŕtvo); nabieha až po crossfade zo statiky */
      if (_liveShown && scrollP < 0.05) {
        if (!_liveAt) _liveAt = t;
        var dk = Math.min(Math.max((t - _liveAt - 2.5) / 4, 0), 1)
               * Math.min(Math.max(1 - scrollP / 0.04, 0), 1);
        camera.position.x += Math.sin(t * 0.42) * 7 * dk;
        camera.position.y += Math.sin(t * 0.27 + 1.3) * 4.5 * dk;
      }
      _lookCur.copy(_desLook);
      camera.lookAt(_lookCur);
      /* filmový expozičný dip pri rýchlom prelete (hyperjump medzi zastávkami):
         čím rýchlejšia kamera, tým tmavšia expozícia — prechody nie sú „surové" */
      var camStep = _prevCam.distanceTo(camera.position) / Math.max(dt, 0.001);
      _prevCam.copy(camera.position);
      _speedS += (Math.min(camStep / 900, 1) - _speedS) * 0.08;
      anchorCards();

      /* Mliečna dráha: viditeľná na ZAČIATKU (hero banner) aj na samom konci letu */
      galaxyFade += (galaxyTargetFor(scrollP) - galaxyFade) * 0.05;
      galaxy.visible = galaxyFade > 0.015;
      if (galaxy.visible) {
        for (var gi = 0; gi < galaxyMats.length; gi++) {
          galaxyMats[gi].mat.opacity = galaxyMats[gi].base * galaxyFade;
        }
        /* pomalá VIDITEĽNÁ rotácia galaxie (~1 otáčka / 5 min) — galaxia sa
           reálne točí a statický disk pôsobil ako obrázok (Petov feedback 10.7.) */
        galaxy.rotation.y += dt * 0.021;
      }
      hereMark.material.opacity += ((galaxyFade * 0.85) - hereMark.material.opacity) * 0.04;

      renderer.render(scene, camera);
      /* is-live (CSS crossfade zo statického hero podkladu) až PO PRVOM reálne
         vyrenderovanom frame — predtým sa pridával pred render() a statická
         galaxia sa fádovala do prázdneho canvasu = „preblikávanie dvoch galaxií" */
      /* pri hero (galaxia v zábere) čakaj aj na jej textúru — inak by crossfade
         odhalil scénu bez galaxie a „druhý obrázok" by tam chvíľu nebol */
      if (!_liveShown && (_mwReady || galaxyFade < 0.5)) {
        _liveShown = true;
        canvas.classList.add('is-live');
      }
      raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && running && visible && !document.hidden) { _lastNow = performance.now() / 1000; raf = requestAnimationFrame(loop); } }

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
    /* prvý frame už s galaxiou v plnej sile (žiadny lerp z nuly) — kľúč k
       bezšvovému prechodu zo statického hero podkladu na živý render */
    scrollP = scrollRaw;
    galaxyFade = galaxyTargetFor(scrollP);
    /* layout sa môže ešte doladiť po načítaní obrázkov/showreelu — prepočítaj zastávky */
    setTimeout(computeStops, 900);
    /* po chvíli idle dohrej všetky textúry v pozadí (rýchle scrollovanie ich už má) */
    setTimeout(function () { planets.forEach(ensureTex); }, 12000);
    running = true;
    kick();   /* is-live pridá loop() po prvom vyrenderovanom frame */
  }
})();
