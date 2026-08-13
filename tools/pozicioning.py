#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Kontrola pozicioningu mrazosoft.sk — hovorí celý web tej istej cieľovke?

Vznik 13. 8. 2026: repozicioning na majiteľov e-shopov sa musel vrátiť, lebo
titulka hovorila e-shopárovi, ale `/tvorba-web-stranok`, `/pwa-aplikacie`,
blogy a regionálny obsah hovorili firmám v Poprade. Oko to na jednej stránke
nevidí — protirečenie je až medzi stránkami.

Kontroluje TRIEDU chyby, nie konkrétne znenie:

  1. CIEĽOVKA — každá indexovaná stránka musí mať v `<title>`, `<h1>` alebo
     meta description aspoň jeden výraz cieľovky. Stránka, ktorá cieľovke
     nehovorí, patrí mimo sitemap a mimo hlavné menu (vzor `laboratorium.html`).
  2. CUDZIA CIEĽOVKA — v `<title>` a `<h1>` indexovanej stránky nesmie stáť
     výraz, ktorý sľubuje inú skupinu než titulka.
  3. BEZ CIEN — od 11. 8. 2026 nesmie na webe stáť suma, `Offer`, `priceRange`
     ani objednávkové CTA (bez živnosti/IČO). Toto platí pre KAŽDÚ stránku
     vrátane vyňatých.

Výnimky sú vymenované s dôvodom a **vypisujú sa** — rozhodnutie má byť vidieť,
nie mlčky zdedené.

Spustenie: python3 tools/pozicioning.py        (exit 1 = nezhoda)
           python3 tools/pozicioning.py --vypis (tabuľka toho, čo kde stojí)
