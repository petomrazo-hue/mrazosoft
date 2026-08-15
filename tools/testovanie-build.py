#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Postaví /testovanie ako NÁHĽAD produkčných stránok — bez kopírovania assetov.

Prečo takto:
  Root a /testovanie mali doteraz dve nezávislé kópie webu (style.css, app.js,
  obrázky, texty). Rozišli sa — v `testovanie/` prežilo 20+ cien v €, ktoré
  z roota odišli 11. 8. z právnych dôvodov. Preto sa tu KOPÍRUJE LEN HTML
  a všetko ostatné sa odkazuje absolútne na root (`/style.css`, `/assets/…`).
  Náhľad tak nemôže zamrznúť na starej verzii a nemá čo duplikovať.

Tri pasce, ktoré tento skript rieši (každá by náhľad ticho rozbila):
  1. Root píše interné odkazy ABSOLÚTNE a bez prípony (`/kontakt`), `testovanie/`
     RELATÍVNE s príponou (`kontakt.html`). Skopírovaná stránka by teda z náhľadu
     odskočila na ŽIVÝ web a človek by to považoval za náhľad.
  2. Bez `noindex` by Google dostal duplicitný obsah vedľa ostrého webu.
  3. Na `/testovanie/` je z júla 2026 registrovaný service worker
     (`ms-testovanie-89`, cache-first na assety). Ostáva v prehliadači aj po
     zmazaní stránok, takže by ďalej servíroval starý web. Preto sa na jeho
     URL zapisuje samodeštrukčný `sw.js` — prehliadač si ho stiahne sám.

