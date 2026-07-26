#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
neo-prod.py — pripraví "neo" web (testovanie/) na produkčné nasadenie.

Robí tri veci, idempotentne (pokojne púšťaj opakovane):
  1. <link rel="canonical">  — absolútna URL podľa BASE
  2. <meta property="og:url"> — zrkadlí canonical (aby si neprotirečili)
  3. <meta http-equiv="Content-Security-Policy"> — striktná CSP so SHA-256
     hashmi VŠETKÝCH inline skriptov na danej stránke

Prečo hashe a nie 'unsafe-inline': stránky majú 4–5 inline skriptov
(version guard, splash, gtag consent, gtag loader, konfig) a 'unsafe-inline'
by CSP degradoval na ozdobu. Hashe sa prepočítajú pri každom behu — takže
PO KAŽDEJ ZMENE INLINE SKRIPTU spusti tento skript, inak stránka spadne.

CUTOVER NA ROOT: zmeň BASE na "https://mrazosoft.sk/" a DIR na "." — nič iné.

Použitie:
    python3 tools/neo-prod.py            # zapíše zmeny
    python3 tools/neo-prod.py --check    # len vypíše, čo by zmenil (exit 1 ak treba zmenu)
"""
from __future__ import annotations

import base64
import hashlib
import os
import re
import sys

# ── konfigurácia ────────────────────────────────────────────────────────────
DIR = "testovanie"
BASE = "https://mrazosoft.sk/testovanie/"

# stránky, ktoré dostanú canonical + og:url (404/offline zámerne nie)
PAGES = [
    "index.html", "sluzby.html", "projekty.html", "o-mne.html", "blog.html",
    "kontakt.html", "zasady.html", "wizard.html",
    "blog-co-je-pwa-aplikacia.html",
    "blog-kolko-stoji-web-stranka.html",
    "blog-web-alebo-eshop.html",
]
# stránky, ktoré dostanú CSP (aj tie bez canonicalu)
CSP_PAGES = PAGES + ["404.html", "offline.html"]

# Externé pôvody, ktoré web reálne používa. Držať v tesnom súlade s realitou —
# každý riadok navyše je diera, každý chýbajúci riadok je rozbitá funkcia.
#   googletagmanager / googleadservices / doubleclick → Google Ads (AW-18272862336)
#   gstatic.com                                        → Firebase SDK (tajne.js)
#   api.web3forms.com                                  → odoslanie kontaktného formulára
#   firebasedatabase.app                               → skrytý chat (tajne.js)
#   youtube-nocookie.com                               → video embed po kliknutí
# POZOR: Clarity (www.clarity.ms) a Meta Pixel (connect.facebook.net) sú v
# cookies.js s prázdnym id → CSP ich zámerne NEPOVOĽUJE. Keď ich zapneš,
# doplň ich sem, inak ich CSP ticho zablokuje.
FIREBASE_DB = "https://tajny-dc6d6-default-rtdb.europe-west1.firebasedatabase.app"

CSP_DIRECTIVES = [
    ("default-src", ["'self'"]),
    ("base-uri", ["'self'"]),
    ("object-src", ["'none'"]),
    ("form-action", ["'self'"]),
    ("script-src", ["'self'", "{HASHES}",
                    "https://www.googletagmanager.com",
                    "https://www.googleadservices.com",
                    "https://googleads.g.doubleclick.net",
                    "https://www.gstatic.com"]),
    # 'unsafe-inline' je tu nutné: stránky používajú style="" atribúty a
    # 404/offline majú <style> blok. Pre štýly je to nízke riziko.
    ("style-src", ["'self'", "'unsafe-inline'"]),
    # pagead2.googlesyndication.com = konverzný beacon Google Ads (ccm/collect).
    # Chodí ako img AJ ako fetch — bez neho CSP ticho zabije meranie konverzií
    # (odhalené až behom v prehliadači, v kóde to vidieť nie je).
    ("img-src", ["'self'", "data:",
                 "https://www.googletagmanager.com",
                 "https://www.google.com",
                 "https://www.google.sk",
                 "https://googleads.g.doubleclick.net",
                 "https://pagead2.googlesyndication.com"]),
    ("font-src", ["'self'"]),
    ("media-src", ["'self'"]),
    ("connect-src", ["'self'",
                     "https://api.web3forms.com",
                     "https://www.googletagmanager.com",
                     "https://www.google.com",
                     "https://googleads.g.doubleclick.net",
                     "https://pagead2.googlesyndication.com",
                     "https://region1.google-analytics.com",
                     "https://www.google-analytics.com",
                     FIREBASE_DB, FIREBASE_DB.replace("https://", "wss://")]),
    ("frame-src", ["https://www.youtube-nocookie.com"]),
    ("worker-src", ["'self'"]),
    ("manifest-src", ["'self'"]),
]
# frame-ancestors sa v <meta> IGNORUJE (a Chrome to hlási do konzoly) —
# clickjacking rieši root/_headers: `Content-Security-Policy: frame-ancestors 'none'`.

MARKER = "<!-- CSP: generované tools/neo-prod.py — needituj ručne -->"

# ── pomocné ────────────────────────────────────────────────────────────────
# inline <script> BEZ src; type="application/ld+json" je dátový blok, nie skript,
# takže CSP ho nerieši a hash nepotrebuje.
RE_INLINE = re.compile(r"<script\b(?![^>]*\bsrc=)([^>]*)>(.*?)</script>", re.S | re.I)
RE_TYPE = re.compile(r'\btype\s*=\s*"([^"]*)"', re.I)
EXEC_TYPES = {"", "text/javascript", "application/javascript", "module"}


def inline_hashes(html: str) -> list[str]:
    out, seen = [], set()
    for m in RE_INLINE.finditer(html):
        t = RE_TYPE.search(m.group(1))
        if (t.group(1).strip().lower() if t else "") not in EXEC_TYPES:
            continue
        digest = hashlib.sha256(m.group(2).encode("utf-8")).digest()
        h = "'sha256-" + base64.b64encode(digest).decode() + "'"
        if h not in seen:
            seen.add(h)
            out.append(h)
    return out


def build_csp(html: str) -> str:
    hashes = inline_hashes(html)
    parts = []
    for name, vals in CSP_DIRECTIVES:
        expanded = []
        for v in vals:
            expanded.extend(hashes if v == "{HASHES}" else [v])
        # script-src bez jediného inline skriptu by ostalo len 'self' + domény — OK
        parts.append(name + " " + " ".join(expanded) if expanded else name)
    return "; ".join(parts)


def canonical_for(page: str) -> str:
    return BASE if page == "index.html" else BASE + page


def apply(page: str, html: str) -> tuple[str, list[str]]:
    """Vráti (nové html, zoznam vykonaných zmien)."""
    changes = []

    if page in PAGES:
        url = canonical_for(page)
        tag = f'<link rel="canonical" href="{url}" />'
        if re.search(r'<link\s+rel="canonical"[^>]*>', html):
            new = re.sub(r'<link\s+rel="canonical"[^>]*>', tag, html, count=1)
            if new != html:
                changes.append(f"canonical → {url}")
            html = new
        else:
            # za <meta name="description">, inak za <title>
            anchor = re.search(r'<meta\s+name="description"[^>]*>', html) \
                or re.search(r"</title>", html)
            if not anchor:
                raise SystemExit(f"{page}: chýba <title> aj description — neviem kam dať canonical")
            i = anchor.end()
            html = html[:i] + "\n  " + tag + html[i:]
            changes.append(f"canonical PRIDANÝ → {url}")

        og = f'<meta property="og:url" content="{url}" />'
        if re.search(r'<meta\s+property="og:url"[^>]*>', html):
            new = re.sub(r'<meta\s+property="og:url"[^>]*>', og, html, count=1)
            if new != html:
                changes.append(f"og:url → {url}")
            html = new
        else:
            anchor = re.search(r'<meta\s+property="og:type"[^>]*>', html) \
                or re.search(r'<link\s+rel="canonical"[^>]*>', html)
            if not anchor:
                raise SystemExit(f"{page}: nenašiel som kotvu pre og:url")
            i = anchor.end()
            html = html[:i] + "\n  " + og + html[i:]
            changes.append(f"og:url PRIDANÝ → {url}")

    if page in CSP_PAGES:
        # Starú vygenerovanú CSP najprv von. Regex MUSÍ zhltnúť aj biely znak
        # PRED markerom — inak po odstránení ostane osirelé odsadenie a každý
        # beh pridá 2 medzery (idempotencia v čudu).
        html = re.sub(
            r"\n[ \t]*" + re.escape(MARKER)
            + r"\s*\n[ \t]*<meta http-equiv=\"Content-Security-Policy\"[^>]*>",
            "", html)
        csp = build_csp(html)
        meta = f'{MARKER}\n  <meta http-equiv="Content-Security-Policy" content="{csp}" />'
        anchor = re.search(r'<meta\s+charset="[^"]*"\s*/?>', html, re.I)
        if not anchor:
            raise SystemExit(f"{page}: nenašiel som <meta charset> — neviem kam vložiť CSP")
        i = anchor.end()
        html = html[:i] + "\n  " + meta + html[i:]
        changes.append(f"CSP ({len(inline_hashes(html))} inline hashov)")

    return html, changes


def main() -> int:
    check = "--check" in sys.argv
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", DIR)
    dirty = False
    for page in CSP_PAGES:
        path = os.path.join(root, page)
        if not os.path.exists(path):
            print(f"  ! {page}: neexistuje, preskakujem")
            continue
        with open(path, encoding="utf-8") as f:
            before = f.read()
        after, changes = apply(page, before)
        if after == before:
            print(f"  = {page}: bez zmeny")
            continue
        dirty = True
        print(f"  {'~' if check else '✓'} {page}: " + "; ".join(changes))
        if not check:
            with open(path, "w", encoding="utf-8") as f:
                f.write(after)
    if check and dirty:
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
