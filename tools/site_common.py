#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Spoločné funkcie pre gen_sitemap.py a qa.py — sken HTML stránok webu."""
from __future__ import annotations
import re
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
BASE = 'https://mrazosoft.sk'

# priečinky, ktoré nie sú súčasťou živého webu (testovacie/archívne/oddelené)
EXCLUDE_DIRS = {'testovanie', 'demo-video-hero', 'kadtestovanie', 'tajnyagent',
                'node_modules', 'tools', '.git', '.github', 'functions'}


EXCLUDE_FILES = {'google5896191634292f37.html'}  # GSC verifikačný stub — nechať bez zmien


def public_html_files():
    """Všetky HTML súbory živého webu (root + en/)."""
    out = []
    for p in sorted(ROOT.glob('*.html')):
        if p.name not in EXCLUDE_FILES:
            out.append(p)
    for p in sorted((ROOT / 'en').glob('*.html')):
        out.append(p)
    return out


def read(p: pathlib.Path) -> str:
    return p.read_text(encoding='utf-8')


def get_canonical(html: str) -> str | None:
    m = re.search(r'<link rel="canonical" href="([^"]+)"', html)
    return m.group(1) if m else None


def get_robots_meta(html: str) -> str:
    m = re.search(r'<meta name="robots" content="([^"]*)"', html)
    return m.group(1) if m else ''


def is_noindex(html: str) -> bool:
    return 'noindex' in get_robots_meta(html)


def robots_disallowed(rel_url: str, robots_txt: str) -> bool:
    for line in robots_txt.splitlines():
        line = line.strip()
        if line.lower().startswith('disallow:'):
            path = line.split(':', 1)[1].strip()
            if path and rel_url.lstrip('/').startswith(path.lstrip('/')):
                return True
    return False
