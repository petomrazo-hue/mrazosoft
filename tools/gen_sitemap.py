#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Generuje sitemap.xml zo skutočných kanonických URL verejných stránok.

- vynecháva noindex stránky a cesty blokované v robots.txt
- lastmod berie z gitu (posledný commit súboru)
- žiadne priority/changefreq (Google ich ignoruje)

Spustenie: python3 tools/gen_sitemap.py
"""
from __future__ import annotations
import subprocess
import sys

from site_common import ROOT, public_html_files, read, get_canonical, is_noindex, robots_disallowed


def git_lastmod(p) -> str:
    try:
        out = subprocess.run(
            ['git', 'log', '-1', '--format=%cs', '--', str(p.relative_to(ROOT))],
            cwd=ROOT, capture_output=True, text=True, check=True).stdout.strip()
        if out:
            return out
    except Exception:
        pass
    import datetime
    return datetime.date.fromtimestamp(p.stat().st_mtime).isoformat()


def main() -> int:
    robots_txt = read(ROOT / 'robots.txt') if (ROOT / 'robots.txt').exists() else ''
    entries = []
    for p in public_html_files():
        html = read(p)
        if is_noindex(html):
            continue
        canonical = get_canonical(html)
        if not canonical:
            print(f'  ! {p.name}: chýba canonical — preskočené', file=sys.stderr)
            continue
        rel = canonical.replace('https://mrazosoft.sk', '') or '/'
        if robots_disallowed(rel, robots_txt):
            continue
        # do sitemapy patrí len self-canonical stránka (nie stránka kanonizovaná inam)
        expected_url_html = p.relative_to(ROOT).as_posix()
        expected = {f'https://mrazosoft.sk/{expected_url_html}',
                    f'https://mrazosoft.sk/{expected_url_html.removesuffix(".html")}'}
        if expected_url_html == 'index.html':
            expected |= {'https://mrazosoft.sk/', 'https://mrazosoft.sk'}
        if expected_url_html == 'en/index.html':
            expected |= {'https://mrazosoft.sk/en/', 'https://mrazosoft.sk/en'}
        if canonical not in expected:
            continue
        entries.append((canonical, git_lastmod(p)))

    lines = ['<?xml version="1.0" encoding="UTF-8"?>',
             '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for url, lastmod in entries:
        lines += ['  <url>', f'    <loc>{url}</loc>', f'    <lastmod>{lastmod}</lastmod>', '  </url>']
    lines.append('</urlset>')
    (ROOT / 'sitemap.xml').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(f'sitemap.xml: {len(entries)} URL')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
