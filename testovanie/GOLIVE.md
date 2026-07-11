# GO-LIVE checklist — testovanie → mrazosoft.sk (hlavná doména)

Keď Peto rozhodne, že scroll-flight verzia nahrádza produkčný web, sprav VŠETKO z tohto zoznamu.
Kým je toto testovacie prostredie, **NIČ z toho nerob** — najmä nekombinuj `noindex` s canonical
na inú URL (mätúce signály, riziko prenosu noindex na produkciu — John Mueller/Google).

## SEO (cieľ: SEOlight 100 % ako doteraz)
1. **Zrušiť `noindex,nofollow`** vo všetkých HTML (`<meta name="robots" content="noindex,nofollow" />` → zmazať).
2. **Pridať self-referencing canonical** na každú stránku: `<link rel="canonical" href="https://mrazosoft.sk/<stránka>" />` (index → `https://mrazosoft.sk/`).
3. **sitemap.xml** v roote: overiť, že obsahuje všetky stránky (bez zasady.html — má vlastný noindex) a lastmod aktualizovať.
4. **hreflang: NEPRIDÁVAŤ** — rozhodnuté: EN je client-side prepínač na rovnakej URL, oddelené EN URL neexistujú → hreflang by bol neplatný. SK je primárny indexovaný jazyk.
5. **OG obrázok**: `assets/og-image.png` (vesmírny vizuál, 1200×630) — pri kopírovaní do roota prepísať starý a overiť `og:image` URL bez `/testovanie/`.
6. **og:url + JSON-LD @id**: už ukazujú na `https://mrazosoft.sk/` ✓ (netreba meniť).
7. Po nasadení: **GSC → Inšpekcia URL → Request indexing** pre `/`, `/sluzby`, `/projekty`; overiť SEOlight = 100 %.

## Technika
8. Preniesť celý obsah `testovanie/` do roota repa (okrem `GOLIVE.md` a `version.json` histórie — version.json roota pokračuje vlastným číslovaním).
9. `?v=` verzie a `site-version` zjednotiť s root číslovaním (root má vlastnú radu).
10. Lighthouse cez `npx serve` (gzip!) pred pushom. **Baseline 10.7.2026 (mobile):** perf 65, a11y 98, BP 100, SEO 60→100 po zrušení noindex. TBT 60 ms, CLS 0.006 — výborné; LCP ~10 s ťahá splash sekvencia + nábeh canvasu (vedomý trade-off; ak treba skóre, skrátiť splash alebo ho vypnúť pre prvý paint). Statická galaxia v hero (`.hero-cosmos::before`) už LCP čiastočne kryje.
11. Overiť kontaktný formulár (Web3Forms) — testovací dopyt.
12. Hard-reload verifikácia naživo s `?cb=` + screenshot (deploy ritual z CLAUDE.md).

## Doplnené 10.7.2026 (v69 — mobil + rescue navigácia)
13. **Nové prvky v69:** letový pill + Mapa letu (`#flightPill`/`#flightMap`), statický hero podklad `assets/textures/hero-static.webp` (screenshot 3D záberu — pri zmene hero kamery v solar.js ho treba PREGENEROVAŤ, postup: skryť UI, screenshot 1600×900, PIL→webp q82), rotácia galaxie 0.021 rad/s.
14. **Známy console error:** Firebase RTDB 401 na `analytics/mrazosoft/<deň>.json` (first-party sink v cookies.js) — RTDB pravidlá odmietajú zápis; pred go-live buď opraviť pravidlá DB `tajny-dc6d6`, alebo sink vypnúť.
15. Mobil je od v69 plnohodnotný (portrét karta dole + planéta hore, landscape bočný panel, safe-area) — pri go-live otestovať na REÁLNOM iPhone (adresný riadok/dvh správanie Playwright nesimuluje).

## Doplnené 10.7.2026 popoludní (v71 — perf/PWA/a11y audit)
16. **Obrázky:** projects PNG (6,1 MB) nahradené AVIF+WebP (252 kB) v `<picture>`; og-image.png → og-image.jpg (865→134 kB). Pri go-live preniesť aj tieto a prepísať og:image URL bez /testovanie/.
17. **Service worker `sw.js`** (network-first HTML, cache-first assety, offline.html fallback) — scope /testovanie/; pri go-live zmeniť registráciu v app.js (podmienka na pathname) + VERSION v sw.js bumpovať pri každom releasei.
18. **404.html** pripravená (kozmická) — GitHub Pages číta 404.html z ROOTU repa; pri go-live skopírovať do roota (teraz by prepísala produkčnú, ak existuje — over!).
19. **hreflang sa NEPRIDÁVA** (bod 4 vyššie platí) — audit z Chrome ho navrhoval, ale EN je client-side na tej istej URL → hreflang by bol neplatný signál.
20. **robots/canonical/sitemap pre /testovanie sa neriešia** — sú to go-live kroky (body 1–3 vyššie); produkčný root má vlastné robots.txt + sitemap.xml.