"""
from __future__ import annotations
import re
import sys

from site_common import ROOT, public_html_files, read, is_noindex

# --- slovník cieľovky: majiteľ e-shopu -------------------------------------
# Stačí JEDEN výraz v title/h1/description. Zámerne je zoznam široký — ide
# o to, či stránka hovorí o jeho svete, nie o presnú formuláciu.
CIELOVKA = [
    'e-shop', 'eshop', 'e-shopy', 'online shop', 'online shops', 'store',
    'objednáv', 'objednav', 'order',
    'sklad', 'stock', 'inventory',
    'feed', 'xml', 'heureka', 'google shopping', 'marketplace',
    'prestashop', 'woocommerce', 'shoptet',
    'košík', 'kosik', 'cart', 'checkout',
    'produkt', 'product',
    'tržb', 'trzb', 'revenue', 'konverz', 'conversion',
    'predaj', 'sales', 'zákazník', 'zakaznik', 'customer',
]

# --- výrazy, ktoré sľubujú INÚ skupinu -------------------------------------
# Kontrolujú sa len v <title> a <h1>, teda v tom, čo je vidieť v Google
# a čo človek prečíta ako prvé.
CUDZIA_CIELOVKA = [
    'na mieru pre firmy', 'pre firmy', 'for companies',
    'prezentačný web', 'prezentacny web', 'firemný web', 'firemny web',
    'web na mieru', 'tvorba web stránok', 'tvorba web stranok',
    'reštaurác', 'restaurac', 'ubytovan', 'kaderníc', 'kadernic',
    'živnostník', 'zivnostnik', 'malé firmy', 'male firmy',
]

# --- ceny (pravidlo z 11. 8. 2026) -----------------------------------------
CENA_VZORY = [
    (r'\b\d[\d\s ]*\s*€', 'suma v eurách'),
    (r'&euro;', 'suma v eurách (HTML entita)'),
    (r'"@type"\s*:\s*"Offer"', 'JSON-LD Offer'),
    (r'priceRange|"price"\s*:|minPrice|lowPrice', 'cenový údaj v štruktúrovaných dátach'),
    (r'Objednať za|Order for', 'objednávkové CTA so sumou'),
]

# --- stránky vyňaté z kontroly cieľovky ------------------------------------
# Kľúč = názov súboru, hodnota = DÔVOD. Bez dôvodu sa výnimka nepridáva.
# Kontrola cien (bod 3) platí aj na ne.

# (a) NAVIGAČNÉ — do hlavného menu patria, ale cieľovku neoslovujú.
#     Kontakt a O mne má každý web; žiadať od nich reč cieľovky by bola brána,
#     ktorá sa nedá splniť.
NAVIGACNE = {
    'kontakt.html': 'kontaktný formulár — nepredáva, len prijíma dopyt',
    'o-mne.html': 'stránka o autorovi — hovorí o mne, nie o zákazníkovej strate',
    'zasady.html': 'právny text (GDPR), cieľovku neoslovuje',
    'blog.html': 'rozcestník článkov — cieľovku nesú jednotlivé články',
    'en/contact.html': 'kontaktný formulár — nepredáva, len prijíma dopyt',
    'en/about.html': 'stránka o autorovi',
}

# (b) MIMO MENU — nesmú stáť v hlavnej navigácii. Keby tam boli, rozbíjajú
#     pozicioning presne tak, ako to spravilo 7 hračiek na stránke Projekty.
MIMO_MENU = {
    'data.html': 'interná návštevnosť za PINom',
    'lab.html': 'interná stránka',
    'laboratorium.html': 'vlastné appky a nástroje — zámerne mimo hlavného menu',
    'pomixuje.html': 'dôkazová stránka „ukáž, netvrď" — meria weby, nepredáva balík',
    'seo-audit.html': 'noindex, mimo menu aj sitemap (pravidlo z 11. 8.)',
}

VYNATE = {**NAVIGACNE, **MIMO_MENU}

# Cudzia cena (ukážka produktu zákazníka v deme) je legitímna — ale musí byť
# priznaná atribútom, nie schovaná. Blok s `data-cena-ukazka="dôvod"` sa
# z kontroly cien vyníma a dôvod sa vypisuje.
UKAZKA_ATTR = 'data-cena-ukazka'

chyby: list[str] = []
prehlad: list[tuple[str, str, str, str]] = []
ukazky: list[str] = []


def bez_ukazok(html: str, name: str) -> str:
    """Vyhodí bloky priznané ako cudzia cena (`data-cena-ukazka="dôvod"`).

    Vyhadzuje sa element od otváracieho tagu s atribútom po jeho zatvárací —
    hľadá sa párovanie rovnakého názvu tagu, aby vnorený `<div>` blok
    nepredčasne neukončil.
    """
    while True:
        m = re.search(r'<(\w+)([^>]*\s' + UKAZKA_ATTR + r'="([^"]*)"[^>]*)>', html)
        if not m:
            return html
        tag, dovod = m.group(1), m.group(3)
        ukazky.append(f'{name}: {dovod}')
        i, hlbka = m.end(), 1
        vzor = re.compile(rf'</?{tag}\b', re.I)
        while hlbka and (n := vzor.search(html, i)):
            hlbka += -1 if n.group(0).startswith('</') else 1
            i = n.end()
        html = html[:m.start()] + html[i:]


def text_bez_tagov(s: str) -> str:
    return re.sub(r'<[^>]+>', ' ', s)


def prvy_h1(html: str) -> str:
    m = re.search(r'<h1[^>]*>(.*?)</h1>', html, re.S)
    return ' '.join(text_bez_tagov(m.group(1)).split()) if m else ''


def title(html: str) -> str:
    m = re.search(r'<title>([^<]*)</title>', html)
    return m.group(1).strip() if m else ''


def description(html: str) -> str:
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    return m.group(1).strip() if m else ''


def hlavne_menu() -> set[str]:
    """Stránky odkazované z hlavnej navigácie titulky (SK aj EN)."""
    out: set[str] = set()
    for idx in ('index.html', 'en/index.html'):
        p = ROOT / idx
        if not p.exists():
            continue
        m = re.search(r'<nav class="nav-links".*?</nav>', read(p), re.S)
        if not m:
            continue
        for href in re.findall(r'href="([^"]+)"', m.group(0)):
            href = href.split('#')[0].split('?')[0].strip('/')
            if not href or href.startswith('http'):
                continue
            out.add(href if href.endswith('.html') else href + '.html')
    return out


def v_sitemape() -> set[str]:
    p = ROOT / 'sitemap.xml'
    if not p.exists():
        return set()
    out = set()
    for loc in re.findall(r'<loc>([^<]+)</loc>', read(p)):
        rel = loc.split('mrazosoft.sk', 1)[-1].strip('/')
        out.add((rel + '.html') if rel and not rel.endswith('.html') else (rel or 'index.html'))
    return out


def skontroluj(p, menu: set[str], sitemap: set[str]) -> None:
    name = p.relative_to(ROOT).as_posix()
    html = read(p)
    t, h, d = title(html), prvy_h1(html), description(html)
    vitrina = f'{t} {h} {d}'.lower()
    prehlad.append((name, t, h, d))

    # 3. ceny — platí pre KAŽDÚ stránku, aj vyňatú
    cistý = bez_ukazok(html, name)
    for vzor, popis in CENA_VZORY:
        m = re.search(vzor, cistý)
        if m:
            uryvok = ' '.join(text_bez_tagov(cistý[max(0, m.start() - 60):m.end() + 20]).split())
            chyby.append(f'{name}: {popis} — „…{uryvok}…" (od 11. 8. 2026 web ceny neuvádza)')

    if name in MIMO_MENU and name in menu:
        chyby.append(f'{name}: patrí mimo hlavného menu ({MIMO_MENU[name]}), '
                     f'ale stojí v HLAVNEJ NAVIGÁCII')

    if name in VYNATE:
        return

    if is_noindex(html) and name not in sitemap:
        return  # nedostupná pre Google a mimo sitemap — nekontroluje sa

    # 1. cieľovka
    if not any(v in vitrina for v in CIELOVKA):
        chyby.append(f'{name}: title/h1/description neobsahuje ani jeden výraz cieľovky '
                     f'(e-shop, objednávky, sklad, feed, tržby…) — „{t}" / „{h}"')

    # 2. cudzia cieľovka vo výklade
    vyklad = f'{t} {h}'.lower()
    for v in CUDZIA_CIELOVKA:
        if v in vyklad:
            chyby.append(f'{name}: title/h1 sľubuje inú skupinu — „{v}" v „{t}" / „{h}"')


def main() -> int:
    menu, sitemap = hlavne_menu(), v_sitemape()
    for p in public_html_files():
        skontroluj(p, menu, sitemap)

    if '--vypis' in sys.argv:
        for name, t, h, d in prehlad:
            print(f'── {name}\n   title: {t}\n   h1:    {h}\n   desc:  {d[:100]}')
        print()

    print('Vyňaté z kontroly cieľovky — patria do menu (dôvod je súčasťou rozhodnutia):')
    for k, v in NAVIGACNE.items():
        print(f'  · {k} — {v}')
    print('Vyňaté z kontroly cieľovky — musia byť MIMO menu:')
    for k, v in MIMO_MENU.items():
        print(f'  · {k} — {v}')
    if ukazky:
        print('Priznaná cudzia cena (vyňatá z kontroly cien):')
        for u in ukazky:
            print(f'  · {u}')
    print()

    if chyby:
        print(f'❌ {len(chyby)} nezhôd s pozicioningom:')
        for c in chyby:
            print(f'  • {c}')
        return 1
    print(f'✅ Pozicioning konzistentný ({len(prehlad)} stránok, '
          f'{len(prehlad) - len(VYNATE)} kontrolovaných na cieľovku).')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
