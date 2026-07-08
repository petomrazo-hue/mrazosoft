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

  var CFG = isMobile
    ? { planets: 5, stars: 600, dpr: 1.5, antialias: false, parallax: false }
    : { planets: 7, stars: 2000, dpr: 2, antialias: true, parallax: true };

  var COL = { star: 0xCFE6FF };

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
      new THREE.SphereGeometry(1.35, 48, 48),
      new THREE.ShaderMaterial({
        uniforms: sunUniforms,
        vertexShader: [
          'varying vec3 vN; varying vec3 vP;',
          'void main(){ vN = normalize(normalMatrix * normal);',
          '  vec4 mv = modelViewMatrix * vec4(position,1.0); vP = mv.xyz;',
          '  gl_Position = projectionMatrix * mv; }'
        ].join('\n'),
        fragmentShader: [
          'uniform float uTime; varying vec3 vN; varying vec3 vP;',
          'float hash(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164))) * 43758.5453); }',
          'float noise(vec3 p){ vec3 i = floor(p); vec3 f = fract(p); f = f*f*(3.0-2.0*f);',
          '  return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x), mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),',
          '             mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x), mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z); }',
          'void main(){',
          '  vec3 eye = normalize(-vP);',
          '  float fres = pow(1.0 - abs(dot(vN, eye)), 1.6);',
          '  float n = noise(vN * 4.0 + uTime * 0.10) * 0.6 + noise(vN * 9.0 - uTime * 0.06) * 0.4;',
          '  vec3 core = mix(vec3(1.0, 0.98, 0.90), vec3(1.0, 0.82, 0.45), n * 0.7);',
          '  vec3 rim  = vec3(1.0, 0.45, 0.10);',
          '  vec3 col = mix(core, rim, fres * 0.85);',
          '  gl_FragColor = vec4(col, 1.0); }'
        ].join('\n')
      })
    );
    scene.add(sun);

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

    /* ── PLANÉTY: realistická sústava — Merkúr→Neptún, Kepler rýchlosti, sklon ±6° ── */
    var PLANET_DEFS = [
      { name: 'mercury', r: 0.15, orbit: 3.6,  col: 0x9C938B, rough: 0.9,  skipMobile: true },
      { name: 'venus',   r: 0.26, orbit: 4.9,  col: 0xD8B98A, rough: 0.7,  skipMobile: true },
      { name: 'earth',   r: 0.29, orbit: 6.4,  col: 0x3B7FD4, rough: 0.55, atmo: 0x6FB4FF, moon: true },
      { name: 'mars',    r: 0.20, orbit: 8.0,  col: 0xC1592F, rough: 0.85 },
      { name: 'jupiter', r: 0.80, orbit: 10.8, col: 0xC8A06E, rough: 0.65, bands: ['#D9BC93','#B98F60','#E0C9A4','#A67C4F','#D3B084'] },
      { name: 'saturn',  r: 0.66, orbit: 13.6, col: 0xD9C08A, rough: 0.65, ring: 0xB8A67A, bands: ['#E4D2A6','#CBB27E','#EEDFBB','#C0A472'] },
      { name: 'neptune', r: 0.32, orbit: 16.2, col: 0x3A5FD9, rough: 0.5,  atmo: 0x5A7FF0 }
    ].filter(function (d) { return !(isMobile && d.skipMobile); });

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
      var opts = { color: def.col };
      if (def.bands) { opts.map = bandTexture(def.bands); opts.color = 0xFFFFFF; }
      if (isMobile) return new THREE.MeshLambertMaterial(opts);
      opts.roughness = def.rough; opts.metalness = 0.05;
      return new THREE.MeshStandardMaterial(opts);
    }

    var planets = [];
    PLANET_DEFS.forEach(function (def, i) {
      var pivot = new THREE.Object3D();
      pivot.rotation.x = THREE.MathUtils.degToRad((Math.random() * 12) - 6);
      pivot.rotation.y = Math.random() * Math.PI * 2;
      scene.add(pivot);

      var mesh = new THREE.Mesh(new THREE.SphereGeometry(def.r, isMobile ? 20 : 32, isMobile ? 20 : 32), planetMaterial(def));
      mesh.position.x = def.orbit;
      pivot.add(mesh);

      if (def.atmo && !isMobile) {
        var atmo = new THREE.Mesh(
          new THREE.SphereGeometry(def.r * 1.18, 32, 32),
          new THREE.ShaderMaterial({
            uniforms: { uCol: { value: new THREE.Color(def.atmo) } },
            vertexShader: 'varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(normalMatrix * normal); vec4 mv = modelViewMatrix * vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix * mv; }',
            fragmentShader: 'uniform vec3 uCol; varying vec3 vN; varying vec3 vP; void main(){ float f = pow(1.0 - abs(dot(vN, normalize(-vP))), 3.0); gl_FragColor = vec4(uCol, f * 0.55); }',
            transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false
          })
        );
        mesh.add(atmo);
      }
      if (def.ring) {
        var ring = new THREE.Mesh(
          new THREE.RingGeometry(def.r * 1.4, def.r * 2.3, 64),
          new THREE.MeshBasicMaterial({ color: def.ring, transparent: true, opacity: 0.45, side: THREE.DoubleSide })
        );
        ring.rotation.x = Math.PI / 2 - 0.24;
        mesh.add(ring);
      }
      if (def.moon) {
        var moonPivot = new THREE.Object3D();
        var moon = new THREE.Mesh(
          new THREE.SphereGeometry(def.r * 0.27, 16, 16),
          planetMaterial({ col: 0xBDB7AE, rough: 0.95 })
        );
        moon.position.x = def.r * 2.6;
        moonPivot.add(moon);
        mesh.add(moonPivot);
        def._moonPivot = moonPivot;
      }

      /* orbitálna čiara — robí „sústavu", nie šetrič */
      var pts = [];
      for (var a = 0; a <= 128; a++) {
        var t = (a / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(t) * def.orbit, 0, Math.sin(t) * def.orbit));
      }
      var line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: COL.star, transparent: true, opacity: i % 2 ? 0.09 : 0.13 })
      );
      pivot.add(line);

      planets.push({ pivot: pivot, mesh: mesh, def: def, speed: 0.22 * Math.pow(def.orbit, -1.5) * 10, spin: (Math.random() * 0.4 + 0.2) });
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

    /* ── kamera: nad ekliptikou, pomalý auto-orbit + mouse parallax + scroll dolly ── */
    /* lookAt pod stred → slnko sedí v hornej tretine, text má tmavý vesmír za sebou */
    var camAngle = 0.6, camElev = isMobile ? 8 : 6, camDist = isMobile ? 32 : 21;
    var lookY = isMobile ? -7.5 : -5.4;
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
    }
    var rt;
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(resize, 200); });

    var running = false, visible = true, raf = null;
    var clock = new THREE.Clock();

    function loop() {
      raf = null;
      if (!running || !visible || document.hidden) return;
      var dt = Math.min(clock.getDelta(), 0.05);
      var t = clock.elapsedTime;

      sunUniforms.uTime.value = t;
      sun.rotation.y += dt * 0.05;
      pulse.material.opacity = 0.6 + 0.15 * Math.sin(t * 1.1);

      planets.forEach(function (p) {
        p.pivot.rotation.y += dt * p.speed;
        p.mesh.rotation.y += dt * p.spin;
        if (p.def._moonPivot) p.def._moonPivot.rotation.y += dt * 1.6;
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
