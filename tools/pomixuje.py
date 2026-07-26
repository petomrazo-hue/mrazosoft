#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
„Pomixuje sa to?" — merací nástroj pre sériu na mrazosoft.sk/pomixuje.

Princíp (Blendtec, kap. 47 Kunovej knihy): netvrď, že máš ostré čepele — hoď do
mixéra iPhone. My netvrdíme „rýchly web", my ho zmeriame a číslo zverejníme.

Merací motor = **Lighthouse CLI** (Google, cez `npx`) proti PRODUKČNEJ URL.
  - Pasca z CLAUDE.md „lokálny Lighthouse bez gzip klame o desiatky bodov" sa
    tu NEUPLATŇUJE: neservírujeme súbory z notebooku, meriame cudzí server,
    takže kompresia aj cache hlavičky sú jeho.
  - Skóre jedného behu kolíše, preto meriame `--runs` krát a berieme MEDIÁN.
  - Ktokoľvek si to vie prepočítať tým istým príkazom — v tom je celá sila
    formátu (Dickson tiež mixoval pred kamerou, nie v zákulisí).

Voliteľne dopĺňa **terénne dáta z CrUX** (reálni návštevníci za 28 dní) cez
PageSpeed Insights API — len ak je v prostredí `PSI_API_KEY`. Bez kľúča sa to
ticho preskočí a do výstupu sa zapíše, že terénne dáta nemáme (radšej priznať
než hádať).

Použitie:
    python3 tools/pomixuje.py https://example.sk
    python3 tools/pomixuje.py https://a.sk https://b.sk --runs 3
    python3 tools/pomixuje.py --md tools/pomixuje-data/example-sk.json
"""
from __future__ import annotations

import argparse
import json
import os
import pathlib
import re
import shutil
import statistics
import subprocess
import sys
import tempfile
import urllib.parse
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA_DIR = ROOT / "tools" / "pomixuje-data"
PSI_ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed"

# Metriky, ktoré publikujeme. Kľúč = Lighthouse audit id.
LAB_METRICS = {
    "largest-contentful-paint": "LCP — kedy je vidieť hlavný obsah",
    "first-contentful-paint": "FCP — kedy je vidieť čokoľvek",
    "total-blocking-time": "TBT — ako dlho stránka nereaguje",
    "cumulative-layout-shift": "CLS — poskakovanie obsahu",
    "speed-index": "Speed Index",
}

FIELD_METRICS = {
    "LARGEST_CONTENTFUL_PAINT_MS": ("LCP", "ms"),
    "INTERACTION_TO_NEXT_PAINT": ("INP", "ms"),
    "CUMULATIVE_LAYOUT_SHIFT_SCORE": ("CLS", ""),
}
FIELD_VERDICT = {"FAST": "dobré", "AVERAGE": "hraničné", "SLOW": "zlé"}

CATEGORIES = {
    "performance": "vykon",
    "accessibility": "pristupnost",
    "best-practices": "spravna_prax",
    "seo": "seo",
}


def slug(url: str) -> str:
    """https://rytmiko.mrazosoft.sk/ -> rytmiko-mrazosoft-sk"""
    host = urllib.parse.urlparse(url).netloc or url
    host = host.lower().removeprefix("www.")
    return re.sub(r"[^a-z0-9]+", "-", host).strip("-")


# --------------------------------------------------------------- lighthouse ---

def run_lighthouse(url: str, form_factor: str) -> dict:
    """Jeden Lighthouse beh proti živej URL. Vracia surový report."""
    with tempfile.TemporaryDirectory() as tmp:
        out = pathlib.Path(tmp) / "lh.json"
        cmd = [
            "npx", "--yes", "lighthouse", url,
            "--quiet",
            "--chrome-flags=--headless=new --no-sandbox",
            "--output=json", f"--output-path={out}",
        ]
        if form_factor == "desktop":
            # preset nastaví form factor, obrazovku AJ desktop throttling naraz —
            # ručné flagy by nechali mobilné 4G throttling a desktop by klamal
            cmd.append("--preset=desktop")
        else:
            cmd += ["--form-factor=mobile", "--screenEmulation.mobile"]

        proc = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if not out.exists():
            err = (proc.stderr or proc.stdout or "").strip()[-400:]
            raise RuntimeError(f"Lighthouse nedal report (exit {proc.returncode}): {err}")
        return json.loads(out.read_text(encoding="utf-8"))