Idempotentný: opakované spustenie dá rovnaký výsledok.
Spustenie: python3 tools/testovanie-build.py [--check]
"""
from __future__ import annotations

import re
import shutil
import sys

from site_common import ROOT

CIEL = ROOT / "testovanie"
CHECK = "--check" in sys.argv

# Stránky, ktoré do náhľadu patria. Vynechané sú interné (`data`, `lab`,
# `seo-audit`) a overovacie súbory Googlu — tie na náhľade nemajú čo robiť.
VYNECHAJ = {"data.html", "lab.html", "seo-audit.html", "404.html", "offline.html"}

# Súbory, ktoré sa v HTML odkazujú relatívne a musia ukázať na ROOT.
NA_ROOT = ("assets/", "style.css", "app.js", "cookies.js", "consent-core.js",
           "tajne.js", "neo.css", "manifest.json", "favicon.ico")

SW_KILL = """/* MRAZOSOFT /testovanie — samodeštrukčný service worker.
   Na tejto ceste bol od 7/2026 registrovaný SW `ms-testovanie-89` s cache-first
   stratégiou na assety. Zmazanie starých súborov ho z prehliadačov NEODSTRÁNI —
   ostal by zaregistrovaný a ďalej by servíroval starú verziu náhľadu.
   Prehliadač si `sw.js` pri navigácii sám sťahuje znova, takže táto verzia
   sa nainštaluje namiesto neho, zmaže všetky cache a odregistruje sa. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (k) { return Promise.all(k.map(function (n) { return caches.delete(n); })); })
      .then(function () { return self.registration.unregister(); })
      .then(function () { return self.clients.matchAll({ type: 'window' }); })
      .then(function (cl) { cl.forEach(function (c) { c.navigate(c.url); }); })
  );
});
"""


def zdrojove_stranky():
    """Verejné HTML stránky roota vrátane `en/`, v stabilnom poradí."""
    sub = [p for p in sorted(ROOT.glob("*.html"))
           if p.name not in VYNECHAJ and not p.name.startswith("google")]
    sub += sorted((ROOT / "en").glob("*.html"))
    return sub


def slug_na_subor(slug: str) -> str | None:
    """`/kontakt` → `kontakt.html`, `/` → `index.html`, `/en/x` → `en/x.html`."""
    s = slug.strip("/")
    if s == "":
        return "index.html"
    if s.startswith("en/") or s == "en":
        zvysok = s[3:] if s.startswith("en/") else ""
        return f"en/{zvysok or 'index'}.html"
    return f"{s}.html"


def preloz(html: str, rel: str, dostupne: set[str]) -> str:
    hlbka = rel.count("/")            # `en/about.html` → 1
    hore = "../" * hlbka              # cesta späť na koreň /testovanie

    # 0) veci, ktoré zatiaľ žijú LEN v náhľade (root ostáva nedotknutý):
    #    vesmírna vrstva na každej stránke + sekcia o vibecodingu na titulke.
    #    Pozor: stránky v `en/` píšu cestu ako `../style.css`, takže doslovná
    #    zhoda by ich TICHO preskočila — a náhľad by mal päť stránok bez neo
    #    vrstvy. Preto regex + tvrdý pád, keď sa kotva nenájde.
    html, n = re.subn(
        r'(<link rel="stylesheet" href="(?:\.\./)*style\.css\?v=\d+" />)',
        r'\1\n  <!-- NEO — vesmírna identita, druhá vrstva NAD style.css (bez WebGL). -->\n'
        r'  <link rel="stylesheet" href="neo.css?v=2" />', html, count=1)
    if n != 1:
        raise SystemExit(f"{rel}: nenašiel sa odkaz na style.css — neo vrstva by chýbala")

    #    Statická galaxia je LCP prvok. Bez preloadu ju prehliadač objaví až po
    #    naparsovaní CSS — namerané na mobile: LCP 2,9 s (root) vs 3,3 s (neo).
    #    Media query musí byť ZRKADLOM tej v neo.css, inak sa stiahnu oba obrázky.
    html = html.replace(
        '  <link rel="stylesheet" href="neo.css?v=2" />',
        '  <link rel="preload" as="image" href="/assets/textures/hero-static-m.webp"\n'
        '        media="(orientation: portrait) and (max-width: 860px)" />\n'
        '  <link rel="preload" as="image" href="/assets/textures/hero-static.webp"\n'
        '        media="(min-width: 861px), (orientation: landscape)" />\n'
        '  <link rel="stylesheet" href="neo.css?v=2" />', 1)
    if rel == "index.html":
        frag = (ROOT / "tools" / "fragmenty" / "ako-stiham.html").read_text(encoding="utf-8")
        kotva = '    <section class="section" id="recenzie">'
        if kotva not in html:
            raise SystemExit("index.html: kotva pre sekciu 'ako-stiham' sa nenašla")
        html = html.replace(kotva, frag + "\n" + kotva, 1)
        # `/vibecoding` odkazuje na prípadové štúdie kotvou `#dokazy` — sekcia
        # na roote id nemá, tak ho náhľad doplní (inak odkaz skočí na začiatok)
        dokazy = '<section class="section">\n      <div class="container">\n' \
                 '        <header class="section-head reveal">\n' \
                 '          <span class="eyebrow" data-i18n="projects.eyebrow">Dôkazy</span>'
        if dokazy not in html:
            raise SystemExit("index.html: sekcia Dôkazy sa nenašla (kotva #dokazy)")
        html = html.replace(dokazy, dokazy.replace('<section class="section">',
                                                   '<section class="section" id="dokazy">', 1), 1)

    # 1) relatívne odkazy na zdieľané súbory → absolútne na root.
    #    Pozor na DVE veci, na ktorých to už raz padlo (obe odhalil až beh
    #    v prehliadači, v kóde ich vidieť nebolo):
    #      · nestačí `href`/`src` — assety sedia aj v `poster` a `srcset`,
    #      · stránky v `en/` sa naň odkazujú cez `../`, takže bez neho ostali
    #        BEZ CSS (5 stránok, 8 zdrojov 404 na každej).
    prefixy = "|".join(re.escape(x) for x in NA_ROOT)

    def na_root(m):
        atr, hodnota = m.group(1), m.group(2)
        holá = re.sub(r'^(\.\./)+', "", hodnota)
        return f'{atr}="/{holá}"'
    html = re.sub(r'\b([\w-]+)="((?:\.\./)*(?:' + prefixy + r')[^"]*)"', na_root, html)

    # 2) interné absolútne odkazy `/kontakt` → relatívne v rámci náhľadu
    def na_nahlad(m):
        atr, cesta = m.group(1), m.group(2)
        # Súbor, nie stránka. Interné STRÁNKY sú na roote zámerne bez prípony
        # (`/kontakt`), takže bodka v poslednom segmente znamená zdieľaný asset
        # — vrátane tých, ktoré práve prepísal krok 1 (`/style.css`, `/neo.css`).
        # Bez tejto stráže si skript vlastný výstup prepíše na odkaz von.
        if "." in cesta.rsplit("/", 1)[-1] or cesta.startswith(("/assets/", "/api/")):
            return m.group(0)
        subor = slug_na_subor(cesta.split("#")[0].split("?")[0])
        if subor is None or subor not in dostupne:
            # stránka v náhľade neexistuje → nechaj ukázať na ostrý web,
            # ale prizná sa to atribútom, nech to nevyzerá ako súčasť náhľadu
            return f'{atr}="https://mrazosoft.sk{cesta}" data-mimo-nahlad="true'
        kotva = cesta.split("#")[1] if "#" in cesta else ""
        return f'{atr}="{hore}{subor}' + (f"#{kotva}" if kotva else "")
    html = re.sub(r'\b(href|src)="(/[^"]*)"', lambda m: na_nahlad(m) + '"', html)

    # 3) noindex — náhľad sa nesmie dostať do Googlu vedľa ostrého webu
    html = re.sub(r'\s*<meta name="robots"[^>]*>', "", html)
    html = html.replace("</title>", '</title>\n  <meta name="robots" content="noindex,nofollow" />', 1)

    # 4) canonical + og:url na vlastnú adresu v náhľade (nie na ostrý web —
    #    noindex + canonical inam sú protirečivé signály, viď GOLIVE.md)
    url = "https://mrazosoft.sk/testovanie/" + ("" if rel == "index.html" else rel)
    html = re.sub(r'<link rel="canonical" href="[^"]*"\s*/?>',
                  f'<link rel="canonical" href="{url}" />', html)
    html = re.sub(r'<meta property="og:url" content="[^"]*"\s*/?>',
                  f'<meta property="og:url" content="{url}" />', html)
    return html


def main() -> int:
    stranky = zdrojove_stranky()
    dostupne = {p.relative_to(ROOT).as_posix() for p in stranky}

    if CHECK:
        print(f"[--check] prenieslo by sa {len(stranky)} stránok do {CIEL.relative_to(ROOT)}/")
        for p in stranky:
            print("  ·", p.relative_to(ROOT).as_posix())
        return 0

    # staré HTML/JS/CSS náhľadu preč (assety sa už neduplikujú — ide sa na root)
    if CIEL.exists():
        shutil.rmtree(CIEL)
    CIEL.mkdir(parents=True)
    (CIEL / "en").mkdir()

    for p in stranky:
        rel = p.relative_to(ROOT).as_posix()
        (CIEL / rel).write_text(preloz(p.read_text(encoding="utf-8"), rel, dostupne),
                                encoding="utf-8")

    (CIEL / "sw.js").write_text(SW_KILL, encoding="utf-8")
    (CIEL / "robots.txt").write_text("User-agent: *\nDisallow: /testovanie/\n", encoding="utf-8")

    print(f"testovanie/: {len(stranky)} stránok + sw.js (samodeštrukčný) + robots.txt")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
