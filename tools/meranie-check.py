#!/usr/bin/env python3
"""Beží meranie návštevnosti mrazosoft.sk naozaj?

First-party zber (cookies.js → Firebase RTDB) bol od 25. 6. do 11. 8. 2026 mŕtvy:
blok `analytics` z `firebase-rules.json` nebol nikdy nasadený do Firebase, takže
zápis vracal 401 — v repe „opravené", na serveri nič. Web pritom fungoval normálne
a nikde sa to neprejavilo, lebo zápis je fire-and-forget.

Kontroluje dve veci, ktoré sa nedajú oklamať:
  1. čítanie uzla vôbec prejde (401 = pravidlá zase nie sú nasadené),
  2. posledná udalosť nie je staršia než PRAH_HODIN (nula návštev za dva dni je
     pri živom webe porucha zberu, nie ticho na webe).

Použitie:  python3 tools/meranie-check.py [--prah-hodin 48]
Návratový kód 1 = porucha (vhodné do launchd/CI).
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import sys
import urllib.error
import urllib.request

DB = "https://tajny-dc6d6-default-rtdb.europe-west1.firebasedatabase.app"
UZOL = "analytics/mrazosoft"


def nacitaj(den: dt.date) -> dict:
    url = f"{DB}/{UZOL}/{den:%Y-%m-%d}.json"
    try:
        with urllib.request.urlopen(url, timeout=20) as r:
            return json.load(r) or {}
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            raise SystemExit(
                f"PORUCHA: čítanie {UZOL} vracia {e.code} — pravidlá v Firebase "
                f"neobsahujú blok „analytics“. Nasaď obsah firebase-rules.json "
                f"v konzole (Realtime Database → Rules → Publish)."
            )
        raise SystemExit(f"PORUCHA: {UZOL} vrátil HTTP {e.code}")
    except OSError as e:
        raise SystemExit(f"PORUCHA: na Firebase sa nedá dostať ({e})")


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prah-hodin", type=int, default=48)
    a = ap.parse_args()

    teraz = dt.datetime.now(dt.timezone.utc)
    udalosti: list[dict] = []
    # dni prezeraj dozadu tak ďaleko, aby prah mohol byť vôbec splnený
    for i in range(a.prah_hodin // 24 + 2):
        udalosti += list(nacitaj((teraz - dt.timedelta(days=i)).date()).values())

    if not udalosti:
        print(f"PORUCHA: za posledné {a.prah_hodin} h nepribudla ani jedna udalosť "
              f"(čítanie funguje, ale zber nie).")
        return 1

    posledna = max(u.get("t", 0) for u in udalosti) / 1000
    vek_h = (teraz.timestamp() - posledna) / 3600
    kedy = dt.datetime.fromtimestamp(posledna, dt.timezone.utc).astimezone()
    print(f"udalostí za okno: {len(udalosti)} | posledná: {kedy:%Y-%m-%d %H:%M} "
          f"({vek_h:.1f} h dozadu)")
    if vek_h > a.prah_hodin:
        print(f"PORUCHA: posledná udalosť je staršia než {a.prah_hodin} h.")
        return 1
    print("OK: meranie zbiera.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