def parse_report(rep: dict) -> dict:
    audits = rep.get("audits", {}) or {}
    cats = rep.get("categories", {}) or {}

    skore = {}
    for lh_key, sk_key in CATEGORIES.items():
        s = (cats.get(lh_key) or {}).get("score")
        skore[sk_key] = round(s * 100) if isinstance(s, (int, float)) else None

    lab = {}
    for aid, label in LAB_METRICS.items():
        a = audits.get(aid) or {}
        lab[aid] = {
            "nazov": label,
            "hodnota": a.get("numericValue"),
            "zobrazene": a.get("displayValue"),
        }

    brzdy = []
    for aid, a in audits.items():
        det = a.get("details") or {}
        # Lighthouse 12+ už nemá type "opportunity" — brzdu poznáme podľa úspor
        ms = det.get("overallSavingsMs") or a.get("metricSavings", {}).get("LCP") or 0
        by = det.get("overallSavingsBytes") or 0
        if a.get("score") == 1 or a.get("scoreDisplayMode") in ("notApplicable", "informative", "manual"):
            continue
        if ms < 100 and by < 20_000:
            continue
        brzdy.append({
            "id": aid,
            "nazov": a.get("title"),
            "usetri_ms": round(ms),
            "usetri_kb": round(by / 1024) if by else 0,
        })
    brzdy.sort(key=lambda b: (b["usetri_ms"], b["usetri_kb"]), reverse=True)

    tbw = (audits.get("total-byte-weight") or {}).get("numericValue")

    return {
        "skore": skore,
        "lab": lab,
        "brzdy": brzdy[:5],
        "vaha_stranky_kb": round(tbw / 1024) if tbw else None,
        "lighthouse_verzia": rep.get("lighthouseVersion"),
        "merane": rep.get("fetchTime"),
        "finalna_url": rep.get("finalDisplayedUrl") or rep.get("finalUrl"),
    }


def median_run(url: str, form_factor: str, runs: int) -> dict:
    """`runs` behov, vráti ten s MEDIÁNOVÝM skóre výkonu (nie priemer čísel —
    priemerovať metriky z rôznych behov by dalo report, ktorý nikdy nenastal)."""
    parsed = []
    for i in range(1, runs + 1):
        print(f"    beh {i}/{runs}…", end="", flush=True)
        p = parse_report(run_lighthouse(url, form_factor))
        print(f" výkon {p['skore']['vykon']}", flush=True)
        parsed.append(p)

    scores = [p["skore"]["vykon"] for p in parsed if p["skore"]["vykon"] is not None]
    if not scores:
        return parsed[0]
    med = statistics.median_low(scores)
    chosen = next(p for p in parsed if p["skore"]["vykon"] == med)
    chosen["vsetky_behy_vykon"] = scores
    chosen["poc_behov"] = runs
    return chosen


# ---------------------------------------------------------------- CrUX/PSI ---

def fetch_field(url: str) -> dict | None:
    """Terénne dáta z CrUX cez PSI. Bez API kľúča vracia None (nehádame)."""
    key = os.environ.get("PSI_API_KEY", "").strip()
    if not key:
        return None
    qs = urllib.parse.urlencode({"url": url, "strategy": "mobile", "key": key})
    try:
        req = urllib.request.Request(f"{PSI_ENDPOINT}?{qs}",
                                     headers={"User-Agent": "mrazosoft-pomixuje/1.0"})
        with urllib.request.urlopen(req, timeout=180) as resp:
            raw = json.loads(resp.read().decode("utf-8"))
    except Exception as e:  # noqa: BLE001
        print(f"    (terénne dáta sa nepodarilo načítať: {type(e).__name__})", file=sys.stderr)
        return None

    le = raw.get("loadingExperience") or {}
    metrics = le.get("metrics") or {}
    if not metrics:
        return None
    celkovo = le.get("overall_category") or ""
    out = {"celkovo": FIELD_VERDICT.get(celkovo, celkovo), "metriky": {}}
    for mid, (label, unit) in FIELD_METRICS.items():
        m = metrics.get(mid)
        if m:
            out["metriky"][mid] = {
                "nazov": label, "jednotka": unit,
                "p75": m.get("percentile"),
                "verdikt": FIELD_VERDICT.get(m.get("category"), m.get("category")),
            }
    return out


# ---------------------------------------------------------------- markdown ---

