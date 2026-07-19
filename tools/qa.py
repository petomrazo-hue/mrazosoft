#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""QA gate pre mrazosoft.sk — kontrola všetkých verejných HTML stránok.

Kritické chyby (exit 1): H1 počet, chýbajúci title/description/canonical,
duplicitné title/description, neplatný JSON-LD, nefunkčné interné odkazy,
neexistujúce assety, noindex stránka v sitemap, sitemap URL bez súboru,
nerecipročný hreflang.
Varovania (exit 0): dĺžky title/description mimo odporúčania, chýbajúci alt,
chýbajúce OG tagy.

Spustenie: python3 tools/qa.py
"""
from __future__ import annotations
import json
import re
import urllib.parse

from site_common import (ROOT, BASE, public_html_files, read, get_canonical,
                         is_noindex, robots_disallowed)

errors: list[str] = []
warnings: list[str] = []


def err(msg): errors.append(msg)
def warn(msg): warnings.append(msg)


def check_page(p, html, titles, descs):
    name = p.relative_to(ROOT).as_posix()
    noindex = is_noindex(html)

    # H1
    h1s = re.findall(r'<h1[\s>]', html)
    if len(h1s) != 1:
        (err if not noindex else warn)(f'{name}: {len(h1s)}× H1 (má byť presne 1)')

    # title
    m = re.search(r'<title>([^<]*)</title>', html)
    if not m or not m.group(1).strip():
        err(f'{name}: chýba <title>')
    else:
        t = m.group(1).strip()
        titles.setdefault(t, []).append(name)
        if not noindex and not (35 <= len(t) <= 65):
            warn(f'{name}: title {len(t)} znakov (odporúčané 45–60): "{t[:50]}…"')

    # description
    m = re.search(r'<meta name="description" content="([^"]*)"', html)
    if not m or not m.group(1).strip():
        (err if not noindex else warn)(f'{name}: chýba meta description')
    else:
        d = m.group(1).strip()
        descs.setdefault(d, []).append(name)
        if not noindex and not (120 <= len(d) <= 165):
            warn(f'{name}: description {len(d)} znakov (odporúčané 140–160)')

    # canonical
    canonical = get_canonical(html)
    if not noindex and not canonical:
        err(f'{name}: chýba canonical')

    # OG základ
    if not noindex:
        for og in ('og:title', 'og:description', 'og:image', 'og:url'):
            if f'property="{og}"' not in html:
                warn(f'{name}: chýba {og}')

    # lang atribút
    if '<html lang=' not in html:
        err(f'{name}: chýba <html lang>')

    # alt texty
    for img in re.findall(r'<img [^>]*>', html):
        if 'alt=' not in img:
            src = re.search(r'src="([^"]*)"', img)
            warn(f'{name}: <img> bez alt ({src.group(1) if src else "?"})')

    # JSON-LD validita
    for i, block in enumerate(re.findall(r'<script type="application/ld\+json">(.*?)</script>', html, re.S)):
        try:
            json.loads(block)
        except json.JSONDecodeError as e:
            err(f'{name}: neplatný JSON-LD blok #{i + 1}: {e}')

    # interné odkazy a assety existujú na disku
    refs = re.findall(r'(?:href|src|poster)="([^"]+)"', html)
    refs += [u.strip().split(' ')[0] for r in re.findall(r'srcset="([^"]+)"', html) for u in r.split(',')]
    for ref in refs:
        root_relative = False
        if ref.startswith(('http://', 'https://', 'mailto:', 'tel:', '#', 'data:', 'javascript:')):
            if ref.startswith(BASE + '/') or ref == BASE:
                ref = ref[len(BASE):].lstrip('/')
                root_relative = True
            else:
                continue
        ref = urllib.parse.unquote(ref.split('#')[0].split('?')[0])
        if not ref:
            continue
        if ref.startswith('/'):
            target = ROOT / ref.lstrip('/')
        elif root_relative:
            target = ROOT / ref
        else:
            target = (p.parent / ref)
        # extensionless interné odkazy (po CF normalizácii) — skús aj .html
        if not target.exists() and not target.suffix:
            if target.with_suffix('.html').exists():
                continue
            if (target / 'index.html').exists():
                continue
        if not target.exists():
            err(f'{name}: odkaz na neexistujúci súbor: {ref}')

    return canonical, noindex


def check_hreflang(pages):
    """Reciprocita hreflang: ak A deklaruje alternate B, B musí deklarovať A."""
    decl = {}  # canonical -> {hreflang: url}
    for p, html in pages:
        canonical = get_canonical(html)
        alts = dict(re.findall(r'<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"', html))
        if alts:
            decl[canonical] = alts
    for canon, alts in decl.items():
        for lang, url in alts.items():
            if lang == 'x-default':
                continue
            if url == canon:
                continue
            target = decl.get(url)
            if target is None:
                err(f'hreflang: {canon} → {url} ({lang}), ale cieľ hreflang nedeklaruje')
            elif canon not in target.values():
                err(f'hreflang: {canon} → {url}, ale späťný odkaz chýba')


def check_sitemap(canonicals_noindex):
    sm = ROOT / 'sitemap.xml'
    if not sm.exists():
        err('sitemap.xml neexistuje')
        return
    urls = re.findall(r'<loc>([^<]+)</loc>', read(sm))
    robots_txt = read(ROOT / 'robots.txt') if (ROOT / 'robots.txt').exists() else ''
    canon_map = {c: nx for c, nx in canonicals_noindex if c}
    for url in urls:
        rel = url.replace(BASE, '').lstrip('/') or 'index.html'
        f = ROOT / rel
        if not f.exists() and not f.suffix:
            f = f.with_suffix('.html')
        if rel.endswith('/'):
            f = ROOT / rel / 'index.html'
        if not f.exists():
            err(f'sitemap: URL bez súboru: {url}')
            continue
        if url in canon_map and canon_map[url]:
            err(f'sitemap: noindex stránka v sitemap: {url}')
        if robots_disallowed(url.replace(BASE, ''), robots_txt):
            err(f'sitemap: robots.txt blokuje URL v sitemap: {url}')


def main() -> int:
    titles: dict[str, list[str]] = {}
    descs: dict[str, list[str]] = {}
    pages = [(p, read(p)) for p in public_html_files()]
    canonicals = []
    for p, html in pages:
        c, nx = check_page(p, html, titles, descs)
        canonicals.append((c, nx))

    for t, names in titles.items():
        if len(names) > 1:
            err(f'duplicitný title na {names}: "{t[:60]}"')
    for d, names in descs.items():
        if len(names) > 1:
            err(f'duplicitná description na {names}')

    check_hreflang(pages)
    check_sitemap(canonicals)

    for w in warnings:
        print(f'⚠  {w}')
    for e in errors:
        print(f'✘  {e}')
    print(f'\nQA: {len(errors)} chýb, {len(warnings)} varovaní, {len(pages)} stránok')
    return 1 if errors else 0


if __name__ == '__main__':
    raise SystemExit(main())
