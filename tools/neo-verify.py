#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
neo-verify.py — overí, že neo web (testovanie/) beží pod striktnou CSP.

Načíta každú stránku v reálnom prehliadači a hlási:
  • porušenia CSP (konzola + securitypolicyviolation event)
  • JS chyby a zlyhané requesty
  • prítomnosť canonical / robots / CSP meta
Naviac funkčne otestuje honeypot kontaktného formulára (odchytený fetch).

Predpoklad: beží `npx serve -l 4321 .` v koreni repa.

    python3 tools/neo-verify.py
"""
from __future__ import annotations

import sys

from playwright.sync_api import sync_playwright

# default = lokálny server; naživo: python3 tools/neo-verify.py https://mrazosoft.sk/testovanie/
BASE = next((a for a in sys.argv[1:] if a.startswith("http")),
            "http://localhost:4321/testovanie/")
# cache-buster: naživo povinný, aby sa nemeralo z CDN/prehliadačovej cache
CB = next((a for a in sys.argv[1:] if a.startswith("?")), "")
PAGES = ["", "sluzby.html", "projekty.html", "o-mne.html", "blog.html",
         "kontakt.html", "zasady.html", "wizard.html",
         "blog-co-je-pwa-aplikacia.html", "blog-kolko-stoji-web-stranka.html",
         "blog-web-alebo-eshop.html", "404.html", "offline.html"]

# Requesty na tretie strany, ktoré v lokálnom teste zlyhajú z iných dôvodov než
# CSP (offline gtag, chýbajúci Ads účet) — nehlásiť ako chybu.
IGNORE_FAIL = ("googletagmanager.com", "google-analytics.com",
               "googleadservices.com", "doubleclick.net", "gstatic.com")


def check_page(page, url: str, name: str) -> list[str]:
    problems: list[str] = []
    console: list[str] = []
    page.on("console", lambda m: console.append(f"{m.type}: {m.text}"))
    page.on("pageerror", lambda e: problems.append(f"JS CHYBA: {e}"))
    page.on("requestfailed", lambda r: (
        None if any(d in r.url for d in IGNORE_FAIL)
        else problems.append(f"REQUEST ZLYHAL: {r.url} ({r.failure})")))

    page.goto(url, wait_until="load", timeout=30000)
    # natívny odchyt porušení CSP — spoľahlivejší než parsovanie konzoly
    page.evaluate("""window.__csp = [];
        document.addEventListener('securitypolicyviolation',
            e => window.__csp.push(e.violatedDirective + ' ← ' + e.blockedURI));""")
    page.wait_for_timeout(2500)  # nechaj dobehnúť lazy-load / gtag / solar

    for v in page.evaluate("window.__csp || []"):
        problems.append(f"CSP PORUŠENIE: {v}")
    for c in console:
        if "Content Security Policy" in c or "Refused to" in c:
            problems.append(f"CSP KONZOLA: {c[:200]}")

    meta = page.evaluate("""({
        csp: !!document.querySelector('meta[http-equiv="Content-Security-Policy"]'),
        canonical: (document.querySelector('link[rel=canonical]')||{}).href || null,
        robots: (document.querySelector('meta[name=robots]')||{}).content || null,
    })""")
    if not meta["csp"]:
        problems.append("chýba CSP meta")
    if name in ("404.html", "offline.html"):
        pass  # tieto canonical zámerne nemajú
    elif not meta["canonical"]:
        problems.append("chýba canonical")
    if meta["robots"] != "noindex,nofollow":
        problems.append(f"robots je '{meta['robots']}' (čakal noindex,nofollow)")
    return problems


def check_honeypot(page) -> list[str]:
    """Bot vyplní skrytý botcheck → nesmie odísť žiadny fetch na web3forms."""
    out = []
    page.goto(BASE + "kontakt.html", wait_until="load", timeout=30000)
    page.wait_for_timeout(1200)
    # cookie lišta je modálna a prekrýva formulár — odmietnuť a nechať zmiznúť
    btn = page.query_selector('.mzc [data-act="reject"]')
    if btn:
        btn.click()
        page.wait_for_selector(".mzc", state="hidden", timeout=5000)
    page.wait_for_timeout(400)
    page.evaluate("""window.__sent = [];
        const orig = window.fetch;
        window.fetch = function (u, o) {
            window.__sent.push({ url: String(u), body: o && o.body });
            return Promise.resolve(new Response('{"success":true}',
                { status: 200, headers: { 'Content-Type': 'application/json' } }));
        };""")

    # 1) bot: honeypot zaškrtnutý → nič sa nesmie odoslať
    page.fill('#kontaktForm [name=meno]', "Bot Test")
    page.fill('#kontaktForm [name=kontakt]', "bot@example.com")
    page.evaluate("document.querySelector('#kontaktForm [name=botcheck]').checked = true")
    page.click('#kontaktForm button[type=submit]')
    page.wait_for_timeout(900)
    if [s for s in page.evaluate("window.__sent") if "web3forms" in s["url"]]:
        out.append("HONEYPOT NEFUNGUJE: bot s vyplneným botcheck prešiel na web3forms")

    # 2) človek: honeypot prázdny → odoslať sa MUSÍ, a payload musí niesť botcheck
    page.evaluate("window.__sent = []")
    page.evaluate("document.querySelector('#kontaktForm [name=botcheck]').checked = false")
    page.fill('#kontaktForm [name=meno]', "Peter Test")
    page.fill('#kontaktForm [name=kontakt]', "peter@example.com")
    page.click('#kontaktForm button[type=submit]')
    page.wait_for_timeout(900)
    sent = [s for s in page.evaluate("window.__sent") if "web3forms" in s["url"]]
    if not sent:
        out.append("FORMULÁR NEODOSIELA: legitímny dopyt sa nedostal na web3forms")
    elif '"botcheck"' not in (sent[0]["body"] or ""):
        out.append("payload NEOBSAHUJE botcheck → serverový filter Web3Forms ho nevidí")
    return out


def main() -> int:
    failed = 0
    print(f"BASE: {BASE}")
    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        for path in PAGES:
            ctx = browser.new_context(viewport={"width": 1440, "height": 900})
            page = ctx.new_page()
            name = path or "index.html"
            try:
                problems = check_page(page, BASE + path + CB, name)
            except Exception as e:  # noqa: BLE001
                problems = [f"NENAČÍTALO SA: {e}"]
            print(("  ✗ " if problems else "  ✓ ") + name
                  + ("" if not problems else "\n      " + "\n      ".join(problems)))
            failed += len(problems)
            ctx.close()

        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        hp = check_honeypot(page)
        print(("  ✗ " if hp else "  ✓ ") + "honeypot kontaktného formulára"
              + ("" if not hp else "\n      " + "\n      ".join(hp)))
        failed += len(hp)

        # dôkazové screenshoty
        page.goto(BASE, wait_until="load"); page.wait_for_timeout(3500)
        page.screenshot(path="/tmp/neo-1440.png")
        ctx.close()
        ctx = browser.new_context(viewport={"width": 390, "height": 844},
                                  is_mobile=True, has_touch=True)
        page = ctx.new_page()
        page.goto(BASE, wait_until="load"); page.wait_for_timeout(3500)
        page.screenshot(path="/tmp/neo-390.png")
        ctx.close()
        browser.close()

    print(f"\nSPOLU: {failed} problémov")
    print("Screenshoty: /tmp/neo-1440.png  /tmp/neo-390.png")
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