def markdown_card(rec: dict) -> str:
    url = rec["url"]
    mob = rec["merania"].get("mobile") or {}
    desk = rec["merania"].get("desktop") or {}
    lines = [f"### {url}", "", "| | Mobil | Desktop |", "|---|---|---|"]

    for key, label in (("vykon", "Výkon"), ("pristupnost", "Prístupnosť"),
                       ("spravna_prax", "Správna prax"), ("seo", "SEO")):
        a = mob.get("skore", {}).get(key)
        b = desk.get("skore", {}).get(key)
        lines.append(f"| {label} | {a if a is not None else '—'} | {b if b is not None else '—'} |")

    if mob:
        lines += ["", "**Mobil — namerané časy**", ""]
        for aid, label in LAB_METRICS.items():
            m = mob["lab"].get(aid) or {}
            lines.append(f"- {label}: **{m.get('zobrazene') or '—'}**")
        if mob.get("vaha_stranky_kb"):
            lines.append(f"- Celková váha stránky: **{mob['vaha_stranky_kb']} kB**")

        if mob.get("brzdy"):
            lines += ["", "**Najväčšie brzdy**", ""]
            for b in mob["brzdy"][:3]:
                usp = [x for x in (f"{b['usetri_ms']} ms" if b["usetri_ms"] else "",
                                   f"{b['usetri_kb']} kB" if b["usetri_kb"] else "") if x]
                lines.append(f"- {b['nazov']}" + (f" — ušetrí {' / '.join(usp)}" if usp else ""))

    teren = rec.get("teren")
    if teren and teren.get("metriky"):
        lines += ["", f"**Reálni návštevníci (CrUX, 28 dní): {teren.get('celkovo') or '—'}**", ""]
        for f in teren["metriky"].values():
            lines.append(f"- {f['nazov']}: {f['p75']}{f['jednotka']} → {f['verdikt']}")
    else:
        lines += ["", "_Terénne dáta (CrUX) nemáme — web nemá dosť návštev alebo chýba API kľúč._"]

    behy = mob.get("vsetky_behy_vykon")
    lines += ["", f"_Merané: {mob.get('merane') or desk.get('merane') or '—'} · "
                  f"Lighthouse {mob.get('lighthouse_verzia') or '—'}"
                  + (f" · medián z behov {behy}" if behy else "") + "_", ""]
    return "\n".join(lines)


# -------------------------------------------------------------------- main ---

def main() -> int:
    ap = argparse.ArgumentParser(description="Zmeria web Lighthousom a uloží výsledok.")
    ap.add_argument("urls", nargs="+", help="URL webov (alebo cesty k JSON pri --md)")
    ap.add_argument("--strategy", choices=["mobile", "desktop", "both"], default="both")
    ap.add_argument("--runs", type=int, default=3, help="behov na formát (medián), default 3")
    ap.add_argument("--out", default=str(DATA_DIR))
    ap.add_argument("--md", action="store_true", help="len vypíš markdown kartu z JSONu")
    args = ap.parse_args()

    if args.md:
        for p in args.urls:
            print(markdown_card(json.loads(pathlib.Path(p).read_text(encoding="utf-8"))))
        return 0

    if not shutil.which("npx"):
        print("Chýba `npx` (Node.js) — Lighthouse sa nedá spustiť.", file=sys.stderr)
        return 2

    forms = ["mobile", "desktop"] if args.strategy == "both" else [args.strategy]
    outdir = pathlib.Path(args.out)
    outdir.mkdir(parents=True, exist_ok=True)

    zlyhalo = []
    for url in args.urls:
        print(f"\n▶ {url}", flush=True)
        rec: dict = {"url": url, "merania": {}}
        try:
            for ff in forms:
                print(f"  → {ff}", flush=True)
                rec["merania"][ff] = median_run(url, ff, args.runs)
            rec["teren"] = fetch_field(url)
        except Exception as e:  # noqa: BLE001 — jeden zlý web nezhodí celú dávku
            print(f"  ✗ {e}", file=sys.stderr)
            zlyhalo.append(url)
            continue

        dest = outdir / f"{slug(url)}.json"
        dest.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")
        mob = rec["merania"].get("mobile") or {}
        desk = rec["merania"].get("desktop") or {}
        print(f"  ✓ výkon mobil {mob.get('skore', {}).get('vykon')} · "
              f"desktop {desk.get('skore', {}).get('vykon')} → {dest.name}")

    if zlyhalo:
        print(f"\nNezmerané: {', '.join(zlyhalo)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
