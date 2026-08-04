#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Identifikácia prevádzkovateľa na mrazosoft.sk — JEDEN ZÁSAH po Petovom rozhodnutí.

Web je dnes zámerne bez IČO/sídla (Peto 19.7.2026 = freelancer). Keď sa rozhodne
inak, tento skript doplní všetko naraz a konzistentne:

  1. pätička (`footer-ident`) vo VŠETKÝCH 25 HTML (SK aj EN)
  2. nová stránka `fakturacia.html` (noindex, follow) so zákonnými údajmi
  3. odkaz „Fakturačné údaje" do pätičkovej právnej navigácie všetkých HTML
  4. riadok o príjemcovi do `zasady.html` §4 (len režim `sap`)

Použitie:
    python3 tools/ident.py --rezim sap --check     # dry-run, nič nezapíše
    python3 tools/ident.py --rezim sap             # zapíše
    python3 tools/ident.py --rezim zivnost         # druhý variant
    python3 tools/ident.py --vratit                # späť na dnešný stav (freelancer)

Skript je IDEMPOTENTNÝ — opakované spustenie nič nezdvojí; `--rezim` sa dá
prepnúť aj z už nasadeného iného režimu.
Po zápise: `python3 tools/qa.py`, `python3 tools/gen_sitemap.py`, potom /ship mrazosoft.
"""
from __future__ import annotations

import argparse
import re
import sys

from site_common import ROOT, public_html_files, read

# ── Značky, podľa ktorých skript pozná svoju vlastnú prácu (idempotencia) ────
MARK = "ms-ident"
# POZOR: `[^>]*` je nutné — po prvom nasadení má značka navyše data-ms-ident="1"
# a bez toho by `--vratit` (aj prepnutie režimu) TICHO nespravil nič. Chytené
# až reálnym behom tam-a-späť, čítaním kódu to viditeľné nebolo.
IDENT_RE = re.compile(r'<p class="footer-ident"[^>]*>(.*?)</p>', re.S)
LEGALNAV_RE = re.compile(r'(<nav class="footer-links"[^>]*>)(.*?)(</nav>)', re.S)
FAKT_LINK = '<a href="/fakturacia" data-i18n="footer.billing">Fakturačné údaje</a>'
FAKT_LINK_RE = re.compile(r'<a href="/fakturacia"[^>]*>.*?</a>')

# ── Dva režimy ──────────────────────────────────────────────────────────────
# POZOR: hodnoty v `zivnost` sú PLACEHOLDERY — pred spustením ich vyplňte.
REZIMY = {
    "sap": {
        "nazov": "Fakturácia cez partnerskú firmu SAP Trade, s.r.o.",
        # SAP Trade overená v ORSR 19.7.2026 (003contex/mrazosoft-fakturacia-sap-trade.md)
        "footer_sk": 'fakturuje SAP Trade, s.r.o., IČO 44 849 664 (platca DPH)',
        "footer_en": 'invoicing by SAP Trade, s.r.o., Reg. No. 44 849 664 (VAT registered)',
        "dph": True,
        "prijemca_zasady": ('<li><strong>SAP Trade, s.r.o.</strong> — vystavovanie faktúr a zmluvná '
                            'agenda (SR/EÚ); spracúva fakturačné údaje klientov.</li>'),
        "blok": """        <h2>1. Kto vám dodáva službu</h2>
        <p>
          <strong>Peter Mráz</strong> — MRAZOSOFT (návrh, vývoj a odovzdanie diela)<br />
          Poprad, Slovenská republika<br />
          E-mail: <a href="mailto:petermraz@mrazosoft.sk">petermraz@mrazosoft.sk</a>
        </p>
        <p>Celý projekt riešite priamo so mnou — jedna osoba od prvej konzultácie po odovzdanie.</p>

        <h2>2. Kto vystavuje faktúru</h2>
        <p>
          <strong>SAP Trade, s.r.o.</strong> — partnerská spoločnosť, ktorá moje služby zmluvne zastrešuje<br />
          IČO: 44 849 664 · IČ DPH: SK2022855109 (platca DPH)<br />
          Zapísaná v Obchodnom registri Slovenskej republiky
        </p>
        <p>Na každú službu dostanete riadnu faktúru od platcu DPH. Pre vás sa nič nekomplikuje — komunikujete stále so mnou.</p>

        <h2>3. Ceny</h2>
        <p>Ceny uvedené na webe sú <strong>vrátane DPH</strong> a sú konečné — dohodnuté vopred, bez dodatočných položiek. Pri firemných objednávkach viem cenu rozpísať aj bez DPH.</p>

        <h2>4. Platba a dodanie</h2>
        <p>Platba prebieha na základe faktúry prevodom, prípadne kartou cez platobnú bránu (predajca je v takom prípade uvedený na doklade z brány). Termín dodania sa dohaduje individuálne a potvrdzuje sa písomne pred začiatkom prác.</p>

        <h2>5. Reklamácie a odstúpenie</h2>
        <p>Reklamáciu alebo odstúpenie od zmluvy uplatnite e-mailom na <a href="mailto:petermraz@mrazosoft.sk">petermraz@mrazosoft.sk</a> — ozvem sa do pár hodín. Ak ste spotrebiteľ (nekupujete na IČO), máte pri službách objednaných na diaľku právo odstúpiť do 14 dní; ak si výslovne prajete začať skôr, právo zaniká dodaním služby v plnom rozsahu.</p>
        <p>Ak sa nedohodneme, môžete sa obrátiť na Slovenskú obchodnú inšpekciu (<a href="https://www.soi.sk" target="_blank" rel="noopener">soi.sk</a>) alebo využiť platformu EÚ pre riešenie sporov online.</p>

        <h2>6. Ochrana osobných údajov</h2>
        <p>Spracovanie osobných údajov popisujú <a href="/zasady">Zásady ochrany osobných údajov</a>.</p>""",
    },
    "zivnost": {
        "nazov": "Vlastná živnosť Petra Mráza",
        # ⚠ VYPLNIŤ pred spustením — hodnoty XXX skript odmietne zapísať.
        "ico": "XXXXXXXX",
        "adresa": "XXXXX, Poprad",
        "zivnostensky_urad": "Okresný úrad Poprad, odbor živnostenského podnikania",
        "cislo_zivnosti": "XXX-XXXXX",
        "footer_sk": "IČO {ico}",
        "footer_en": "Reg. No. {ico}",
        "dph": False,
        "prijemca_zasady": None,
        "blok": """        <h2>1. Prevádzkovateľ a dodávateľ</h2>
        <p>
          <strong>Peter Mráz</strong> — MRAZOSOFT<br />
          {adresa}, Slovenská republika<br />
          IČO: {ico}<br />
          Zapísaný v Živnostenskom registri: {zivnostensky_urad}, č. živnostenského registra {cislo_zivnosti}<br />
          E-mail: <a href="mailto:petermraz@mrazosoft.sk">petermraz@mrazosoft.sk</a>
        </p>
        <p><strong>Nie som platcom DPH.</strong> Ceny uvedené na webe sú konečné.</p>

        <h2>2. Ceny, platba a dodanie</h2>
        <p>Ceny sú konečné a dohodnuté vopred, bez dodatočných položiek. Platba prebieha na základe faktúry prevodom, prípadne kartou cez platobnú bránu (predajca je v takom prípade uvedený na doklade z brány). Termín dodania sa dohaduje individuálne a potvrdzuje sa písomne pred začiatkom prác.</p>

        <h2>3. Reklamácie a odstúpenie</h2>
        <p>Reklamáciu alebo odstúpenie od zmluvy uplatnite e-mailom na <a href="mailto:petermraz@mrazosoft.sk">petermraz@mrazosoft.sk</a> — ozvem sa do pár hodín. Ak ste spotrebiteľ (nekupujete na IČO), máte pri službách objednaných na diaľku právo odstúpiť do 14 dní; ak si výslovne prajete začať skôr, právo zaniká dodaním služby v plnom rozsahu.</p>
        <p>Ak sa nedohodneme, môžete sa obrátiť na Slovenskú obchodnú inšpekciu (<a href="https://www.soi.sk" target="_blank" rel="noopener">soi.sk</a>) alebo využiť platformu EÚ pre riešenie sporov online.</p>

        <h2>4. Dozorný orgán</h2>
        <p>Slovenská obchodná inšpekcia, Inšpektorát SOI pre Prešovský kraj — dohľad nad dodržiavaním predpisov na ochranu spotrebiteľa.</p>

        <h2>5. Ochrana osobných údajov</h2>
        <p>Spracovanie osobných údajov popisujú <a href="/zasady">Zásady ochrany osobných údajov</a>.</p>""",
    },
}

# Dnešný stav — cieľ pre `--vratit` (presné znenie z HTML, overené 4.8.2026)
POVODNE_SK = ('<p class="footer-ident"><span data-i18n="footer.operator">Prevádzkovateľ</span>'
              ': Peter Mráz · Poprad, Slovensko</p>')
POVODNE_EN = '<p class="footer-ident"><span>Operator</span>: Peter Mráz · Poprad, Slovakia</p>'
# Odstránenie dovety pri `--vratit` — zachová pôvodný obsah riadka (existujú
# tri varianty pätičky: s data-i18n, s holým <span>Operator</span> aj bez spanu).
ODSTRAN_DOVETU = re.compile(
    r'<p class="footer-ident" data-' + MARK + r'="1">(.*?) · <span[^>]*>.*?</span></p>', re.S)


def je_en(p) -> bool:
    return p.parent.name == "en"


def dovetok_html(rez: dict, en: bool) -> str:
    """Len DOVETA o fakturácii — pripája sa k pôvodnému riadku, ktorý ostáva
    nedotknutý. V HTML sú TRI varianty pätičky (s data-i18n, s holým
    <span>Operator</span> aj úplne bez spanu v aikurz.html); prepísanie jedným
    natvrdo napísaným znením by dva z nich potichu poškodilo."""
    txt = (rez["footer_en"] if en else rez["footer_sk"]).format(**rez)
    return f'<span>{txt}</span>' if en else f'<span data-i18n="footer.billnote">{txt}</span>'


def uprav_footer(html: str, doveta: str) -> str:
    """Pripne dovetu k identifikácii a doplní odkaz na /fakturacia (idempotentne)."""
    html = ODSTRAN_DOVETU.sub(r'<p class="footer-ident">\1</p>', html, count=1)  # predošlý režim preč

    def _ident(m):
        return f'<p class="footer-ident" data-{MARK}="1">{m.group(1)} · {doveta}</p>'

    html = IDENT_RE.sub(_ident, html, count=1)

    def _nav(m):
        otvor, vnutro, zavri = m.groups()
        vnutro = FAKT_LINK_RE.sub("", vnutro)          # odstráň predošlú verziu
        vnutro = vnutro.replace('<a href="/zasady"', FAKT_LINK + '<a href="/zasady"', 1)
        return otvor + vnutro + zavri

    return LEGALNAV_RE.sub(_nav, html, count=1)


def zostav_fakturacia(rez: dict) -> str:
    """Postaví fakturacia.html klonovaním obalu zo zasady.html (rovnaká hlavička,
    nav aj pätička — žiadna ručne udržiavaná kópia, ktorá by sa rozišla)."""
    src = read(ROOT / "zasady.html")
    titul = "Fakturačné a zákonné údaje | MRAZOSOFT"
    popis = ("Kto vám službu dodáva, kto vystavuje faktúru, ako je to s cenami, platbou, "
             "dodaním a reklamáciou. Zákonné údaje k službám MRAZOSOFT (Peter Mráz).")

    h = src
    h = re.sub(r"<title>[^<]*</title>", f"<title>{titul}</title>", h, count=1)
    h = re.sub(r'(<meta name="description" content=")[^"]*(")', lambda m: m.group(1) + popis + m.group(2), h, count=1)
    h = re.sub(r'(<meta property="og:description" content=")[^"]*(")',
               lambda m: m.group(1) + "Zákonné a fakturačné údaje k službám MRAZOSOFT." + m.group(2), h, count=1)
    h = re.sub(r'(<meta property="og:title" content=")[^"]*(")', lambda m: m.group(1) + titul + m.group(2), h, count=1)
    h = h.replace('href="https://mrazosoft.sk/zasady"', 'href="https://mrazosoft.sk/fakturacia"')
    h = h.replace('content="https://mrazosoft.sk/zasady"', 'content="https://mrazosoft.sk/fakturacia"')
    h = re.sub(r'(<meta name="twitter:title" content=")[^"]*(")', lambda m: m.group(1) + titul + m.group(2), h, count=1)
    h = re.sub(r'(<meta name="twitter:description" content=")[^"]*(")', lambda m: m.group(1) + popis + m.group(2), h, count=1)

    # hero
    h = h.replace('<span class="eyebrow">Súkromie</span>', '<span class="eyebrow">Zákonné údaje</span>', 1)
    h = h.replace('<h1 class="hero-title"><span class="grad-text">Zásady ochrany osobných údajov</span></h1>',
                  '<h1 class="hero-title"><span class="grad-text">Fakturačné a zákonné údaje</span></h1>', 1)
    h = h.replace('<p class="page-sub">Aké údaje spracúvam, prečo, komu sa odovzdávajú a aké máte práva.</p>',
                  '<p class="page-sub">Kto vám službu dodáva, kto vystavuje faktúru a čo robiť, keď niečo nesedí.</p>', 1)

    # telo
    blok = rez["blok"]
    if rez is REZIMY["zivnost"]:
        blok = blok.format(**rez)
    telo = re.compile(r'(<div class="container legal">).*?(\n      </div>)', re.S)
    if not telo.search(h):
        raise SystemExit("CHYBA: v zasady.html sa nenašiel blok <div class=\"container legal\"> — "
                         "šablóna sa zmenila, uprav ident.py")
    h = telo.sub(lambda m: m.group(1) + "\n" + blok + m.group(2), h, count=1)

    # JSON-LD zo zasady sem nepatrí (ak tam nejaké je, zhodí to qa.py duplicitou @id)
    h = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', "", h, flags=re.S)
    return h


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--rezim", choices=sorted(REZIMY))
    ap.add_argument("--check", action="store_true", help="dry-run, nič nezapíše")
    ap.add_argument("--vratit", action="store_true", help="späť na dnešný stav (bez IČO)")
    a = ap.parse_args()

    if not a.rezim and not a.vratit:
        ap.error("zadaj --rezim sap|zivnost alebo --vratit")

    zmeny: list[str] = []

    if a.vratit:
        for p in public_html_files():
            h = read(p)
            # Chirurgicky: odstráň LEN dovetu a značku, zvyšok riadka nechaj tak.
            # (Natvrdo dosadené znenie by prepísalo tretí variant pätičky
            #  v aikurz.html — nájdené až behom tam-a-späť, nie čítaním kódu.)
            n = ODSTRAN_DOVETU.sub(r'<p class="footer-ident">\1</p>', h, count=1)
            n = LEGALNAV_RE.sub(lambda m: m.group(1) + FAKT_LINK_RE.sub("", m.group(2)) + m.group(3), n, count=1)
            for r in REZIMY.values():                      # §4 zásad späť
                if r["prijemca_zasady"]:
                    n = n.replace("          " + r["prijemca_zasady"] + "\n", "")
            if n != h:
                zmeny.append(f"pätička ← pôvodná: {p.relative_to(ROOT)}")
                if not a.check:
                    p.write_text(n, encoding="utf-8")
        f = ROOT / "fakturacia.html"
        if f.exists():
            zmeny.append("zmazať fakturacia.html")
            if not a.check:
                f.unlink()
    else:
        rez = REZIMY[a.rezim]
        if "XXX" in str(rez.get("ico", "")) or "XXXXX" in str(rez.get("adresa", "")):
            print(f"STOP: režim „{a.rezim}\" má nevyplnené údaje (XXX) — doplň ich hore v ident.py.",
                  file=sys.stderr)
            return 2

        novy = zostav_fakturacia(rez)
        cesta = ROOT / "fakturacia.html"
        if not cesta.exists() or read(cesta) != novy:
            zmeny.append("fakturacia.html (nová/aktualizovaná stránka)")
            if not a.check:
                cesta.write_text(novy, encoding="utf-8")

        for p in list(public_html_files()) + [ROOT / "fakturacia.html"]:
            if not p.exists():
                continue
            h = read(p)
            n = uprav_footer(h, dovetok_html(rez, je_en(p)))
            if p.name == "zasady.html" and rez["prijemca_zasady"] and rez["prijemca_zasady"] not in n:
                n = n.replace("<li><strong>WebSupport, s.r.o.</strong>",
                              rez["prijemca_zasady"] + "\n          <li><strong>WebSupport, s.r.o.</strong>", 1)
            if n != h:
                zmeny.append(f"pätička/§4: {p.relative_to(ROOT)}")
                if not a.check:
                    p.write_text(n, encoding="utf-8")

    if not zmeny:
        print("Nič na zmenu — stav už zodpovedá zadaniu.")
        return 0
    print(("[DRY-RUN] " if a.check else "") + f"{len(zmeny)} zmien:")
    for z in zmeny:
        print("  •", z)
    if not a.check and not a.vratit:
        print("\nĎalej: doplň do app.js i18n kľúče footer.billing (SK 'Fakturačné údaje' / EN 'Billing details')")
        print("       a footer.billnote (EN preklad dovety o fakturácii), bumpni ?v= app.js vo VŠETKÝCH HTML,")
        print("       spusti tools/qa.py + tools/gen_sitemap.py, potom /ship mrazosoft.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
